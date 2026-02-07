"""
Pydantic schemas for Attendance API.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class AttendanceStatusType(str, Enum):
    """Attendance status types."""

    PRESENT = "Present"
    ABSENT = "Absent"
    ON_LEAVE = "On Leave"


class AttendanceBase(BaseModel):
    """Base attendance schema."""

    employee_id: str = Field(..., description="Employee ID")
    employee_name: str = Field(..., description="Employee name")
    avatar: Optional[str] = Field(None, description="Avatar URL")
    role: str = Field(..., description="Employee role")
    date: str = Field(..., description="Attendance date (YYYY-MM-DD)")
    status: AttendanceStatusType = Field(..., description="Attendance status")
    check_in: Optional[str] = Field(None, description="Check-in time")
    check_out: Optional[str] = Field(None, description="Check-out time")
    work_hours: Optional[str] = Field(None, description="Total work hours")


class AttendanceCreate(AttendanceBase):
    """Schema for creating attendance record."""

    pass


class AttendanceUpdate(BaseModel):
    """Schema for updating attendance (partial update)."""

    status: Optional[AttendanceStatusType] = None
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    work_hours: Optional[str] = None


class AttendanceResponse(AttendanceBase):
    """Schema for attendance response."""

    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AttendanceListResponse(BaseModel):
    """Paginated attendance list response."""

    attendance_records: list[AttendanceResponse]
    total: int
    page: int
    per_page: int


class MarkAttendanceRequest(BaseModel):
    """Simple request to mark attendance."""

    employee_id: str = Field(..., description="Employee ID")
    status: AttendanceStatusType = Field(..., description="Attendance status")
    date: Optional[str] = Field(None, description="Date (defaults to today)")
