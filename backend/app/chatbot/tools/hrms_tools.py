"""
LangChain tools for HRMS database queries.
These tools provide controlled, validated access to the database
instead of exposing raw SQL to the LLM.
"""

from langchain.tools import tool
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.employee import DepartmentEnum, StatusEnum
from app.services.employee_service import EmployeeService
from app.services.attendance_service import AttendanceService
from app.services.activity_service import ActivityService


def get_db_session() -> Session:
    """Get a database session for tool operations."""
    return SessionLocal()


def _normalize_department(department: str) -> str | None:
    if not department:
        return None
    d = department.strip()
    if d.lower() in {"all", "any", "*"}:
        return None
    for item in DepartmentEnum:
        if d.lower() == item.value.lower() or d.lower() == item.name.lower():
            return item.value
    return d


@tool
def get_organization_stats() -> str:
    """Get a quick high-level overview of organization metrics (Dashboard stats).

    Use this when the user asks for an overview, summary, or "how are we doing".
    """
    db = get_db_session()
    try:
        total = EmployeeService.get_employee_count(db)
        on_leave = len(EmployeeService.get_employees_by_status(db, "On Leave"))
        att_stats = AttendanceService.get_attendance_stats(db)

        return f"""Current Organization Stats:
- Total Employees: {total}
- Attendance Rate: {att_stats["attendance_rate"]}%
- Employees on Leave: {on_leave}
- Today's Status: {att_stats["present"]} Present, {att_stats["absent"]} Absent"""
    finally:
        db.close()


@tool
def get_recent_activities() -> str:
    """Get the most recent system activities and HR events.

    Use this when the user asks about recent activity, updates, or what's happening in the organization.
    """
    db = get_db_session()
    try:
        # Seed initial data if empty for demonstration
        ActivityService.seed_initial_activities(db)
        activities, total = ActivityService.get_all_activities(db, limit=5)

        if not activities:
            return "No recent activities found."

        activity_list = "\n".join(
            [
                f"- {act.title}: {act.description} ({act.timestamp})"
                for act in activities
            ]
        )
        return f"Recent Organization Activities:\n{activity_list}"
    finally:
        db.close()


@tool
def get_total_employees() -> str:
    """Get the total number of employees in the organization.

    Use this when the user asks about headcount, total employees, or team size.
    """
    db = get_db_session()
    try:
        count = EmployeeService.get_employee_count(db)
        return f"The organization currently has {count} employees."
    finally:
        db.close()


@tool
def get_employees_by_department(department: str) -> str:
    """Get all employees in a specific department.

    Args:
        department: The department name (Engineering, Design, Marketing, HR, Finance)

    Use this when the user asks about employees in a specific department.
    """
    db = get_db_session()
    try:
        normalized_department = _normalize_department(department)
        if normalized_department is None:
            employees, total = EmployeeService.get_all_employees(db, limit=50)
            if not employees:
                return "No employees found."
            employee_list = "\n".join([f"- {emp.full_name} ({emp.role})" for emp in employees])
            more = "" if total <= len(employees) else f"\n... and {total - len(employees)} more"
            return f"Employees (showing {len(employees)} of {total}):\n{employee_list}{more}"

        employees = EmployeeService.get_employees_by_department(db, normalized_department)
        if not employees:
            return f"No employees found in the {normalized_department} department."

        employee_list = "\n".join(
            [f"- {emp.full_name} ({emp.role})" for emp in employees]
        )
        return f"Employees in {normalized_department} department ({len(employees)} total):\n{employee_list}"
    except Exception:
        return "I couldn't apply that department filter. Please use a valid department (Engineering, Design, Marketing, HR, Finance) or say 'all departments'."
    finally:
        db.close()


@tool
def get_employees_on_leave() -> str:
    """Get all employees who are currently on leave.

    Use this when the user asks about who is on leave or vacation.
    """
    db = get_db_session()
    try:
        employees = EmployeeService.get_employees_by_status(db, "On Leave")
        if not employees:
            return "No employees are currently on leave."

        employee_list = "\n".join(
            [
                f"- {emp.full_name} ({emp.department.value}, {emp.role})"
                for emp in employees
            ]
        )
        return (
            f"Employees currently on leave ({len(employees)} total):\n{employee_list}"
        )
    finally:
        db.close()


@tool
def get_department_breakdown() -> str:
    """Get the employee count breakdown by department.

    Use this when the user asks about department distribution or breakdown.
    """
    db = get_db_session()
    try:
        stats = EmployeeService.get_department_stats(db)
        if not stats:
            return "No department statistics available."

        breakdown = "\n".join(
            [f"- {dept}: {count} employees" for dept, count in stats.items()]
        )
        total = sum(stats.values())
        return f"Department breakdown (Total: {total} employees):\n{breakdown}"
    finally:
        db.close()


@tool
def get_status_breakdown() -> str:
    """Get the employee count breakdown by status (Active, On Leave, Terminated).

    Use this when the user asks about employee status distribution.
    """
    db = get_db_session()
    try:
        stats = EmployeeService.get_status_stats(db)
        if not stats:
            return "No status statistics available."

        breakdown = "\n".join(
            [f"- {status}: {count} employees" for status, count in stats.items()]
        )
        return f"Employee status breakdown:\n{breakdown}"
    finally:
        db.close()


