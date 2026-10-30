"""
Student360 — Academic Early-Warning & Intervention Intelligence Platform
Hugging Face Space Interactive Demo
"""

try:
    import spaces
except ImportError:
    class spaces:
        @staticmethod
        def GPU(fn=None, **kwargs):
            if fn is None:
                return lambda f: f
            return fn

import gradio as gr
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import numpy as np
from typing import Tuple, List, Dict, Any

# ==========================================
# CONSTANTS & DETERMINISTIC RISK CONFIG
# ==========================================
W_ATT = 0.35
W_ASG = 0.25
W_ACA = 0.40

ATT_THRESHOLD = 75.0
ACA_THRESHOLD = 60.0

RISK_LOW_MAX = 35.0
RISK_MEDIUM_MAX = 65.0

# Pre-seeded university cohort for the explorer
SAMPLE_STUDENTS = [
    {
        "id": 1,
        "name": "Alex Johnson",
        "roll_no": "CS-2023-014",
        "dept": "Computer Science",
        "attendance": 54.0,
        "assignments": 45.0,
        "academics": 48.0,
        "exam_history": [74, 68, 61, 48],
        "absent_last_10": 5,
        "missed_assignments": 4,
        "intervention": "Academic Counseling & Attendance Monitoring Contract",
    },
    {
        "id": 2,
        "name": "Priya Sharma",
        "roll_no": "DS-2023-088",
        "dept": "Data Science",
        "attendance": 68.0,
        "assignments": 80.0,
        "academics": 55.0,
        "exam_history": [64, 62, 58, 55],
        "absent_last_10": 3,
        "missed_assignments": 1,
        "intervention": "Peer Tutoring in Linear Algebra",
    },
    {
        "id": 3,
        "name": "Marcus Vance",
        "roll_no": "EE-2022-031",
        "dept": "Electrical Eng",
        "attendance": 92.0,
        "assignments": 95.0,
        "academics": 88.0,
        "exam_history": [82, 85, 87, 88],
        "absent_last_10": 0,
        "missed_assignments": 0,
        "intervention": "Nominated for Departmental Peer Mentor",
    },
    {
        "id": 4,
        "name": "Liam O'Connor",
        "roll_no": "ME-2023-102",
        "dept": "Mechanical Eng",
        "attendance": 62.0,
        "assignments": 50.0,
        "academics": 42.0,
        "exam_history": [72, 65, 54, 42],
        "absent_last_10": 4,
        "missed_assignments": 3,
        "intervention": "Faculty Remedial Sessions in Thermodynamics",
    },
    {
        "id": 5,
        "name": "Sofia Patel",
        "roll_no": "AI-2024-009",
        "dept": "Artificial Intelligence",
        "attendance": 84.0,
        "assignments": 90.0,
        "academics": 76.0,
        "exam_history": [70, 72, 75, 76],
        "absent_last_10": 1,
        "missed_assignments": 0,
        "intervention": "Standard Mentorship Check-in",
    },
    {
        "id": 6,
        "name": "David Kim",
        "roll_no": "CS-2023-042",
        "dept": "Computer Science",
        "attendance": 48.0,
        "assignments": 60.0,
        "academics": 38.0,
        "exam_history": [60, 52, 45, 38],
        "absent_last_10": 6,
        "missed_assignments": 5,
        "intervention": "Mandatory Parent-Advisor Conference & Study Plan",
    },
]

