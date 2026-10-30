"""
Student360 — Deterministic Risk Detection Engine

Uses weighted scoring with configurable thresholds.
No AI APIs. Fully transparent, explainable calculations.
"""
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import (
    Student, AttendanceRecord, Assignment, InternalMark,
    RiskAssessment, RiskCategory, AttendanceStatus
)
from app.config import settings
import datetime


def _calc_attendance_pct(db: Session, student_id: int) -> Optional[float]:
    """Calculate attendance percentage across all subjects."""
    total = db.query(func.count(AttendanceRecord.id)).filter(
        AttendanceRecord.student_id == student_id
    ).scalar()
    if not total or total == 0:
        return None
    present = db.query(func.count(AttendanceRecord.id)).filter(
        AttendanceRecord.student_id == student_id,
        AttendanceRecord.status.in_([AttendanceStatus.PRESENT, AttendanceStatus.LATE])
    ).scalar()
    return round((present / total) * 100, 2)


def _calc_assignment_completion(db: Session, student_id: int) -> Optional[float]:
    """Calculate assignment completion percentage."""
    total = db.query(func.count(Assignment.id)).filter(
        Assignment.student_id == student_id
    ).scalar()
    if not total or total == 0:
        return None
    submitted = db.query(func.count(Assignment.id)).filter(
        Assignment.student_id == student_id,
        Assignment.submitted == True
    ).scalar()
    return round((submitted / total) * 100, 2)


def _calc_academic_pct(db: Session, student_id: int) -> Optional[float]:
    """Calculate overall academic percentage from internal marks."""
    marks = db.query(InternalMark).filter(
        InternalMark.student_id == student_id
    ).all()
    if not marks:
        return None
    total_obtained = sum(m.marks_obtained for m in marks)
    total_max = sum(m.max_marks for m in marks)
    if total_max == 0:
        return None
    return round((total_obtained / total_max) * 100, 2)


def calculate_risk_score(
    attendance_pct: Optional[float],
    assignment_completion_pct: Optional[float],
    academic_pct: Optional[float],
) -> Tuple[float, str, List[dict]]:
    """
    Calculate risk score using the specified formula:
      A = max(0, ((75 - attendance%) / 75) * 100)
      B = 100 - assignment_completion%
      C = max(0, ((60 - academic%) / 60) * 100)
      R = 0.35*A + 0.25*B + 0.40*C

    Missing data → component excluded, weights redistributed proportionally.
    """
    components = {}
    factors = []
    w_att = settings.RISK_WEIGHT_ATTENDANCE
    w_asg = settings.RISK_WEIGHT_ASSIGNMENT
    w_aca = settings.RISK_WEIGHT_ACADEMIC

    if attendance_pct is not None:
        A = max(0.0, ((settings.ATTENDANCE_THRESHOLD - attendance_pct) / settings.ATTENDANCE_THRESHOLD) * 100)
        components["attendance"] = (A, w_att)
        severity = "high" if A > 50 else "medium" if A > 20 else "low"
        factors.append({
            "component": "Attendance",
            "value": attendance_pct,
            "risk_contribution": round(A, 2),
            "threshold": settings.ATTENDANCE_THRESHOLD,
            "severity": severity,
            "explanation": f"Attendance is {attendance_pct}% (threshold: {settings.ATTENDANCE_THRESHOLD}%)"
        })

    if assignment_completion_pct is not None:
        B = max(0.0, 100 - assignment_completion_pct)
        components["assignment"] = (B, w_asg)
        severity = "high" if B > 50 else "medium" if B > 20 else "low"
        factors.append({
            "component": "Assignments",
            "value": assignment_completion_pct,
            "risk_contribution": round(B, 2),
            "threshold": 100.0,
            "severity": severity,
            "explanation": f"Assignment completion is {assignment_completion_pct}% (target: 100%)"
        })

    if academic_pct is not None:
        C = max(0.0, ((settings.ACADEMIC_THRESHOLD - academic_pct) / settings.ACADEMIC_THRESHOLD) * 100)
        components["academic"] = (C, w_aca)
        severity = "high" if C > 50 else "medium" if C > 20 else "low"
        factors.append({
            "component": "Academic Performance",
            "value": academic_pct,
            "risk_contribution": round(C, 2),
            "threshold": settings.ACADEMIC_THRESHOLD,
            "severity": severity,
            "explanation": f"Academic performance is {academic_pct}% (threshold: {settings.ACADEMIC_THRESHOLD}%)"
        })

    if not components:
        return 0.0, RiskCategory.LOW.value, [{
            "component": "Insufficient Data",
            "value": None,
            "risk_contribution": 0,
            "severity": "unknown",
            "explanation": "Not enough data to calculate risk score"
        }]

    # Redistribute weights proportionally for missing components
    total_weight = sum(w for _, w in components.values())
    R = sum((score * (weight / total_weight)) for score, weight in components.values())
    R = round(min(100.0, max(0.0, R)), 2)

    if R < settings.RISK_LOW_MAX:
        category = RiskCategory.LOW.value
    elif R < settings.RISK_MEDIUM_MAX:
        category = RiskCategory.MEDIUM.value
    else:
        category = RiskCategory.HIGH.value

    return R, category, factors


