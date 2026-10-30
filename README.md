# Student360 — Academic Early-Warning & Intervention Platform

> **Deterministic Academic Intelligence & Comprehensive CMS for Higher Education**

Student360 is an enterprise-grade academic telemetry platform engineered to detect student drop-out and failure risk early using explainable mathematical modeling, transparent rules, and structured faculty intervention workflows.

---

## 🎨 Professional Design Language & Color Palette

Student360 strictly rejects generic AI gradient templates (such as purple/cyan SaaS blobs). Instead, it adopts an authoritative, scholastic design system:
- **Primary Foundation**: Oxford Slate & Deep Charcoal (`#0F172A`, `#1E293B`, `#334155`) — commanding, clear, institutional.
- **Academic Prestige Accent**: Oxford Gold & Burnished Amber (`#D97706`, `#B45309`, `#F59E0B`) — representing academic honor and scholarship.
- **Institutional Risk**: Crimson (`#DC2626`) for critical alerts.
- **Academic Standing**: Forest Emerald (`#16A34A`, `#059669`) for positive compliance.
- **Surfaces**: Crisp porcelain & warm paper (`#FFFFFF`, `#F8FAFC`, `#F1F5F9`).

---

## 🛡️ Role Hierarchy & Access Control

| Role | Demo Email | Demo Password | Scope of Authority |
|---|---|---|---|
| **Super Admin** | `superadmin@student360.edu` | `superadmin123` | **Full Central CMS**: Add, edit, and remove anything across the site (users, roles, departments, subjects, risk engine thresholds, broadcast announcements, site settings, audit logs, and database resets). |
| **Admin** | `admin@student360.edu` | `admin123` | Institutional dashboards, student enrollment, CSV imports, intervention tracking, analytics reports. |
| **Head of Dept (HOD)** | `hod.cs@student360.edu` | `hod123` | Department telemetry, student reviews, mentor assignments, analytics. |
| **Faculty Mentor** | `faculty1@student360.edu` | `faculty123` | Student 360 dossiers, intervention management, recovery simulations. |
| **Student** | `student1@student360.edu` | `student123` | Protected personal 360 portal (attendance ledger, coursework, internal marks, mentorship feedback). |

---

## ⚙️ Deterministic Risk Detection Engine

Student360 contains **no external AI/LLM APIs, fake chat windows, or non-deterministic predictions**. Risk scores are calculated deterministically:

$$A = \max\left(0, \frac{75 - \text{attendance}\%}{75} \times 100\right)$$
$$B = 100 - \text{assignment\_completion}\%$$
$$C = \max\left(0, \frac{60 - \text{academic}\%}{60} \times 100\right)$$
$$R = (0.35 \times A) + (0.25 \times B) + (0.40 \times C)$$

### Stratification:
- **Low Risk**: $0.0 - 29.9$
- **Medium Risk**: $30.0 - 59.9$
- **High Risk**: $60.0 - 100.0$

*Missing components are safely excluded with proportional weight redistribution.*

---

## 🏆 Key Features

### Feature 1: Algorithmic Academic Trend Detection
- Consecutive class attendance declines ($\ge 5$ absences in last 10 sessions).
- Declining internal examination marks over consecutive assessments.
- Sudden performance drops ($>15\%$ score degradation).
- Repeated missed coursework and assignments ($\ge 3$ consecutive unsubmitted).

### Feature 2: Student Recovery Simulator
- Interactive simulation sandbox allowing faculty mentors to model hypothetical attendance, assignment, and exam target outcomes.
- Live recalculation of projected composite risk scores and net point mitigation delta.
- Clearly watermarked as simulated projections before being converted into formal intervention contracts.

### Feature 3: Central CMS for Super Admin
- **Users**: Create, update role, disable/enable, reset password, delete.
- **Departments**: Add, update code/name, inspect allocations, delete.
- **Subjects**: Add course units, credits, semester schedules, delete.
- **Site Settings**: Customize institution name, academic terms, alert emails.
- **Announcements**: Publish urgent platform-wide notification banners.
- **Risk Engine Thresholds**: Live calibration of attendance thresholds (75%), pass marks (60%), and weights ($0.35, 0.25, 0.40$).
- **Audit Logs**: Comprehensive security trail of all actions with timestamps and operator identity.

---

## 🚀 Running the Application

### 1. Backend (FastAPI + SQLite + SQLAlchemy)
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API root: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

### 2. Frontend (React 19 + TypeScript + Vite + Tailwind CSS + Recharts)
```bash
cd frontend
npm install
npm run dev -- --port 5173
```
- Web Application: `http://localhost:5173`

---

## 🧪 Synthetic Dataset Generator
The database is automatically pre-seeded with reproducible, internally consistent records:
- **150 Students** across varied behavioral profiles (consistent, irregular attendance, incomplete assignments, declining marks, post-intervention improvement, high risk).
- **10 Faculty Members** & HODs across 5 engineering departments (CS, EC, ME, CE, MC).
- **32 Accredited Subjects** spanning semesters 3 through 6.
- Over **18,000 Attendance Records**, **3,400 Coursework Assignments**, and **1,200 Internal Examination Marks**.

