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
from app.core.demo_scope_context import get_demo_scope_key
from datetime import datetime, timedelta
from app.models.attendance import Attendance


def get_db_session() -> Session:
    """Get a database session for tool operations."""
    return SessionLocal()


def _scope_key() -> str | None:
    return get_demo_scope_key()


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


def _normalize_date(date_str: str | None) -> str:
    if not date_str:
        return datetime.now().strftime("%Y-%m-%d")
    s = date_str.strip()
    if not s:
        return datetime.now().strftime("%Y-%m-%d")
    low = s.lower()
    if low in {"today", "now"}:
        return datetime.now().strftime("%Y-%m-%d")
    if low == "yesterday":
        return (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    try:
        return datetime.strptime(s, "%Y-%m-%d").strftime("%Y-%m-%d")
    except Exception:
        return s


def _latest_attendance_date(db: Session, scope_key: str | None) -> str:
    query = db.query(Attendance.date)
    if scope_key:
        query = query.filter(Attendance.device_id == scope_key)
    latest = query.order_by(Attendance.date.desc()).first()
    return (latest[0] if latest and latest[0] else datetime.now().strftime("%Y-%m-%d"))


def _calendar_today() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def _has_attendance_for_date(db: Session, date_str: str, scope_key: str | None) -> bool:
    q = db.query(Attendance.id).filter(Attendance.date == date_str)
    if scope_key:
        q = q.filter(Attendance.device_id == scope_key)
    return q.first() is not None


def _resolve_attendance_date(date_str: str | None, db: Session, scope_key: str | None) -> str:
    if date_str is None:
        # Default behavior: if there is any data for calendar-today, use it.
        # Otherwise fall back to the latest available attendance date.
        today = _calendar_today()
        return today if _has_attendance_for_date(db, today, scope_key) else _latest_attendance_date(db, scope_key)
    s = date_str.strip() if isinstance(date_str, str) else str(date_str)
    if not s:
        today = _calendar_today()
        return today if _has_attendance_for_date(db, today, scope_key) else _latest_attendance_date(db, scope_key)
    low = s.lower()
    if low in {"today", "now"}:
        today = _calendar_today()
        return today if _has_attendance_for_date(db, today, scope_key) else _latest_attendance_date(db, scope_key)
    return _normalize_date(s)


@tool
def get_organization_stats() -> str:
    """Get a quick high-level overview of organization metrics (Dashboard stats).

    Use this when the user asks for an overview, summary, or "how are we doing".
    """
    db = get_db_session()
    try:
        scope_key = _scope_key()
        total = EmployeeService.get_employee_count(db, scope_key=scope_key)
        today = _latest_attendance_date(db, scope_key)
        att_stats = AttendanceService.get_attendance_stats_scoped(
            db, date_str=today, scope_key=scope_key
        )
        absent_records, _ = AttendanceService.get_all_attendance(
            db,
            date_filter=today,
            status="Absent",
            limit=500,
            scope_key=scope_key,
        )
        absent_count = len(absent_records)

        return f"""Current Organization Stats:
- Total Employees: {total}
- Attendance Rate: {att_stats["attendance_rate"]}%
- Employees on Leave (today): {att_stats["on_leave"]}
- Today's Status: {att_stats["present"]} Present, {absent_count} Absent"""
    finally:
        db.close()


@tool
def get_absent_employees(date: str = None) -> str:
    """Get employees marked Absent on a specific date (YYYY-MM-DD)."""
    db = get_db_session()
    try:
        scope_key = _scope_key()
        date_norm = _resolve_attendance_date(date, db, scope_key)
        records, _ = AttendanceService.get_all_attendance(
            db,
            date_filter=date_norm,
            status="Absent",
            limit=500,
            scope_key=scope_key,
        )

        if not records:
            return f"No employees were marked Absent on {date_norm}."

        lines = "\n".join(
            [f"- {r.employee_name} ({r.role}) - Marked as Absent" for r in records[:25]]
        )
        more = "" if len(records) <= 25 else f"\n... and {len(records) - 25} more"
        return f"Employees absent on {date_norm} ({len(records)} total):\n{lines}{more}"
    except Exception as e:
        return f"I couldn't retrieve the absent employee list for {date_norm}. Error: {str(e)}"
    finally:
        db.close()


@tool
def get_attendance_summary(date: str = None) -> str:
    """Get attendance summary for a specific date (YYYY-MM-DD)."""
    db = get_db_session()
    try:
        scope_key = _scope_key()
        date_norm = _resolve_attendance_date(date, db, scope_key)
        stats = AttendanceService.get_attendance_stats_scoped(
            db, date_str=date_norm, scope_key=scope_key
        )
        return (
            f"Attendance Summary ({stats['date']}):\n"
            f"- Total Recorded: {stats['total']}\n"
            f"- Present: {stats['present']}\n"
            f"- Absent: {stats['absent']}\n"
            f"- On Leave: {stats['on_leave']}\n"
            f"- Attendance Rate: {stats['attendance_rate']}%"
        )
    except Exception as e:
        return f"I couldn't retrieve attendance summary for {date_norm}. Error: {str(e)}"
    finally:
        db.close()


@tool
def get_present_employees(date: str = None) -> str:
    """List employees marked Present on a specific date (YYYY-MM-DD)."""
    db = get_db_session()
    try:
        scope_key = _scope_key()
        date_norm = _resolve_attendance_date(date, db, scope_key)
        records, _ = AttendanceService.get_all_attendance(
            db,
            date_filter=date_norm,
            status="Present",
            limit=500,
            scope_key=scope_key,
        )

        if not records:
            return f"No employees were marked Present on {date_norm}."

        lines = "\n".join([f"- {r.employee_name} ({r.role})" for r in records[:25]])
        more = "" if len(records) <= 25 else f"\n... and {len(records) - 25} more"
        return f"Employees present on {date_norm} ({len(records)} total):\n{lines}{more}"
    except Exception as e:
        return f"I couldn't retrieve present employees for {date_norm}. Error: {str(e)}"
    finally:
        db.close()


@tool
def compare_attendance(date_a: str, date_b: str) -> str:
    """Compare attendance summary between two dates (YYYY-MM-DD)."""
    a = _normalize_date(date_a)
    b = _normalize_date(date_b)
    db = get_db_session()
    try:
        scope_key = _scope_key()
        stats_a = AttendanceService.get_attendance_stats_scoped(
            db, date_str=a, scope_key=scope_key
        )
        stats_b = AttendanceService.get_attendance_stats_scoped(
            db, date_str=b, scope_key=scope_key
        )

        return (
            "Attendance Comparison:\n"
            f"- {stats_a['date']}: {stats_a['present']} Present, {stats_a['absent']} Absent, {stats_a['on_leave']} On Leave (Rate {stats_a['attendance_rate']}%)\n"
            f"- {stats_b['date']}: {stats_b['present']} Present, {stats_b['absent']} Absent, {stats_b['on_leave']} On Leave (Rate {stats_b['attendance_rate']}%)"
        )
    except Exception as e:
        return f"I couldn't compare attendance between {a} and {b}. Error: {str(e)}"
    finally:
        db.close()


@tool
def get_repeat_absentees(
    start_date: str = None, end_date: str = None, min_absences: int = 2
) -> str:
    """Find employees absent at least N times in a date range."""
    db = get_db_session()
    try:
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        if not start_date:
            start_date = datetime.now().strftime("%Y-%m-01")
        if min_absences is None or int(min_absences) < 1:
            min_absences = 1

        scope_key = _scope_key()
        report = AttendanceService.get_attendance_report_scoped(
            db, start_date, end_date, scope_key=scope_key
        )
        offenders = [
            r for r in report if int(r.get("absent", 0)) >= int(min_absences)
        ]

        if not offenders:
            return (
                f"No repeat absentees found from {start_date} to {end_date} "
                f"(threshold: {min_absences}+)."
            )

        offenders.sort(key=lambda x: x.get("absent", 0), reverse=True)
        lines = "\n".join(
            [
                f"- {o['name']} ({o['id']}): {o['absent']} absences"
                for o in offenders[:25]
            ]
        )
        more = "" if len(offenders) <= 25 else f"\n... and {len(offenders) - 25} more"
        return (
            f"Repeat absentees from {start_date} to {end_date} (threshold: {min_absences}+):\n"
            f"{lines}{more}"
        )
    except Exception as e:
        return f"I couldn't compute repeat absentees. Error: {str(e)}"
    finally:
        db.close()


@tool
def get_department_with_most_absentees(date: str = None) -> str:
    """Find which department has the most absentees on a specific date (YYYY-MM-DD)."""
    date_norm = _normalize_date(date)
    db = get_db_session()
    try:
        scope_key = _scope_key()
        absent_employees = AttendanceService.get_absent_employees_scoped(
            db, date_norm, scope_key=scope_key
        )

        if not absent_employees:
            return f"No absentees found on {date_norm}."

        counts: dict[str, int] = {}
        for emp in absent_employees:
            dept = emp.get("department") or "Unknown"
            counts[dept] = counts.get(dept, 0) + 1

        top_dept, top_count = max(counts.items(), key=lambda x: x[1])
        breakdown = "\n".join(
            [
                f"- {dept}: {count}"
                for dept, count in sorted(counts.items(), key=lambda x: x[1], reverse=True)
            ]
        )

        return (
            f"Department with most absentees on {date_norm}: {top_dept} ({top_count})\n\n"
            f"Absentee breakdown by department:\n{breakdown}"
        )
    except Exception as e:
        return f"I couldn't compute department absentees for {date_norm}. Error: {str(e)}"
    finally:
        db.close()


@tool
def get_employees_on_leave_by_date(date: str = None) -> str:
    """Get employees on leave for a specific date (YYYY-MM-DD).

    Use this when the user asks who was on leave on a past date.
    """
    db = get_db_session()
    try:
        scope_key = _scope_key()
        date_norm = _resolve_attendance_date(date, db, scope_key)
        records, _ = AttendanceService.get_all_attendance(
            db,
            date_filter=date_norm,
            status="On Leave",
            limit=500,
            scope_key=scope_key,
        )
        if not records:
            return f"No employees were marked on leave on {date_norm}."
        lines = "\n".join([f"- {r.employee_name} ({r.role})" for r in records[:25]])
        more = "" if len(records) <= 25 else f"\n... and {len(records) - 25} more"
        return f"Employees on leave on {date_norm} ({len(records)} total):\n{lines}{more}"
    finally:
        db.close()


@tool
def get_employee_names_and_statuses() -> str:
    """List employee names and their current status.

    Use this when the user asks for a list of employees with their statuses
    (e.g., 'all employee names and their status').
    """
    db = get_db_session()
    try:
        scope_key = _scope_key()
        employees, total = EmployeeService.get_all_employees(
            db, limit=200, scope_key=scope_key
        )
        if not employees:
            return "No employees found."

        lines = "\n".join(
            [f"- {e.full_name}: {getattr(e.status, 'value', e.status)}" for e in employees]
        )
        more = "" if total <= len(employees) else f"\n... and {total - len(employees)} more"
        return f"Employees and statuses (showing {len(employees)} of {total}):\n{lines}{more}"
    finally:
        db.close()


@tool
def get_recent_activities() -> str:
    """Get the most recent system activities and HR events.

    Use this when the user asks about recent activity, updates, or what's happening in the organization.
    """
    db = get_db_session()
    try:
        scope_key = _scope_key()
        # Seed initial data if empty for demonstration
        ActivityService.seed_initial_activities(db, scope_key=scope_key)
        activities, total = ActivityService.get_all_activities(db, limit=5, scope_key=scope_key)

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
        scope_key = _scope_key()
        count = EmployeeService.get_employee_count(db, scope_key=scope_key)
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
        scope_key = _scope_key()
        normalized_department = _normalize_department(department)
        if normalized_department is None:
            employees, total = EmployeeService.get_all_employees(db, limit=50, scope_key=scope_key)
            if not employees:
                return "No employees found."
            employee_list = "\n".join([f"- {emp.full_name} ({emp.role})" for emp in employees])
            more = "" if total <= len(employees) else f"\n... and {total - len(employees)} more"
            return f"Employees (showing {len(employees)} of {total}):\n{employee_list}{more}"

        employees = EmployeeService.get_employees_by_department_scoped(db, normalized_department, scope_key=scope_key)
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
    """Get today's employees on leave based on attendance records.

    Use this when the user asks about who is on leave or vacation today.
    """
    db = get_db_session()
    try:
        scope_key = _scope_key()
        today = _latest_attendance_date(db, scope_key)
        records, _ = AttendanceService.get_all_attendance(
            db,
            date_filter=today,
            status="On Leave",
            limit=500,
            scope_key=scope_key,
        )

        if not records:
            return "No employees are currently on leave today."

        lines = "\n".join(
            [f"- {r.employee_name} ({r.role})" for r in records[:25]]
        )
        more = "" if len(records) <= 25 else f"\n... and {len(records) - 25} more"
        return f"Employees on leave today ({len(records)} total):\n{lines}{more}"
    finally:
        db.close()


@tool
def get_absent_employees_today() -> str:
    """Get all employees who are absent today (no attendance marked or marked as Absent).

    Use this when the user asks about who is absent, missing, or didn't check in today.
    """
    db = get_db_session()
    try:
        scope_key = _scope_key()
        today = _latest_attendance_date(db, scope_key)
        absent_employees = AttendanceService.get_absent_employees_scoped(
            db, today, scope_key=scope_key
        )
        
        if not absent_employees:
            return "No employees are currently absent. All active employees either have attendance marked or are on leave."

        employee_list = "\n".join(
            [
                f"- {emp['name']} ({emp['department']}, {emp['role']}) - {emp['reason']}"
                for emp in absent_employees
            ]
        )
        return (
            f"Employees absent today ({len(absent_employees)} total):\n{employee_list}"
        )
    except Exception as e:
        return f"I couldn't retrieve the absent employee list. Error: {str(e)}"
    finally:
        db.close()


@tool
def get_department_breakdown() -> str:
    """Get the employee count breakdown by department.

    Use this when the user asks about department distribution or breakdown.
    """
    db = get_db_session()
    try:
        scope_key = _scope_key()
        stats = EmployeeService.get_department_stats(db, scope_key=scope_key)
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
        scope_key = _scope_key()
        stats = EmployeeService.get_status_stats(db, scope_key=scope_key)
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
        scope_key = _scope_key()
        if identifier and identifier.strip().lower() in {s.value.lower() for s in StatusEnum}:
            status = next(
                (s.value for s in StatusEnum if s.value.lower() == identifier.strip().lower()),
                identifier.strip(),
            )
            employees = EmployeeService.get_employees_by_status_scoped(db, status, scope_key=scope_key)
            if not employees:
                return f"No employees found with status: {status}"
            preview = employees[:10]
            employee_list = "\n".join([f"- {emp.full_name} ({emp.department.value}, {emp.role})" for emp in preview])
            more = "" if len(employees) <= len(preview) else f"\n... and {len(employees) - len(preview)} more"
            return f"Employees with status '{status}' ({len(employees)} total):\n{employee_list}{more}"

        # Try to find by ID first
        employee = EmployeeService.get_employee_by_id_scoped(db, identifier, scope_key=scope_key)

        # If not found, try by email
        if not employee and "@" in identifier:
            employee = EmployeeService.get_employee_by_email_scoped(db, identifier, scope_key=scope_key)

        # If not found, try searching by name
        if not employee:
            employees, total = EmployeeService.get_all_employees(db, search=identifier, limit=5, scope_key=scope_key)
            if employees:
                if len(employees) == 1:
                    employee = employees[0]
                else:
                    # Multiple matches, show list
                    matches = "\n".join([f"- {emp.full_name} ({emp.id}, {emp.department.value})" for emp in employees[:5]])
                    return f"Multiple employees found matching '{identifier}':\n{matches}\n\nPlease specify the employee ID for detailed information."

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
        scope_key = _scope_key()
        employees, total = EmployeeService.get_all_employees(db, search=query, limit=10, scope_key=scope_key)
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
        scope_key = _scope_key()
        stats = AttendanceService.get_attendance_stats_scoped(db, scope_key=scope_key)
        records = AttendanceService.get_today_attendance_scoped(db, scope_key)

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
        scope_key = _scope_key()
        records, total = AttendanceService.get_all_attendance(
            db, employee_id=employee_id, limit=10, scope_key=scope_key
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

        scope_key = _scope_key()
        report = AttendanceService.get_attendance_report_scoped(db, start_date, end_date, scope_key=scope_key)

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
    get_employees_on_leave_by_date,
    get_absent_employees_today,
    get_absent_employees,
    get_department_breakdown,
    get_status_breakdown,
    get_employee_names_and_statuses,
    get_employee_details,
    search_employees,
    get_today_attendance,
    get_attendance_summary,
    get_present_employees,
    get_employee_attendance,
    get_attendance_report,
    get_department_with_most_absentees,
    compare_attendance,
    get_repeat_absentees,
]
