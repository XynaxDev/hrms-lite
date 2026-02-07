"""
Activity service for managing system activities.
"""

from typing import List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc
import uuid

from app.models.activity import Activity
from app.schemas.activity import ActivityCreate


class ActivityService:
    @staticmethod
    def get_all_activities(
        db: Session, limit: int = 10, skip: int = 0
    ) -> Tuple[List[Activity], int]:
        """Get all activities with pagination."""
        query = db.query(Activity).order_by(desc(Activity.created_at))
        total = query.count()
        activities = query.offset(skip).limit(limit).all()
        return activities, total

    @staticmethod
    def create_activity(db: Session, activity_in: ActivityCreate) -> Activity:
        """Create a new activity entry."""
        db_activity = Activity(
            id=f"ACT-{uuid.uuid4().hex[:6].upper()}",
            title=activity_in.title,
            description=activity_in.description,
            type=activity_in.type,
            timestamp=activity_in.timestamp,
        )
        db.add(db_activity)
        db.commit()
        db.refresh(db_activity)
        return db_activity

    @staticmethod
    def seed_initial_activities(db: Session):
        """Seed initial activities if the table is empty."""
        if db.query(Activity).count() > 0:
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
            ActivityService.create_activity(db, ActivityCreate(**data))
