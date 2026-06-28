"""
Data Ingestion Module
─────────────────────
Loads the Zomato dataset from Hugging Face, normalises it into a clean
pandas DataFrame, and exposes metadata (locations, cuisines) for the
/api/metadata endpoint.

Real column names (from Croissant schema):
  url, address, name, online_order, book_table, rate, votes, phone,
  location, rest_type, dish_liked, cuisines, approx_cost(for two people),
  reviews_list, menu_item, listed_in(type), listed_in(city)
"""

import re
import logging
import unicodedata
from typing import Optional

import pandas as pd

logger = logging.getLogger(__name__)

# ── Constants ──────────────────────────────────────────────────────────────────

DATASET_ID = "ManikaSaini/zomato-restaurant-recommendation"
SPLIT = "train"

# Budget tiers (INR cost-for-two)
BUDGET_LOW_MAX = 500
BUDGET_MED_MAX = 1000

# Cap on dataset size sent to the filter layer
MAX_CANDIDATE_CAP = 30

# City alias normalisation (common alternate spellings → canonical name)
CITY_ALIASES: dict[str, str] = {
    "bengaluru": "bangalore",
    "bombay": "mumbai",
    "new delhi": "delhi",
    "calcutta": "kolkata",
    "madras": "chennai",
    "hyderabad deccan": "hyderabad",
}


# ── Helpers ────────────────────────────────────────────────────────────────────

def _fix_encoding(text: str) -> str:
    """Repair multi-level UTF-8 mojibake (e.g. 'SantÃ©' → 'Santé')."""
    if not isinstance(text, str):
        return text
    # Keep trying to decode latin-1 → utf-8 until the string stops changing
    for _ in range(4):
        try:
            fixed = text.encode("latin-1").decode("utf-8")
            if fixed == text:
                break
            text = fixed
        except (UnicodeEncodeError, UnicodeDecodeError):
            break
    return text


def _parse_rate(raw: str) -> float:
    """Convert strings like '4.1/5', '4.1', 'NEW', '-' to a float."""
    if not isinstance(raw, str):
        return 0.0
    clean = raw.strip().lower()
    if clean in ("new", "-", "nan", ""):
        return 0.0
    # Handle '4.1/5'
    match = re.match(r"(\d+(\.\d+)?)", clean)
    if match:
        return float(match.group(1))
    return 0.0


def _parse_cost(raw) -> float:
    """Convert strings like '300', '1,200', NaN to a float."""
    if pd.isna(raw):
        return 0.0
    clean = str(raw).replace(",", "").strip()
    try:
        return float(clean)
    except ValueError:
        return 0.0


def _budget_tier(cost: float) -> str:
    if cost <= BUDGET_LOW_MAX:
        return "low"
    elif cost <= BUDGET_MED_MAX:
        return "medium"
    return "high"


def _normalise_text(text: str) -> str:
    """Lowercase, strip, and collapse whitespace."""
    if not isinstance(text, str):
        return ""
    text = unicodedata.normalize("NFKC", text)
    return " ".join(text.strip().lower().split())


def _apply_alias(city: str) -> str:
    return CITY_ALIASES.get(city.lower(), city).title()


# ── DataLoader ─────────────────────────────────────────────────────────────────

