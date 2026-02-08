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
from sqlalchemy import func
from app.core.config import get_settings


class EmployeeService:
    """Service class for employee operations."""

    @staticmethod
    def _coerce_enum(enum_cls, value):
        if value is None:
            return None
        if isinstance(value, enum_cls):
            return value
        raw = value.value if hasattr(value, "value") else value
        if raw is None:
            return None
        s = str(raw).strip()
        if not s:
            return None
        try:
            return enum_cls(s)
        except Exception:
            key = s.upper()
            if key in enum_cls.__members__:
                return enum_cls.__members__[key]
            raise

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
        scope_key: Optional[str] = None,
    ) -> Tuple[List[Employee], int]:
        """Get all employees with optional filtering."""
        query = db.query(Employee)

        if scope_key:
            settings = get_settings()
            if settings.DEMO_SHARED_EMPLOYEES:
                query = query.filter(or_(Employee.device_id.is_(None), Employee.device_id == scope_key))
            else:
                query = query.filter(Employee.device_id == scope_key)

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
    def get_employee_by_id_case_insensitive(
        db: Session, employee_id: str
    ) -> Optional[Employee]:
        """Get a single employee by ID, case-insensitive."""
        if not employee_id:
            return None
        return (
            db.query(Employee)
            .filter(func.lower(Employee.id) == employee_id.strip().lower())
            .first()
        )

    @staticmethod
    def get_employee_by_id_scoped(
        db: Session, employee_id: str, scope_key: Optional[str] = None
    ) -> Optional[Employee]:
        query = db.query(Employee).filter(Employee.id == employee_id)
        if scope_key:
            settings = get_settings()
            if settings.DEMO_SHARED_EMPLOYEES:
                query = query.filter(or_(Employee.device_id.is_(None), Employee.device_id == scope_key))
            else:
                query = query.filter(Employee.device_id == scope_key)
        return query.first()

    @staticmethod
    def get_employee_by_id_scoped_case_insensitive(
        db: Session, employee_id: str, scope_key: Optional[str] = None
    ) -> Optional[Employee]:
        """Get a single employee by ID, scoped + case-insensitive."""
        if not employee_id:
            return None
        query = db.query(Employee).filter(
            func.lower(Employee.id) == employee_id.strip().lower()
        )
        if scope_key:
            settings = get_settings()
            if settings.DEMO_SHARED_EMPLOYEES:
                query = query.filter(or_(Employee.device_id.is_(None), Employee.device_id == scope_key))
            else:
                query = query.filter(Employee.device_id == scope_key)
        return query.first()

    @staticmethod
    def get_employee_by_email(db: Session, email: str) -> Optional[Employee]:
        """Get a single employee by email."""
        return db.query(Employee).filter(Employee.email == email).first()

    @staticmethod
    def get_employee_by_email_scoped(
        db: Session, email: str, scope_key: Optional[str] = None
    ) -> Optional[Employee]:
        query = db.query(Employee).filter(Employee.email == email)
        if scope_key:
            settings = get_settings()
            if settings.DEMO_SHARED_EMPLOYEES:
                query = query.filter(or_(Employee.device_id.is_(None), Employee.device_id == scope_key))
            else:
                query = query.filter(Employee.device_id == scope_key)
        return query.first()

    @staticmethod
    def create_employee(
        db: Session, employee_data: EmployeeCreate, scope_key: Optional[str] = None
    ) -> Employee:
        """Create a new employee."""
        department_enum = EmployeeService._coerce_enum(DepartmentEnum, employee_data.department)
        status_enum = EmployeeService._coerce_enum(StatusEnum, employee_data.status)

        db_employee = Employee(
            id=employee_data.id or EmployeeService.generate_employee_id(),
            full_name=employee_data.full_name,
            email=employee_data.email,
            role=employee_data.role,
            department=department_enum,
            status=status_enum,
            avatar=employee_data.avatar,
            check_in_time=employee_data.check_in_time,
            location=employee_data.location,
            joined_date=employee_data.joined_date,
            device_id=scope_key,
        )

        db.add(db_employee)

        # Record activity
        new_activity = Activity(
            id=f"ACT-{uuid.uuid4().hex[:6].upper()}",
            title="New employee onboarded",
            description=f"{db_employee.full_name} joined {db_employee.department.value} as {db_employee.role}",
            type="onboarding",
            timestamp="Just now",
            device_id=scope_key,
        )
        db.add(new_activity)

        db.commit()
        db.refresh(db_employee)

        return db_employee

    @staticmethod
    def create_employee_scoped(
        db: Session, employee_data: EmployeeCreate, scope_key: Optional[str]
    ) -> Employee:
        """Create a new employee and bind it to demo isolation scope."""
        return EmployeeService.create_employee(db, employee_data, scope_key=scope_key)

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
                    value = EmployeeService._coerce_enum(DepartmentEnum, value)
                elif field == "status":
                    value = EmployeeService._coerce_enum(StatusEnum, value)
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
    def get_employees_by_department_scoped(
        db: Session, department: str, scope_key: Optional[str] = None
    ) -> List[Employee]:
        query = db.query(Employee).filter(Employee.department == department)
        if scope_key:
            settings = get_settings()
            if settings.DEMO_SHARED_EMPLOYEES:
                query = query.filter(or_(Employee.device_id.is_(None), Employee.device_id == scope_key))
            else:
                query = query.filter(Employee.device_id == scope_key)
        return query.all()

    @staticmethod
    def get_employees_by_status(db: Session, status: str) -> List[Employee]:
        """Get all employees with a specific status."""
        return db.query(Employee).filter(Employee.status == status).all()

    @staticmethod
    def get_employees_by_status_scoped(
        db: Session, status: str, scope_key: Optional[str] = None
    ) -> List[Employee]:
        query = db.query(Employee).filter(Employee.status == status)
        if scope_key:
            settings = get_settings()
            if settings.DEMO_SHARED_EMPLOYEES:
                query = query.filter(or_(Employee.device_id.is_(None), Employee.device_id == scope_key))
            else:
                query = query.filter(Employee.device_id == scope_key)
        return query.all()

    @staticmethod
    def get_employee_count(db: Session, scope_key: Optional[str] = None) -> int:
        """Get total employee count."""
        query = db.query(Employee)
        if scope_key:
            settings = get_settings()
            if settings.DEMO_SHARED_EMPLOYEES:
                query = query.filter(or_(Employee.device_id.is_(None), Employee.device_id == scope_key))
            else:
                query = query.filter(Employee.device_id == scope_key)
        return query.count()

    @staticmethod
    def get_department_stats(db: Session, scope_key: Optional[str] = None) -> dict:
        """Get employee count by department."""
        from sqlalchemy import func

        query = db.query(Employee.department, func.count(Employee.id).label("count"))
        if scope_key:
            settings = get_settings()
            if settings.DEMO_SHARED_EMPLOYEES:
                query = query.filter(or_(Employee.device_id.is_(None), Employee.device_id == scope_key))
            else:
                query = query.filter(Employee.device_id == scope_key)
        result = query.group_by(Employee.department).all()

        return {
            str(dept.value if hasattr(dept, "value") else dept): count
            for dept, count in result
        }

    @staticmethod
    def get_status_stats(db: Session, scope_key: Optional[str] = None) -> dict:
        """Get employee count by status."""
        from sqlalchemy import func

        query = db.query(Employee.status, func.count(Employee.id).label("count"))
        if scope_key:
            settings = get_settings()
            if settings.DEMO_SHARED_EMPLOYEES:
                query = query.filter(or_(Employee.device_id.is_(None), Employee.device_id == scope_key))
            else:
                query = query.filter(Employee.device_id == scope_key)
        result = query.group_by(Employee.status).all()

        return {
            str(status.value if hasattr(status, "value") else status): count
            for status, count in result
        }