# ==========================================
# CORE ALGORITHMIC ENGINE
# ==========================================
@spaces.GPU
def calculate_risk(
    attendance_pct: float,
    assignment_pct: float,
    academic_pct: float
) -> Tuple[float, str, float, float, float, List[Dict[str, Any]]]:
    """
    Deterministic academic risk score computation.
    
    Formula:
        A = max(0, ((75 - Attendance) / 75) * 100)
        B = 100 - Assignments
        C = max(0, ((60 - Academic) / 60) * 100)
        R = 0.35*A + 0.25*B + 0.40*C
    """
    # Component A (Attendance Deficit)
    A = max(0.0, ((ATT_THRESHOLD - attendance_pct) / ATT_THRESHOLD) * 100) if attendance_pct < ATT_THRESHOLD else 0.0
    
    # Component B (Assignment Deficit)
    B = max(0.0, 100.0 - assignment_pct)
    
    # Component C (Academic Deficit)
    C = max(0.0, ((ACA_THRESHOLD - academic_pct) / ACA_THRESHOLD) * 100) if academic_pct < ACA_THRESHOLD else 0.0
    
    # Overall Weighted Risk
    R = round(W_ATT * A + W_ASG * B + W_ACA * C, 2)
    R = max(0.0, min(100.0, R))
    
    if R < RISK_LOW_MAX:
        category = "LOW"
    elif R < RISK_MEDIUM_MAX:
        category = "MEDIUM"
    else:
        category = "HIGH"
        
    factors = [
        {
            "Component": "Attendance Deficit (A)",
            "Observed Value": f"{attendance_pct:.1f}%",
            "Threshold": f"{ATT_THRESHOLD:.1f}%",
            "Raw Component Risk (0-100)": round(A, 1),
            "Weight": f"{W_ATT * 100:.0f}%",
            "Weighted Contribution": round(W_ATT * A, 2),
            "Status": "At-Risk" if attendance_pct < ATT_THRESHOLD else "Compliant",
        },
        {
            "Component": "Assignment Incompletion (B)",
            "Observed Value": f"{assignment_pct:.1f}%",
            "Threshold": "100.0%",
            "Raw Component Risk (0-100)": round(B, 1),
            "Weight": f"{W_ASG * 100:.0f}%",
            "Weighted Contribution": round(W_ASG * B, 2),
            "Status": "Deficit" if assignment_pct < 85 else "Acceptable",
        },
        {
            "Component": "Academic Examination (C)",
            "Observed Value": f"{academic_pct:.1f}%",
            "Threshold": f"{ACA_THRESHOLD:.1f}%",
            "Raw Component Risk (0-100)": round(C, 1),
            "Weight": f"{W_ACA * 100:.0f}%",
            "Weighted Contribution": round(W_ACA * C, 2),
            "Status": "At-Risk" if academic_pct < ACA_THRESHOLD else "Passing",
        },
    ]
    
    return R, category, round(A, 2), round(B, 2), round(C, 2), factors


