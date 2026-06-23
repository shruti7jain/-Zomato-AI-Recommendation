# ZOMATA Milestone AI — Implementation Plan

This plan organises the build into **clearly separated Backend and Frontend phases**. Phases 1–4 cover the complete backend stack (done). Phases 5–7 cover the frontend with a premium UI. Phase 8 is final integration and polish.

---

## ✅ Phase 1: Backend — Project Initialisation & Setup
> **Status: COMPLETE**

Set up the core backend environment, dependencies, and application skeleton.

### `backend/`

#### ✅ [DONE] [backend/requirements.txt](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/backend/requirements.txt)
Dependencies: `fastapi`, `uvicorn[standard]`, `datasets`, `pandas`, `groq`, `pydantic`, `python-dotenv`.

#### ✅ [DONE] [backend/app/main.py](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/backend/app/main.py)
FastAPI app with lifespan hook (dataset loads at startup), CORS middleware, health check at `GET /api/health`.

#### ✅ [DONE] [backend/.env.example](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/backend/.env.example)
Template for: `GROQ_API_KEY`, `LLM_MODEL`, `LLM_PROVIDER`, `CORS_ORIGINS`.

---

## ✅ Phase 2: Backend — Data Ingestion & Models
> **Status: COMPLETE**

#### ✅ [DONE] [backend/app/models/schemas.py](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/backend/app/models/schemas.py)
Pydantic schemas: `UserPreferences`, `Restaurant`, `Recommendation`, `RecommendationResponse`, `MetadataResponse`.

#### ✅ [DONE] [backend/app/services/data_loader.py](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/backend/app/services/data_loader.py)
Downloads, caches, and preprocesses the Zomato dataset from Hugging Face (`ManikaSaini/zomato-restaurant-recommendation`). Normalises rating, cost, cuisine, location, and budget tier. Exposes `data_loader` singleton.

---

## ✅ Phase 3: Backend — Core API & Groq LLM Integration
> **Status: COMPLETE**

#### ✅ [DONE] [backend/app/services/filter_service.py](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/backend/app/services/filter_service.py)
Deterministic filtering: location → budget → rating → cuisine (soft). Caps at 30 candidates.

#### ✅ [DONE] [backend/app/services/prompt_builder.py](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/backend/app/services/prompt_builder.py)
Builds system + user prompts with strict JSON output rules for the LLM.

#### ✅ [DONE] [backend/app/services/llm_client.py](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/backend/app/services/llm_client.py)
Groq API integration using `llama-3.3-70b-versatile`. Lazy singleton, robust JSON parsing, markdown fence stripping.

#### ✅ [DONE] [backend/app/services/orchestrator.py](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/backend/app/services/orchestrator.py)
Coordinates the full filter → prompt → LLM → parse pipeline. Graceful fallback to deterministic ranking if LLM fails.

#### ✅ [DONE] [backend/app/routes/recommendations.py](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/backend/app/routes/recommendations.py)
`POST /api/recommendations` — main endpoint.  
`GET /api/metadata` — returns locations, cuisines, budgets for UI dropdowns.

---

## ✅ Phase 4: Backend — Verification
> **Status: COMPLETE**

- ✅ Dataset loads successfully (12,140 restaurants)
- ✅ Filter pipeline: location + budget + rating filters working
- ✅ Groq LLM (`llama-3.3-70b-versatile`) returns valid ranked JSON
- ✅ Live test: Bellandur + high budget + rating 4.5 → Top 3 correct results

---

## ✅ Phase 5: Frontend — Design System & Foundation
> **Status: COMPLETE**

Establish the visual identity, design tokens, and global styles before building any component.

### `frontend/src/`

#### ✅ [DONE] [frontend/src/index.css](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/frontend/src/index.css)
- Import Google Fonts (`Inter`, `Plus Jakarta Sans`)
- Define CSS custom properties (color palette, spacing scale, shadows, border radii)
- Dark-mode base: deep charcoal background, warm accent colors (saffron/coral inspired by Zomato)
- Glassmorphism utility classes: `.glass-card`, `.glass-input`
- Smooth scroll, focus ring, and animation keyframes (`fade-up`, `shimmer`, `pulse-glow`)
- Tailwind base layer extensions for the design system

#### ✅ [DONE] [frontend/src/components/ui/Spinner.tsx](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/frontend/src/components/ui/Spinner.tsx)
Animated loading spinner with pulsing ring — used in skeleton states.

#### ✅ [DONE] [frontend/src/components/ui/Badge.tsx](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/frontend/src/components/ui/Badge.tsx)
Pill badge for cuisine tags, budget tier, and rating labels.

#### ✅ [DONE] [frontend/src/components/ui/StarRating.tsx](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/frontend/src/components/ui/StarRating.tsx)
Animated star rating display (filled/half/empty) with numeric label.

---

## ✅ Phase 6: Frontend — Core Components
> **Status: COMPLETE**

Build all visible UI components using the design system from Phase 5.

### Hero Section

