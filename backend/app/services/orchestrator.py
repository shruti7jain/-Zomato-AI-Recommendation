"""
Orchestrator
────────────
Coordinates the full recommendation pipeline:

  UserPreferences
      │
      ▼
  filter_service.filter_candidates()     ← deterministic filtering
      │
      ▼
  prompt_builder.build_user_message()   ← prompt construction
      │
      ▼
  llm_client.call_llm()                 ← Groq API call
      │
      ▼
  _parse_llm_output()                   ← JSON → Pydantic
      │
      ▼
  RecommendationResponse

Fallback
--------
If the LLM call fails (network error, parse error, key missing), the
orchestrator falls back to a deterministic ranking (top-k by rating) with a
generic explanation, so the endpoint always returns something useful.
"""

import logging
from typing import Any

import pandas as pd

from app.models.schemas import (
    UserPreferences,
    Recommendation,
    RecommendationMeta,
    RecommendationResponse,
)
from app.services.filter_service import filter_candidates
from app.services.prompt_builder import SYSTEM_PROMPT, build_user_message
from app.services.llm_client import call_llm

logger = logging.getLogger(__name__)


# ── Public entry point ─────────────────────────────────────────────────────────

async def get_recommendations(prefs: UserPreferences) -> RecommendationResponse:
    """
    Run the full pipeline and return a ``RecommendationResponse``.

    This is an ``async`` function so it can be awaited directly from the
    FastAPI route handler — the Groq SDK call is synchronous but lightweight
    enough for this prototype (no dedicated thread pool needed).
    """
    # ── Step 1: Filter ─────────────────────────────────────────────────────────
    candidates, filters_applied = filter_candidates(prefs)
    num_candidates = len(candidates)
    logger.info("Orchestrator: %d candidates after filtering.", num_candidates)

    # ── Step 2: Handle empty candidates ───────────────────────────────────────
    if num_candidates == 0:
        return _empty_response(prefs, filters_applied)

    # ── Step 3: Build prompt ───────────────────────────────────────────────────
    user_message = build_user_message(prefs, candidates, filters_applied)

    # ── Step 4: Call LLM ──────────────────────────────────────────────────────
    llm_fallback = False
    try:
        llm_data = call_llm(SYSTEM_PROMPT, user_message)
        response = _build_response(llm_data, prefs, filters_applied, num_candidates, llm_fallback=False)
    except Exception as exc:
        logger.warning("LLM call failed, using fallback ranking: %s", exc)
        llm_fallback = True
        response = _fallback_response(candidates, prefs, filters_applied, num_candidates)

    return response


# ── Internal helpers ───────────────────────────────────────────────────────────

def _build_response(
    llm_data: dict[str, Any],
    prefs: UserPreferences,
    filters_applied: list[str],
    num_candidates: int,
    *,
    llm_fallback: bool,
) -> RecommendationResponse:
    """Convert parsed LLM JSON into a validated RecommendationResponse."""
    raw_recs: list[dict] = llm_data.get("recommendations", [])
    summary: str = llm_data.get("summary", "Here are your personalised restaurant recommendations.")

    recommendations: list[Recommendation] = []
    for i, item in enumerate(raw_recs[: prefs.top_k], start=1):
        try:
            rec = Recommendation(
                rank=item.get("rank", i),
                name=item.get("name", "Unknown"),
                cuisine=item.get("cuisine", "Various"),
                rating=float(item.get("rating", 0.0)),
                estimated_cost=str(item.get("estimated_cost", "N/A")),
                explanation=item.get("explanation", "A great choice for your preferences."),
            )
            recommendations.append(rec)
        except Exception as exc:
            logger.warning("Skipping malformed recommendation item %d: %s", i, exc)

    return RecommendationResponse(
        summary=summary,
        recommendations=recommendations,
        meta=RecommendationMeta(
            candidates_considered=num_candidates,
            filters_applied=filters_applied,
            llm_fallback=llm_fallback,
        ),
    )


def _fallback_response(
    candidates: pd.DataFrame,
    prefs: UserPreferences,
    filters_applied: list[str],
    num_candidates: int,
) -> RecommendationResponse:
    """Deterministic fallback: top-k by rating with a generic explanation."""
    top = candidates.head(prefs.top_k)
    recommendations: list[Recommendation] = []

    for i, row in enumerate(top.itertuples(index=False), start=1):
        cost = getattr(row, "cost_for_two", 0) or 0
        recommendations.append(
            Recommendation(
                rank=i,
                name=getattr(row, "name", "Unknown"),
                cuisine=getattr(row, "cuisine", "Various"),
                rating=float(getattr(row, "rating", 0.0)),
                estimated_cost=f"₹{int(cost)} for two" if cost else "N/A",
                explanation=(
                    f"Rated {getattr(row, 'rating', 'N/A')}/5 and located in "
                    f"{getattr(row, 'location', prefs.location)}. "
                    "This is a highly-rated option matching your filters."
                ),
            )
        )

    return RecommendationResponse(
        summary=(
            f"We found {len(recommendations)} restaurant(s) in {prefs.location} "
            f"within the {prefs.budget} budget tier. AI ranking was unavailable; "
            "results are sorted by rating."
        ),
        recommendations=recommendations,
        meta=RecommendationMeta(
            candidates_considered=num_candidates,
            filters_applied=filters_applied,
            llm_fallback=True,
            suggestions=["Try broadening your cuisine or budget filters for more options."],
        ),
    )


def _empty_response(prefs: UserPreferences, filters_applied: list[str]) -> RecommendationResponse:
    """Return a helpful empty response when no candidates are found."""
    suggestions = [
        f"Try a different location — '{prefs.location}' may be misspelled.",
        "Broaden the budget tier (e.g., switch from 'low' to 'medium').",
        "Remove the cuisine filter to see all restaurants in that area.",
    ]
    return RecommendationResponse(
        summary=(
            f"No restaurants found matching your criteria in {prefs.location}. "
            "Try adjusting your filters."
        ),
        recommendations=[],
        meta=RecommendationMeta(
            candidates_considered=0,
            filters_applied=filters_applied,
            llm_fallback=False,
            suggestions=suggestions,
        ),
    )