def assess_student_risk(db: Session, student_id: int) -> dict:
    """Full risk assessment for a student. Calculates, stores, returns."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return None

    att_pct = _calc_attendance_pct(db, student_id)
    asg_pct = _calc_assignment_completion(db, student_id)
    aca_pct = _calc_academic_pct(db, student_id)

    overall, category, factors = calculate_risk_score(att_pct, asg_pct, aca_pct)

    # Get previous risk score
    prev = db.query(RiskAssessment).filter(
        RiskAssessment.student_id == student_id
    ).order_by(RiskAssessment.calculated_at.desc()).first()

    previous_risk = prev.overall_risk if prev else None

    # Compute individual component risks for storage
    att_risk = None
    asg_risk = None
    aca_risk = None
    if att_pct is not None:
        att_risk = round(max(0, ((settings.ATTENDANCE_THRESHOLD - att_pct) / settings.ATTENDANCE_THRESHOLD) * 100), 2)
    if asg_pct is not None:
        asg_risk = round(max(0, 100 - asg_pct), 2)
    if aca_pct is not None:
        aca_risk = round(max(0, ((settings.ACADEMIC_THRESHOLD - aca_pct) / settings.ACADEMIC_THRESHOLD) * 100), 2)

    assessment = RiskAssessment(
        student_id=student_id,
        attendance_pct=att_pct,
        assignment_completion_pct=asg_pct,
        academic_pct=aca_pct,
        attendance_risk=att_risk,
        assignment_risk=asg_risk,
        academic_risk=aca_risk,
        overall_risk=overall,
        risk_category=RiskCategory(category),
        factors=factors,
        previous_risk=previous_risk,
        calculated_at=datetime.datetime.utcnow()
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    trend = "stable"
    if previous_risk is not None:
        diff = overall - previous_risk
        if diff > 5:
            trend = "worsening"
        elif diff < -5:
            trend = "improving"

    return {
        "student_id": student_id,
        "student_name": student.full_name,
        "attendance_pct": att_pct,
        "assignment_completion_pct": asg_pct,
        "academic_pct": aca_pct,
        "attendance_risk": att_risk,
        "assignment_risk": asg_risk,
        "academic_risk": aca_risk,
        "overall_risk": overall,
        "risk_category": category,
        "factors": factors,
        "previous_risk": previous_risk,
        "risk_trend": trend,
        "calculated_at": assessment.calculated_at
    }


def detect_trends(db: Session, student_id: int) -> dict:
    """Academic trend detection — transparent statistical rules."""
    alerts = []

    # 1. Consecutive attendance decline
    att_records = db.query(AttendanceRecord).filter(
        AttendanceRecord.student_id == student_id
    ).order_by(AttendanceRecord.date.desc()).limit(30).all()

    if att_records:
        recent_absent = 0
        for r in att_records[:10]:
            if r.status == AttendanceStatus.ABSENT:
                recent_absent += 1
        if recent_absent >= 5:
            alerts.append({
                "type": "attendance_decline",
                "severity": "high",
                "message": f"Absent {recent_absent} out of last 10 classes",
                "data": {"absent_count": recent_absent, "total_recent": 10}
            })
        elif recent_absent >= 3:
            alerts.append({
                "type": "attendance_decline",
                "severity": "medium",
                "message": f"Absent {recent_absent} out of last 10 classes",
                "data": {"absent_count": recent_absent, "total_recent": 10}
            })

    # 2. Declining internal marks
    marks = db.query(InternalMark).filter(
        InternalMark.student_id == student_id
    ).order_by(InternalMark.id.asc()).all()

    if len(marks) >= 2:
        mark_pcts = []
        for m in marks:
            if m.max_marks > 0:
                mark_pcts.append((m.exam_type, round(m.marks_obtained / m.max_marks * 100, 2)))

        # Check for consecutive decline
        declining = 0
        for i in range(1, len(mark_pcts)):
            if mark_pcts[i][1] < mark_pcts[i-1][1]:
                declining += 1
            else:
                declining = 0

        if declining >= 2:
            alerts.append({
                "type": "marks_decline",
                "severity": "high",
                "message": f"Marks have declined for {declining} consecutive exams",
                "data": {"consecutive_declines": declining}
            })

        # Check for sudden drop (>15%)
        if len(mark_pcts) >= 2:
            latest = mark_pcts[-1][1]
            prev = mark_pcts[-2][1]
            if prev > 0 and (prev - latest) > 15:
                alerts.append({
                    "type": "sudden_drop",
                    "severity": "high",
                    "message": f"Sudden performance drop: {prev}% → {latest}% (>{15}% decline)",
                    "data": {"previous": prev, "current": latest, "drop": round(prev - latest, 2)}
                })

    # 3. Repeated missed assignments
    assignments = db.query(Assignment).filter(
        Assignment.student_id == student_id
    ).order_by(Assignment.due_date.desc()).limit(10).all()

    if assignments:
        consecutive_missed = 0
        for a in assignments:
            if not a.submitted:
                consecutive_missed += 1
            else:
                break
        if consecutive_missed >= 3:
            alerts.append({
                "type": "missed_assignments",
                "severity": "high" if consecutive_missed >= 5 else "medium",
                "message": f"{consecutive_missed} consecutive assignments not submitted",
                "data": {"missed_count": consecutive_missed}
            })

    # Build attendance trend data (weekly)
    att_trend = []
    if att_records:
        from collections import defaultdict
        weekly = defaultdict(lambda: {"present": 0, "total": 0})
        for r in reversed(att_records):
            week = r.date.isocalendar()[1]
            weekly[week]["total"] += 1
            if r.status in (AttendanceStatus.PRESENT, AttendanceStatus.LATE):
                weekly[week]["present"] += 1
        for wk in sorted(weekly.keys()):
            d = weekly[wk]
            att_trend.append({
                "week": wk,
                "percentage": round(d["present"] / d["total"] * 100, 1) if d["total"] > 0 else 0
            })

    marks_trend = []
    if marks:
        for m in marks:
            if m.max_marks > 0:
                marks_trend.append({
                    "exam": m.exam_type,
                    "percentage": round(m.marks_obtained / m.max_marks * 100, 1),
                    "subject_id": m.subject_id
                })

    return {
        "student_id": student_id,
        "alerts": alerts,
        "attendance_trend": att_trend,
        "marks_trend": marks_trend
    }