#### ✅ [DONE] [frontend/src/components/Hero.tsx](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/frontend/src/components/Hero.tsx)
- Full-viewport hero with animated gradient background (deep navy → saffron diagonal)
- Bold headline: *"Find your perfect table, powered by AI"*
- Animated floating food icons (subtle parallax on scroll)
- Smooth scroll-down arrow CTA

### Preference Form

#### ✅ [DONE] [frontend/src/components/PreferenceForm.tsx](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/frontend/src/components/PreferenceForm.tsx)
- Glassmorphism card (`backdrop-filter: blur`) on dark background
- **Location** — searchable `<select>` populated from `GET /api/metadata`, with a city icon
- **Budget** — 3-option segmented toggle (Low / Medium / High) with animated active state
- **Cuisine** — searchable dropdown (optional), populated from metadata
- **Min Rating** — interactive star-click input (1–5) with hover preview
- **Additional Preferences** — styled `<textarea>` with character counter
- **Submit button** — gradient fill, shimmer hover effect, loading spinner inside on submit
- Full validation with inline error messages (red shake animation on invalid submit)

### Results Panel

#### ✅ [DONE] [frontend/src/components/ResultsPanel.tsx](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/frontend/src/components/ResultsPanel.tsx)
- Summary banner with AI icon and the LLM summary sentence
- Staggered `fade-up` entrance animation (each card delays by 100ms × rank)
- Empty state: illustrated SVG + helpful suggestions from the API
- Error state: red-tinted card with retry button

#### ✅ [DONE] [frontend/src/components/RestaurantCard.tsx](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/frontend/src/components/RestaurantCard.tsx)
Premium card design:
- **Rank badge** — large glowing number top-left (#1 = gold, #2 = silver, #3 = bronze)
- **Name** — large bold typography
- **Cuisine tags** — scrollable pill row (each cuisine split into its own `<Badge>`)
- **Rating** — `<StarRating>` component + vote count
- **Estimated cost** — with rupee icon
- **AI Explanation** — italicised blockquote with a subtle left border accent
- Hover: card lifts (translate-y + stronger shadow), smooth 200ms ease
- Glass morphism: semi-transparent dark card with frosted border

### Skeleton Loader

#### ✅ [DONE] [frontend/src/components/SkeletonCards.tsx](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/frontend/src/components/SkeletonCards.tsx)
3 placeholder cards with animated shimmer sweep — shown during API loading state.

---

## ✅ Phase 7: Frontend — App Orchestration & API Client
> **Status: COMPLETE**

Wire everything together and connect to the backend.

### API Client

#### ✅ [DONE] [frontend/src/api/client.ts](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/frontend/src/api/client.ts)
- `fetchMetadata()` — calls `GET /api/metadata`, returns locations + cuisines
- `fetchRecommendations(prefs)` — calls `POST /api/recommendations`, returns `RecommendationResponse`
- Typed request/response interfaces mirroring backend Pydantic schemas
- Centralised error handling (network errors, 503, 500)

### App Root

#### ✅ [DONE] [frontend/src/App.tsx](file:///c:/Users/shrut/ZOMATA-MILESTONE-AI/frontend/src/App.tsx)
Application state machine with 5 explicit states:

| State | What renders |
|-------|-------------|
| `idle` | `<Hero>` + `<PreferenceForm>` (metadata loaded) |
| `loading` | `<PreferenceForm>` (disabled) + `<SkeletonCards>` |
| `success` | `<ResultsPanel>` with recommendation cards |
| `empty` | `<ResultsPanel>` with empty state + suggestions |
| `error` | `<ResultsPanel>` with error card + retry button |

- Metadata fetched once on mount via `useEffect`
- Smooth transition between states (CSS fade)
- Sticky nav header: ZOMATA AI logo + "How it works" anchor link

---

## ✅ Phase 8: Integration, Polish & Verification
> **Status: COMPLETE**

### Integration Checklist
- [x] Frontend `vite.config.ts` proxy → `http://localhost:8000` (avoids CORS in dev)
- [x] `npm install` and verify all packages resolve
- [x] Start both servers: `uvicorn app.main:app --reload` + `npm run dev`
- [x] End-to-end test: submit form → see real LLM recommendations in UI

### Visual QA Checklist
- [x] Hero gradient renders correctly on all viewport widths
- [x] Form validation shows inline errors without page reload
- [x] Loading skeleton matches card layout exactly
- [x] Staggered card animations play smoothly (no layout shift)
- [x] Hover effects on cards feel premium and responsive
- [x] Mobile layout (< 640px): stacked cards, full-width form fields

### Verification Plan

#### Automated
```bash
# Backend health
curl http://localhost:8000/api/health
curl http://localhost:8000/api/metadata

# Recommendation test
curl -X POST http://localhost:8000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"location":"Bellandur","budget":"high","min_rating":4.0,"top_k":3}'
```

#### Manual
- Submit the form in the browser and verify cards render with AI explanations
- Test empty state: search for a location that has no restaurants
- Test error state: stop the backend and submit the form
- Resize browser to mobile width and verify layout adapts
