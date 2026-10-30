from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import date, datetime


# ── Auth ──
class LoginRequest(BaseModel):
    email: str
    password: str


class StudentRegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    enrollment_no: str
    department_id: int
    semester: int = Field(ge=1, le=8)
    admission_year: int
    phone: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ── Department ──
class DepartmentOut(BaseModel):
    id: int
    name: str
    code: str

    class Config:
        from_attributes = True


# ── Student ──
class StudentCreate(BaseModel):
    enrollment_no: str
    full_name: str
    email: str
    department_id: int
    semester: int = Field(ge=1, le=8)
    admission_year: int
    phone: Optional[str] = None


class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    department_id: Optional[int] = None
    semester: Optional[int] = None
    phone: Optional[str] = None
    status: Optional[str] = None


class StudentOut(BaseModel):
    id: int
    enrollment_no: str
    full_name: str
    email: str
    department_id: int
    department_name: Optional[str] = None
    semester: int
    admission_year: int
    phone: Optional[str] = None
    status: str
    risk_score: Optional[float] = None
    risk_category: Optional[str] = None

    class Config:
        from_attributes = True


# ── Academic Records ──
class AttendanceCreate(BaseModel):
    student_id: int
    subject_id: int
    date: date
    status: str  # present, absent, late
    semester: int


class AssignmentCreate(BaseModel):
    student_id: int
    subject_id: int
    title: str
    due_date: date
    submitted: bool = False
    score: Optional[float] = None
    max_score: float = 100.0
    semester: int


class MarksCreate(BaseModel):
    student_id: int
    subject_id: int
    exam_type: str
    marks_obtained: float
    max_marks: float
    semester: int


class AttendanceOut(BaseModel):
    id: int
    student_id: int
    subject_id: int
    date: date
    status: str
    semester: int

    class Config:
        from_attributes = True


class AssignmentOut(BaseModel):
    id: int
    student_id: int
    subject_id: int
    title: str
    due_date: date
    submitted: bool
    score: Optional[float]
    max_score: float
    semester: int

    class Config:
        from_attributes = True


class MarksOut(BaseModel):
    id: int
    student_id: int
    subject_id: int
    exam_type: str
    marks_obtained: float
    max_marks: float
    semester: int

    class Config:
        from_attributes = True


class SubjectOut(BaseModel):
    id: int
    name: str
    code: str
    department_id: int
    semester: int
    credits: int

    class Config:
        from_attributes = True


# ── Risk ──
class RiskResponse(BaseModel):
    student_id: int
    student_name: Optional[str] = None
    attendance_pct: Optional[float] = None
    assignment_completion_pct: Optional[float] = None
    academic_pct: Optional[float] = None
    attendance_risk: Optional[float] = None
    assignment_risk: Optional[float] = None
    academic_risk: Optional[float] = None
    overall_risk: float
    risk_category: str
    factors: Optional[List[dict]] = None
    previous_risk: Optional[float] = None
    risk_trend: Optional[str] = None
    calculated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SimulationRequest(BaseModel):
    student_id: int
    attendance_pct: Optional[float] = None
    assignment_completion_pct: Optional[float] = None
    academic_pct: Optional[float] = None


class TrendAlert(BaseModel):
    type: str
    severity: str
    message: str
    data: Optional[dict] = None


class TrendResponse(BaseModel):
    student_id: int
    alerts: List[TrendAlert]
    attendance_trend: Optional[List[dict]] = None
    marks_trend: Optional[List[dict]] = None


# ── Intervention ──
class InterventionCreate(BaseModel):
    student_id: int
    faculty_id: int
    type: str
    description: str
    deadline: Optional[date] = None
    notes: Optional[str] = None


class InterventionUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    follow_up: Optional[str] = None
    improvement_notes: Optional[str] = None


class InterventionOut(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    faculty_id: int
    faculty_name: Optional[str] = None
    type: str
    description: str
    status: str
    deadline: Optional[date] = None
    notes: Optional[str] = None
    follow_up: Optional[str] = None
    improvement_notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Analytics ──
class DashboardStats(BaseModel):
    total_students: int
    total_faculty: int
    high_risk: int
    medium_risk: int
    low_risk: int
    departments: List[dict]
    risk_distribution: List[dict]
    attendance_trends: List[dict]
    recent_alerts: List[dict]


# ── CSV Import ──
class CSVImportResponse(BaseModel):
    success: bool
    records_imported: int
    errors: List[str]


# ── User ──
class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    department_id: Optional[int] = None
    student_id: Optional[int] = None

    class Config:
        from_attributes = True
