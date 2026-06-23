from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal


# ── Input ──────────────────────────────────────────────────────────────────────

class UserPreferences(BaseModel):
    """Validated user preference payload sent from the frontend."""
    location: str = Field(..., min_length=1, description="City or locality for recommendation")
    budget: Literal["low", "medium", "high"] = Field(..., description="Budget tier")
    cuisine: Optional[str] = Field(None, description="Preferred cuisine type (partial match)")
    min_rating: Optional[float] = Field(None, ge=0.0, le=5.0, description="Minimum acceptable rating (0–5)")
    additional_preferences: Optional[str] = Field(
        None, max_length=500,
        description="Any extra preferences (max 500 chars)"
    )
    top_k: int = Field(5, ge=1, le=20, description="Number of recommendations to return")

    @field_validator("location")
    @classmethod
    def strip_location(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("location must be a non-empty string")
        return stripped

    @field_validator("cuisine")
    @classmethod
    def strip_cuisine(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        stripped = v.strip()
        return stripped if stripped else None

    @field_validator("additional_preferences")
    @classmethod
    def strip_additional(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        stripped = v.strip()
        return stripped if stripped else None


# ── Internal data ──────────────────────────────────────────────────────────────

class Restaurant(BaseModel):
    """Canonical restaurant record after preprocessing."""
    id: str
    name: str
    location: str
    city: Optional[str] = None
    cuisine: str
    rating: float
    cost_for_two: float
    budget_tier: Literal["low", "medium", "high"]
    address: Optional[str] = None
    online_order: Optional[bool] = None
    book_table: Optional[bool] = None
    votes: Optional[int] = None
    rest_type: Optional[str] = None
    dish_liked: Optional[str] = None


# ── Output ─────────────────────────────────────────────────────────────────────

class Recommendation(BaseModel):
    """A single ranked recommendation returned to the frontend."""
    rank: int
    name: str
    cuisine: str
    rating: float
    estimated_cost: str
    explanation: str


class RecommendationMeta(BaseModel):
    """Metadata about the recommendation pipeline run."""
    candidates_considered: int
    filters_applied: List[str]
    llm_fallback: bool
    suggestions: Optional[List[str]] = None


class RecommendationResponse(BaseModel):
    """Complete API response for a recommendation request."""
    summary: str
    recommendations: List[Recommendation]
    meta: RecommendationMeta


# ── Metadata endpoint ──────────────────────────────────────────────────────────

class MetadataResponse(BaseModel):
    """Response for GET /api/metadata — used to populate UI dropdowns."""
    locations: List[str]
    cuisines: List[str]
    budgets: List[str] = ["low", "medium", "high"]
