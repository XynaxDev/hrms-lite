"""
SQLAlchemy models for Attendance entity.
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.sql import func
from app.db.database import Base
import enum


class AttendanceStatusEnum(str, enum.Enum):
    """Attendance status enumeration."""

    PRESENT = "Present"
    ABSENT = "Absent"
    ON_LEAVE = "On Leave"


class Attendance(Base):
    """Attendance record database model."""

    __tablename__ = "attendance"

    id = Column(String(20), primary_key=True, index=True)
    employee_id = Column(
        String(20), ForeignKey("employees.id"), nullable=False, index=True
    )
    employee_name = Column(String(100), nullable=False)
    avatar = Column(Text, nullable=True)
    role = Column(String(100), nullable=False)
    date = Column(String(20), nullable=False, index=True)
    status = Column(SQLEnum(AttendanceStatusEnum), nullable=False, index=True)
    check_in = Column(String(20), nullable=True)
    check_out = Column(String(20), nullable=True)
    work_hours = Column(String(20), nullable=True)

    # Demo isolation (nullable in production)
    device_id = Column(String(128), nullable=True, index=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Attendance(id={self.id}, employee_id={self.employee_id}, date={self.date}, status={self.status})>"
