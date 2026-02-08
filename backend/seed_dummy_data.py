import argparse
from datetime import date, timedelta

from app.db.database import SessionLocal
from app.models.employee import DepartmentEnum, Employee, StatusEnum
from app.models.attendance import Attendance
from app.models.activity import Activity
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


def clear_demo_data(scope_key: str | None) -> dict:
    db = SessionLocal()
    try:
        q_emp = db.query(Employee)
        q_att = db.query(Attendance)
        q_act = db.query(Activity)

        if scope_key is None:
            q_emp = q_emp.filter(Employee.device_id.is_(None))
            q_att = q_att.filter(Attendance.device_id.is_(None))
            q_act = q_act.filter(Activity.device_id.is_(None))
        else:
            q_emp = q_emp.filter(Employee.device_id == scope_key)
            q_att = q_att.filter(Attendance.device_id == scope_key)
            q_act = q_act.filter(Activity.device_id == scope_key)

        deleted_activities = q_act.delete(synchronize_session=False)
        deleted_attendance = q_att.delete(synchronize_session=False)
        deleted_employees = q_emp.delete(synchronize_session=False)

        db.commit()
        return {
            "scope_key": scope_key,
            "employees_deleted": int(deleted_employees or 0),
            "attendance_deleted": int(deleted_attendance or 0),
            "activities_deleted": int(deleted_activities or 0),
        }
    finally:
        db.close()


def seed_complete_demo_data(count: int) -> None:
    """Seed employees, attendance, and activities using the centralized seed function"""
    db = SessionLocal()
    try:
        seed_global_demo_data(db, employee_count=count)
        print(f"Demo employees seeded for {count} employees")
    except Exception as e:
        print(f"Error seeding demo data: {e}")
    finally:
        db.close()


def seed_complete_demo_data_scoped(count: int, scope_key: str) -> None:
    """Seed demo employees for a specific device scope (demo isolation)."""
    db = SessionLocal()
    try:
        seed_global_demo_data(db, employee_count=count, scope_key=scope_key)
        print(f"Demo employees seeded for {count} employees (scope={scope_key})")
    except Exception as e:
        print(f"Error seeding demo data: {e}")
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed dummy employees and demo data")
    parser.add_argument("--count", type=int, default=10, help="Number of employees to create")
    parser.add_argument("--employees-only", action="store_true", help="Only seed employees (no attendance/activities)")
    parser.add_argument("--clear", action="store_true", help="Clear demo data instead of seeding")
    parser.add_argument("--scope", type=str, default="", help="Device scope key (X-Device-Id) to clear or seed")
    parser.add_argument("--global", dest="clear_global", action="store_true", help="When clearing, target global rows (device_id NULL)")
    args = parser.parse_args()

    if args.clear:
        scope_key = None
        if not args.clear_global:
            v = (args.scope or "").strip()
            scope_key = v or None
        result = clear_demo_data(scope_key)
        print(
            f"Clear complete for scope={result['scope_key']}: "
            f"{result['employees_deleted']} employees, {result['attendance_deleted']} attendance, {result['activities_deleted']} activities deleted."
        )
        return

    if args.employees_only:
        added = seed_dummy_employees(args.count)
        print(f"Employee seed complete. Added {added} employees.")
    else:
        v = (args.scope or "").strip()
        if v:
            seed_complete_demo_data_scoped(args.count, v)
        else:
            seed_complete_demo_data(args.count)


if __name__ == "__main__":
    main()
