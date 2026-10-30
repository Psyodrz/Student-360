from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import (
    Student, User, Department, RiskAssessment, RiskCategory,
    AttendanceRecord, AttendanceStatus, Intervention, InterventionStatus,
    InternalMark, Assignment
)
from app.schemas import DashboardStats
from app.auth import get_current_user, require_role
import csv
import io

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "hod", "faculty"))
):
    total_students = db.query(func.count(Student.id)).scalar()
    total_faculty = db.query(func.count(User.id)).filter(
        User.role.in_([User.role.property.columns[0].type.enum_class.FACULTY, User.role.property.columns[0].type.enum_class.HOD])
    ).scalar()

    # Get latest risk per student using subquery
    from sqlalchemy import distinct
    high = 0
    medium = 0
    low = 0
    unassessed = 0

    students = db.query(Student).all()
    dept_performance = {}

    for s in students:
        latest = db.query(RiskAssessment).filter(
            RiskAssessment.student_id == s.id
        ).order_by(RiskAssessment.calculated_at.desc()).first()

        dept = db.query(Department).filter(Department.id == s.department_id).first()
        dept_name = dept.name if dept else "Unknown"

        if dept_name not in dept_performance:
            dept_performance[dept_name] = {"name": dept_name, "total": 0, "high": 0, "medium": 0, "low": 0, "avg_risk": 0, "risk_sum": 0}

        dept_performance[dept_name]["total"] += 1

        if latest:
            if latest.risk_category == RiskCategory.HIGH:
                high += 1
                dept_performance[dept_name]["high"] += 1
            elif latest.risk_category == RiskCategory.MEDIUM:
                medium += 1
                dept_performance[dept_name]["medium"] += 1
            else:
                low += 1
                dept_performance[dept_name]["low"] += 1
            dept_performance[dept_name]["risk_sum"] += latest.overall_risk
        else:
            unassessed += 1
            low += 1
            dept_performance[dept_name]["low"] += 1

    for d in dept_performance.values():
        d["avg_risk"] = round(d["risk_sum"] / d["total"], 1) if d["total"] > 0 else 0
        del d["risk_sum"]

    # Attendance trends (last 4 weeks, weekly)
    from datetime import datetime, timedelta
    from collections import defaultdict
    four_weeks_ago = datetime.utcnow().date() - timedelta(weeks=4)
    att_records = db.query(AttendanceRecord).filter(
        AttendanceRecord.date >= four_weeks_ago
    ).all()

    weekly_att = defaultdict(lambda: {"total": 0, "present": 0})
    for r in att_records:
        week_label = f"Week {r.date.isocalendar()[1]}"
        weekly_att[week_label]["total"] += 1
        if r.status in (AttendanceStatus.PRESENT, AttendanceStatus.LATE):
            weekly_att[week_label]["present"] += 1

    attendance_trends = []
    for wk in sorted(weekly_att.keys()):
        d = weekly_att[wk]
        attendance_trends.append({
            "week": wk,
            "percentage": round(d["present"] / d["total"] * 100, 1) if d["total"] > 0 else 0,
            "total": d["total"]
        })

    # Recent alerts — high risk students
    recent_high_risk = db.query(RiskAssessment).filter(
        RiskAssessment.risk_category == RiskCategory.HIGH
    ).order_by(RiskAssessment.calculated_at.desc()).limit(10).all()

    recent_alerts = []
    for ra in recent_high_risk:
        stud = db.query(Student).filter(Student.id == ra.student_id).first()
        if stud:
            recent_alerts.append({
                "student_id": stud.id,
                "student_name": stud.full_name,
                "enrollment_no": stud.enrollment_no,
                "risk_score": ra.overall_risk,
                "category": ra.risk_category.value,
                "calculated_at": str(ra.calculated_at) if ra.calculated_at else None,
            })

    return {
        "total_students": total_students,
        "total_faculty": total_faculty,
        "high_risk": high,
        "medium_risk": medium,
        "low_risk": low,
        "departments": list(dept_performance.values()),
        "risk_distribution": [
            {"category": "High", "count": high, "color": "#ef4444"},
            {"category": "Medium", "count": medium, "color": "#f59e0b"},
            {"category": "Low", "count": low, "color": "#22c55e"},
        ],
        "attendance_trends": attendance_trends,
        "recent_alerts": recent_alerts,
    }


