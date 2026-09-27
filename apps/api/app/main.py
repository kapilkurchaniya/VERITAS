"""
NEXUS API — FastAPI application entry point.

Configures CORS, includes all routers, provides health endpoints.
Run with: uvicorn app.main:app --reload --port 8000
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1 import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup/shutdown events."""
    # Startup
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    yield
    # Shutdown
    print(f"👋 {settings.APP_NAME} shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered project execution intelligence platform",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────
app.include_router(api_v1_router)


# ── Health ────────────────────────────────────────────

@app.get("/health", tags=["Health"])
async def health():
    """Liveness check."""
    return {"status": "ok", "service": settings.APP_NAME}


@app.get("/ready", tags=["Health"])
async def ready():
    """Readiness check — verifies database connectivity."""
    from sqlalchemy import text
    from app.db.session import async_session_factory

    try:
        async with async_session_factory() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        return {"status": "not_ready", "database": str(e)}
