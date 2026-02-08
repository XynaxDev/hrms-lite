"""
SQLAlchemy models for Employee entity.
"""

from sqlalchemy import Column, String, DateTime, Text, Enum as SQLEnum
from sqlalchemy.sql import func
from app.db.database import Base
import enum


class DepartmentEnum(str, enum.Enum):
    """Department enumeration."""

    ENGINEERING = "Engineering"
    DESIGN = "Design"
    MARKETING = "Marketing"
    HR = "HR"
    FINANCE = "Finance"


class StatusEnum(str, enum.Enum):
    """Employee status enumeration."""

    ACTIVE = "Active"
    INACTIVE = "Inactive"
    ON_LEAVE = "On Leave"
    TERMINATED = "Terminated"


class Employee(Base):
    """Employee database model."""

    __tablename__ = "employees"

    id = Column(String(20), primary_key=True, index=True)
    full_name = Column(String(100), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(String(100), nullable=False)
    department = Column(
        SQLEnum(
            DepartmentEnum,
            values_callable=lambda x: [e.name for e in x],
            name="departmentenum",
        ),
        nullable=False,
        index=True,
    )
    status = Column(
        SQLEnum(
            StatusEnum,
            values_callable=lambda x: [e.name for e in x],
            name="statusenum",
        ),
        default=StatusEnum.ACTIVE,
        index=True,
    )
    avatar = Column(Text, nullable=True)
    check_in_time = Column(String(20), nullable=True)
    location = Column(String(200), nullable=True)
    joined_date = Column(String(20), nullable=False)

    # Demo isolation (nullable in production)
    device_id = Column(String(128), nullable=True, index=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Employee(id={self.id}, name={self.full_name}, department={self.department})>"
