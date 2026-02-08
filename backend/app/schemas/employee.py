"""
Pydantic schemas for Employee API.
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from pydantic.alias_generators import to_camel
from typing import Optional
from datetime import datetime
from enum import Enum


class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel, populate_by_name=True, from_attributes=True
    )


class DepartmentType(str, Enum):
    """Department types."""

    ENGINEERING = "Engineering"
    DESIGN = "Design"
    MARKETING = "Marketing"
    HR = "HR"
    FINANCE = "Finance"


class StatusType(str, Enum):
    """Employee status types."""

    ACTIVE = "Active"
    INACTIVE = "Inactive"
    TERMINATED = "Terminated"


class EmployeeBase(BaseSchema):
    """Base employee schema."""

    full_name: str = Field(
        ..., min_length=2, max_length=100, description="Employee full name"
    )
    email: EmailStr = Field(..., description="Employee email address")
    role: str = Field(..., min_length=2, max_length=100, description="Job role/title")
    department: DepartmentType = Field(..., description="Department")
    status: StatusType = Field(
        default=StatusType.ACTIVE, description="Employment status"
    )
    avatar: Optional[str] = Field(None, description="Avatar URL or Base64")
    check_in_time: Optional[str] = Field(
        None, max_length=20, description="Check-in time"
    )
    location: Optional[str] = Field(None, max_length=200, description="Work location")
    joined_date: str = Field(..., description="Date joined (YYYY-MM-DD)")


class EmployeeCreate(EmployeeBase):
    """Schema for creating an employee."""

    id: Optional[str] = Field(
        None, min_length=2, max_length=20, description="Custom employee ID"
    )


class EmployeeUpdate(BaseSchema):
    """Schema for updating an employee (all fields optional)."""

    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    role: Optional[str] = Field(None, min_length=2, max_length=100)
    department: Optional[DepartmentType] = None
    status: Optional[StatusType] = None
    avatar: Optional[str] = Field(None)
    check_in_time: Optional[str] = Field(None, max_length=20)
    location: Optional[str] = Field(None, max_length=200)
    joined_date: Optional[str] = None


class EmployeeResponse(EmployeeBase):
    """Schema for employee response."""

    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmployeeListResponse(BaseSchema):
    """Paginated employee list response."""

    employees: list[EmployeeResponse]
    total: int
    page: int
    per_page: int
