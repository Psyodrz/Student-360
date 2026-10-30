import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentsAPI, riskAPI, interventionsAPI, analyticsAPI } from '../lib/api';
import {
  GraduationCap,
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Calendar,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Minus,
  Sliders,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle,
  ShieldAlert,
  HelpCircle,
  X
} from 'lucide-react';

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Intervention modal
  const [isInterventionOpen, setIsInterventionOpen] = useState(false);
  const [interventionForm, setInterventionForm] = useState({
    faculty_id: '',
    type: 'counseling',
    description: '',
    deadline: '',
    notes: '',
  });

  const fetchProfile = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      studentsAPI.getProfile(Number(id)),
      riskAPI.trends(Number(id)),
      analyticsAPI.faculty().catch(() => ({ data: [] })),
    ])
      .then(([profRes, trendRes, facRes]) => {
        setProfile(profRes.data);
        setTrends(trendRes.data);
        setFacultyList(facRes.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await interventionsAPI.create({
        student_id: Number(id),
        faculty_id: Number(interventionForm.faculty_id),
        type: interventionForm.type,
        description: interventionForm.description,
        deadline: interventionForm.deadline || null,
        notes: interventionForm.notes || null,
      });
      setIsInterventionOpen(false);
      setInterventionForm({ faculty_id: '', type: 'counseling', description: '', deadline: '', notes: '' });
      fetchProfile();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to initiate intervention');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-oxford-900 border-t-academic-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading Student Dossier...
          </span>
        </div>
      </div>
    );
  }

  if (!profile || !profile.student) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-600 font-medium">Student profile not found.</p>
        <button onClick={() => navigate('/students')} className="btn-secondary mt-3">
          Return to Students Directory
        </button>
      </div>
    );
  }

  const { student, attendance, assignments, academic, risk, interventions } = profile;

  const getRiskCategoryStyle = (cat?: string) => {
    if (cat === 'High') return 'bg-risk-50 text-risk-800 border-risk-300 ring-1 ring-risk-400/40';
    if (cat === 'Medium') return 'bg-academic-50 text-academic-800 border-academic-300 ring-1 ring-academic-400/40';
    return 'bg-stable-50 text-stable-800 border-stable-300 ring-1 ring-stable-400/40';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/students')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/simulator?student_id=${student.id}`)}
            className="btn-accent text-xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Launch Recovery Simulator</span>
          </button>
          <button
            onClick={() => {
              setInterventionForm({
                faculty_id: facultyList[0]?.id || '',
                type: 'academic_support',
                description: `Mandatory academic support initiated for risk level ${risk?.score ?? 'N/A'}.`,
                deadline: '',
                notes: '',
              });
              setIsInterventionOpen(true);
            }}
            className="btn-primary text-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Assign Academic Intervention</span>
          </button>
        </div>
      </div>

      {/* Student Dossier Header Card */}
      <div className="card-surface p-6 bg-gradient-to-r from-white via-white to-slate-50 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-oxford-900 border border-oxford-800 flex items-center justify-center text-white text-2xl font-bold font-mono shadow-md">
              {student.full_name?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {student.full_name}
                </h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                  {student.enrollment_no}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 uppercase">
                  {student.status || 'Active'}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {student.department} ({student.department_code})
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Semester {student.semester} • Batch of {student.admission_year}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {student.email}
                </span>
                {student.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {student.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Risk Score Snapshot */}
          <div className={`p-4 rounded-xl border flex flex-col items-center justify-center min-w-[170px] ${getRiskCategoryStyle(risk?.category)}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Composite Risk Index
            </span>
            <div className="text-3xl font-black mt-1 font-mono">
              {risk?.score ?? '—'}<span className="text-sm font-normal text-slate-500">/100</span>
            </div>
            <span className="mt-1 font-semibold text-xs uppercase tracking-wider">
              {risk?.category || 'Low'} Risk Level
            </span>
          </div>
        </div>
      </div>

      {/* Deterministic Risk Engine Mathematical Transparency */}
      <div className="card-surface p-6 border-l-4 border-academic-600">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-academic-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Deterministic Risk Engine Mathematical Breakdown
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            Formula: R = 0.35A + 0.25B + 0.40C
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Factor A: Attendance */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Attendance Risk (A)</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                Weight: 35%
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
              {attendance?.percentage !== null ? `${attendance?.percentage}%` : 'N/A'}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Formula: max(0, ((75 - att) / 75) * 100). Threshold 75%.
            </p>
            <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] flex justify-between text-slate-600">
              <span>Classes Attended:</span>
              <span className="font-semibold">{attendance?.present || 0} / {attendance?.total_classes || 0}</span>
            </div>
          </div>

          {/* Factor B: Assignments */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Assignment Risk (B)</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                Weight: 25%
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
              {assignments?.completion_pct !== null ? `${assignments?.completion_pct}%` : 'N/A'}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Formula: 100 - completion_pct. Target 100%.
            </p>
            <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] flex justify-between text-slate-600">
              <span>Submitted / Total:</span>
              <span className="font-semibold">{assignments?.submitted || 0} / {assignments?.total || 0}</span>
            </div>
          </div>

          {/* Factor C: Internal Marks */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Academic Marks Risk (C)</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                Weight: 40%
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
              {academic?.overall_percentage !== null ? `${academic?.overall_percentage}%` : 'N/A'}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Formula: max(0, ((60 - marks) / 60) * 100). Threshold 60%.
            </p>
            <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] flex justify-between text-slate-600">
              <span>Total Exams Tracked:</span>
              <span className="font-semibold">{academic?.marks?.length || 0} assessments</span>
            </div>
          </div>
        </div>

        {/* Contributing Factors & Logic Explanation */}
        {risk?.factors && risk?.factors.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Explainable Risk Indicators:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {risk.factors.map((f: any, i: number) => (
                <div key={i} className="p-2.5 rounded bg-white border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800">{f.component}</span>
                    <p className="text-[10px] text-slate-500">{f.explanation}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${f.severity === 'high' ? 'bg-risk-100 text-risk-800' : f.severity === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-stable-100 text-stable-800'}`}>
                    {f.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Feature 1: Academic Trend Detection Alerts */}
      {trends?.alerts && trends.alerts.length > 0 && (
        <div className="card-surface p-5 border-l-4 border-risk-600 bg-risk-50/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-risk-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-risk-900">
              Algorithmic Trend Alerts Detected (Feature 1)
            </h3>
          </div>
          <div className="space-y-2">
            {trends.alerts.map((alert: any, idx: number) => (
              <div key={idx} className="p-3 rounded-md bg-white border border-risk-200 flex items-start gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-0.5 ${alert.severity === 'high' ? 'bg-risk-600 text-white' : 'bg-academic-600 text-white'}`}>
                  {alert.severity}
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-800">{alert.message}</span>
                  <p className="text-[11px] text-slate-500 capitalize mt-0.5">Alert Class: {alert.type.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout: Subject Attendance & Internal Marks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Internal Exam Marks */}
        <div className="card-surface p-5">
          <h3 className="text-sm font-semibold text-slate-800 pb-3 border-b border-slate-100">
            Internal Assessments Ledger
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase bg-slate-50">
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Exam Type</th>
                  <th className="py-2.5 px-3 text-right">Score</th>
                  <th className="py-2.5 px-3 text-right">% Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {academic?.marks?.length === 0 ? (
                  <tr><td colSpan={4} className="py-6 text-center text-slate-400">No marks recorded.</td></tr>
                ) : (
                  academic?.marks?.map((m: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-medium text-slate-800">{m.subject}</td>
                      <td className="py-2.5 px-3 text-slate-600">{m.exam_type}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{m.marks_obtained} / {m.max_marks}</td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono">
                        <span className={m.percentage < 60 ? 'text-risk-600' : 'text-stable-700'}>
                          {m.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assigned Interventions Timeline */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">
              Intervention History & Remedial Actions
            </h3>
            <span className="text-[11px] font-medium text-slate-400">
              {interventions?.length || 0} Assigned
            </span>
          </div>
          <div className="mt-3 space-y-3 max-h-[300px] overflow-y-auto">
            {interventions?.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">
                No interventions assigned for this student yet.
              </p>
            ) : (
              interventions?.map((iv: any) => (
                <div key={iv.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 capitalize">
                      {iv.type.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${iv.status === 'completed' || iv.status === 'evaluated' ? 'bg-stable-100 text-stable-800' : iv.status === 'in_progress' ? 'bg-academic-100 text-academic-800' : 'bg-slate-200 text-slate-800'}`}>
                      {iv.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-600">{iv.description}</p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-200">
                    <span>Mentor: {iv.faculty_name}</span>
                    {iv.deadline && <span>Target: {iv.deadline}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* New Intervention Modal */}
      {isInterventionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">Assign Academic Intervention</h2>
              <button onClick={() => setIsInterventionOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateIntervention} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Faculty Mentor *</label>
                <select
                  required
                  value={interventionForm.faculty_id}
                  onChange={(e) => setInterventionForm({ ...interventionForm, faculty_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-oxford-800"
                >
                  <option value="">Select Mentor</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>{f.full_name} ({f.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Intervention Category *</label>
                <select
                  value={interventionForm.type}
                  onChange={(e) => setInterventionForm({ ...interventionForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-oxford-800"
                >
                  <option value="counseling">One-on-One Academic Counseling</option>
                  <option value="academic_support">Remedial Tutoring & Subject Support</option>
                  <option value="attendance_warning">Statutory Attendance Warning</option>
                  <option value="parent_meeting">Dean-Parent Advisory Conference</option>
                  <option value="peer_tutoring">Peer Mentor Study Group</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Action Description *</label>
                <textarea
                  required
                  rows={3}
                  value={interventionForm.description}
                  onChange={(e) => setInterventionForm({ ...interventionForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-oxford-800"
                  placeholder="Detail the remedial objectives and schedule..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Completion Deadline</label>
                <input
                  type="date"
                  value={interventionForm.deadline}
                  onChange={(e) => setInterventionForm({ ...interventionForm, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-oxford-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsInterventionOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Deploy Intervention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

