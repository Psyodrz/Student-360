from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Student, User
from app.schemas import RiskResponse, SimulationRequest, TrendResponse
from app.auth import get_current_user, require_role
from app.risk_engine import assess_student_risk, detect_trends, calculate_risk_score

router = APIRouter(prefix="/api/risk", tags=["Risk Engine"])


@router.get("/student/{student_id}", response_model=RiskResponse)
def get_student_risk(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.value == "student" and current_user.student_id != student_id:
        raise HTTPException(403, "Access denied")

    result = assess_student_risk(db, student_id)
    if result is None:
        raise HTTPException(404, "Student not found")
    return result


@router.post("/calculate-all")
def calculate_all_risks(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "faculty"))
):
    students = db.query(Student).all()
    results = []
    for s in students:
        r = assess_student_risk(db, s.id)
        if r:
            results.append({
                "student_id": s.id,
                "name": s.full_name,
                "risk_score": r["overall_risk"],
                "category": r["risk_category"]
            })
    return {"calculated": len(results), "results": results}


@router.get("/trends/{student_id}", response_model=TrendResponse)
def get_student_trends(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.value == "student" and current_user.student_id != student_id:
        raise HTTPException(403, "Access denied")

    result = detect_trends(db, student_id)
    return result


@router.post("/simulate")
def simulate_recovery(
    data: SimulationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "faculty"))
):
    """Recovery simulator: recalculate risk with hypothetical values."""
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(404, "Student not found")

    # Get current actual values
    from app.risk_engine import _calc_attendance_pct, _calc_assignment_completion, _calc_academic_pct
    current_att = _calc_attendance_pct(db, data.student_id)
    current_asg = _calc_assignment_completion(db, data.student_id)
    current_aca = _calc_academic_pct(db, data.student_id)

    # Use simulated values where provided, else fall back to actuals
    sim_att = data.attendance_pct if data.attendance_pct is not None else current_att
    sim_asg = data.assignment_completion_pct if data.assignment_completion_pct is not None else current_asg
    sim_aca = data.academic_pct if data.academic_pct is not None else current_aca

    # Calculate current risk
    current_score, current_cat, current_factors = calculate_risk_score(current_att, current_asg, current_aca)

    # Calculate simulated risk
    sim_score, sim_cat, sim_factors = calculate_risk_score(sim_att, sim_asg, sim_aca)

    return {
        "student_id": data.student_id,
        "student_name": student.full_name,
        "current": {
            "attendance_pct": current_att,
            "assignment_completion_pct": current_asg,
            "academic_pct": current_aca,
            "risk_score": current_score,
            "risk_category": current_cat,
            "factors": current_factors,
        },
        "simulated": {
            "attendance_pct": sim_att,
            "assignment_completion_pct": sim_asg,
            "academic_pct": sim_aca,
            "risk_score": sim_score,
            "risk_category": sim_cat,
            "factors": sim_factors,
        },
        "improvement": round(current_score - sim_score, 2),
        "is_simulated": True,
    }
