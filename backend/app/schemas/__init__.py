"""
Schemas module initialization.
"""

from app.schemas.employee import (
    EmployeeBase,
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EmployeeListResponse,
    DepartmentType,
    StatusType,
)
from app.schemas.attendance import (
    AttendanceBase,
    AttendanceCreate,
    AttendanceUpdate,
    AttendanceResponse,
    AttendanceListResponse,
    AttendanceStatusType,
    MarkAttendanceRequest,
)
from app.schemas.chat import ChatMessage, ChatRequest, ChatResponse, ChatRole

__all__ = [
    # Employee
    "EmployeeBase",
    "EmployeeCreate",
    "EmployeeUpdate",
    "EmployeeResponse",
    "EmployeeListResponse",
    "DepartmentType",
    "StatusType",
    # Attendance
    "AttendanceBase",
    "AttendanceCreate",
    "AttendanceUpdate",
    "AttendanceResponse",
    "AttendanceListResponse",
    "AttendanceStatusType",
    "MarkAttendanceRequest",
    # Chat
    "ChatMessage",
    "ChatRequest",
    "ChatResponse",
    "ChatRole",
]
