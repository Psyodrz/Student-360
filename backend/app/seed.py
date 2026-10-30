"""
Student360 — Synthetic Data Generator

Generates 150 students, 10 faculty, 5 departments with realistic,
internally consistent academic records.

Safe to run repeatedly — checks for existing data.
"""
import random
import datetime
from sqlalchemy.orm import Session
from app.models import (
    Department, User, UserRole, Student, Subject,
    AttendanceRecord, AttendanceStatus, Assignment, InternalMark,
    Intervention, InterventionStatus, RiskAssessment, RiskCategory,
    SiteSettings, Announcement, PageContent, AuditLog
)
from app.auth import hash_password
from app.risk_engine import assess_student_risk

random.seed(42)  # Reproducible

DEPARTMENTS = [
    ("Computer Science", "CS"),
    ("Electronics & Communication", "EC"),
    ("Mechanical Engineering", "ME"),
    ("Civil Engineering", "CE"),
    ("Mathematics & Computing", "MC"),
]

SUBJECTS = {
    "CS": [
        ("Data Structures", "CS201", 3, 3), ("Algorithms", "CS301", 4, 3),
        ("Database Systems", "CS302", 4, 3), ("Operating Systems", "CS303", 4, 4),
        ("Computer Networks", "CS401", 5, 3), ("Software Engineering", "CS402", 5, 3),
        ("Machine Learning", "CS501", 6, 4), ("Web Technologies", "CS502", 6, 3),
    ],
    "EC": [
        ("Circuit Theory", "EC201", 3, 3), ("Signals & Systems", "EC301", 4, 4),
        ("Digital Electronics", "EC302", 4, 3), ("Microprocessors", "EC303", 4, 3),
        ("Communication Systems", "EC401", 5, 3), ("VLSI Design", "EC402", 5, 4),
    ],
    "ME": [
        ("Thermodynamics", "ME201", 3, 4), ("Fluid Mechanics", "ME301", 4, 3),
        ("Machine Design", "ME302", 4, 4), ("Manufacturing", "ME401", 5, 3),
        ("Heat Transfer", "ME402", 5, 3), ("CAD/CAM", "ME501", 6, 3),
    ],
    "CE": [
        ("Structural Analysis", "CE201", 3, 4), ("Surveying", "CE301", 4, 3),
        ("Concrete Technology", "CE302", 4, 3), ("Geotechnical Eng.", "CE401", 5, 4),
        ("Transportation Eng.", "CE402", 5, 3), ("Environmental Eng.", "CE501", 6, 3),
    ],
    "MC": [
        ("Linear Algebra", "MC201", 3, 4), ("Probability & Statistics", "MC301", 4, 3),
        ("Numerical Methods", "MC302", 4, 3), ("Discrete Mathematics", "MC401", 5, 3),
        ("Optimization", "MC402", 5, 4), ("Data Science", "MC501", 6, 3),
    ],
}

FIRST_NAMES = [
    "Aarav", "Aditi", "Aditya", "Ananya", "Arjun", "Ayesha", "Chandra", "Deepika",
    "Divya", "Gaurav", "Harsh", "Ishaan", "Jaya", "Karan", "Kavya", "Lakshmi",
    "Manish", "Meera", "Nandini", "Nikhil", "Pooja", "Priya", "Rahul", "Ravi",
    "Rohan", "Sakshi", "Shreya", "Sneha", "Suresh", "Tanvi", "Varun", "Vikas",
    "Vini", "Yash", "Zara", "Ankita", "Bhavya", "Chirag", "Diya", "Esha",
    "Farhan", "Gauri", "Himanshu", "Isha", "Jai", "Komal", "Lalit", "Mohit",
    "Neha", "Om",
]

LAST_NAMES = [
    "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Agarwal", "Reddy", "Nair",
    "Verma", "Joshi", "Mehta", "Shah", "Rao", "Das", "Iyer", "Pillai",
    "Chauhan", "Bhatia", "Malik", "Saxena", "Kapoor", "Mishra", "Tiwari", "Pandey",
    "Srivastava", "Kulkarni", "Desai", "Patil", "Ghosh", "Banerjee",
]

# Student profiles — determines behavior
PROFILES = [
    ("consistent", 35),     # Good performers
    ("irregular_att", 25),  # Irregular attendance
    ("low_assignments", 20),# Poor assignment completion
    ("declining", 15),      # Declining marks over time
    ("improving", 10),      # Improving after intervention
    ("at_risk", 20),        # Multiple risk factors
    ("excellent", 25),      # Top performers
]