@tool
def get_employee_details(identifier: str) -> str:
    """Get detailed information about a specific employee.

    Args:
        identifier: Employee ID (e.g., #EMP-001) or email address

    Use this when the user asks about a specific employee by name, ID, or email.
    """
    db = get_db_session()
    try:
        if identifier and identifier.strip().lower() in {s.value.lower() for s in StatusEnum}:
            status = next(
                (s.value for s in StatusEnum if s.value.lower() == identifier.strip().lower()),
                identifier.strip(),
            )
            employees = EmployeeService.get_employees_by_status(db, status)
            if not employees:
                return f"No employees found with status: {status}"
            preview = employees[:10]
            employee_list = "\n".join([f"- {emp.full_name} ({emp.department.value}, {emp.role})" for emp in preview])
            more = "" if len(employees) <= len(preview) else f"\n... and {len(employees) - len(preview)} more"
            return f"Employees with status '{status}' ({len(employees)} total):\n{employee_list}{more}"

        # Try to find by ID first
        employee = EmployeeService.get_employee_by_id(db, identifier)

        # If not found, try by email
        if not employee and "@" in identifier:
            employee = EmployeeService.get_employee_by_email(db, identifier)

        if not employee:
            return f"No employee found with identifier: {identifier}"

        return f"""Employee Details:
- ID: {employee.id}
- Name: {employee.full_name}
- Email: {employee.email}
- Role: {employee.role}
- Department: {employee.department.value}
- Status: {employee.status.value}
- Location: {employee.location or "Not specified"}
- Joined: {employee.joined_date}
- Check-in Time: {employee.check_in_time or "Not checked in"}"""
    except Exception:
        return "I couldn't fetch employee details for that input. Try an employee ID, email, or full name."
    finally:
        db.close()


@tool
def search_employees(query: str) -> str:
    """Search for employees by name, email, or role.

    Args:
        query: Search term to find matching employees

    Use this when the user wants to search or find employees.
    """
    db = get_db_session()
    try:
        employees, total = EmployeeService.get_all_employees(db, search=query, limit=10)
        if not employees:
            return f"No employees found matching '{query}'."

        results = "\n".join(
            [
                f"- {emp.full_name} | {emp.role} | {emp.department.value} | {emp.status.value}"
                for emp in employees
            ]
        )
        return f"Found {total} employee(s) matching '{query}':\n{results}"
    finally:
        db.close()


@tool
def get_today_attendance() -> str:
    """Get today's attendance summary and statistics.

    Use this when the user asks about today's attendance or who's present.
    """
    db = get_db_session()
    try:
        stats = AttendanceService.get_attendance_stats(db)
        records = AttendanceService.get_today_attendance(db)

        present_list = [r for r in records if r.status.value == "Present"]

        response = f"""Today's Attendance Summary ({stats["date"]}):
- Total Recorded: {stats["total"]}
- Present: {stats["present"]}
- Absent: {stats["absent"]}
- On Leave: {stats["on_leave"]}
- Attendance Rate: {stats["attendance_rate"]}%"""

        if present_list:
            checked_in = "\n".join(
                [
                    f"  - {r.employee_name} (checked in at {r.check_in})"
                    for r in present_list[:5]
                ]
            )
            if len(present_list) > 5:
                checked_in += f"\n  ... and {len(present_list) - 5} more"
            response += f"\n\nRecently Checked In:\n{checked_in}"

        return response
    finally:
        db.close()


@tool
def get_employee_attendance(employee_id: str) -> str:
    """Get attendance history for a specific employee.

    Args:
        employee_id: The employee's ID (e.g., #EMP-001)

    Use this when the user asks about a specific employee's attendance.
    """
    db = get_db_session()
    try:
        records, total = AttendanceService.get_all_attendance(
            db, employee_id=employee_id, limit=10
        )
        if not records:
            return f"No attendance records found for employee {employee_id}."

        history = "\n".join(
            [
                f"- {r.date}: {r.status.value} (Check-in: {r.check_in}, Check-out: {r.check_out}, Hours: {r.work_hours})"
                for r in records
            ]
        )
        return f"Attendance history for {records[0].employee_name} (last {len(records)} records):\n{history}"
    finally:
        db.close()


@tool
def get_attendance_report(start_date: str = None, end_date: str = None) -> str:
    """Get a summary of attendance (Present, Absent, On Leave) for all employees over a date range.

    Args:
        start_date: Start date in YYYY-MM-DD format (defaults to first of current month)
        end_date: End date in YYYY-MM-DD format (defaults to today)

    Use this when the user asks for attendance summaries, most absent employees, or attendance reports.
    """
    from datetime import datetime

    db = get_db_session()
    try:
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        if not start_date:
            start_date = datetime.now().strftime("%Y-%m-01")

        report = AttendanceService.get_attendance_report(db, start_date, end_date)

        if not report:
            return f"No attendance records found between {start_date} and {end_date}."

        # Sort by absent count descending for useful info
        report.sort(key=lambda x: x["absent"], reverse=True)

        lines = [f"Attendance Report ({start_date} to {end_date}):"]
        for row in report:
            lines.append(
                f"- {row['name']} ({row['id']}): {row['present']} Present, {row['absent']} Absent, {row['on_leave']} On Leave"
            )

        return "\n".join(lines)
    finally:
        db.close()


# Export all tools for use in the chatbot
HRMS_TOOLS = [
    get_organization_stats,
    get_recent_activities,
    get_total_employees,
    get_employees_by_department,
    get_employees_on_leave,
    get_department_breakdown,
    get_status_breakdown,
    get_employee_details,
    search_employees,
    get_today_attendance,
    get_employee_attendance,
    get_attendance_report,
]
