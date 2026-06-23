"""
Recommendations Router
───────────────────────
Provides:
  POST /api/recommendations  — main recommendation endpoint
  GET  /api/metadata         — filter options for UI dropdowns (moved here
                               from main.py for cleaner separation; main.py
                               retains a duplicate for backward compat).
"""

import logging

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from app.models.schemas import UserPreferences, RecommendationResponse, MetadataResponse
from app.services.data_loader import data_loader
from app.services.orchestrator import get_recommendations

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Recommendations"])


# ── POST /api/recommendations ──────────────────────────────────────────────────

@router.post(
    "/recommendations",
    response_model=RecommendationResponse,
    summary="Get AI-powered restaurant recommendations",
    description=(
        "Accepts user preferences (location, budget, cuisine, rating) and "
        "returns an LLM-ranked shortlist of restaurants with natural-language "
        "explanations."
    ),
    status_code=status.HTTP_200_OK,
)
async def recommend(prefs: UserPreferences) -> RecommendationResponse:
    """Main recommendation endpoint."""
    if not data_loader.is_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "Dataset not loaded",
                "message": (
                    "The backend is still initialising or the dataset failed to load. "
                    "Please retry in a few seconds."
                ),
            },
        )

    logger.info(
        "Recommendation request | location=%r | budget=%r | cuisine=%r | min_rating=%s | top_k=%d",
        prefs.location, prefs.budget, prefs.cuisine, prefs.min_rating, prefs.top_k,
    )

    try:
        result = await get_recommendations(prefs)
    except Exception as exc:
        logger.exception("Unhandled error in recommendation pipeline: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal server error",
                "message": "An unexpected error occurred while generating recommendations.",
            },
        ) from exc

    return result


# ── GET /api/metadata ──────────────────────────────────────────────────────────

@router.get(
    "/metadata",
    response_model=MetadataResponse,
    summary="Get filter metadata",
    description="Returns available locations, cuisines, and budget tiers for populating frontend dropdowns.",
    status_code=status.HTTP_200_OK,
)
async def get_metadata() -> MetadataResponse:
    """Return metadata for UI dropdowns."""
    return MetadataResponse(
        locations=data_loader.locations if data_loader.is_ready else [],
        cuisines=data_loader.cuisines if data_loader.is_ready else [],
    )
