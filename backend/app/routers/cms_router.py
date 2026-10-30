"""
CMS Router — Super Admin full control over the entire system.

Provides CRUD on:
  - Users (all roles, including creating admins)
  - Departments
  - Subjects
  - Students (proxy — delegates to students_router logic but with no role restriction)
  - Site Settings
  - Announcements
  - Audit Logs (read only)
  - System configuration (risk thresholds)
  - Page Content
"""
from datetime import datetime, date as dt_date
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models import (
    User, UserRole, Student, Department, Subject,
    SiteSettings, Announcement, AuditLog, PageContent,
    RiskAssessment, AttendanceRecord, Assignment, InternalMark,
    Intervention, InterventionStatus, RiskCategory
)
from app.auth import get_current_user, require_super_admin, hash_password

router = APIRouter(prefix="/api/cms", tags=["CMS — Super Admin"])


# ─────────────────────── helpers ───────────────────────

def _audit(db: Session, user: User, action: str, entity_type: str = None,
           entity_id: int = None, details: dict = None):
    log = AuditLog(
        user_id=user.id,
        user_email=user.email,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
    )
    db.add(log)
    db.commit()


# ═══════════════════════ DASHBOARD ═══════════════════════

@router.get("/dashboard")
def cms_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    """CMS overview statistics."""
    total_users = db.query(func.count(User.id)).scalar()
    total_students = db.query(func.count(Student.id)).scalar()
    total_departments = db.query(func.count(Department.id)).scalar()
    total_subjects = db.query(func.count(Subject.id)).scalar()
    total_interventions = db.query(func.count(Intervention.id)).scalar()
    total_announcements = db.query(func.count(Announcement.id)).filter(
        Announcement.is_active == True
    ).scalar()

    users_by_role = {}
    for role in UserRole:
        count = db.query(func.count(User.id)).filter(User.role == role).scalar()
        users_by_role[role.value] = count

    recent_logs = db.query(AuditLog).order_by(desc(AuditLog.created_at)).limit(15).all()
    logs_out = [{
        "id": l.id, "user_email": l.user_email, "action": l.action,
        "entity_type": l.entity_type, "entity_id": l.entity_id,
        "details": l.details, "created_at": str(l.created_at),
    } for l in recent_logs]

    return {
        "total_users": total_users,
        "total_students": total_students,
        "total_departments": total_departments,
        "total_subjects": total_subjects,
        "total_interventions": total_interventions,
        "active_announcements": total_announcements,
        "users_by_role": users_by_role,
        "recent_audit_logs": logs_out,
    }


# ═══════════════════════ USERS ═══════════════════════

@router.get("/users")
def list_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0, limit: int = 200,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    q = db.query(User)
    if role:
        q = q.filter(User.role == UserRole(role))
    if search:
        term = f"%{search}%"
        q = q.filter((User.full_name.ilike(term)) | (User.email.ilike(term)))
    users = q.offset(skip).limit(limit).all()
    return [{
        "id": u.id, "email": u.email, "full_name": u.full_name,
        "role": u.role.value, "department_id": u.department_id,
        "student_id": u.student_id, "is_active": u.is_active,
        "created_at": str(u.created_at) if u.created_at else None,
    } for u in users]


