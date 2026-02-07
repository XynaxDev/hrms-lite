"""
API router configuration.
"""

from fastapi import APIRouter, Depends
from app.core.security import get_api_key

from app.api.endpoints import (
    employees_router,
    attendance_router,
    chat_router,
    activities_router,
)

api_router = APIRouter(
    prefix="/api/v1",
    dependencies=[Depends(get_api_key)],  # Global security check
)

# Include all endpoint routers
api_router.include_router(employees_router)
api_router.include_router(attendance_router)
api_router.include_router(chat_router)
api_router.include_router(activities_router, prefix="/activities", tags=["Activities"])