class DataLoader:
    """
    Loads and caches the Zomato dataset.

    Usage
    -----
    Call ``data_loader.load()`` once at startup (inside the FastAPI lifespan).
    Access the cleaned DataFrame via ``data_loader.df`` and metadata via
    ``data_loader.locations`` / ``data_loader.cuisines``.
    """

    def __init__(self) -> None:
        self.df: Optional[pd.DataFrame] = None
        self.locations: list[str] = []
        self.cuisines: list[str] = []
        self.is_ready: bool = False

    # ── Public API ─────────────────────────────────────────────────────────────

    def load(self) -> None:
        """Load the dataset from Hugging Face."""
        logger.info(f"Loading dataset from Hugging Face: {DATASET_ID}")
        try:
            from datasets import load_dataset
            dataset = load_dataset(DATASET_ID, split=SPLIT)
            raw_df = dataset.to_pandas()
            logger.info("Raw dataset loaded from Hugging Face: %d rows", len(raw_df))
            
            self.df = self._preprocess(raw_df)
        except Exception as exc:
            logger.critical("Failed to load Hugging Face dataset: %s", exc)
            raise

        if len(self.df) == 0:
            raise ValueError(
                "Dataset is empty — check dataset integrity."
            )

        self._extract_metadata()
        self.is_ready = True
        logger.info(
            "Dataset ready: %d restaurants | %d locations | %d cuisines",
            len(self.df), len(self.locations), len(self.cuisines),
        )

    # ── Preprocessing ──────────────────────────────────────────────────────────

    def _preprocess(self, raw: pd.DataFrame) -> pd.DataFrame:
        df = raw.copy()

        # ── 1. Rename known columns to canonical names ─────────────────────────
        rename_map = {
            "cuisines":                      "cuisine",
            "approx_cost(for two people)":   "cost_raw",
            "rate":                          "rate_raw",
            "listed_in(city)":               "city",
            "listed_in(type)":               "listing_type",
        }
        df = df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns})

        # ── 2. Guard: ensure mandatory columns exist ───────────────────────────
        for col in ("name", "location"):
            if col not in df.columns:
                df[col] = "Unknown"

        # ── 3. Drop rows without a name or location ────────────────────────────
        df = df.dropna(subset=["name", "location"])
        df = df[df["name"].str.strip() != ""]
        df = df[df["location"].str.strip() != ""]

        # ── 3b. Fix character encoding on text columns ────────────────────────
        for _enc_col in ("name", "location", "address", "dish_liked"):
            if _enc_col in df.columns:
                df[_enc_col] = df[_enc_col].astype(str).apply(_fix_encoding)

        # ── 4. Parse rating ───────────────────────────────────────────────────
        if "rate_raw" in df.columns:
            df["rating"] = df["rate_raw"].apply(_parse_rate)
        else:
            df["rating"] = 0.0

        # ── 5. Parse cost ─────────────────────────────────────────────────────
        if "cost_raw" in df.columns:
            df["cost_for_two"] = df["cost_raw"].apply(_parse_cost)
        else:
            df["cost_for_two"] = 0.0

        # ── 6. Cuisine: fill missing, normalise, fix encoding ───────────────
        if "cuisine" not in df.columns:
            df["cuisine"] = "Various"
        df["cuisine"] = df["cuisine"].fillna("Various").astype(str).apply(_fix_encoding)

        # ── 7. City / location normalisation ─────────────────────────────────
        if "city" not in df.columns:
            df["city"] = df["location"]
        df["city"] = df["city"].fillna("").astype(str).apply(_normalise_text).apply(
            lambda c: _apply_alias(c) if c else "Unknown"
        )
        df["location"] = df["location"].fillna("").astype(str).str.strip().str.title()

        # ── 8. Budget tier ────────────────────────────────────────────────────
        df["budget_tier"] = df["cost_for_two"].apply(_budget_tier)

        # ── 9. Boolean helpers ────────────────────────────────────────────────
        for bool_col in ("online_order", "book_table"):
            if bool_col in df.columns:
                df[bool_col] = df[bool_col].map(
                    {"Yes": True, "No": False, True: True, False: False}
                ).fillna(False)

        # ── 10. Votes ─────────────────────────────────────────────────────────
        if "votes" in df.columns:
            df["votes"] = pd.to_numeric(df["votes"], errors="coerce").fillna(0).astype(int)

        # ── 11. Deduplicate on (name, location) — keep highest rated ──────────
        df = (
            df.sort_values("rating", ascending=False)
              .drop_duplicates(subset=["name", "location"], keep="first")
              .reset_index(drop=True)
        )

        # ── 12. Assign stable string IDs ──────────────────────────────────────
        df["id"] = df.index.astype(str)

        # ── 13. Select and order final columns ────────────────────────────────
        keep = [
            "id", "name", "location", "city", "cuisine",
            "rating", "cost_for_two", "budget_tier",
            "address", "online_order", "book_table", "votes",
            "rest_type", "dish_liked",
        ]
        existing_keep = [c for c in keep if c in df.columns]
        df = df[existing_keep].copy()

        logger.info("Preprocessing complete: %d unique restaurants retained.", len(df))
        return df

    # ── Metadata extraction ────────────────────────────────────────────────────

    def _extract_metadata(self) -> None:
        if self.df is None:
            return

        # Locations: from the city column
        self.locations = sorted(
            self.df["city"].dropna()
                           .str.strip()
                           .loc[lambda s: s != ""]
                           .unique()
                           .tolist()
        )

        # Cuisines: split comma-separated values and flatten
        all_cuisines = (
            self.df["cuisine"]
                .dropna()
                .astype(str)
                .str.split(",")
                .explode()
                .str.strip()
                .str.title()
        )
        self.cuisines = sorted(
            all_cuisines[all_cuisines.str.len() > 0].unique().tolist()
        )


# ── Singleton ──────────────────────────────────────────────────────────────────
# Imported and used by both main.py (startup) and the filter service.
data_loader = DataLoader()
