from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from app.database import get_db
from app.models import Student, Department, RiskAssessment, User
from app.schemas import StudentCreate, StudentUpdate, StudentOut
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/students", tags=["Students"])


@router.get("", response_model=List[StudentOut])
def list_students(
    search: Optional[str] = None,
    department_id: Optional[int] = None,
    semester: Optional[int] = None,
    risk_category: Optional[str] = None,
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "hod", "faculty"))
):
    q = db.query(Student).join(Department)

    if search:
        search_term = f"%{search}%"
        q = q.filter(
            (Student.full_name.ilike(search_term)) |
            (Student.enrollment_no.ilike(search_term)) |
            (Student.email.ilike(search_term))
        )
    if department_id:
        q = q.filter(Student.department_id == department_id)
    if semester:
        q = q.filter(Student.semester == semester)

    students = q.offset(skip).limit(limit).all()
    result = []
    for s in students:
        latest_risk = db.query(RiskAssessment).filter(
            RiskAssessment.student_id == s.id
        ).order_by(RiskAssessment.calculated_at.desc()).first()

        out = StudentOut(
            id=s.id,
            enrollment_no=s.enrollment_no,
            full_name=s.full_name,
            email=s.email,
            department_id=s.department_id,
            department_name=s.department.name if s.department else None,
            semester=s.semester,
            admission_year=s.admission_year,
            phone=s.phone,
            status=s.status or "active",
            risk_score=latest_risk.overall_risk if latest_risk else None,
            risk_category=latest_risk.risk_category.value if latest_risk else None,
        )
        if risk_category and out.risk_category != risk_category:
            continue
        result.append(out)

    return result


@router.post("", response_model=StudentOut)
def create_student(
    data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "faculty"))
):
    if db.query(Student).filter(Student.enrollment_no == data.enrollment_no).first():
        raise HTTPException(400, "Enrollment number already exists")
    if db.query(Student).filter(Student.email == data.email).first():
        raise HTTPException(400, "Email already exists")

    student = Student(**data.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    dept = db.query(Department).filter(Department.id == student.department_id).first()
    return StudentOut(
        id=student.id, enrollment_no=student.enrollment_no, full_name=student.full_name,
        email=student.email, department_id=student.department_id,
        department_name=dept.name if dept else None,
        semester=student.semester, admission_year=student.admission_year,
        phone=student.phone, status=student.status or "active",
    )


@router.get("/{student_id}", response_model=StudentOut)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(404, "Student not found")

    # Students can only access their own profile
    if current_user.role.value == "student" and current_user.student_id != student_id:
        raise HTTPException(403, "Access denied")

    dept = db.query(Department).filter(Department.id == student.department_id).first()
    latest_risk = db.query(RiskAssessment).filter(
        RiskAssessment.student_id == student_id
    ).order_by(RiskAssessment.calculated_at.desc()).first()

    return StudentOut(
        id=student.id, enrollment_no=student.enrollment_no, full_name=student.full_name,
        email=student.email, department_id=student.department_id,
        department_name=dept.name if dept else None,
        semester=student.semester, admission_year=student.admission_year,
        phone=student.phone, status=student.status or "active",
        risk_score=latest_risk.overall_risk if latest_risk else None,
        risk_category=latest_risk.risk_category.value if latest_risk else None,
    )


@router.put("/{student_id}", response_model=StudentOut)
def update_student(
    student_id: int,
    data: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "faculty"))
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(404, "Student not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(student, key, value)
    db.commit()
    db.refresh(student)
    dept = db.query(Department).filter(Department.id == student.department_id).first()
    return StudentOut(
        id=student.id, enrollment_no=student.enrollment_no, full_name=student.full_name,
        email=student.email, department_id=student.department_id,
        department_name=dept.name if dept else None,
        semester=student.semester, admission_year=student.admission_year,
        phone=student.phone, status=student.status or "active",
    )


@router.delete("/{student_id}")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(404, "Student not found")

    # Also delete linked user accounts
    db.query(User).filter(User.student_id == student_id).delete()
    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}


