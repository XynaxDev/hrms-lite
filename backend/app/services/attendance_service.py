"""
Attendance service layer for business logic.
"""

from sqlalchemy.orm import Session
from typing import Optional, Tuple, List
from uuid import uuid4
from datetime import datetime

from app.models.attendance import Attendance, AttendanceStatusEnum
from app.models.employee import Employee
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceUpdate,
    MarkAttendanceRequest,
)


class AttendanceService:
    """Service class for attendance operations."""

    @staticmethod
    def generate_attendance_id() -> str:
        """Generate a unique attendance ID."""
        return f"ATT-{str(uuid4())[:8].upper()}"

    @staticmethod
    def get_all_attendance(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        date_filter: Optional[str] = None,
        employee_id: Optional[str] = None,
        status: Optional[str] = None,
    ) -> Tuple[List[Attendance], int]:
        """Get all attendance records with optional filtering."""
        query = db.query(Attendance)

        if date_filter:
            query = query.filter(Attendance.date == date_filter)
        if employee_id:
            query = query.filter(Attendance.employee_id == employee_id)
        if status:
            query = query.filter(Attendance.status == status)

        total = query.count()
        records = query.order_by(Attendance.date.desc()).offset(skip).limit(limit).all()

        return records, total

    @staticmethod
    def get_attendance_by_id(db: Session, attendance_id: str) -> Optional[Attendance]:
        """Get a single attendance record by ID."""
        return db.query(Attendance).filter(Attendance.id == attendance_id).first()

    @staticmethod
    def get_attendance_by_employee_date(
        db: Session, employee_id: str, date_str: str
    ) -> Optional[Attendance]:
        """Get attendance record for a specific employee and date."""
        return (
            db.query(Attendance)
            .filter(Attendance.employee_id == employee_id, Attendance.date == date_str)
            .first()
        )

    @staticmethod
    def create_attendance(db: Session, attendance_data: AttendanceCreate) -> Attendance:
        """Create a new attendance record."""
        status_enum = AttendanceStatusEnum(attendance_data.status.value)

        db_attendance = Attendance(
            id=AttendanceService.generate_attendance_id(),
            employee_id=attendance_data.employee_id,
            employee_name=attendance_data.employee_name,
            avatar=attendance_data.avatar,
            role=attendance_data.role,
            date=attendance_data.date,
            status=status_enum,
            check_in=attendance_data.check_in,
            check_out=attendance_data.check_out,
            work_hours=attendance_data.work_hours,
        )

        db.add(db_attendance)
        db.commit()
        db.refresh(db_attendance)

        return db_attendance

    @staticmethod
    def mark_attendance(
        db: Session, request: MarkAttendanceRequest
    ) -> Optional[Attendance]:
        """Mark attendance for an employee (simplified endpoint)."""
        # Get employee details
        employee = db.query(Employee).filter(Employee.id == request.employee_id).first()
        if not employee:
            return None

        # Use today's date if not provided
        attendance_date = request.date or datetime.now().strftime("%Y-%m-%d")

        # Check if attendance already exists for this date
        existing = AttendanceService.get_attendance_by_employee_date(
            db, request.employee_id, attendance_date
        )
        if existing:
            # Update existing record
            existing.status = AttendanceStatusEnum(request.status.value)
            if request.status.value == "Present":
                existing.check_in = datetime.now().strftime("%I:%M %p")
            db.commit()
            db.refresh(existing)
            return existing

        # Create new attendance record
        status_enum = AttendanceStatusEnum(request.status.value)
        check_in = (
            datetime.now().strftime("%I:%M %p")
            if request.status.value == "Present"
            else "-"
        )

        db_attendance = Attendance(
            id=AttendanceService.generate_attendance_id(),
            employee_id=request.employee_id,
            employee_name=employee.full_name,
            avatar=employee.avatar,
            role=employee.role,
            date=attendance_date,
            status=status_enum,
            check_in=check_in,
            check_out="-",
            work_hours="0h 00m",
        )

        db.add(db_attendance)
        db.commit()
        db.refresh(db_attendance)

        return db_attendance

    @staticmethod
    def update_attendance(
        db: Session, attendance_id: str, attendance_data: AttendanceUpdate
    ) -> Optional[Attendance]:
        """Update an existing attendance record."""
        db_attendance = (
            db.query(Attendance).filter(Attendance.id == attendance_id).first()
        )

        if not db_attendance:
            return None

        update_data = attendance_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if value is not None:
                if field == "status":
                    value = AttendanceStatusEnum(
                        value.value if hasattr(value, "value") else value
                    )
                setattr(db_attendance, field, value)

        db.commit()
        db.refresh(db_attendance)

        return db_attendance

    @staticmethod
    def delete_attendance(db: Session, attendance_id: str) -> bool:
        """Delete an attendance record by ID."""
        db_attendance = (
            db.query(Attendance).filter(Attendance.id == attendance_id).first()
        )

        if not db_attendance:
            return False

        db.delete(db_attendance)
        db.commit()

        return True

    @staticmethod
    def get_today_attendance(db: Session) -> List[Attendance]:
        """Get all attendance records for today."""
        today = datetime.now().strftime("%Y-%m-%d")
        return db.query(Attendance).filter(Attendance.date == today).all()

    @staticmethod
    def get_attendance_stats(db: Session, date_str: Optional[str] = None) -> dict:
        """Get attendance statistics for a date."""
        if not date_str:
            date_str = datetime.now().strftime("%Y-%m-%d")

        query = db.query(Attendance).filter(Attendance.date == date_str)

        total = query.count()
        present = query.filter(
            Attendance.status == AttendanceStatusEnum.PRESENT
        ).count()
        absent = query.filter(Attendance.status == AttendanceStatusEnum.ABSENT).count()
        on_leave = query.filter(
            Attendance.status == AttendanceStatusEnum.ON_LEAVE
        ).count()

        return {
            "date": date_str,
            "total": total,
            "present": present,
            "absent": absent,
            "on_leave": on_leave,
            "attendance_rate": round((present / total * 100) if total > 0 else 0, 2),
        }

    @staticmethod
    def get_attendance_report(
        db: Session, start_date: str, end_date: str
    ) -> List[dict]:
        """Get aggregate attendance stats per employee for a date range."""
        from sqlalchemy import func

        # Query to count statuses per employee
        results = (
            db.query(
                Attendance.employee_id,
                Attendance.employee_name,
                Attendance.status,
                func.count(Attendance.id).label("count"),
            )
            .filter(Attendance.date >= start_date, Attendance.date <= end_date)
            .group_by(
                Attendance.employee_id, Attendance.employee_name, Attendance.status
            )
            .all()
        )

        # Process results into a more usable dictionary
        report_map = {}
        for emp_id, name, status, count in results:
            if emp_id not in report_map:
                report_map[emp_id] = {
                    "id": emp_id,
                    "name": name,
                    "present": 0,
                    "absent": 0,
                    "on_leave": 0,
                }

            if status == AttendanceStatusEnum.PRESENT:
                report_map[emp_id]["present"] = count
            elif status == AttendanceStatusEnum.ABSENT:
                report_map[emp_id]["absent"] = count
            elif status == AttendanceStatusEnum.ON_LEAVE:
                report_map[emp_id]["on_leave"] = count

        return list(report_map.values())
