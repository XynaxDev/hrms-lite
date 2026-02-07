"""
API endpoints module initialization.
"""

from app.api.endpoints.employees import router as employees_router
from app.api.endpoints.attendance import router as attendance_router
from app.api.endpoints.chat import router as chat_router
from app.api.endpoints.activities import router as activities_router

__all__ = ["employees_router", "attendance_router", "chat_router", "activities_router"]