def detect_student_trends(
    history_str: str,
    absent_days: int,
    missed_asg: int
) -> Tuple[List[str], go.Figure]:
    """
    Algorithmic Trend and Anomaly Detection.
    Detects sudden drops (>15%), consecutive mark declines, and absenteeism streaks.
    """
    try:
        marks = [float(x.strip()) for x in history_str.split(",") if x.strip()]
    except Exception:
        marks = [70.0, 65.0, 58.0, 44.0]

    alerts = []
    
    # 1. Sudden performance drop check (>15%)
    if len(marks) >= 2:
        for i in range(1, len(marks)):
            prev = marks[i - 1]
            curr = marks[i]
            if prev - curr > 15.0:
                alerts.append(f"⚠️ **Sudden Academic Drop**: Exam #{i} ({curr}%) dropped by {prev - curr:.1f}% compared to Exam #{i-1} ({prev}%). Exceeds the >15% threshold.")
                
    # 2. Consecutive decline check
    if len(marks) >= 3:
        declines = 0
        for i in range(1, len(marks)):
            if marks[i] < marks[i - 1]:
                declines += 1
            else:
                declines = 0
        if declines >= 2:
            alerts.append(f"📉 **Downward Momentum**: Marks have consistently declined across {declines} consecutive evaluation terms.")

    # 3. Attendance streak alert
    if absent_days >= 5:
        alerts.append(f"🚨 **Critical Absenteeism**: Absent {absent_days} out of last 10 lecture hours. Immediate attendance intervention required.")
    elif absent_days >= 3:
        alerts.append(f"⚠️ **Attendance Warning**: Absent {absent_days} out of last 10 lecture hours.")

    # 4. Missed assignments alert
    if missed_asg >= 3:
        alerts.append(f"📋 **Persistent Non-Submission**: {missed_asg} consecutive assignments missing.")

    if not alerts:
        alerts.append("✅ **No Anomalies Detected**: Academic progression and attendance metrics are within acceptable institutional parameters.")

    # Create Plotly trajectory chart
    fig = go.Figure()
    terms = [f"Term {i+1}" for i in range(len(marks))]
    
    fig.add_trace(go.Scatter(
        x=terms,
        y=marks,
        mode="lines+markers+text",
        name="Performance %",
        text=[f"{m:.1f}%" for m in marks],
        textposition="top center",
        line=dict(color="#10B981" if marks[-1] >= 60 else "#EF4444", width=3),
        marker=dict(size=10, symbol="circle")
    ))
    
    # Benchmark 60% Passing Line
    fig.add_hline(
        y=ACA_THRESHOLD,
        line_dash="dash",
        line_color="#F59E0B",
        annotation_text="Academic Threshold (60%)",
        annotation_position="bottom right"
    )

    fig.update_layout(
        title="Historical Academic Trajectory",
        yaxis=dict(title="Score (%)", range=[0, 105]),
        xaxis=dict(title="Evaluation Term"),
        template="plotly_dark",
        plot_bgcolor="#0F172A",
        paper_bgcolor="#0F172A",
        margin=dict(l=40, r=40, t=50, b=40),
        font=dict(family="Inter, sans-serif", color="#E2E8F0")
    )
    
    return alerts, fig


# ==========================================
# GRADIO INTERFACE LOGIC
# ==========================================
def run_calculator(att: float, asg: float, aca: float):
    R, cat, A, B, C, factors = calculate_risk(att, asg, aca)
    
    # Color badge based on category
    if cat == "HIGH":
        badge_color = "#EF4444"
        badge_bg = "#450A0A"
        cat_desc = "CRITICAL ACTION REQUIRED — High likelihood of course failure or drop-out."
    elif cat == "MEDIUM":
        badge_color = "#F59E0B"
        badge_bg = "#451A03"
        cat_desc = "MODERATE RISK — Proactive counseling and academic tutoring recommended."
    else:
        badge_color = "#10B981"
        badge_bg = "#064E3B"
        cat_desc = "ON TRACK — Student is performing well above compliance thresholds."
        
    score_html = f"""
    <div style="background:{badge_bg}; border: 2px solid {badge_color}; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 15px;">
        <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: {badge_color}; font-weight: 700;">Composite Risk Score</div>
        <div style="font-size: 64px; font-weight: 900; color: #FFFFFF; line-height: 1.1; margin: 8px 0;">{R:.1f}<span style="font-size: 24px; color: {badge_color};"> / 100</span></div>
        <div style="display: inline-block; background: {badge_color}; color: #000; font-weight: 800; font-size: 14px; padding: 4px 16px; border-radius: 9999px;">{cat} RISK</div>
        <div style="font-size: 13px; color: #CBD5E1; margin-top: 10px;">{cat_desc}</div>
    </div>
    """
    
    # Plotly contribution bar chart
    fig = go.Figure()
    components = ["Attendance (35%)", "Assignments (25%)", "Academics (40%)"]
    contribs = [W_ATT * A, W_ASG * B, W_ACA * C]
    colors = ["#3B82F6", "#8B5CF6", "#EC4899"]
    
    fig.add_trace(go.Bar(
        x=components,
        y=contribs,
        marker_color=colors,
        text=[f"+{c:.2f} pts" for c in contribs],
        textposition="auto"
    ))
    
    fig.update_layout(
        title="Weighted Risk Contribution by Dimension",
        yaxis=dict(title="Risk Points Imparted", range=[0, 45]),
        template="plotly_dark",
        plot_bgcolor="#0F172A",
        paper_bgcolor="#0F172A",
        margin=dict(l=30, r=30, t=50, b=30),
        font=dict(family="Inter, sans-serif", color="#E2E8F0")
    )
    
    df = pd.DataFrame(factors)
    return score_html, fig, df


