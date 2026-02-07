"""
Pydantic schemas for Activity entity.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ActivityBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    type: str = Field(..., max_length=50)
    timestamp: str = Field(..., max_length=50)


class ActivityCreate(ActivityBase):
    pass


class ActivityResponse(ActivityBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ActivityList(BaseModel):
    total: int
    activities: List[ActivityResponse]
