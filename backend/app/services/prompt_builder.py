"""
Prompt Builder
──────────────
Constructs the system prompt and user message sent to the Groq LLM.

Design
------
- System prompt: defines the AI persona, output format (strict JSON), and
  rules for ranking (prefer cuisine match, then rating, then cost).
- User message: injects the serialised candidate list and user preferences.
- The LLM is instructed to return ONLY a JSON object — no prose, no markdown
  fences — so the response can be parsed deterministically.
"""

import json
import logging
from typing import Any

import pandas as pd

from app.models.schemas import UserPreferences

logger = logging.getLogger(__name__)

# ── System prompt ──────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are ZOMATA AI, an expert restaurant recommendation engine for Indian cities.

Your task:
Given a list of candidate restaurants (in JSON) and the user's preferences, produce a ranked shortlist.

Output rules (STRICT — violations will break the system):
1. Respond with ONLY a valid JSON object — no markdown fences, no explanatory text.
2. The JSON must have exactly two keys: "summary" and "recommendations".
3. "summary": a single sentence (max 60 words) summarising why these restaurants fit.
4. "recommendations": an ordered array of objects, best match first.
   Each object must have:
   - "rank"           : integer starting at 1
   - "name"           : exact restaurant name from the candidates list
   - "cuisine"        : cuisine string from the candidates list
   - "rating"         : rating float from the candidates list
   - "estimated_cost" : e.g. "₹400 for two" based on cost_for_two value
   - "explanation"    : 1–2 sentences on why this restaurant suits the user

Ranking priorities (in order):
  a. Cuisine match with user preference
  b. Higher rating
  c. Higher votes (popularity proxy)
  d. Cost within requested budget tier

Only include restaurants that exist in the candidates JSON.
Return at most the requested top_k recommendations."""


# ── Builder ───────────────────────────────────────────────────────────────────

def build_user_message(
    prefs: UserPreferences,
    candidates: pd.DataFrame,
    filters_applied: list[str],
) -> str:
    """
    Serialise candidates and user preferences into the LLM user message.

    Parameters
    ----------
    prefs : UserPreferences
    candidates : pd.DataFrame  — already filtered and capped
    filters_applied : list[str]

    Returns
    -------
    str — the formatted user message string
    """
    # Serialise candidates to a compact JSON list
    candidate_records: list[dict[str, Any]] = _df_to_records(candidates)

    prefs_dict = {
        "location": prefs.location,
        "budget": prefs.budget,
        "cuisine_preference": prefs.cuisine or "any",
        "min_rating": prefs.min_rating,
        "additional_preferences": prefs.additional_preferences or "none",
        "top_k": prefs.top_k,
    }

    message = (
        f"User Preferences:\n{json.dumps(prefs_dict, ensure_ascii=False, indent=2)}\n\n"
        f"Filters Applied: {', '.join(filters_applied) if filters_applied else 'none'}\n\n"
        f"Candidate Restaurants ({len(candidate_records)} total):\n"
        f"{json.dumps(candidate_records, ensure_ascii=False, indent=2)}\n\n"
        f"Return your JSON response now."
    )

    logger.debug("User message built: %d candidates, prefs=%s", len(candidate_records), prefs_dict)
    return message


def _df_to_records(df: pd.DataFrame) -> list[dict[str, Any]]:
    """Convert DataFrame rows to a lean list of dicts for the LLM."""
    cols_to_include = [
        "name", "cuisine", "rating", "cost_for_two",
        "budget_tier", "location", "votes", "rest_type", "dish_liked",
    ]
    existing_cols = [c for c in cols_to_include if c in df.columns]
    records = df[existing_cols].copy()

    # Replace NaN / NaT with None for clean JSON
    records = records.where(records.notna(), other=None)
    return records.to_dict(orient="records")
