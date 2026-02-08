from __future__ import annotations

from datetime import date, timedelta
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.models.attendance import Attendance, AttendanceStatusEnum
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

        # Always seed attendance and activities if they don't exist, regardless of employee seeding
        # Generate varied attendance records for all employees
        print(f"DEBUG: Starting attendance seeding for {employee_count} employees")
        attendance_statuses = [AttendanceStatusEnum.PRESENT, AttendanceStatusEnum.ON_LEAVE, AttendanceStatusEnum.ABSENT]
        seed_attendance = []
        att_id_counter = 1
        
        for i, employee_data in enumerate(base_employees[:max(0, employee_count)]):
            emp_id = employee_data["id"]
            emp_name = employee_data["full_name"]
            emp_role = employee_data["role"]
            
            # Check if employee exists in database before creating attendance
            if not db.query(Employee).filter(Employee.id == emp_id).first():
                print(f"DEBUG: Employee {emp_id} not found, skipping attendance")
                continue
            
            # Create 3 attendance records per employee with different dates
            for day_offset in range(3):
                att_date = str(today - timedelta(days=day_offset))
                status = attendance_statuses[i % len(attendance_statuses)] if day_offset == 0 else attendance_statuses[(i + day_offset) % len(attendance_statuses)]
                
                attendance_data = {
                    "id": f"ATT-SEED-{att_id_counter:03d}",
                    "employee_id": emp_id,
                    "employee_name": emp_name,
                    "avatar": _avatar_url(emp_id),
                    "role": emp_role,
                    "date": att_date,
                    "device_id": None,
                }
                
                if status == AttendanceStatusEnum.PRESENT:
                    # Vary check-in and check-out times
                    check_in_hour = 8 + (i % 2)  # 8 or 9 AM
                    check_in_minute = 15 + (i * 7) % 45  # varied minutes
                    check_out_hour = 17 + (i % 2)  # 5 or 6 PM
                    check_out_minute = 30 + (i * 13) % 30  # varied minutes
                    
                    attendance_data.update({
                        "status": status,
                        "check_in": f"{check_in_hour:02d}:{check_in_minute:02d}",
                        "check_out": f"{check_out_hour:02d}:{check_out_minute:02d}",
                        "work_hours": f"{8 + (i % 2)}h {30 + (i * 7) % 30}m",
                    })
                else:
                    attendance_data.update({
                        "status": status,
                        "check_in": None,
                        "check_out": None,
                        "work_hours": None,
                    })
                
                seed_attendance.append(Attendance(**attendance_data))
                att_id_counter += 1

        print(f"DEBUG: Created {len(seed_attendance)} attendance records to insert")
        
        for att in seed_attendance:
            if not db.query(Employee).filter(Employee.id == att.employee_id).first():
                print(f"DEBUG: Skipping attendance for {att.employee_id} - employee not found")
                continue
            if not db.query(Attendance).filter(Attendance.id == att.id).first():
                db.add(att)
                print(f"DEBUG: Adding attendance {att.id} for employee {att.employee_id}")
        db.commit()
        print("DEBUG: Attendance seeding completed")

        # Generate varied activity records for all employees
        activity_types = ["announcement", "attendance", "performance", "leave", "meeting"]
        seed_activities = []
        act_id_counter = 1
        
        # Add some general activities
        seed_activities.extend([
            Activity(
                id="ACT-SEED-001",
                title="Welcome to HRMS Lite",
                description="Demo records have been preloaded so you can explore the app immediately.",
                type="announcement",
                timestamp="Today",
                device_id=None,
            ),
            Activity(
                id="ACT-SEED-002", 
                title="System Update",
                description="New attendance tracking features are now available.",
                type="announcement",
                timestamp="Yesterday",
                device_id=None,
            ),
        ])
        act_id_counter = 3
        
        # Create personalized activities for each employee
        for i, employee_data in enumerate(base_employees[:max(0, employee_count)]):
            emp_id = employee_data["id"]
            emp_name = employee_data["full_name"]
            
            # Create 2-3 activities per employee
            for j in range(2):
                activity_type = activity_types[(i + j) % len(activity_types)]
                days_ago = j + (i % 3)  # Spread across different days
                
                if activity_type == "attendance":
                    title = f"Attendance Recorded"
                    description = f"Daily attendance has been logged for {emp_name}"
                elif activity_type == "performance":
                    title = f"Performance Review"
                    description = f"Quarterly performance review completed for {emp_name}"
                elif activity_type == "leave":
                    title = f"Leave Request"
                    description = f"Leave request submitted by {emp_name}"
                elif activity_type == "meeting":
                    title = f"Team Meeting"
                    description = f"{emp_name} attended team sync meeting"
                else:  # announcement
                    title = f"Welcome {emp_name}"
                    description = f"New team member {emp_name} has joined"
                
                timestamp = f"{days_ago} days ago" if days_ago > 0 else "Today"
                
                seed_activities.append(Activity(
                    id=f"ACT-SEED-{act_id_counter:03d}",
                    title=title,
                    description=description,
                    type=activity_type,
                    timestamp=timestamp,
                    device_id=None,
                ))
                act_id_counter += 1

        for act in seed_activities:
            if not db.query(Activity).filter(Activity.id == act.id).first():
                db.add(act)
        db.commit()
    except IntegrityError:
        db.rollback()
    except Exception:
        db.rollback()
