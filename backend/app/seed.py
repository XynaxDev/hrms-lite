from __future__ import annotations

from datetime import date, timedelta
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.employee import DepartmentEnum, Employee, StatusEnum


def _avatar_url(emp_id: str) -> str:
    return f"https://api.dicebear.com/7.x/adventurer/png?seed={emp_id}&size=128"


def seed_global_demo_data(db: Session, employee_count: int = 10) -> None:
    """Seed employees, attendance, and activities. Each section checks for existing data independently."""

    base_employees = [
        {
            "id": "DUM_1",
            "full_name": "Aarav Sharma",
            "email": "dum.1@example.com",
            "role": "Software Engineer",
            "department": DepartmentEnum.ENGINEERING,
            "status": StatusEnum.ACTIVE,
        },
        {
            "id": "DUM_2",
            "full_name": "Isha Verma",
            "email": "dum.2@example.com",
            "role": "Product Designer",
            "department": DepartmentEnum.DESIGN,
            "status": StatusEnum.ACTIVE,
        },
        {
            "id": "DUM_3",
            "full_name": "Kabir Khan",
            "email": "dum.3@example.com",
            "role": "HR Manager",
            "department": DepartmentEnum.HR,
            "status": StatusEnum.INACTIVE,
        },
        {
            "id": "DUM_4",
            "full_name": "Meera Iyer",
            "email": "dum.4@example.com",
            "role": "Marketing Associate",
            "department": DepartmentEnum.MARKETING,
            "status": StatusEnum.ACTIVE,
        },
        {
            "id": "DUM_5",
            "full_name": "Rohan Gupta",
            "email": "dum.5@example.com",
            "role": "Finance Analyst",
            "department": DepartmentEnum.FINANCE,
            "status": StatusEnum.ACTIVE,
        },
        {
            "id": "DUM_6",
            "full_name": "Ananya Singh",
            "email": "dum.6@example.com",
            "role": "Software Engineer",
            "department": DepartmentEnum.ENGINEERING,
            "status": StatusEnum.ACTIVE,
        },
        {
            "id": "DUM_7",
            "full_name": "Vihaan Patel",
            "email": "dum.7@example.com",
            "role": "Product Designer",
            "department": DepartmentEnum.DESIGN,
            "status": StatusEnum.ACTIVE,
        },
        {
            "id": "DUM_8",
            "full_name": "Diya Nair",
            "email": "dum.8@example.com",
            "role": "HR Executive",
            "department": DepartmentEnum.HR,
            "status": StatusEnum.ACTIVE,
        },
        {
            "id": "DUM_9",
            "full_name": "Arjun Mehta",
            "email": "dum.9@example.com",
            "role": "Marketing Associate",
            "department": DepartmentEnum.MARKETING,
            "status": StatusEnum.ACTIVE,
        },
        {
            "id": "DUM_10",
            "full_name": "Sara Roy",
            "email": "dum.10@example.com",
            "role": "Finance Analyst",
            "department": DepartmentEnum.FINANCE,
            "status": StatusEnum.ACTIVE,
        },
    ]

    try:
        # Check if we need to seed employees
        seed_marker = db.query(Employee).filter(Employee.id == "DUM_1").first()
        if not seed_marker:
            for i, data in enumerate(base_employees[: max(0, employee_count)]):
                if db.query(Employee).filter(Employee.id == data["id"]).first():
                    continue

                joined_date = str(date.today() - timedelta(days=(i * 30)))  # Each employee joined 30 days apart
                db.add(
                    Employee(
                        id=data["id"],
                        full_name=data["full_name"],
                        email=data["email"],
                        role=data["role"],
                        department=data["department"],
                        status=data["status"],
                        avatar=_avatar_url(data["id"]),
                        check_in_time=None,
                        location="Remote",
                        joined_date=joined_date,
                        device_id=None,
                    )
                )
            db.commit()

        # Intentionally do not seed attendance/activities.
        # Attendance should stay empty until a user marks it.
        return
    except IntegrityError:
        db.rollback()
    except Exception:
        db.rollback()
