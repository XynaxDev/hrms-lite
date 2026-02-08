"""Employee API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional

from app.db.database import get_db
from app.core.demo_isolation import get_demo_scope
from app.services.employee_service import EmployeeService
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EmployeeListResponse,
)
from app.models.employee import StatusEnum

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.get("", response_model=EmployeeListResponse)
def get_employees(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum records to return"),
    department: Optional[str] = Query(None, description="Filter by department"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by name, email, or role"),
    db: Session = Depends(get_db),
    scope_key: Optional[str] = Depends(get_demo_scope),
):
    """Get all employees with optional filtering and pagination."""
    employees, total = EmployeeService.get_all_employees(
        db,
        skip=skip,
        limit=limit,
        department=department,
        status=status,
        search=search,
        scope_key=scope_key,
    )

    for emp in employees:
        try:
            if (
                emp.status == StatusEnum.ON_LEAVE
                or getattr(emp.status, "value", None) == "On Leave"
                or emp.status == "On Leave"
            ):
                emp.status = StatusEnum.ACTIVE
        except Exception:
            pass

    return EmployeeListResponse(
        employees=employees,
        total=total,
        page=(skip // limit) + 1,
        per_page=limit,
    )


@router.get("/stats")
def get_employee_stats(
    db: Session = Depends(get_db),
    scope_key: Optional[str] = Depends(get_demo_scope),
):
    """Get employee statistics."""
    from app.models.employee import Employee
    from sqlalchemy import func

    if scope_key:
        total = db.query(Employee).filter(Employee.device_id == scope_key).count()
        by_department = {
            str(dept.value if hasattr(dept, "value") else dept): count
            for dept, count in (
                db.query(Employee.department, func.count(Employee.id).label("count"))
                .filter(Employee.device_id == scope_key)
                .group_by(Employee.department)
                .all()
            )
        }
        by_status: dict[str, int] = {}
        for s, count in (
            db.query(Employee.status, func.count(Employee.id).label("count"))
            .filter(Employee.device_id == scope_key)
            .group_by(Employee.status)
            .all()
        ):
            key = str(s.value if hasattr(s, "value") else s)
            if key == "On Leave":
                key = "Active"
            by_status[key] = by_status.get(key, 0) + int(count)
        return {"total": total, "by_department": by_department, "by_status": by_status}

    return {
        "total": EmployeeService.get_employee_count(db),
        "by_department": EmployeeService.get_department_stats(db),
        "by_status": EmployeeService.get_status_stats(db),
    }


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: str,
    db: Session = Depends(get_db),
    scope_key: Optional[str] = Depends(get_demo_scope),
):
    """Get a single employee by ID."""
    employee = EmployeeService.get_employee_by_id_scoped_case_insensitive(
        db, employee_id, scope_key
    )
    if not employee:
        raise HTTPException(
            status_code=404, detail=f"Employee with ID {employee_id} not found"
        )
    try:
        if (
            employee.status == StatusEnum.ON_LEAVE
            or getattr(employee.status, "value", None) == "On Leave"
            or employee.status == "On Leave"
        ):
            employee.status = StatusEnum.ACTIVE
    except Exception:
        pass
    return employee


@router.post("", response_model=EmployeeResponse, status_code=201)
def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
    scope_key: Optional[str] = Depends(get_demo_scope),
):
    """Create a new employee."""
    # Check for duplicate email
    existing = EmployeeService.get_employee_by_email(db, employee.email)
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"An employee with email {employee.email} already exists",
        )

    try:
        return EmployeeService.create_employee_scoped(db, employee, scope_key)
    except IntegrityError as exc:
        db.rollback()
        msg = str(getattr(exc, "orig", exc))
        if "employees_pkey" in msg or "Key (id)=" in msg:
            raise HTTPException(
                status_code=409,
                detail="Employee ID already exists. Please use a different ID.",
            ) from exc
        raise HTTPException(status_code=409, detail="Duplicate record") from exc


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: str,
    employee: EmployeeUpdate,
    db: Session = Depends(get_db),
    scope_key: Optional[str] = Depends(get_demo_scope),
):
    """Update an existing employee."""
    # Check if employee exists
    existing = EmployeeService.get_employee_by_id_scoped_case_insensitive(
        db, employee_id, scope_key
    )
    if not existing:
        raise HTTPException(
            status_code=404, detail=f"Employee with ID {employee_id} not found"
        )

    # Check for duplicate email if email is being updated
    if employee.email and employee.email != existing.email:
        email_exists = EmployeeService.get_employee_by_email(db, employee.email)
        if email_exists:
            raise HTTPException(
                status_code=409,
                detail=f"An employee with email {employee.email} already exists",
            )

    updated = EmployeeService.update_employee(db, existing.id, employee)
    return updated


@router.delete("/{employee_id}", status_code=204)
def delete_employee(
    employee_id: str,
    db: Session = Depends(get_db),
    scope_key: Optional[str] = Depends(get_demo_scope),
):
    """Delete an employee."""
    import logging

    logger = logging.getLogger(__name__)

    logger.info(f"Delete request received for employee ID: {employee_id}")

    if not employee_id or employee_id.strip() == "":
        logger.warning("Delete request with empty employee ID")
        raise HTTPException(status_code=400, detail="Employee ID is required")

    logger.info(f"Attempting to delete employee: {employee_id}")
    existing = EmployeeService.get_employee_by_id_scoped_case_insensitive(
        db, employee_id, scope_key
    )
    if not existing:
      raise HTTPException(
          status_code=404, detail=f"Employee with ID {employee_id} not found"
      )

    deleted = EmployeeService.delete_employee(db, existing.id)

    if not deleted:
        logger.warning(f"Employee not found: {employee_id}")
        raise HTTPException(
            status_code=404, detail=f"Employee with ID {employee_id} not found"
        )

    logger.info(f"Successfully deleted employee: {employee_id}")
    return None
