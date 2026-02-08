import argparse
from datetime import date, timedelta

from app.db.database import SessionLocal
from app.models.employee import DepartmentEnum, Employee, StatusEnum
from app.seed import seed_global_demo_data
from sqlalchemy.exc import IntegrityError


def _avatar_url(n: int) -> str:
    return f"https://api.dicebear.com/7.x/adventurer/png?seed=DUM_{n}&size=128"


def _dummy_name(n: int) -> str:
    names = [
        "Aarav Sharma",
        "Isha Verma",
        "Kabir Khan",
        "Meera Iyer",
        "Rohan Gupta",
        "Ananya Singh",
        "Vihaan Patel",
        "Diya Nair",
        "Arjun Mehta",
        "Sara Roy",
    ]
    return names[(n - 1) % len(names)]


def seed_dummy_employees(count: int) -> int:
    db = SessionLocal()

    departments = [
        DepartmentEnum.ENGINEERING,
        DepartmentEnum.DESIGN,
        DepartmentEnum.MARKETING,
        DepartmentEnum.HR,
        DepartmentEnum.FINANCE,
    ]

    added = 0
    try:
        for i in range(1, count + 1):
            emp_id = f"DUM_{i}"

            if db.query(Employee).filter(Employee.id == emp_id).first():
                continue

            dept = departments[(i - 1) % len(departments)]
            role = {
                DepartmentEnum.ENGINEERING: "Software Engineer",
                DepartmentEnum.DESIGN: "Product Designer",
                DepartmentEnum.MARKETING: "Marketing Associate",
                DepartmentEnum.HR: "HR Executive",
                DepartmentEnum.FINANCE: "Finance Analyst",
            }[dept]

            emp = Employee(
                id=emp_id,
                full_name=_dummy_name(i),
                email=f"dum.{i}@example.com",
                role=role,
                department=dept,
                status=StatusEnum.ACTIVE,
                avatar=_avatar_url(i),
                check_in_time=None,
                location="Remote",
                joined_date=str(date.today() - timedelta(days=((i - 1) * 30))),  # Each employee joined 30 days apart
                device_id=None,
            )

            db.add(emp)
            try:
                db.commit()
                added += 1
            except IntegrityError:
                db.rollback()

        return added
    finally:
        db.close()


def seed_complete_demo_data(count: int) -> None:
    """Seed employees, attendance, and activities using the centralized seed function"""
    db = SessionLocal()
    try:
        seed_global_demo_data(db, employee_count=count)
        print(f"Complete demo data seeded for {count} employees (including attendance and activities)")
    except Exception as e:
        print(f"Error seeding demo data: {e}")
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed dummy employees and demo data")
    parser.add_argument("--count", type=int, default=10, help="Number of employees to create")
    parser.add_argument("--employees-only", action="store_true", help="Only seed employees (no attendance/activities)")
    args = parser.parse_args()

    if args.employees_only:
        added = seed_dummy_employees(args.count)
        print(f"Employee seed complete. Added {added} employees.")
    else:
        seed_complete_demo_data(args.count)


if __name__ == "__main__":
    main()
