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

    # ── 3. Cuisine filter (soft) ───────────────────────────────────────────────
    # Soft: if no match found, skip the cuisine filter and note it in filters_applied
    if prefs.cuisine:
        cuisine_mask = _cuisine_mask(df, prefs.cuisine)
        if cuisine_mask.sum() > 0:
            df = df[cuisine_mask]
            filters_applied.append(f"cuisine={prefs.cuisine!r}")
            logger.debug("After cuisine filter: %d rows", len(df))
        else:
            logger.warning(
                "No restaurants found for cuisine=%r in %r — cuisine filter relaxed",
                prefs.cuisine, prefs.location,
            )
            filters_applied.append(
                f"cuisine={prefs.cuisine!r} (not available here — showing best nearby options)"
            )

    # ── 4. Min rating filter (soft) ────────────────────────────────────────────
    # Soft: if min_rating is too strict, relax it rather than returning empty
    if prefs.min_rating is not None:
        rating_mask = df["rating"] >= prefs.min_rating
        if rating_mask.sum() > 0:
            df = df[rating_mask]
            filters_applied.append(f"min_rating>={prefs.min_rating}")
            logger.debug("After rating filter: %d rows", len(df))
        else:
            logger.warning(
                "No restaurants found for min_rating>=%s — rating filter relaxed",
                prefs.min_rating,
            )
            filters_applied.append(
                f"min_rating>={prefs.min_rating} (relaxed — showing top-rated options)"
            )

    # ── 5. Exclude unrated restaurants (rating=0) unless they're all we have ───
    if "rating" in df.columns:
        rated = df[df["rating"] > 0]
        if len(rated) > 0:
            df = rated   # prefer rated restaurants; keep unrated only if nothing else
            logger.debug("Excluded %d unrated (rating=0) restaurants", len(df) - len(rated))

    # ── 6. Sort and cap ────────────────────────────────────────────────────────
    sort_cols = [c for c in ["rating", "votes"] if c in df.columns]
    if sort_cols:
        df = df.sort_values(sort_cols, ascending=False)

    candidates = df.head(MAX_CANDIDATES).reset_index(drop=True)

    # ── 7. Budget relaxation fallback ──────────────────────────────────────────
    # If we still have fewer than top_k candidates, relax the budget filter so
    # we can pad results from the same location across all budget tiers.
    top_k = getattr(prefs, "top_k", 5)
    if len(candidates) < top_k:
        logger.warning(
            "Only %d candidates — relaxing budget to pad results to %d",
            len(candidates), top_k,
        )
        df_all = data_loader.df.copy()
        loc_mask2 = _location_mask(df_all, prefs.location)
        df_all = df_all[loc_mask2]
        # Also exclude unrated restaurants from the padded extras
        if "rating" in df_all.columns:
            rated_all = df_all[df_all["rating"] > 0]
            if len(rated_all) > 0:
                df_all = rated_all
        if prefs.cuisine:
            cuisine_mask2 = _cuisine_mask(df_all, prefs.cuisine)
            if cuisine_mask2.sum() > 0:
                df_all = df_all[cuisine_mask2]
        if sort_cols:
            df_all = df_all.sort_values(
                [c for c in sort_cols if c in df_all.columns], ascending=False
            )
        # Pad with extras not already in candidates
        existing_names = set(candidates["name"].tolist())
        extras = df_all[~df_all["name"].isin(existing_names)].head(top_k - len(candidates))
        candidates = pd.concat([candidates, extras], ignore_index=True)
        filters_applied.append("budget relaxed to find enough results")

        # Re-sort the merged list so padded extras don't disrupt order
        merge_sort_cols = [c for c in ["rating", "votes"] if c in candidates.columns]
        if merge_sort_cols:
            candidates = candidates.sort_values(merge_sort_cols, ascending=False).reset_index(drop=True)

    logger.info(
        "Filter complete: %d candidates | filters=%s",
        len(candidates), filters_applied
    )
    return candidates, filters_applied