def run_simulator(cur_att: float, cur_asg: float, cur_aca: float, target_att: float, target_asg: float, target_aca: float):
    r_cur, cat_cur, _, _, _, _ = calculate_risk(cur_att, cur_asg, cur_aca)
    r_sim, cat_sim, _, _, _, _ = calculate_risk(target_att, target_asg, target_aca)
    
    diff = round(r_sim - r_cur, 2)
    
    if diff <= 0:
        reduction_str = f"Reduced risk by {abs(diff):.1f} points"
        delta_color = "#10B981"
    else:
        reduction_str = f"Increased risk by {diff:.1f} points"
        delta_color = "#EF4444"
        
    summary_html = f"""
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
        <div style="background: #1E293B; border-radius: 10px; padding: 16px; border-left: 4px solid #64748B;">
            <div style="color: #94A3B8; font-size: 12px; font-weight: 600;">CURRENT BASELINE</div>
            <div style="font-size: 32px; font-weight: 800; color: #FFFFFF;">{r_cur:.1f} <span style="font-size: 14px; color: #94A3B8;">({cat_cur})</span></div>
            <div style="font-size: 12px; color: #CBD5E1; margin-top: 4px;">Att: {cur_att}% | Asg: {cur_asg}% | Exam: {cur_aca}%</div>
        </div>
        <div style="background: #1E293B; border-radius: 10px; padding: 16px; border-left: 4px solid {delta_color};">
            <div style="color: {delta_color}; font-size: 12px; font-weight: 600;">SIMULATED TARGET</div>
            <div style="font-size: 32px; font-weight: 800; color: #FFFFFF;">{r_sim:.1f} <span style="font-size: 14px; color: {delta_color};">({cat_sim})</span></div>
            <div style="font-size: 12px; color: #CBD5E1; margin-top: 4px;">{reduction_str}</div>
        </div>
    </div>
    """
    
    # Comparison chart
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=["Baseline Current", "Target Simulated"],
        y=[r_cur, r_sim],
        marker_color=["#EF4444" if r_cur >= 65 else "#F59E0B" if r_cur >= 35 else "#10B981",
                      "#EF4444" if r_sim >= 65 else "#F59E0B" if r_sim >= 35 else "#10B981"],
        text=[f"{r_cur:.1f} ({cat_cur})", f"{r_sim:.1f} ({cat_sim})"],
        textposition="auto"
    ))
    
    fig.add_hline(y=35, line_dash="dot", line_color="#10B981", annotation_text="Low Risk Benchmark (<35)")
    fig.add_hline(y=65, line_dash="dot", line_color="#EF4444", annotation_text="High Risk Threshold (>65)")
    
    fig.update_layout(
        title="What-If Intervention Comparison",
        yaxis=dict(title="Composite Risk Score", range=[0, 100]),
        template="plotly_dark",
        plot_bgcolor="#0F172A",
        paper_bgcolor="#0F172A",
        margin=dict(l=30, r=30, t=50, b=30),
        font=dict(family="Inter, sans-serif", color="#E2E8F0")
    )
    
    # Action plan text
    steps = []
    if target_att > cur_att:
        steps.append(f"• Raising attendance from {cur_att}% to {target_att}% recovers up to {W_ATT * max(0, ((75-cur_att)/75)*100 - max(0, ((75-target_att)/75)*100)):.1f} risk points.")
    if target_asg > cur_asg:
        steps.append(f"• Completing missing assignments from {cur_asg}% to {target_asg}% eliminates {W_ASG * (target_asg - cur_asg):.1f} risk points.")
    if target_aca > cur_aca:
        steps.append(f"• Remedial preparation lifting exam scores from {cur_aca}% to {target_aca}% yields a {W_ACA * max(0, ((60-cur_aca)/60)*100 - max(0, ((60-target_aca)/60)*100)):.1f} risk score recovery.")
        
    if not steps:
        action_plan = "No positive adjustments simulated. Adjust the target sliders above baseline to view recovery potential."
    else:
        action_plan = "\n".join(steps)
        if r_sim < 35.0:
            action_plan += f"\n\n🎯 **SUCCESS**: This simulated plan successfully transitions the student into the **SAFE (LOW RISK)** zone!"
            
    return summary_html, fig, action_plan


