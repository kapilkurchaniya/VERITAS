"""NEXUS API — v1 router aggregation."""
from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.projects import router as projects_router
from app.api.v1.schedules import router as schedules_router
from app.api.v1.activities import router as activities_router

from app.api.v1.capture import router as capture_router
from app.api.v1.events import router as events_router
from app.api.v1.governance import router as governance_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(projects_router)
api_v1_router.include_router(schedules_router)
api_v1_router.include_router(activities_router)
api_v1_router.include_router(capture_router)
api_v1_router.include_router(events_router)
api_v1_router.include_router(governance_router)
