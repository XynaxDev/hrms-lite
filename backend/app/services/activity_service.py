"""
Activity service for managing system activities.
"""

from typing import List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
import uuid

from app.models.activity import Activity
from app.schemas.activity import ActivityCreate


class ActivityService:
    @staticmethod
    def get_all_activities(
        db: Session, limit: int = 10, skip: int = 0, scope_key: str | None = None
    ) -> Tuple[List[Activity], int]:
        """Get all activities with pagination."""
        query = db.query(Activity).order_by(desc(Activity.created_at))
        if scope_key:
            query = query.filter(Activity.device_id == scope_key)
        total = query.count()
        activities = query.offset(skip).limit(limit).all()
        return activities, total

    @staticmethod
    def create_activity(db: Session, activity_in: ActivityCreate, scope_key: str | None = None) -> Activity:
        """Create a new activity entry."""
        db_activity = Activity(
            id=f"ACT-{uuid.uuid4().hex[:6].upper()}",
            title=activity_in.title,
            description=activity_in.description,
            type=activity_in.type,
            timestamp=activity_in.timestamp,
            device_id=scope_key,
        )
        db.add(db_activity)
        db.commit()
        db.refresh(db_activity)
        return db_activity

    @staticmethod
    def seed_initial_activities(db: Session, scope_key: str | None = None):
        """Seed initial activities if the table is empty."""
        q = db.query(Activity)
        if scope_key:
            q = q.filter(Activity.device_id == scope_key)
        if q.count() > 0:
            return

        initial_data = [
            {
                "title": "System Initialization",
                "description": "HRMS Lite backend services started and database connected.",
                "type": "announcement",
                "timestamp": "Just now",
            },
            {
                "title": "Monthly Payroll Disbursed",
                "description": "Salary payments for all departments successfully processed.",
                "type": "payroll",
                "timestamp": "Today",
            },
            {
                "title": "Annual Leave Policy Update",
                "description": "Revised leave guidelines for 2026 have been published.",
                "type": "announcement",
                "timestamp": "Yesterday",
            },
        ]

        for data in initial_data:
            ActivityService.create_activity(db, ActivityCreate(**data), scope_key=scope_key)