def _gen_profile():
    """Weighted random profile selection."""
    types = [p[0] for p in PROFILES]
    weights = [p[1] for p in PROFILES]
    return random.choices(types, weights=weights, k=1)[0]


def seed_database(db: Session):
    """Seed the database with synthetic data. Idempotent."""
    # Check if already seeded
    if db.query(Department).count() > 0:
        print("Database already seeded. Skipping.")
        return

    print("Seeding database...")

    # 1. Departments
    dept_objs = {}
    for name, code in DEPARTMENTS:
        dept = Department(name=name, code=code)
        db.add(dept)
        db.flush()
        dept_objs[code] = dept
    db.commit()
    print(f"  Created {len(dept_objs)} departments")

    # 2. Subjects
    subj_objs = {}
    for dept_code, subjects in SUBJECTS.items():
        for name, code, sem, credits in subjects:
            subj = Subject(
                name=name, code=code,
                department_id=dept_objs[dept_code].id,
                semester=sem, credits=credits
            )
            db.add(subj)
            db.flush()
            subj_objs[code] = subj
    db.commit()
    print(f"  Created {len(subj_objs)} subjects")

    # 3. Super Admin & Admin users
    super_admin = User(
        email="superadmin@student360.edu",
        password_hash=hash_password("superadmin123"),
        full_name="Chief Academic Officer (Super Admin)",
        role=UserRole.SUPER_ADMIN,
    )
    db.add(super_admin)

    admin = User(
        email="admin@student360.edu",
        password_hash=hash_password("admin123"),
        full_name="Dr. Admin User",
        role=UserRole.ADMIN,
    )
    db.add(admin)
    db.flush()

    # 4. Faculty & HOD users
    faculty_names = [
        ("Dr. Rajesh Kumar", "CS"), ("Dr. Priya Sharma", "EC"),
        ("Dr. Suresh Patel", "ME"), ("Dr. Anita Gupta", "CE"),
        ("Dr. Vikram Singh", "MC"), ("Prof. Neeta Joshi", "CS"),
        ("Prof. Arun Mehta", "EC"), ("Prof. Kavita Rao", "ME"),
        ("Prof. Ramesh Das", "CE"), ("Prof. Sanjay Iyer", "MC"),
    ]

    faculty_objs = []
    for i, (name, dept_code) in enumerate(faculty_names):
        is_hod = i < 5
        email_prefix = "hod" if is_hod else "faculty"
        email_suffix = dept_code.lower() if is_hod else str(i - 4)
        user = User(
            email=f"{email_prefix}.{email_suffix}@student360.edu" if is_hod else f"faculty{i-4}@student360.edu",
            password_hash=hash_password("hod123" if is_hod else "faculty123"),
            full_name=name,
            role=UserRole.HOD if is_hod else UserRole.FACULTY,
            department_id=dept_objs[dept_code].id,
        )
        db.add(user)
        db.flush()
        faculty_objs.append(user)
    db.commit()
    print(f"  Created 1 admin + {len(faculty_objs)} faculty/HOD users")

    # 5. Students
    students = []
    used_names = set()
    dept_codes = list(dept_objs.keys())

    for i in range(150):
        while True:
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            full = f"{first} {last}"
            if full not in used_names:
                used_names.add(full)
                break

        dept_code = dept_codes[i % len(dept_codes)]
        semester = random.choice([3, 4, 5, 6])
        year = 2024 - (semester // 2)

        student = Student(
            enrollment_no=f"{dept_code}{year % 100}{str(i+1).zfill(3)}",
            full_name=full,
            email=f"{first.lower()}.{last.lower()}{i+1}@student360.edu",
            department_id=dept_objs[dept_code].id,
            semester=semester,
            admission_year=year,
            phone=f"+91 {random.randint(70000, 99999)} {random.randint(10000, 99999)}",
            status="active",
        )
        db.add(student)
        db.flush()

        # Create user account for first few students
        if i < 5:
            stu_user = User(
                email=f"student{i+1}@student360.edu",
                password_hash=hash_password("student123"),
                full_name=full,
                role=UserRole.STUDENT,
                department_id=dept_objs[dept_code].id,
                student_id=student.id,
            )
            db.add(stu_user)

        students.append((student, _gen_profile(), dept_code))

    db.commit()
    print(f"  Created {len(students)} students")

    # 6. Generate academic records per student
    today = datetime.date.today()
    total_att = 0
    total_asg = 0
    total_marks = 0

    for student, profile, dept_code in students:
        # Get subjects for this department and semester
        dept_subjects = [
            s for code, s in subj_objs.items()
            if code.startswith(dept_code) and s.semester <= student.semester
        ]
        if not dept_subjects:
            continue

        # Select 3-5 subjects for this student
        student_subjects = random.sample(dept_subjects, min(len(dept_subjects), random.randint(3, 5)))

        # --- Attendance ---
        for subj in student_subjects:
            num_classes = random.randint(35, 50)
            for j in range(num_classes):
                class_date = today - datetime.timedelta(days=random.randint(1, 120))

                if profile == "excellent":
                    status = random.choices(
                        [AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.ABSENT],
                        weights=[88, 7, 5], k=1
                    )[0]
                elif profile == "consistent":
                    status = random.choices(
                        [AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.ABSENT],
                        weights=[78, 10, 12], k=1
                    )[0]
                elif profile == "irregular_att":
                    status = random.choices(
                        [AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.ABSENT],
                        weights=[45, 10, 45], k=1
                    )[0]
                elif profile == "at_risk":
                    status = random.choices(
                        [AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.ABSENT],
                        weights=[40, 8, 52], k=1
                    )[0]
                elif profile == "improving":
                    # Better attendance in recent classes
                    if j > num_classes * 0.6:
                        status = random.choices(
                            [AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.ABSENT],
                            weights=[75, 10, 15], k=1
                        )[0]
                    else:
                        status = random.choices(
                            [AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.ABSENT],
                            weights=[45, 10, 45], k=1
                        )[0]
                else:
                    status = random.choices(
                        [AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.ABSENT],
                        weights=[65, 10, 25], k=1
                    )[0]

                att = AttendanceRecord(
                    student_id=student.id, subject_id=subj.id,
                    date=class_date, status=status, semester=student.semester
                )
                db.add(att)
                total_att += 1

        # --- Assignments ---
        for subj in student_subjects:
            num_assignments = random.randint(6, 10)
            for j in range(num_assignments):
                due = today - datetime.timedelta(days=random.randint(1, 100))

                if profile == "excellent":
                    submitted = random.random() < 0.95
                    score = random.uniform(78, 100) if submitted else None
                elif profile == "consistent":
                    submitted = random.random() < 0.85
                    score = random.uniform(60, 90) if submitted else None
                elif profile == "low_assignments":
                    submitted = random.random() < 0.40
                    score = random.uniform(35, 70) if submitted else None
                elif profile == "at_risk":
                    submitted = random.random() < 0.35
                    score = random.uniform(25, 55) if submitted else None
                elif profile == "improving":
                    if j > num_assignments * 0.5:
                        submitted = random.random() < 0.80
                        score = random.uniform(55, 85) if submitted else None
                    else:
                        submitted = random.random() < 0.40
                        score = random.uniform(30, 55) if submitted else None
                else:
                    submitted = random.random() < 0.70
                    score = random.uniform(50, 85) if submitted else None

                asg = Assignment(
                    student_id=student.id, subject_id=subj.id,
                    title=f"Assignment {j+1} - {subj.name}",
                    due_date=due, submitted=submitted,
                    score=round(score, 1) if score else None,
                    max_score=100.0, semester=student.semester
                )
                db.add(asg)
                total_asg += 1

        # --- Internal Marks ---
        exam_types = ["Internal 1", "Internal 2", "Mid-Semester"]
        for subj in student_subjects:
            for k, exam in enumerate(exam_types):
                max_marks = 30.0 if "Internal" in exam else 50.0

                if profile == "excellent":
                    pct = random.uniform(0.75, 0.98)
                elif profile == "consistent":
                    pct = random.uniform(0.55, 0.85)
                elif profile == "declining":
                    # Marks decrease with each exam
                    base = random.uniform(0.65, 0.85)
                    pct = max(0.15, base - k * random.uniform(0.10, 0.20))
                elif profile == "at_risk":
                    pct = random.uniform(0.20, 0.50)
                elif profile == "improving":
                    base = random.uniform(0.30, 0.50)
                    pct = min(0.95, base + k * random.uniform(0.10, 0.20))
                else:
                    pct = random.uniform(0.40, 0.75)

                marks = InternalMark(
                    student_id=student.id, subject_id=subj.id,
                    exam_type=exam, marks_obtained=round(max_marks * pct, 1),
                    max_marks=max_marks, semester=student.semester
                )
                db.add(marks)
                total_marks += 1

    db.commit()
    print(f"  Created {total_att} attendance records, {total_asg} assignments, {total_marks} internal marks")

    # 7. Calculate risk assessments for all students
    print("  Calculating risk assessments...")
    for student, profile, dept_code in students:
        assess_student_risk(db, student.id)

    # 8. Generate interventions for high-risk students
    high_risk_students = db.query(RiskAssessment).filter(
        RiskAssessment.risk_category == RiskCategory.HIGH
    ).all()

    seen_students = set()
    intervention_count = 0
    intervention_types = ["counseling", "academic_support", "attendance_warning", "parent_meeting", "peer_tutoring"]

    for ra in high_risk_students:
        if ra.student_id in seen_students:
            continue
        seen_students.add(ra.student_id)

        faculty = random.choice(faculty_objs)
        status_choice = random.choice([
            InterventionStatus.PENDING, InterventionStatus.IN_PROGRESS,
            InterventionStatus.COMPLETED, InterventionStatus.EVALUATED
        ])

        iv = Intervention(
            student_id=ra.student_id,
            faculty_id=faculty.id,
            type=random.choice(intervention_types),
            description=f"Intervention for student with risk score {ra.overall_risk}. "
                        f"Focus on {'attendance' if ra.attendance_risk and ra.attendance_risk > 30 else 'academic performance'}.",
            status=status_choice,
            deadline=today + datetime.timedelta(days=random.randint(7, 30)),
            notes="Initial assessment completed." if status_choice != InterventionStatus.PENDING else None,
            follow_up="Schedule follow-up meeting." if status_choice in (InterventionStatus.COMPLETED, InterventionStatus.EVALUATED) else None,
            improvement_notes="Student showing gradual improvement." if status_choice == InterventionStatus.EVALUATED else None,
        )
        db.add(iv)
        intervention_count += 1

    db.commit()
    print(f"  Created {intervention_count} interventions")

    # 9. Seed Default CMS Data
    print("  Seeding default CMS site settings, announcements & policies...")
    initial_settings = [
        {"key": "institution_name", "value": "Apex Institute of Higher Technology", "value_type": "string", "label": "Institution Name", "category": "branding"},
        {"key": "academic_year", "value": "2024-2025", "value_type": "string", "label": "Current Academic Year", "category": "general"},
        {"key": "current_term", "value": "Even Semester", "value_type": "string", "label": "Current Academic Term", "category": "general"},
        {"key": "alert_email_notification", "value": "true", "value_type": "boolean", "label": "Enable Automated Risk Notifications", "category": "notifications"},
        {"key": "min_attendance_threshold", "value": "75.0", "value_type": "number", "label": "Statutory Minimum Attendance (%)", "category": "risk"},
        {"key": "dean_contact_email", "value": "academics@student360.edu", "value_type": "string", "label": "Academic Dean Support Email", "category": "general"},
    ]
    for s in initial_settings:
        db.add(SiteSettings(**s, updated_by=super_admin.id))

    announcements = [
        Announcement(
            title="Mid-Term Academic Review & Early Intervention Mandate",
            content="Faculty mentors are requested to review flagged student interventions for Mid-Term before the end of the current cycle. Strict attendance compliance is enforced across all engineering departments.",
            priority="urgent",
            target_roles=[],
            is_active=True,
            created_by=super_admin.id,
        ),
        Announcement(
            title="Internal Assessment Remedial Schedule Released",
            content="Remedial tutoring sessions for students scoring below threshold marks will be conducted every Wednesday in Block B. Check your student portal for assigned sessions.",
            priority="normal",
            target_roles=["student", "faculty"],
            is_active=True,
            created_by=admin.id,
        ),
    ]
    for a in announcements:
        db.add(a)

    pages = [
        PageContent(
            slug="academic-policy",
            title="Institutional Academic Standing & Intervention Policy",
            content="Students are expected to maintain an attendance of not less than 75% in each enrolled subject. Students falling within the high-risk bracket are assigned dedicated faculty mentors under the Early-Warning Framework.",
            meta={"category": "governance", "version": "2.4"},
            is_published=True,
            created_by=super_admin.id,
        ),
        PageContent(
            slug="mentor-guidelines",
            title="Faculty Mentorship & Intervention Protocols",
            content="Mentors must document all student sessions within 48 hours of meeting. Interventions transition from 'Pending' through 'In Progress' to 'Completed' upon verified grade or attendance improvement.",
            meta={"category": "guidelines", "version": "1.8"},
            is_published=True,
            created_by=super_admin.id,
        )
    ]
    for p in pages:
        db.add(p)

    db.commit()
    print("Seeding complete!")
