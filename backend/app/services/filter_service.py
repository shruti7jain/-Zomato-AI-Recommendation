"""
Filter Service
──────────────
Applies deterministic filters (location, cuisine, budget, rating) to the
full dataset and returns a ranked candidate list for the LLM to re-rank.

Strategy
--------
1. Hard filter on location (city or locality substring match).
2. Soft filter on cuisine (partial match; skipped if no match found).
3. Hard filter on budget tier.
4. Hard filter on min_rating (if provided).
5. Sort by (rating DESC, votes DESC) and cap at MAX_CANDIDATES.
"""

import logging
from typing import Optional

import pandas as pd

from app.services.data_loader import data_loader
from app.models.schemas import UserPreferences

logger = logging.getLogger(__name__)

MAX_CANDIDATES = 30   # Maximum rows sent to the LLM
MIN_CANDIDATES = 5    # If we have fewer than this after hard filters, relax cuisine


def _location_mask(df: pd.DataFrame, location: str) -> pd.Series:
    """Return boolean mask for rows matching location (city or locality)."""
    loc_lower = location.strip().lower()
    city_match = df["city"].str.lower().str.contains(loc_lower, na=False, regex=False)
    loc_match = df["location"].str.lower().str.contains(loc_lower, na=False, regex=False)
    return city_match | loc_match


def _cuisine_mask(df: pd.DataFrame, cuisine: str) -> pd.Series:
    """Return boolean mask for rows whose cuisine contains the given term."""
    return df["cuisine"].str.lower().str.contains(
        cuisine.strip().lower(), na=False, regex=False
    )


def filter_candidates(prefs: UserPreferences) -> tuple[pd.DataFrame, list[str]]:
    """
    Apply deterministic filters and return (candidate_df, filters_applied_list).

    Parameters
    ----------
    prefs : UserPreferences
        Validated user preference payload.

    Returns
    -------
    tuple[pd.DataFrame, list[str]]
        A (possibly empty) DataFrame of candidate restaurants, and a list of
        human-readable strings describing which filters were applied.
    """
    if not data_loader.is_ready or data_loader.df is None:
        logger.error("DataLoader not ready — cannot filter.")
        return pd.DataFrame(), []

    df = data_loader.df.copy()
    filters_applied: list[str] = []

    # ── 1. Location filter (hard) ──────────────────────────────────────────────
    loc_mask = _location_mask(df, prefs.location)
    if loc_mask.sum() > 0:
        df = df[loc_mask]
        filters_applied.append(f"location={prefs.location!r}")
        logger.debug("After location filter: %d rows", len(df))
    else:
        logger.warning("No restaurants found for location=%r — returning empty", prefs.location)
        return pd.DataFrame(), filters_applied + [f"location={prefs.location!r} (no matches)"]

    # ── 2. Budget tier filter (hard) ───────────────────────────────────────────
    budget_mask = df["budget_tier"] == prefs.budget
    if budget_mask.sum() > 0:
        df = df[budget_mask]
        filters_applied.append(f"budget={prefs.budget!r}")
        logger.debug("After budget filter: %d rows", len(df))
    else:
        logger.warning("No restaurants found for budget tier=%r — returning empty", prefs.budget)
        return pd.DataFrame(), filters_applied + [f"budget={prefs.budget!r} (no matches)"]

    # ── 3. Min rating filter (hard) ────────────────────────────────────────────
    if prefs.min_rating is not None:
        rating_mask = df["rating"] >= prefs.min_rating
        if rating_mask.sum() > 0:
            df = df[rating_mask]
            filters_applied.append(f"min_rating>={prefs.min_rating}")
            logger.debug("After rating filter: %d rows", len(df))
        else:
            logger.warning("No restaurants found for min_rating>=%s — returning empty", prefs.min_rating)
            return pd.DataFrame(), filters_applied + [f"min_rating>={prefs.min_rating} (no matches)"]

    # ── 4. Cuisine filter (hard) ──────────────
    if prefs.cuisine:
        cuisine_mask = _cuisine_mask(df, prefs.cuisine)
        if cuisine_mask.sum() > 0:
            df = df[cuisine_mask]
            filters_applied.append(f"cuisine={prefs.cuisine!r}")
            logger.debug("After cuisine filter: %d rows", len(df))
        else:
            logger.warning("No restaurants found for cuisine=%r — returning empty", prefs.cuisine)
            return pd.DataFrame(), filters_applied + [f"cuisine={prefs.cuisine!r} (no matches)"]

    # ── 5. Sort and cap ────────────────────────────────────────────────────────
    sort_cols = [c for c in ["rating", "votes"] if c in df.columns]
    if sort_cols:
        df = df.sort_values(sort_cols, ascending=False)

    candidates = df.head(MAX_CANDIDATES).reset_index(drop=True)

    logger.info(
        "Filter complete: %d candidates | filters=%s",
        len(candidates), filters_applied
    )
    return candidates, filters_applied
