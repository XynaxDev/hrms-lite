"""
Employee service layer for business logic.
"""

from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, Tuple, List
from uuid import uuid4

from app.models.employee import Employee, DepartmentEnum, StatusEnum
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
)
from app.models.activity import Activity
from app.models.attendance import Attendance
import uuid


class EmployeeService:
    """Service class for employee operations."""

    @staticmethod
    def generate_employee_id() -> str:
        """Generate a unique employee ID."""
        return f"#EMP-{str(uuid4())[:8].upper()}"

    @staticmethod
    def get_all_employees(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        department: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[Employee], int]:
        """Get all employees with optional filtering."""
        query = db.query(Employee)

        # Apply filters
        if department:
            query = query.filter(Employee.department == department)
        if status:
            query = query.filter(Employee.status == status)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Employee.full_name.ilike(search_pattern),
                    Employee.email.ilike(search_pattern),
                    Employee.role.ilike(search_pattern),
                )
            )

        total = query.count()
        employees = query.offset(skip).limit(limit).all()

        return employees, total

    @staticmethod
    def get_employee_by_id(db: Session, employee_id: str) -> Optional[Employee]:
        """Get a single employee by ID."""
        return db.query(Employee).filter(Employee.id == employee_id).first()

    @staticmethod
    def get_employee_by_email(db: Session, email: str) -> Optional[Employee]:
        """Get a single employee by email."""
        return db.query(Employee).filter(Employee.email == email).first()

    @staticmethod
    def create_employee(db: Session, employee_data: EmployeeCreate) -> Employee:
        """Create a new employee."""
        # Map pydantic enum to SQLAlchemy enum
        department_enum = DepartmentEnum(employee_data.department.value)
        status_enum = StatusEnum(employee_data.status.value)

        db_employee = Employee(
            id=employee_data.id or EmployeeService.generate_employee_id(),
            full_name=employee_data.full_name,
            email=employee_data.email,
            role=employee_data.role,
            department=department_enum,
            status=status_enum,
            avatar=employee_data.avatar
            or f"https://i.pravatar.cc/150?u={employee_data.email}",
            check_in_time=employee_data.check_in_time,
            location=employee_data.location,
            joined_date=employee_data.joined_date,
        )

        db.add(db_employee)

        # Record activity
        new_activity = Activity(
            id=f"ACT-{uuid.uuid4().hex[:6].upper()}",
            title="New employee onboarded",
            description=f"{db_employee.full_name} joined {db_employee.department.value} as {db_employee.role}",
            type="onboarding",
            timestamp="Just now",
        )
        db.add(new_activity)

        db.commit()
        db.refresh(db_employee)

        return db_employee

    @staticmethod
    def update_employee(
        db: Session, employee_id: str, employee_data: EmployeeUpdate
    ) -> Optional[Employee]:
        """Update an existing employee."""
        db_employee = db.query(Employee).filter(Employee.id == employee_id).first()

        if not db_employee:
            return None

        update_data = employee_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if value is not None:
                # Handle enum conversion
                if field == "department":
                    value = DepartmentEnum(
                        value.value if hasattr(value, "value") else value
                    )
                elif field == "status":
                    value = StatusEnum(
                        value.value if hasattr(value, "value") else value
                    )
                setattr(db_employee, field, value)

        db.commit()
        db.refresh(db_employee)

        return db_employee

    @staticmethod
    def delete_employee(db: Session, employee_id: str) -> bool:
        """Delete an employee by ID."""
        import logging

        logger = logging.getLogger(__name__)

        logger.info(f"Service: Looking for employee with ID: {employee_id}")
        db_employee = db.query(Employee).filter(Employee.id == employee_id).first()

        if not db_employee:
            logger.warning(f"Service: Employee not found in database: {employee_id}")
            return False

        logger.info(
            f"Service: Found employee {db_employee.full_name}, proceeding with deletion"
        )

        # Delete related attendance records first (cascade)
        attendance_records = (
            db.query(Attendance).filter(Attendance.employee_id == employee_id).all()
        )
        for attendance in attendance_records:
            db.delete(attendance)
        logger.info(
            f"Service: Deleted {len(attendance_records)} attendance records for employee {employee_id}"
        )

        # Record activity
        new_activity = Activity(
            id=f"ACT-{uuid.uuid4().hex[:6].upper()}",
            title="Employee profile removed",
            description=f"Record for {db_employee.full_name} has been deleted from the system.",
            type="announcement",
            timestamp="Just now",
        )
        db.add(new_activity)
        logger.info(f"Service: Activity record created")

        db.delete(db_employee)
        db.commit()

        logger.info(
            f"Service: Employee {employee_id} successfully deleted from database"
        )
        return True

    @staticmethod
    def get_employees_by_department(db: Session, department: str) -> List[Employee]:
        """Get all employees in a specific department."""
        return db.query(Employee).filter(Employee.department == department).all()

    @staticmethod
    def get_employees_by_status(db: Session, status: str) -> List[Employee]:
        """Get all employees with a specific status."""
        return db.query(Employee).filter(Employee.status == status).all()

    @staticmethod
    def get_employee_count(db: Session) -> int:
        """Get total employee count."""
        return db.query(Employee).count()

    @staticmethod
    def get_department_stats(db: Session) -> dict:
        """Get employee count by department."""
        from sqlalchemy import func

        result = (
            db.query(Employee.department, func.count(Employee.id).label("count"))
            .group_by(Employee.department)
            .all()
        )

        return {
            str(dept.value if hasattr(dept, "value") else dept): count
            for dept, count in result
        }

    @staticmethod
    def get_status_stats(db: Session) -> dict:
        """Get employee count by status."""
        from sqlalchemy import func

        result = (
            db.query(Employee.status, func.count(Employee.id).label("count"))
            .group_by(Employee.status)
            .all()
        )

        return {
            str(status.value if hasattr(status, "value") else status): count
            for status, count in result
        }