@router.post("/users")
def create_user(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    if db.query(User).filter(User.email == data["email"]).first():
        raise HTTPException(400, "Email already exists")

    user = User(
        email=data["email"],
        password_hash=hash_password(data.get("password", "password123")),
        full_name=data["full_name"],
        role=UserRole(data["role"]),
        department_id=data.get("department_id"),
        student_id=data.get("student_id"),
        is_active=data.get("is_active", True),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    _audit(db, current_user, "create", "user", user.id, {"email": user.email, "role": user.role.value})
    return {
        "id": user.id, "email": user.email, "full_name": user.full_name,
        "role": user.role.value, "department_id": user.department_id,
        "is_active": user.is_active,
    }


@router.put("/users/{user_id}")
def update_user(
    user_id: int, data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    if "full_name" in data:
        user.full_name = data["full_name"]
    if "email" in data:
        existing = db.query(User).filter(User.email == data["email"], User.id != user_id).first()
        if existing:
            raise HTTPException(400, "Email already taken")
        user.email = data["email"]
    if "role" in data:
        user.role = UserRole(data["role"])
    if "department_id" in data:
        user.department_id = data["department_id"]
    if "is_active" in data:
        user.is_active = data["is_active"]
    if "password" in data and data["password"]:
        user.password_hash = hash_password(data["password"])

    db.commit()
    db.refresh(user)
    _audit(db, current_user, "update", "user", user.id, {"email": user.email})
    return {
        "id": user.id, "email": user.email, "full_name": user.full_name,
        "role": user.role.value, "department_id": user.department_id,
        "is_active": user.is_active,
    }


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    if user.id == current_user.id:
        raise HTTPException(400, "Cannot delete yourself")
    _audit(db, current_user, "delete", "user", user.id, {"email": user.email})
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


# ═══════════════════════ DEPARTMENTS ═══════════════════════

@router.get("/departments")
def list_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    depts = db.query(Department).all()
    result = []
    for d in depts:
        student_count = db.query(func.count(Student.id)).filter(Student.department_id == d.id).scalar()
        faculty_count = db.query(func.count(User.id)).filter(
            User.department_id == d.id,
            User.role.in_([UserRole.FACULTY, UserRole.HOD])
        ).scalar()
        subject_count = db.query(func.count(Subject.id)).filter(Subject.department_id == d.id).scalar()
        result.append({
            "id": d.id, "name": d.name, "code": d.code,
            "student_count": student_count, "faculty_count": faculty_count,
            "subject_count": subject_count,
            "created_at": str(d.created_at) if d.created_at else None,
        })
    return result


@router.post("/departments")
def create_department(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    if db.query(Department).filter(Department.code == data["code"]).first():
        raise HTTPException(400, f"Department code '{data['code']}' already exists")
    dept = Department(name=data["name"], code=data["code"])
    db.add(dept)
    db.commit()
    db.refresh(dept)
    _audit(db, current_user, "create", "department", dept.id, {"name": dept.name})
    return {"id": dept.id, "name": dept.name, "code": dept.code}


@router.put("/departments/{dept_id}")
def update_department(
    dept_id: int, data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(404, "Department not found")
    if "name" in data:
        dept.name = data["name"]
    if "code" in data:
        existing = db.query(Department).filter(Department.code == data["code"], Department.id != dept_id).first()
        if existing:
            raise HTTPException(400, "Department code already exists")
        dept.code = data["code"]
    db.commit()
    db.refresh(dept)
    _audit(db, current_user, "update", "department", dept.id, {"name": dept.name})
    return {"id": dept.id, "name": dept.name, "code": dept.code}


@router.delete("/departments/{dept_id}")
def delete_department(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(404, "Department not found")
    student_count = db.query(func.count(Student.id)).filter(Student.department_id == dept_id).scalar()
    if student_count > 0:
        raise HTTPException(400, f"Cannot delete — {student_count} students are assigned to this department")
    _audit(db, current_user, "delete", "department", dept.id, {"name": dept.name})
    db.delete(dept)
    db.commit()
    return {"message": "Department deleted"}


# ═══════════════════════ SUBJECTS ═══════════════════════

@router.get("/subjects")
def list_subjects(
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    q = db.query(Subject)
    if department_id:
        q = q.filter(Subject.department_id == department_id)
    subjects = q.all()
    result = []
    for s in subjects:
        dept = db.query(Department).filter(Department.id == s.department_id).first()
        result.append({
            "id": s.id, "name": s.name, "code": s.code,
            "department_id": s.department_id,
            "department_name": dept.name if dept else None,
            "semester": s.semester, "credits": s.credits,
        })
    return result


@router.post("/subjects")
def create_subject(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    if db.query(Subject).filter(Subject.code == data["code"]).first():
        raise HTTPException(400, f"Subject code '{data['code']}' already exists")
    dept = db.query(Department).filter(Department.id == data["department_id"]).first()
    if not dept:
        raise HTTPException(404, "Department not found")
    subj = Subject(
        name=data["name"], code=data["code"],
        department_id=data["department_id"],
        semester=data.get("semester", 1),
        credits=data.get("credits", 3),
    )
    db.add(subj)
    db.commit()
    db.refresh(subj)
    _audit(db, current_user, "create", "subject", subj.id, {"name": subj.name})
    return {"id": subj.id, "name": subj.name, "code": subj.code,
            "department_id": subj.department_id, "semester": subj.semester, "credits": subj.credits}


@router.put("/subjects/{subj_id}")
def update_subject(
    subj_id: int, data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    subj = db.query(Subject).filter(Subject.id == subj_id).first()
    if not subj:
        raise HTTPException(404, "Subject not found")
    for field in ("name", "code", "department_id", "semester", "credits"):
        if field in data:
            setattr(subj, field, data[field])
    db.commit()
    db.refresh(subj)
    _audit(db, current_user, "update", "subject", subj.id, {"name": subj.name})
    return {"id": subj.id, "name": subj.name, "code": subj.code,
            "department_id": subj.department_id, "semester": subj.semester, "credits": subj.credits}


@router.delete("/subjects/{subj_id}")
def delete_subject(
    subj_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    subj = db.query(Subject).filter(Subject.id == subj_id).first()
    if not subj:
        raise HTTPException(404, "Subject not found")
    # Remove associated records
    db.query(AttendanceRecord).filter(AttendanceRecord.subject_id == subj_id).delete()
    db.query(Assignment).filter(Assignment.subject_id == subj_id).delete()
    db.query(InternalMark).filter(InternalMark.subject_id == subj_id).delete()
    _audit(db, current_user, "delete", "subject", subj.id, {"name": subj.name})
    db.delete(subj)
    db.commit()
    return {"message": "Subject and associated records deleted"}


# ═══════════════════════ STUDENTS (full CRUD) ═══════════════════════

@router.get("/students")
def cms_list_students(
    search: Optional[str] = None,
    department_id: Optional[int] = None,
    semester: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0, limit: int = 300,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    q = db.query(Student)
    if search:
        term = f"%{search}%"
        q = q.filter((Student.full_name.ilike(term)) | (Student.enrollment_no.ilike(term)))
    if department_id:
        q = q.filter(Student.department_id == department_id)
    if semester:
        q = q.filter(Student.semester == semester)
    if status:
        q = q.filter(Student.status == status)
    students = q.offset(skip).limit(limit).all()
    result = []
    for s in students:
        dept = db.query(Department).filter(Department.id == s.department_id).first()
        latest_risk = db.query(RiskAssessment).filter(
            RiskAssessment.student_id == s.id
        ).order_by(RiskAssessment.calculated_at.desc()).first()
        result.append({
            "id": s.id, "enrollment_no": s.enrollment_no, "full_name": s.full_name,
            "email": s.email, "department_id": s.department_id,
            "department_name": dept.name if dept else None,
            "semester": s.semester, "admission_year": s.admission_year,
            "phone": s.phone, "status": s.status or "active",
            "risk_score": latest_risk.overall_risk if latest_risk else None,
            "risk_category": latest_risk.risk_category.value if latest_risk else None,
        })
    return result


@router.post("/students")
def cms_create_student(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    if db.query(Student).filter(Student.enrollment_no == data["enrollment_no"]).first():
        raise HTTPException(400, "Enrollment number already exists")
    student = Student(
        enrollment_no=data["enrollment_no"],
        full_name=data["full_name"],
        email=data["email"],
        department_id=data["department_id"],
        semester=data.get("semester", 1),
        admission_year=data.get("admission_year", 2024),
        phone=data.get("phone"),
        status=data.get("status", "active"),
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    _audit(db, current_user, "create", "student", student.id, {"name": student.full_name})
    return {"id": student.id, "enrollment_no": student.enrollment_no, "full_name": student.full_name}


@router.put("/students/{student_id}")
def cms_update_student(
    student_id: int, data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(404, "Student not found")
    for field in ("full_name", "email", "department_id", "semester", "admission_year", "phone", "status"):
        if field in data:
            setattr(student, field, data[field])
    db.commit()
    db.refresh(student)
    _audit(db, current_user, "update", "student", student.id, {"name": student.full_name})
    return {"id": student.id, "enrollment_no": student.enrollment_no, "full_name": student.full_name}


@router.delete("/students/{student_id}")
def cms_delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(404, "Student not found")
    _audit(db, current_user, "delete", "student", student.id, {"name": student.full_name})
    # Remove linked user account
    db.query(User).filter(User.student_id == student_id).delete()
    db.delete(student)
    db.commit()
    return {"message": "Student and all associated records deleted"}


# ═══════════════════════ INTERVENTIONS ═══════════════════════

@router.delete("/interventions/{intervention_id}")
def cms_delete_intervention(
    intervention_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    iv = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not iv:
        raise HTTPException(404, "Intervention not found")
    _audit(db, current_user, "delete", "intervention", iv.id)
    db.delete(iv)
    db.commit()
    return {"message": "Intervention deleted"}


# ═══════════════════════ SITE SETTINGS ═══════════════════════

@router.get("/settings")
def get_settings(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    q = db.query(SiteSettings)
    if category:
        q = q.filter(SiteSettings.category == category)
    settings = q.all()
    return [{
        "id": s.id, "key": s.key, "value": s.value,
        "value_type": s.value_type, "label": s.label,
        "category": s.category,
    } for s in settings]


@router.put("/settings")
def update_settings(
    data: List[dict],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    """Bulk update settings. Expects [{"key": "...", "value": "..."}]"""
    updated = 0
    for item in data:
        setting = db.query(SiteSettings).filter(SiteSettings.key == item["key"]).first()
        if setting:
            setting.value = str(item["value"])
            setting.updated_by = current_user.id
            updated += 1
        else:
            new_setting = SiteSettings(
                key=item["key"], value=str(item["value"]),
                value_type=item.get("value_type", "string"),
                label=item.get("label", item["key"]),
                category=item.get("category", "general"),
                updated_by=current_user.id,
            )
            db.add(new_setting)
            updated += 1
    db.commit()
    _audit(db, current_user, "update", "settings", None, {"updated_count": updated})
    return {"message": f"{updated} settings updated"}


# ═══════════════════════ ANNOUNCEMENTS ═══════════════════════

@router.get("/announcements")
def list_announcements(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    anns = db.query(Announcement).order_by(desc(Announcement.created_at)).all()
    return [{
        "id": a.id, "title": a.title, "content": a.content,
        "priority": a.priority, "target_roles": a.target_roles,
        "is_active": a.is_active,
        "starts_at": str(a.starts_at) if a.starts_at else None,
        "expires_at": str(a.expires_at) if a.expires_at else None,
        "created_at": str(a.created_at) if a.created_at else None,
    } for a in anns]


@router.post("/announcements")
def create_announcement(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    ann = Announcement(
        title=data["title"], content=data["content"],
        priority=data.get("priority", "normal"),
        target_roles=data.get("target_roles", []),
        is_active=data.get("is_active", True),
        created_by=current_user.id,
    )
    db.add(ann)
    db.commit()
    db.refresh(ann)
    _audit(db, current_user, "create", "announcement", ann.id, {"title": ann.title})
    return {"id": ann.id, "title": ann.title}


@router.put("/announcements/{ann_id}")
def update_announcement(
    ann_id: int, data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(404, "Announcement not found")
    for field in ("title", "content", "priority", "target_roles", "is_active"):
        if field in data:
            setattr(ann, field, data[field])
    db.commit()
    db.refresh(ann)
    _audit(db, current_user, "update", "announcement", ann.id, {"title": ann.title})
    return {"id": ann.id, "title": ann.title}


@router.delete("/announcements/{ann_id}")
def delete_announcement(
    ann_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(404, "Announcement not found")
    _audit(db, current_user, "delete", "announcement", ann.id, {"title": ann.title})
    db.delete(ann)
    db.commit()
    return {"message": "Announcement deleted"}


# ═══════════════════════ AUDIT LOGS ═══════════════════════

@router.get("/audit-logs")
def list_audit_logs(
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    q = db.query(AuditLog)
    if action:
        q = q.filter(AuditLog.action == action)
    if entity_type:
        q = q.filter(AuditLog.entity_type == entity_type)
    logs = q.order_by(desc(AuditLog.created_at)).offset(skip).limit(limit).all()
    total = q.count()
    return {
        "total": total,
        "logs": [{
            "id": l.id, "user_email": l.user_email, "action": l.action,
            "entity_type": l.entity_type, "entity_id": l.entity_id,
            "details": l.details, "created_at": str(l.created_at),
        } for l in logs]
    }


# ═══════════════════════ RISK THRESHOLDS ═══════════════════════

@router.get("/risk-config")
def get_risk_config(
    current_user: User = Depends(require_super_admin),
):
    from app.config import settings
    return {
        "attendance_threshold": settings.ATTENDANCE_THRESHOLD,
        "academic_threshold": settings.ACADEMIC_THRESHOLD,
        "risk_weight_attendance": settings.RISK_WEIGHT_ATTENDANCE,
        "risk_weight_assignment": settings.RISK_WEIGHT_ASSIGNMENT,
        "risk_weight_academic": settings.RISK_WEIGHT_ACADEMIC,
        "risk_low_max": settings.RISK_LOW_MAX,
        "risk_medium_max": settings.RISK_MEDIUM_MAX,
    }


@router.put("/risk-config")
def update_risk_config(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    """Store risk thresholds in site_settings so they survive restarts."""
    config_keys = {
        "attendance_threshold", "academic_threshold",
        "risk_weight_attendance", "risk_weight_assignment", "risk_weight_academic",
        "risk_low_max", "risk_medium_max",
    }
    updated = 0
    for key in config_keys:
        if key in data:
            setting = db.query(SiteSettings).filter(SiteSettings.key == f"risk.{key}").first()
            if setting:
                setting.value = str(data[key])
            else:
                db.add(SiteSettings(
                    key=f"risk.{key}", value=str(data[key]),
                    value_type="number", label=key.replace("_", " ").title(),
                    category="risk",
                ))
            updated += 1
    db.commit()
    _audit(db, current_user, "update", "risk_config", None, data)
    return {"message": f"{updated} risk config values saved", "note": "Restart server to apply changes to engine"}


# ═══════════════════════ PAGE CONTENT ═══════════════════════

@router.get("/pages")
def list_pages(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    pages = db.query(PageContent).all()
    return [{
        "id": p.id, "slug": p.slug, "title": p.title,
        "content": p.content, "meta": p.meta,
        "is_published": p.is_published,
        "created_at": str(p.created_at) if p.created_at else None,
        "updated_at": str(p.updated_at) if p.updated_at else None,
    } for p in pages]


@router.post("/pages")
def create_page(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    if db.query(PageContent).filter(PageContent.slug == data["slug"]).first():
        raise HTTPException(400, "Page slug already exists")
    page = PageContent(
        slug=data["slug"], title=data["title"],
        content=data.get("content", ""),
        meta=data.get("meta"),
        is_published=data.get("is_published", True),
        created_by=current_user.id,
    )
    db.add(page)
    db.commit()
    db.refresh(page)
    _audit(db, current_user, "create", "page", page.id, {"slug": page.slug})
    return {"id": page.id, "slug": page.slug, "title": page.title}


@router.put("/pages/{page_id}")
def update_page(
    page_id: int, data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    page = db.query(PageContent).filter(PageContent.id == page_id).first()
    if not page:
        raise HTTPException(404, "Page not found")
    for field in ("slug", "title", "content", "meta", "is_published"):
        if field in data:
            setattr(page, field, data[field])
    db.commit()
    db.refresh(page)
    _audit(db, current_user, "update", "page", page.id, {"slug": page.slug})
    return {"id": page.id, "slug": page.slug, "title": page.title}


@router.delete("/pages/{page_id}")
def delete_page(
    page_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    page = db.query(PageContent).filter(PageContent.id == page_id).first()
    if not page:
        raise HTTPException(404, "Page not found")
    _audit(db, current_user, "delete", "page", page.id, {"slug": page.slug})
    db.delete(page)
    db.commit()
    return {"message": "Page deleted"}


# ═══════════════════════ BULK OPERATIONS ═══════════════════════

@router.post("/bulk/recalculate-risks")
def bulk_recalculate(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    from app.risk_engine import assess_student_risk
    students = db.query(Student).all()
    count = 0
    for s in students:
        assess_student_risk(db, s.id)
        count += 1
    _audit(db, current_user, "bulk_recalculate", "risk", None, {"students_processed": count})
    return {"message": f"Recalculated risk for {count} students"}


@router.post("/bulk/reset-database")
def reset_database(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    """Clear all data and reseed. USE WITH CAUTION."""
    _audit(db, current_user, "reset_database", None, None)

    # Delete in order to respect FK constraints
    db.query(AuditLog).delete()
    db.query(Announcement).delete()
    db.query(SiteSettings).delete()
    db.query(PageContent).delete()
    db.query(Intervention).delete()
    db.query(RiskAssessment).delete()
    db.query(InternalMark).delete()
    db.query(Assignment).delete()
    db.query(AttendanceRecord).delete()
    db.query(User).delete()
    db.query(Student).delete()
    db.query(Subject).delete()
    db.query(Department).delete()
    db.commit()

    from app.seed import seed_database
    seed_database(db)

    return {"message": "Database reset and reseeded"}


# ═══════════════════════ PUBLIC ANNOUNCEMENTS ═══════════════════════

@router.get("/public/announcements")
def get_active_announcements(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    """Public endpoint — returns active announcements for all campus users."""
    user_role = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            from app.auth import SECRET_KEY, ALGORITHM
            from jose import jwt
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_role = payload.get("role")
        except Exception:
            pass

    q = db.query(Announcement).filter(Announcement.is_active == True)
    anns = q.order_by(desc(Announcement.created_at)).limit(20).all()
    result = []
    for a in anns:
        if user_role and a.target_roles and len(a.target_roles) > 0:
            if user_role not in a.target_roles and "all" not in a.target_roles:
                continue
        elif not user_role and a.target_roles and len(a.target_roles) > 0:
            if "student" not in a.target_roles and "all" not in a.target_roles:
                continue
        result.append({
            "id": a.id,
            "title": a.title,
            "content": a.content,
            "priority": a.priority,
            "created_at": str(a.created_at) if a.created_at else None,
        })
    return result