@router.get("/{student_id}/profile")
def get_student_profile(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Full student profile with academic history."""
    if current_user.role.value == "student" and current_user.student_id != student_id:
        raise HTTPException(403, "Access denied")

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(404, "Student not found")

    dept = db.query(Department).filter(Department.id == student.department_id).first()

    # Attendance summary
    from app.models import AttendanceRecord, AttendanceStatus
    from sqlalchemy import func
    total_att = db.query(func.count(AttendanceRecord.id)).filter(AttendanceRecord.student_id == student_id).scalar()
    present_att = db.query(func.count(AttendanceRecord.id)).filter(
        AttendanceRecord.student_id == student_id,
        AttendanceRecord.status.in_([AttendanceStatus.PRESENT, AttendanceStatus.LATE])
    ).scalar()
    att_pct = round((present_att / total_att) * 100, 2) if total_att > 0 else None

    # Assignment summary
    from app.models import Assignment
    total_asg = db.query(func.count(Assignment.id)).filter(Assignment.student_id == student_id).scalar()
    submitted_asg = db.query(func.count(Assignment.id)).filter(
        Assignment.student_id == student_id, Assignment.submitted == True
    ).scalar()
    asg_pct = round((submitted_asg / total_asg) * 100, 2) if total_asg > 0 else None

    # Internal marks
    from app.models import InternalMark
    marks = db.query(InternalMark).filter(InternalMark.student_id == student_id).all()
    marks_data = []
    for m in marks:
        from app.models import Subject
        subj = db.query(Subject).filter(Subject.id == m.subject_id).first()
        marks_data.append({
            "exam_type": m.exam_type,
            "subject": subj.name if subj else "Unknown",
            "subject_code": subj.code if subj else "",
            "marks_obtained": m.marks_obtained,
            "max_marks": m.max_marks,
            "percentage": round(m.marks_obtained / m.max_marks * 100, 1) if m.max_marks > 0 else 0
        })

    total_obtained = sum(m.marks_obtained for m in marks)
    total_max = sum(m.max_marks for m in marks)
    academic_pct = round((total_obtained / total_max) * 100, 2) if total_max > 0 else None

    # Risk
    latest_risk = db.query(RiskAssessment).filter(
        RiskAssessment.student_id == student_id
    ).order_by(RiskAssessment.calculated_at.desc()).first()

    # Interventions
    from app.models import Intervention
    interventions = db.query(Intervention).filter(Intervention.student_id == student_id).all()
    intervention_data = []
    for iv in interventions:
        faculty = db.query(User).filter(User.id == iv.faculty_id).first()
        intervention_data.append({
            "id": iv.id,
            "type": iv.type,
            "description": iv.description,
            "status": iv.status.value,
            "faculty_name": faculty.full_name if faculty else "Unknown",
            "deadline": str(iv.deadline) if iv.deadline else None,
            "notes": iv.notes,
            "follow_up": iv.follow_up,
            "improvement_notes": iv.improvement_notes,
            "created_at": str(iv.created_at) if iv.created_at else None,
        })

    return {
        "student": {
            "id": student.id,
            "enrollment_no": student.enrollment_no,
            "full_name": student.full_name,
            "email": student.email,
            "department": dept.name if dept else None,
            "department_code": dept.code if dept else None,
            "semester": student.semester,
            "admission_year": student.admission_year,
            "phone": student.phone,
            "status": student.status,
        },
        "attendance": {
            "total_classes": total_att,
            "present": present_att,
            "percentage": att_pct,
        },
        "assignments": {
            "total": total_asg,
            "submitted": submitted_asg,
            "completion_pct": asg_pct,
        },
        "academic": {
            "marks": marks_data,
            "overall_percentage": academic_pct,
        },
        "risk": {
            "score": latest_risk.overall_risk if latest_risk else None,
            "category": latest_risk.risk_category.value if latest_risk else None,
            "factors": latest_risk.factors if latest_risk else None,
            "previous": latest_risk.previous_risk if latest_risk else None,
        },
        "interventions": intervention_data,
    }
