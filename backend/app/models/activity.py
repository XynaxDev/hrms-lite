"""
SQLAlchemy models for Activity entity.
"""

from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.sql import func
from app.db.database import Base


class Activity(Base):
    """System activity log database model."""

    __tablename__ = "activities"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(
        String(50), nullable=False, index=True
    )  # e.g., 'onboarding', 'payroll', 'attendance'
    timestamp = Column(String(50), nullable=False)

    # Demo isolation (nullable in production)
    device_id = Column(String(128), nullable=True, index=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Activity(id={self.id}, title={self.title}, type={self.type})>"
