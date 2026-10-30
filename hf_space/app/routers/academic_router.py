from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from app.database import get_db
from app.models import (
    AttendanceRecord, Assignment, InternalMark, Subject, Student,
    Department, AttendanceStatus, User
)
from app.schemas import (
    AttendanceCreate, AssignmentCreate, MarksCreate,
    AttendanceOut, AssignmentOut, MarksOut, SubjectOut, CSVImportResponse
)
from app.auth import get_current_user, require_role
import csv
import io

router = APIRouter(prefix="/api/academic", tags=["Academic Records"])


@router.get("/subjects", response_model=List[SubjectOut])
def list_subjects(
    department_id: Optional[int] = None,
    semester: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Subject)
    if department_id:
        q = q.filter(Subject.department_id == department_id)
    if semester:
        q = q.filter(Subject.semester == semester)
    return q.all()


@router.post("/attendance", response_model=AttendanceOut)
def add_attendance(
    data: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "faculty"))
):
    record = AttendanceRecord(**data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/attendance/bulk")
def add_attendance_bulk(
    records: List[AttendanceCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "faculty"))
):
    created = []
    for data in records:
        record = AttendanceRecord(**data.model_dump())
        db.add(record)
        created.append(record)
    db.commit()
    return {"message": f"{len(created)} attendance records added"}


