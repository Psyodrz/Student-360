from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models import Intervention, InterventionStatus, Student, User
from app.schemas import InterventionCreate, InterventionUpdate, InterventionOut
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/interventions", tags=["Interventions"])


@router.get("", response_model=List[InterventionOut])
def list_interventions(
    status: Optional[str] = None,
    faculty_id: Optional[int] = None,
    student_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Intervention)

    # Students only see their own
    if current_user.role.value == "student":
        if current_user.student_id is None:
            return []
        q = q.filter(Intervention.student_id == current_user.student_id)
    else:
        if student_id:
            q = q.filter(Intervention.student_id == student_id)
        if faculty_id:
            q = q.filter(Intervention.faculty_id == faculty_id)

    if status:
        q = q.filter(Intervention.status == InterventionStatus(status))

    interventions = q.order_by(Intervention.created_at.desc()).all()
    result = []
    for iv in interventions:
        student = db.query(Student).filter(Student.id == iv.student_id).first()
        faculty = db.query(User).filter(User.id == iv.faculty_id).first()
        result.append(InterventionOut(
            id=iv.id,
            student_id=iv.student_id,
            student_name=student.full_name if student else None,
            faculty_id=iv.faculty_id,
            faculty_name=faculty.full_name if faculty else None,
            type=iv.type,
            description=iv.description,
            status=iv.status.value,
            deadline=iv.deadline,
            notes=iv.notes,
            follow_up=iv.follow_up,
            improvement_notes=iv.improvement_notes,
            created_at=iv.created_at,
            updated_at=iv.updated_at,
        ))
    return result


@router.post("", response_model=InterventionOut)
def create_intervention(
    data: InterventionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "faculty"))
):
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(404, "Student not found")
    faculty = db.query(User).filter(User.id == data.faculty_id).first()
    if not faculty:
        raise HTTPException(404, "Faculty not found")

    iv = Intervention(
        student_id=data.student_id,
        faculty_id=data.faculty_id,
        type=data.type,
        description=data.description,
        deadline=data.deadline,
        notes=data.notes,
    )
    db.add(iv)
    db.commit()
    db.refresh(iv)

    return InterventionOut(
        id=iv.id, student_id=iv.student_id, student_name=student.full_name,
        faculty_id=iv.faculty_id, faculty_name=faculty.full_name,
        type=iv.type, description=iv.description, status=iv.status.value,
        deadline=iv.deadline, notes=iv.notes, created_at=iv.created_at,
        updated_at=iv.updated_at,
    )


@router.put("/{intervention_id}", response_model=InterventionOut)
def update_intervention(
    intervention_id: int,
    data: InterventionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "faculty"))
):
    iv = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not iv:
        raise HTTPException(404, "Intervention not found")

    if data.status:
        iv.status = InterventionStatus(data.status)
    if data.notes is not None:
        iv.notes = data.notes
    if data.follow_up is not None:
        iv.follow_up = data.follow_up
    if data.improvement_notes is not None:
        iv.improvement_notes = data.improvement_notes

    db.commit()
    db.refresh(iv)

    student = db.query(Student).filter(Student.id == iv.student_id).first()
    faculty = db.query(User).filter(User.id == iv.faculty_id).first()

    return InterventionOut(
        id=iv.id, student_id=iv.student_id, student_name=student.full_name if student else None,
        faculty_id=iv.faculty_id, faculty_name=faculty.full_name if faculty else None,
        type=iv.type, description=iv.description, status=iv.status.value,
        deadline=iv.deadline, notes=iv.notes, follow_up=iv.follow_up,
        improvement_notes=iv.improvement_notes,
        created_at=iv.created_at, updated_at=iv.updated_at,
    )


@router.get("/student/{student_id}", response_model=List[InterventionOut])
def get_student_interventions(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.value == "student" and current_user.student_id != student_id:
        raise HTTPException(403, "Access denied")

    interventions = db.query(Intervention).filter(
        Intervention.student_id == student_id
    ).order_by(Intervention.created_at.desc()).all()

    result = []
    for iv in interventions:
        faculty = db.query(User).filter(User.id == iv.faculty_id).first()
        result.append(InterventionOut(
            id=iv.id, student_id=iv.student_id,
            faculty_id=iv.faculty_id, faculty_name=faculty.full_name if faculty else None,
            type=iv.type, description=iv.description, status=iv.status.value,
            deadline=iv.deadline, notes=iv.notes, follow_up=iv.follow_up,
            improvement_notes=iv.improvement_notes,
            created_at=iv.created_at, updated_at=iv.updated_at,
        ))
    return result
