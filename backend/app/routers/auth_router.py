from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Student, Department, UserRole
from app.schemas import LoginRequest, TokenResponse, UserOut, StudentRegisterRequest
from app.auth import verify_password, hash_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.get("/departments")
def get_public_departments(db: Session = Depends(get_db)):
    """Public department listing for registration."""
    departments = db.query(Department).all()
    return [{"id": d.id, "name": d.name, "code": d.code} for d in departments]


@router.post("/register-student", response_model=TokenResponse)
def register_student(req: StudentRegisterRequest, db: Session = Depends(get_db)):
    """Allow students to self-register their academic portal accounts."""
    # 1. Check if user email already taken
    if db.query(User).filter(User.email == req.email.strip()).first():
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    # 2. Check if student record exists by enrollment
    enrollment = req.enrollment_no.strip()
    student = db.query(Student).filter(Student.enrollment_no == enrollment).first()

    if student:
        # Check if an account is already linked to this student
        existing_user = db.query(User).filter(User.student_id == student.id).first()
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail=f"Enrollment number {enrollment} is already linked to an existing user account."
            )
        # Update student record with any newly provided details
        student.full_name = req.full_name.strip()
        student.email = req.email.strip()
        student.department_id = req.department_id
        student.semester = req.semester
        student.admission_year = req.admission_year
        if req.phone:
            student.phone = req.phone.strip()
    else:
        # Create fresh student profile
        student = Student(
            enrollment_no=enrollment,
            full_name=req.full_name.strip(),
            email=req.email.strip(),
            department_id=req.department_id,
            semester=req.semester,
            admission_year=req.admission_year,
            phone=req.phone.strip() if req.phone else None,
            status="active"
        )
        db.add(student)
        db.flush()

    # 3. Create user account
    user = User(
        email=req.email.strip(),
        password_hash=hash_password(req.password),
        full_name=req.full_name.strip(),
        role=UserRole.STUDENT,
        department_id=student.department_id,
        student_id=student.id,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 4. Generate token for instant login
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(
        access_token=token,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
            "department_id": user.department_id,
            "student_id": user.student_id,
        }
    )


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(
        access_token=token,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
            "department_id": user.department_id,
            "student_id": user.student_id,
        }
    )


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role.value,
        "department_id": current_user.department_id,
        "student_id": current_user.student_id,
    }
