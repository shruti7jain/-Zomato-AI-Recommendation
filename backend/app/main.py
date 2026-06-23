import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.routes.recommendations import router as recommendations_router
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan: dataset loads once before the server accepts traffic ────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.services.data_loader import data_loader
    logger.info("Starting up ZOMATA AI backend…")
    try:
        data_loader.load()
    except Exception as exc:
        logger.critical("Dataset failed to load — server will start in degraded mode: %s", exc)
    yield
    logger.info("Shutting down ZOMATA AI backend.")


# ── App factory ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Zomata Milestone AI API",
    description="Backend API for AI-powered restaurant recommendations using Groq LLM",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
_raw_origins = os.getenv("CORS_ORIGINS", "*")
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(recommendations_router)


# ── Health check (inline — no dataset dependency) ─────────────────────────────
@app.get("/api/health", tags=["System"])
async def health_check():
    """Returns service status and dataset load info."""
    from app.services.data_loader import data_loader
    return {
        "status": "ok" if data_loader.is_ready else "degraded",
        "dataset_loaded": data_loader.is_ready,
        "restaurant_count": len(data_loader.df) if data_loader.df is not None else 0,
    }

# ── Static Files (Frontend) ───────────────────────────────────────────────────
if os.path.isdir("../frontend_html"):
    app.mount("/", StaticFiles(directory="../frontend_html", html=True), name="frontend")