def load_cohort_student(student_idx: int):
    s = SAMPLE_STUDENTS[student_idx]
    r, cat, _, _, _, _ = calculate_risk(s["attendance"], s["assignments"], s["academics"])
    details = f"""
    ### 👤 Student Dossier: {s['name']} ({s['roll_no']})
    - **Department**: {s['dept']}
    - **Current Risk Score**: **{r:.1f} / 100 ({cat} Risk)**
    - **Attendance**: {s['attendance']}% (Threshold: 75%)
    - **Assignments**: {s['assignments']}% Submitted
    - **Exam Average**: {s['academics']}% (Threshold: 60%)
    - **Active Intervention**: *{s['intervention']}*
    """
    history_str = ", ".join(str(x) for x in s["exam_history"])
    return s["attendance"], s["assignments"], s["academics"], s["attendance"], s["assignments"], s["academics"], history_str, s["absent_last_10"], s["missed_assignments"], details


# ==========================================
# BUILD GRADIO APP
# ==========================================
custom_css = """
body, .gradio-container {
    background-color: #0B132B !important;
    font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
}
.header-box {
    background: linear-gradient(135deg, #1C2541 0%, #0B132B 100%);
    border: 1px solid #3A506B;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
}
"""

with gr.Blocks(title="Student360 — Academic Early-Warning Platform") as demo:
    gr.HTML("""
    <div style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 1px solid #334155; border-radius: 14px; padding: 24px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
            <div>
                <div style="display: inline-block; background: #F59E0B; color: #000; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Deterministic Risk Intelligence</div>
                <h1 style="color: #FFFFFF; font-size: 32px; font-weight: 800; margin: 0; line-height: 1.2;">Student360 Platform</h1>
                <p style="color: #94A3B8; font-size: 14px; margin: 6px 0 0 0;">Explainable academic early-warning, what-if recovery simulator, and multi-term trajectory analytics.</p>
            </div>
            <div style="text-align: right;">
                <a href="https://github.com/Psyodrz/Student-360" target="_blank" style="display: inline-block; background: #3B82F6; color: #FFFFFF; font-weight: 600; font-size: 13px; padding: 8px 16px; border-radius: 8px; text-decoration: none;">GitHub Source Code ↗</a>
                <div style="color: #64748B; font-size: 12px; margin-top: 6px;">Formula: R = 0.35A + 0.25B + 0.40C</div>
            </div>
        </div>
    </div>
    """)
    
    with gr.Tabs():
        # TAB 1: RISK CALCULATOR
        with gr.Tab("🧮 Explainable Risk Engine"):
            gr.Markdown("### Calculate Institutional Academic Risk via Explainable Deterministic Formulas")
            with gr.Row():
                with gr.Column(scale=5):
                    calc_att = gr.Slider(0.0, 100.0, value=65.0, step=0.5, label="Attendance Rate (%)", info="Benchmark: 75% minimum")
                    calc_asg = gr.Slider(0.0, 100.0, value=70.0, step=0.5, label="Assignment Completion (%)", info="Benchmark: 100% target")
                    calc_aca = gr.Slider(0.0, 100.0, value=52.0, step=0.5, label="Academic Exam Performance (%)", info="Benchmark: 60% passing")
                    
                    gr.Markdown("#### Quick Scenario Presets:")
                    with gr.Row():
                        btn_preset1 = gr.Button("🔴 High-Risk Student", size="sm")
                        btn_preset2 = gr.Button("🟡 Moderate Risk", size="sm")
                        btn_preset3 = gr.Button("🟢 High Achiever", size="sm")
                        
                with gr.Column(scale=7):
                    calc_output_html = gr.HTML()
                    calc_output_chart = gr.Plot()
                    
            calc_output_table = gr.DataFrame(label="Factor-by-Factor Audit Table", interactive=False)
            
            # Event triggers
            for inp in [calc_att, calc_asg, calc_aca]:
                inp.change(run_calculator, inputs=[calc_att, calc_asg, calc_aca], outputs=[calc_output_html, calc_output_chart, calc_output_table])
                
            demo.load(run_calculator, inputs=[calc_att, calc_asg, calc_aca], outputs=[calc_output_html, calc_output_chart, calc_output_table])
            
            btn_preset1.click(lambda: (54.0, 45.0, 48.0), outputs=[calc_att, calc_asg, calc_aca])
            btn_preset2.click(lambda: (68.0, 80.0, 55.0), outputs=[calc_att, calc_asg, calc_aca])
            btn_preset3.click(lambda: (92.0, 95.0, 88.0), outputs=[calc_att, calc_asg, calc_aca])

        # TAB 2: RECOVERY SIMULATOR
        with gr.Tab("🔮 What-If Recovery Simulator"):
            gr.Markdown("### Model Target Interventions & Calculate Minimal Effort to Reach Safe Zone")
            with gr.Row():
                with gr.Column():
                    gr.Markdown("#### 📌 Current Baseline Metrics")
                    sim_cur_att = gr.Slider(0.0, 100.0, value=54.0, step=1.0, label="Current Attendance (%)")
                    sim_cur_asg = gr.Slider(0.0, 100.0, value=45.0, step=1.0, label="Current Assignments (%)")
                    sim_cur_aca = gr.Slider(0.0, 100.0, value=48.0, step=1.0, label="Current Exams (%)")
                with gr.Column():
                    gr.Markdown("#### 🎯 Target Simulated Interventions")
                    sim_tar_att = gr.Slider(0.0, 100.0, value=76.0, step=1.0, label="Target Attendance (%)")
                    sim_tar_asg = gr.Slider(0.0, 100.0, value=85.0, step=1.0, label="Target Assignments (%)")
                    sim_tar_aca = gr.Slider(0.0, 100.0, value=65.0, step=1.0, label="Target Exams (%)")

            sim_summary_html = gr.HTML()
            with gr.Row():
                with gr.Column(scale=6):
                    sim_chart = gr.Plot()
                with gr.Column(scale=6):
                    sim_action_text = gr.Markdown(label="Institutional Action Plan")

            sim_inputs = [sim_cur_att, sim_cur_asg, sim_cur_aca, sim_tar_att, sim_tar_asg, sim_tar_aca]
            for s_inp in sim_inputs:
                s_inp.change(run_simulator, inputs=sim_inputs, outputs=[sim_summary_html, sim_chart, sim_action_text])
            demo.load(run_simulator, inputs=sim_inputs, outputs=[sim_summary_html, sim_chart, sim_action_text])

        # TAB 3: TREND & ANOMALY DETECTION
        with gr.Tab("📈 Algorithmic Trend & Anomaly Alerts"):
            gr.Markdown("### Detect Downward Momentum and Sudden Performance Drops (>15%)")
            with gr.Row():
                with gr.Column(scale=5):
                    trend_history = gr.Textbox(
                        label="Historical Term Exam Scores (comma separated)",
                        value="78, 72, 65, 48",
                        placeholder="e.g. 78, 72, 65, 48"
                    )
                    trend_absent = gr.Slider(0, 10, value=5, step=1, label="Days Absent in Last 10 Lectures")
                    trend_missed = gr.Slider(0, 10, value=4, step=1, label="Consecutive Missed Assignments")
                    btn_run_trend = gr.Button("Evaluate Alerts & Trajectory", variant="primary")
                with gr.Column(scale=7):
                    trend_chart = gr.Plot()
                    trend_alerts = gr.Markdown()

            btn_run_trend.click(
                detect_student_trends,
                inputs=[trend_history, trend_absent, trend_missed],
                outputs=[trend_alerts, trend_chart]
            )
            demo.load(
                detect_student_trends,
                inputs=[trend_history, trend_absent, trend_missed],
                outputs=[trend_alerts, trend_chart]
            )

        # TAB 4: COHORT EXPLORER
        with gr.Tab("👥 University Cohort Explorer"):
            gr.Markdown("### Explore Real-Time Student Profiles & Departmental Risk")
            with gr.Row():
                with gr.Column(scale=4):
                    student_selector = gr.Radio(
                        choices=[f"{s['id']}. {s['name']} ({s['dept']})" for s in SAMPLE_STUDENTS],
                        value=f"{SAMPLE_STUDENTS[0]['id']}. {SAMPLE_STUDENTS[0]['name']} ({SAMPLE_STUDENTS[0]['dept']})",
                        type="index",
                        label="Select Student Profile"
                    )
                with gr.Column(scale=8):
                    cohort_details = gr.Markdown()
                    btn_load_into_sim = gr.Button("Load This Student into Simulator & Trend Analysis", variant="secondary")

            student_selector.change(
                load_cohort_student,
                inputs=[student_selector],
                outputs=[calc_att, calc_asg, calc_aca, sim_cur_att, sim_cur_asg, sim_cur_aca, trend_history, trend_absent, trend_missed, cohort_details]
            )
            demo.load(
                load_cohort_student,
                inputs=[student_selector],
                outputs=[calc_att, calc_asg, calc_aca, sim_cur_att, sim_cur_asg, sim_cur_aca, trend_history, trend_absent, trend_missed, cohort_details]
            )

        # TAB 5: ARCHITECTURE & API DOCS
        with gr.Tab("🏛️ System Architecture"):
            gr.Markdown(r"""
            ### Complete Full-Stack Architecture
            
            ```
            ┌────────────────────────────────────────────────────────┐
            │                     Student360                         │
            ├────────────────────────────────────────────────────────┤
            │  Frontend: React 19 + TypeScript + Vite + Tailwind CSS │
            │  Backend:  FastAPI + SQLAlchemy + SQLite/PostgreSQL    │
            │  Engine:   Deterministic Weighted Risk (R = 0.35A...)  │
            │  Simulator: What-If Target Scenario Recalculation      │
            │  Portal:   Role-Based (SuperAdmin, Admin, Faculty, Stu)│
            │  Deploy:   Vercel (UI) + Hugging Face / Render (API)   │
            └────────────────────────────────────────────────────────┘
            ```
            
            #### Core Formula Reference
            - **Attendance Factor ($A$)**: $\max\left(0, \frac{75 - \text{Att}\%}{75} \times 100\right)$
            - **Assignment Factor ($B$)**: $100 - \text{Submission}\%$
            - **Academic Factor ($C$)**: $\max\left(0, \frac{60 - \text{Academic}\%}{60} \times 100\right)$
            - **Composite Risk ($R$)**: $0.35A + 0.25B + 0.40C$
            
            #### REST API Endpoints
            - `GET /api/risk/student/{id}`: Detailed risk breakdown
            - `POST /api/risk/simulate`: Model what-if interventions
            - `GET /api/risk/trends/{id}`: Algorithmic trend & anomaly alerts
            - `POST /api/auth/register`: Student self-registration
            
            *Open-source repository available on GitHub: [Psyodrz/Student-360](https://github.com/Psyodrz/Student-360)*
            """)

if __name__ == "__main__":
    demo.launch(mcp_server=True)
