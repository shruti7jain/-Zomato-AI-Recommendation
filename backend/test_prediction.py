"""
Standalone Phase 3 test script
───────────────────────────────
Tests the full pipeline (filter → prompt → Groq LLM) with:
  Location : Bellandur
  Budget   : high  (Rs. 2000 for two > Rs. 1500 medium threshold)
  Rating   : 4.5 minimum
  Top-K    : 3

Run from the backend/ directory:
    python test_prediction.py
"""

import sys
import os
import json

# Force UTF-8 output so any restaurant names with special chars print cleanly
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# Add the backend directory to sys.path so imports resolve
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load .env before anything else
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# ── Validate API key before loading the heavy dataset ─────────────────────────
api_key = os.getenv("GROQ_API_KEY", "")
if not api_key or api_key == "your_groq_api_key_here":
    print("\n[ERROR]  GROQ_API_KEY is not set in backend/.env")
    print("   Open backend/.env and replace 'your_groq_api_key_here' with your real key.\n")
    sys.exit(1)

print("[OK]  GROQ_API_KEY found.\n")

# ── Load the dataset ───────────────────────────────────────────────────────────
print("[INFO]  Loading Zomato dataset from Hugging Face (may use cache)…")
from app.services.data_loader import data_loader
data_loader.load()
print(f"   → {len(data_loader.df):,} restaurants loaded.\n")

# ── Build user preferences ─────────────────────────────────────────────────────
from app.models.schemas import UserPreferences

prefs = UserPreferences(
    location="Bellandur",
    budget="high",          # Rs. 2000 for two → high tier (>Rs. 1500)
    min_rating=4.5,
    cuisine=None,           # no cuisine filter → broader results
    additional_preferences="Looking for top-rated fine dining or popular spots",
    top_k=3,
)

print(f"[INPUT]  Preferences:")
print(f"   Location    : {prefs.location}")
print(f"   Budget tier : {prefs.budget}  (Rs. 2000 for two > Rs. 1500 threshold → 'high')")
print(f"   Min rating  : {prefs.min_rating}/5")
print(f"   Top-K       : {prefs.top_k}\n")

# ── Step 1: Filter ─────────────────────────────────────────────────────────────
from app.services.filter_service import filter_candidates

candidates, filters_applied = filter_candidates(prefs)
print(f"[FILTER]  Filters applied : {filters_applied}")
print(f"   Candidates found : {len(candidates)}\n")

if len(candidates) == 0:
    print("[WARN]  No candidates found for these filters.")
    print("   Try: broader budget, lower min_rating, or check location spelling.")
    sys.exit(0)

# Show the top candidates before LLM ranking
print("[CANDIDATES]  Top candidates being sent to LLM (sorted by rating):")
preview_cols = ["name", "cuisine", "rating", "cost_for_two", "location"]
existing = [c for c in preview_cols if c in candidates.columns]
print(candidates[existing].head(10).to_string(index=False))
print()

# ── Step 2: Build prompt ───────────────────────────────────────────────────────
from app.services.prompt_builder import SYSTEM_PROMPT, build_user_message

user_message = build_user_message(prefs, candidates, filters_applied)

# ── Step 3: Call Groq LLM ──────────────────────────────────────────────────────
from app.services.llm_client import call_llm

print("[LLM]  Calling Groq LLM (llama3-8b-8192)…")
try:
    llm_data = call_llm(SYSTEM_PROMPT, user_message)
except Exception as e:
    print(f"[ERROR]  LLM call failed: {e}")
    sys.exit(1)

# ── Step 4: Display results ────────────────────────────────────────────────────
print("\n" + "═" * 60)
print("  ZOMATA AI — Top 3 Restaurant Recommendations")
print("═" * 60)
print(f"\n📝  Summary: {llm_data.get('summary', 'N/A')}\n")

recs = llm_data.get("recommendations", [])
for rec in recs[:3]:
    print(f"  #{rec.get('rank', '?')}  {rec.get('name', 'Unknown')}")
    print(f"      Cuisine  : {rec.get('cuisine', 'N/A')}")
    print(f"      Rating   : {rec.get('rating', 'N/A')}/5")
    print(f"      Est. Cost: {rec.get('estimated_cost', 'N/A')}")
    print(f"      Why      : {rec.get('explanation', 'N/A')}")
    print()

print("═" * 60)
