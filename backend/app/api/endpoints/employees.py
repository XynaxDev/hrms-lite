"""
Employee API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.services.employee_service import EmployeeService
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EmployeeListResponse,
)

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.get("", response_model=EmployeeListResponse)
def get_employees(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum records to return"),
    department: Optional[str] = Query(None, description="Filter by department"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by name, email, or role"),
    db: Session = Depends(get_db),
):
    """Get all employees with optional filtering and pagination."""
    employees, total = EmployeeService.get_all_employees(
        db, skip=skip, limit=limit, department=department, status=status, search=search
    )

    return EmployeeListResponse(
        employees=employees,
        total=total,
        page=(skip // limit) + 1,
        per_page=limit,
    )


@router.get("/stats")
def get_employee_stats(db: Session = Depends(get_db)):
    """Get employee statistics."""
    return {
        "total": EmployeeService.get_employee_count(db),
        "by_department": EmployeeService.get_department_stats(db),
        "by_status": EmployeeService.get_status_stats(db),
    }


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    """Get a single employee by ID."""
    employee = EmployeeService.get_employee_by_id(db, employee_id)
    if not employee:
        raise HTTPException(
            status_code=404, detail=f"Employee with ID {employee_id} not found"
        )
    return employee


@router.post("", response_model=EmployeeResponse, status_code=201)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    """Create a new employee."""
    # Check for duplicate email
    existing = EmployeeService.get_employee_by_email(db, employee.email)
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"An employee with email {employee.email} already exists",
        )

    return EmployeeService.create_employee(db, employee)


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: str, employee: EmployeeUpdate, db: Session = Depends(get_db)
):
    """Update an existing employee."""
    # Check if employee exists
    existing = EmployeeService.get_employee_by_id(db, employee_id)
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

    updated = EmployeeService.update_employee(db, employee_id, employee)
    return updated


@router.delete("/{employee_id}", status_code=204)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    """Delete an employee."""
    import logging

    logger = logging.getLogger(__name__)

    logger.info(f"Delete request received for employee ID: {employee_id}")

    if not employee_id or employee_id.strip() == "":
        logger.warning("Delete request with empty employee ID")
        raise HTTPException(status_code=400, detail="Employee ID is required")

    logger.info(f"Attempting to delete employee: {employee_id}")
    deleted = EmployeeService.delete_employee(db, employee_id)

    if not deleted:
        logger.warning(f"Employee not found: {employee_id}")
        raise HTTPException(
            status_code=404, detail=f"Employee with ID {employee_id} not found"
        )

    logger.info(f"Successfully deleted employee: {employee_id}")
    return None
