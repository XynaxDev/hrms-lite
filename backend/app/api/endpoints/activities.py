from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.activity_service import ActivityService
from app.schemas.activity import ActivityResponse, ActivityList, ActivityCreate

router = APIRouter()


@router.get("/", response_model=ActivityList)
def get_activities(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Get all recent activities."""
    # Seed initial data if empty for demonstration
    ActivityService.seed_initial_activities(db)

    activities, total = ActivityService.get_all_activities(db, skip=skip, limit=limit)
    return {"total": total, "activities": activities}


@router.post("/", response_model=ActivityResponse)
def create_activity(activity_in: ActivityCreate, db: Session = Depends(get_db)):
    """Create a new activity entry."""
    return ActivityService.create_activity(db, activity_in)