@router.post("/assignments", response_model=AssignmentOut)
def add_assignment(
    data: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "faculty"))
):
    record = Assignment(**data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/marks", response_model=MarksOut)
def add_marks(
    data: MarksCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "faculty"))
):
    record = InternalMark(**data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/student/{student_id}/attendance")
def get_student_attendance(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.value == "student" and current_user.student_id != student_id:
        raise HTTPException(403, "Access denied")

    records = db.query(AttendanceRecord).filter(
        AttendanceRecord.student_id == student_id
    ).order_by(AttendanceRecord.date.desc()).all()

    # Build subject-wise summary
    subject_stats = {}
    for r in records:
        sid = r.subject_id
        if sid not in subject_stats:
            subj = db.query(Subject).filter(Subject.id == sid).first()
            subject_stats[sid] = {
                "subject_id": sid,
                "subject_name": subj.name if subj else "Unknown",
                "subject_code": subj.code if subj else "",
                "total": 0, "present": 0, "absent": 0, "late": 0
            }
        subject_stats[sid]["total"] += 1
        if r.status == AttendanceStatus.PRESENT:
            subject_stats[sid]["present"] += 1
        elif r.status == AttendanceStatus.ABSENT:
            subject_stats[sid]["absent"] += 1
        elif r.status == AttendanceStatus.LATE:
            subject_stats[sid]["late"] += 1

    for sid in subject_stats:
        s = subject_stats[sid]
        s["percentage"] = round(((s["present"] + s["late"]) / s["total"]) * 100, 1) if s["total"] > 0 else 0

    return {
        "records": [{"id": r.id, "subject_id": r.subject_id, "date": str(r.date), "status": r.status.value} for r in records[:100]],
        "subject_summary": list(subject_stats.values()),
        "overall": {
            "total": len(records),
            "present": sum(1 for r in records if r.status in (AttendanceStatus.PRESENT, AttendanceStatus.LATE)),
            "percentage": round(sum(1 for r in records if r.status in (AttendanceStatus.PRESENT, AttendanceStatus.LATE)) / len(records) * 100, 1) if records else 0
        }
    }


@router.get("/student/{student_id}/assignments")
def get_student_assignments(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.value == "student" and current_user.student_id != student_id:
        raise HTTPException(403, "Access denied")

    assignments = db.query(Assignment).filter(
        Assignment.student_id == student_id
    ).order_by(Assignment.due_date.desc()).all()

    result = []
    for a in assignments:
        subj = db.query(Subject).filter(Subject.id == a.subject_id).first()
        result.append({
            "id": a.id, "subject": subj.name if subj else "Unknown",
            "subject_code": subj.code if subj else "",
            "title": a.title, "due_date": str(a.due_date),
            "submitted": a.submitted, "score": a.score, "max_score": a.max_score,
        })

    total = len(assignments)
    submitted = sum(1 for a in assignments if a.submitted)

    return {
        "assignments": result,
        "summary": {
            "total": total,
            "submitted": submitted,
            "completion_pct": round(submitted / total * 100, 1) if total > 0 else 0
        }
    }


@router.get("/student/{student_id}/marks")
def get_student_marks(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.value == "student" and current_user.student_id != student_id:
        raise HTTPException(403, "Access denied")

    marks = db.query(InternalMark).filter(
        InternalMark.student_id == student_id
    ).all()

    result = []
    for m in marks:
        subj = db.query(Subject).filter(Subject.id == m.subject_id).first()
        result.append({
            "id": m.id, "subject": subj.name if subj else "Unknown",
            "subject_code": subj.code if subj else "",
            "exam_type": m.exam_type,
            "marks_obtained": m.marks_obtained, "max_marks": m.max_marks,
            "percentage": round(m.marks_obtained / m.max_marks * 100, 1) if m.max_marks > 0 else 0,
        })

    total_obt = sum(m.marks_obtained for m in marks)
    total_max = sum(m.max_marks for m in marks)

    return {
        "marks": result,
        "summary": {
            "total_obtained": total_obt,
            "total_max": total_max,
            "overall_pct": round(total_obt / total_max * 100, 1) if total_max > 0 else 0
        }
    }


@router.post("/import/csv", response_model=CSVImportResponse)
async def import_csv(
    file: UploadFile = File(...),
    record_type: str = "attendance",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "faculty"))
):
    """Import CSV data. Supports: attendance, assignments, marks."""
    errors = []
    imported = 0

    try:
        content = await file.read()
        decoded = content.decode("utf-8")
        reader = csv.DictReader(io.StringIO(decoded))
        rows = list(reader)
    except Exception as e:
        return CSVImportResponse(success=False, records_imported=0, errors=[f"Failed to parse CSV: {str(e)}"])

    for i, row in enumerate(rows, start=2):
        try:
            if record_type == "attendance":
                # Required: enrollment_no, subject_code, date, status, semester
                student = db.query(Student).filter(Student.enrollment_no == row.get("enrollment_no", "").strip()).first()
                subject = db.query(Subject).filter(Subject.code == row.get("subject_code", "").strip()).first()
                if not student:
                    errors.append(f"Row {i}: Student not found: {row.get('enrollment_no')}")
                    continue
                if not subject:
                    errors.append(f"Row {i}: Subject not found: {row.get('subject_code')}")
                    continue
                from datetime import date as dt_date
                record = AttendanceRecord(
                    student_id=student.id, subject_id=subject.id,
                    date=dt_date.fromisoformat(row["date"].strip()),
                    status=AttendanceStatus(row["status"].strip().lower()),
                    semester=int(row.get("semester", student.semester))
                )
                db.add(record)
                imported += 1

            elif record_type == "assignments":
                student = db.query(Student).filter(Student.enrollment_no == row.get("enrollment_no", "").strip()).first()
                subject = db.query(Subject).filter(Subject.code == row.get("subject_code", "").strip()).first()
                if not student or not subject:
                    errors.append(f"Row {i}: Student or subject not found")
                    continue
                from datetime import date as dt_date
                record = Assignment(
                    student_id=student.id, subject_id=subject.id,
                    title=row.get("title", "Untitled"),
                    due_date=dt_date.fromisoformat(row["due_date"].strip()),
                    submitted=row.get("submitted", "").strip().lower() in ("true", "1", "yes"),
                    score=float(row["score"]) if row.get("score") else None,
                    max_score=float(row.get("max_score", 100)),
                    semester=int(row.get("semester", student.semester))
                )
                db.add(record)
                imported += 1

            elif record_type == "marks":
                student = db.query(Student).filter(Student.enrollment_no == row.get("enrollment_no", "").strip()).first()
                subject = db.query(Subject).filter(Subject.code == row.get("subject_code", "").strip()).first()
                if not student or not subject:
                    errors.append(f"Row {i}: Student or subject not found")
                    continue
                record = InternalMark(
                    student_id=student.id, subject_id=subject.id,
                    exam_type=row.get("exam_type", "Internal"),
                    marks_obtained=float(row["marks_obtained"]),
                    max_marks=float(row.get("max_marks", 100)),
                    semester=int(row.get("semester", student.semester))
                )
                db.add(record)
                imported += 1
            else:
                return CSVImportResponse(success=False, records_imported=0, errors=[f"Unknown record type: {record_type}"])

        except Exception as e:
            errors.append(f"Row {i}: {str(e)}")

    if imported > 0:
        db.commit()

    return CSVImportResponse(
        success=len(errors) == 0,
        records_imported=imported,
        errors=errors[:20]  # Limit error messages
    )
