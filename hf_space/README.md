---
title: Student360 - Academic Risk Intelligence
emoji: 🎓
colorFrom: yellow
colorTo: indigo
sdk: gradio
sdk_version: 6.31.0
app_file: app.py
short_description: Academic risk early-warning & recovery simulator
python_version: "3.12"
---

# 🎓 Student360 — Academic Early-Warning & Intervention Platform

Student360 is an explainable academic early-warning, recovery simulation, and intervention platform engineered for higher education institutions.

Unlike black-box neural approaches that alienate educators, Student360 operates on a **100% deterministic, mathematically auditable risk engine**:

$$\mathbf{R} = 0.35A + 0.25B + 0.40C$$

Where:
- **$A$ (Attendance Risk)**: $\max\left(0, \frac{75 - \text{Att}\%}{75} \times 100\right)$
- **$B$ (Assignment Risk)**: $100 - \text{Submission}\%$
- **$C$ (Academic Performance Risk)**: $\max\left(0, \frac{60 - \text{Academic}\%}{60} \times 100\right)$

---

## 🌟 Key Capabilities
1. **Explainable Risk Decomposition**: Transparent factor breakdown with threshold tracking.
2. **What-If Recovery Simulator**: Model target attendance & test improvements to map the minimal path out of risk.
3. **Algorithmic Trend Detection**: Flags consecutive mark declines and sudden drops ($>15\%$) without opaque heuristics.
4. **Cohort Intelligence**: Departmental and cohort analytics for early academic advisor interventions.
5. **Headless API & MCP Ready**: Gradio 6 MCP server mode enabled for autonomous multi-agent integration.

---

## 💻 Full Source Code & Architecture
- **GitHub Repository**: [Psyodrz/Student-360](https://github.com/Psyodrz/Student-360)
- **Backend Stack**: FastAPI, SQLAlchemy, SQLite/PostgreSQL, JWT Auth, Pydantic v2
- **Frontend Stack**: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React