@router.get("/risk-distribution")
def get_risk_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "hod"))
):
    students = db.query(Student).all()
    distribution = {"High": 0, "Medium": 0, "Low": 0}
    for s in students:
        latest = db.query(RiskAssessment).filter(
            RiskAssessment.student_id == s.id
        ).order_by(RiskAssessment.calculated_at.desc()).first()
        if latest:
            distribution[latest.risk_category.value] += 1
        else:
            distribution["Low"] += 1
    return distribution


@router.get("/department-comparison")
def get_department_comparison(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "hod"))
):
    departments = db.query(Department).all()
    result = []
    for dept in departments:
        students = db.query(Student).filter(Student.department_id == dept.id).all()
        if not students:
            continue

        risk_scores = []
        att_pcts = []
        for s in students:
            latest = db.query(RiskAssessment).filter(
                RiskAssessment.student_id == s.id
            ).order_by(RiskAssessment.calculated_at.desc()).first()
            if latest:
                risk_scores.append(latest.overall_risk)
                if latest.attendance_pct is not None:
                    att_pcts.append(latest.attendance_pct)

        result.append({
            "department": dept.name,
            "code": dept.code,
            "total_students": len(students),
            "avg_risk": round(sum(risk_scores) / len(risk_scores), 1) if risk_scores else 0,
            "avg_attendance": round(sum(att_pcts) / len(att_pcts), 1) if att_pcts else 0,
        })

    return result


@router.get("/intervention-effectiveness")
def get_intervention_effectiveness(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "hod", "faculty"))
):
    interventions = db.query(Intervention).all()
    total = len(interventions)
    by_status = {}
    by_type = {}
    for iv in interventions:
        st = iv.status.value
        by_status[st] = by_status.get(st, 0) + 1
        by_type[iv.type] = by_type.get(iv.type, 0) + 1

    completed = by_status.get("completed", 0) + by_status.get("evaluated", 0)

    return {
        "total": total,
        "completed": completed,
        "completion_rate": round(completed / total * 100, 1) if total > 0 else 0,
        "by_status": [{"status": k, "count": v} for k, v in by_status.items()],
        "by_type": [{"type": k, "count": v} for k, v in by_type.items()],
    }


@router.get("/export/csv")
def export_csv(
    export_type: str = "students",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "hod"))
):
    output = io.StringIO()
    writer = csv.writer(output)

    if export_type == "students":
        writer.writerow(["Enrollment No", "Name", "Email", "Department", "Semester", "Risk Score", "Risk Category"])
        students = db.query(Student).all()
        for s in students:
            dept = db.query(Department).filter(Department.id == s.department_id).first()
            latest = db.query(RiskAssessment).filter(
                RiskAssessment.student_id == s.id
            ).order_by(RiskAssessment.calculated_at.desc()).first()
            writer.writerow([
                s.enrollment_no, s.full_name, s.email,
                dept.name if dept else "", s.semester,
                latest.overall_risk if latest else "N/A",
                latest.risk_category.value if latest else "N/A",
            ])
    elif export_type == "risk":
        writer.writerow(["Student", "Enrollment", "Attendance%", "Assignment%", "Academic%", "Risk Score", "Category"])
        assessments = db.query(RiskAssessment).order_by(RiskAssessment.calculated_at.desc()).all()
        seen = set()
        for ra in assessments:
            if ra.student_id in seen:
                continue
            seen.add(ra.student_id)
            stud = db.query(Student).filter(Student.id == ra.student_id).first()
            writer.writerow([
                stud.full_name if stud else "", stud.enrollment_no if stud else "",
                ra.attendance_pct, ra.assignment_completion_pct, ra.academic_pct,
                ra.overall_risk, ra.risk_category.value,
            ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={export_type}_export.csv"}
    )


@router.get("/departments")
def list_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    departments = db.query(Department).all()
    return [{"id": d.id, "name": d.name, "code": d.code} for d in departments]


@router.get("/faculty")
def list_faculty(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "hod", "faculty"))
):
    from app.models import UserRole
    faculty = db.query(User).filter(User.role.in_([UserRole.FACULTY, UserRole.HOD])).all()
    return [{"id": f.id, "full_name": f.full_name, "email": f.email, "department_id": f.department_id} for f in faculty]
