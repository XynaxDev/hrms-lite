"""
Attendance API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.core.demo_isolation import get_demo_scope
from app.services.attendance_service import AttendanceService
from app.services.employee_service import EmployeeService
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceUpdate,
    AttendanceResponse,
    AttendanceListResponse,
    MarkAttendanceRequest,
)

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.get("", response_model=AttendanceListResponse)
def get_attendance(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum records to return"),
    date: Optional[str] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    employee_id: Optional[str] = Query(None, description="Filter by employee ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    scope_key: Optional[str] = Depends(get_demo_scope),
):
    """Get all attendance records with optional filtering and pagination."""
    records, total = AttendanceService.get_all_attendance(
        db,
        skip=skip,
        limit=limit,
        date_filter=date,
        employee_id=employee_id,
        status=status,
        scope_key=scope_key,
    )

    return AttendanceListResponse(
        attendance_records=records,
        total=total,
        page=(skip // limit) + 1,
        per_page=limit,
    )


@router.get("/today")
def get_today_attendance(
    db: Session = Depends(get_db),
    scope_key: Optional[str] = Depends(get_demo_scope),
):
    """Get today's attendance summary."""
    records = AttendanceService.get_today_attendance_scoped(db, scope_key)
    stats = AttendanceService.get_attendance_stats_scoped(db, None, scope_key)

    return {
        "stats": stats,
        "records": records,
    }


@router.get("/stats")
def get_attendance_stats(
    date: Optional[str] = Query(
        None, description="Date for stats (YYYY-MM-DD), defaults to today"
    ),
    db: Session = Depends(get_db),
    scope_key: Optional[str] = Depends(get_demo_scope),
):
    """Get attendance statistics for a specific date."""
    return AttendanceService.get_attendance_stats_scoped(db, date, scope_key)


@router.get("/{attendance_id}", response_model=AttendanceResponse)
def get_attendance_record(
    attendance_id: str,
    db: Session = Depends(get_db),
    scope_key: Optional[str] = Depends(get_demo_scope),
):
    """Get a single attendance record by ID."""
    record = AttendanceService.get_attendance_by_id(db, attendance_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"Attendance record with ID {attendance_id} not found",
        )
    if scope_key and record.device_id not in (None, scope_key):
        raise HTTPException(
            status_code=404,
            detail=f"Attendance record with ID {attendance_id} not found",
        )
    return record


@router.post("/mark", response_model=AttendanceResponse, status_code=201)
def mark_attendance(
    request: MarkAttendanceRequest,
    db: Session = Depends(get_db),
    scope_key: Optional[str] = Depends(get_demo_scope),
):
    """Mark attendance for an employee (simplified endpoint)."""
    # Verify employee exists
    employee = EmployeeService.get_employee_by_id_scoped_case_insensitive(
        db, request.employee_id, scope_key
    )
    if not employee:
        raise HTTPException(
            status_code=404, detail=f"Employee with ID {request.employee_id} not found"
        )

    record = AttendanceService.mark_attendance_scoped(db, request, scope_key)
    if not record:
        raise HTTPException(status_code=500, detail="Failed to mark attendance")

    return record


@router.post("", response_model=AttendanceResponse, status_code=201)
def create_attendance(
    attendance: AttendanceCreate,
    db: Session = Depends(get_db),
    scope_key: Optional[str] = Depends(get_demo_scope),
):
    """Create a new attendance record."""
    # Verify employee exists
    employee = EmployeeService.get_employee_by_id_scoped_case_insensitive(
        db, attendance.employee_id, scope_key
    )
    if not employee:
        raise HTTPException(
            status_code=404,
            detail=f"Employee with ID {attendance.employee_id} not found",
        )

    # Check for duplicate attendance on same date
    existing = AttendanceService.get_attendance_by_employee_date(
        db, attendance.employee_id, attendance.date
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Attendance already exists for employee {attendance.employee_id} on {attendance.date}",
        )

    return AttendanceService.create_attendance_scoped(db, attendance, scope_key)


@router.put("/{attendance_id}", response_model=AttendanceResponse)
def update_attendance(
    attendance_id: str,
    attendance: AttendanceUpdate,
    db: Session = Depends(get_db),
    scope_key: Optional[str] = Depends(get_demo_scope),
):
    """Update an existing attendance record."""
    existing = AttendanceService.get_attendance_by_id(db, attendance_id)
    if not existing:
        raise HTTPException(
            status_code=404,
            detail=f"Attendance record with ID {attendance_id} not found",
        )
    if scope_key and existing.device_id not in (None, scope_key):
        raise HTTPException(
            status_code=404,
            detail=f"Attendance record with ID {attendance_id} not found",
        )
    updated = AttendanceService.update_attendance(db, attendance_id, attendance)
    if not updated:
        raise HTTPException(
            status_code=404,
            detail=f"Attendance record with ID {attendance_id} not found",
        )
    return updated


@router.delete("/{attendance_id}", status_code=204)
def delete_attendance(
    attendance_id: str,
    db: Session = Depends(get_db),
    scope_key: Optional[str] = Depends(get_demo_scope),
):
    """Delete an attendance record."""
    existing = AttendanceService.get_attendance_by_id(db, attendance_id)
    if not existing:
        raise HTTPException(
            status_code=404,
            detail=f"Attendance record with ID {attendance_id} not found",
        )
    if scope_key and existing.device_id not in (None, scope_key):
        raise HTTPException(
            status_code=404,
            detail=f"Attendance record with ID {attendance_id} not found",
        )
    deleted = AttendanceService.delete_attendance(db, attendance_id)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail=f"Attendance record with ID {attendance_id} not found",
        )
    return None


@router.get("/summary/all")
def get_attendance_summary(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    scope_key: Optional[str] = Depends(get_demo_scope),
):
    """Get attendance summary for all employees (total present days)."""
    from datetime import datetime, timedelta

    if not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")
    if not start_date:
        # Default to last 30 days
        start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")

    report = AttendanceService.get_attendance_report_scoped(db, start_date, end_date, scope_key)

    return {"start_date": start_date, "end_date": end_date, "summary": report}
