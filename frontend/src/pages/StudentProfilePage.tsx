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
  Sparkles,
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
          <div className="w-8 h-8 border-3 border-[#2C2621] border-t-amber-500 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#8C7D70] uppercase tracking-wider">
            Loading Student Dossier...
          </span>
        </div>
      </div>
    );
  }

  if (!profile || !profile.student) {
    return (
      <div className="text-center py-16 rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-8 max-w-md mx-auto">
        <p className="text-[#5C4F43] font-bold">Student profile not found.</p>
        <button onClick={() => navigate('/students')} className="btn-secondary mt-3 text-xs">
          Return to Students Directory
        </button>
      </div>
    );
  }

  const { student, attendance, assignments, academic, risk, interventions } = profile;

  const getRiskCategoryStyle = (cat?: string) => {
    if (cat === 'High') return 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]';
    if (cat === 'Medium') return 'bg-[#FEF3C7] text-[#B45309] border-[#FCD34D]';
    return 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 🌟 Top Navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/students')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C4F43] hover:text-[#2C2621] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Students Directory</span>
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
                description: `Mandatory academic support initiated for risk index ${risk?.score ?? 'N/A'}.`,
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

      {/* 🌟 Student Dossier Header Card (Warm Porcelain Style) */}
      <div className="rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2C2621] text-white flex items-center justify-center text-2xl font-bold font-mono shadow-md">
              {student.full_name?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-[#2C2621] tracking-tight">
                  {student.full_name}
                </h1>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-white border border-[#DACFBF] text-[#2C2621] font-bold">
                  {student.enrollment_no}
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#DCFCE7] text-[#15803D] uppercase font-mono">
                  {student.status || 'Active'}
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#7A6D61]">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#8C7D70]" />
                  {student.department} ({student.department_code})
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8C7D70]" />
                  Semester {student.semester} • Batch {student.admission_year}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#8C7D70]" />
                  {student.email}
                </span>
                {student.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#8C7D70]" />
                    {student.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Risk Score Snapshot */}
          <div className={`p-5 rounded-2xl border flex flex-col items-center justify-center min-w-[170px] shadow-xs ${getRiskCategoryStyle(risk?.category)}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Composite Risk Index
            </span>
            <div className="text-3xl font-extrabold mt-1 font-mono">
              {risk?.score ?? '—'}<span className="text-xs font-normal opacity-70"> / 100</span>
            </div>
            <span className="mt-1 font-bold text-xs uppercase tracking-wider font-mono">
              {risk?.category || 'Low'} Risk Level
            </span>
          </div>
        </div>
      </div>

      {/* 🌟 Deterministic Risk Engine Mathematical Transparency */}
      <div className="rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#EADFD4]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <h2 className="text-sm font-bold text-[#2C2621] uppercase tracking-wide">
              Deterministic Risk Engine Mathematical Breakdown
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#5C4F43] bg-white px-2.5 py-0.5 rounded-lg border border-[#DACFBF] font-bold">
            R = 0.35A + 0.25B + 0.40C
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          
          {/* Factor A: Attendance */}
          <div className="p-4 rounded-2xl bg-white/80 border border-[#E0D4C5] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2C2621]">Attendance Risk (A)</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF4ED] text-[#B45309] border border-[#E3D6C8]">
                Weight: 35%
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold font-mono text-[#2C2621]">
              {attendance?.percentage !== null ? `${attendance?.percentage}%` : 'N/A'}
            </div>
            <p className="mt-1 text-[11px] text-[#7A6D61]">
              Formula: max(0, ((75 - att) / 75) * 100). Quota 75%.
            </p>
            <div className="mt-2 pt-2 border-t border-[#EADFD4] text-[11px] flex justify-between text-[#7A6D61]">
              <span>Classes Attended:</span>
              <span className="font-bold text-[#2C2621]">{attendance?.present || 0} / {attendance?.total_classes || 0}</span>
            </div>
          </div>

          {/* Factor B: Assignments */}
          <div className="p-4 rounded-2xl bg-white/80 border border-[#E0D4C5] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2C2621]">Assignment Risk (B)</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF4ED] text-[#B45309] border border-[#E3D6C8]">
                Weight: 25%
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold font-mono text-[#2C2621]">
              {assignments?.completion_pct !== null ? `${assignments?.completion_pct}%` : 'N/A'}
            </div>
            <p className="mt-1 text-[11px] text-[#7A6D61]">
              Formula: 100 - completion_pct. Quota 100%.
            </p>
            <div className="mt-2 pt-2 border-t border-[#EADFD4] text-[11px] flex justify-between text-[#7A6D61]">
              <span>Submitted / Total:</span>
              <span className="font-bold text-[#2C2621]">{assignments?.submitted || 0} / {assignments?.total || 0}</span>
            </div>
          </div>

          {/* Factor C: Internal Marks */}
          <div className="p-4 rounded-2xl bg-white/80 border border-[#E0D4C5] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2C2621]">Academic Marks Risk (C)</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF4ED] text-[#B45309] border border-[#E3D6C8]">
                Weight: 40%
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold font-mono text-[#2C2621]">
              {academic?.overall_percentage !== null ? `${academic?.overall_percentage}%` : 'N/A'}
            </div>
            <p className="mt-1 text-[11px] text-[#7A6D61]">
              Formula: max(0, ((60 - marks) / 60) * 100). Safe 60%.
            </p>
            <div className="mt-2 pt-2 border-t border-[#EADFD4] text-[11px] flex justify-between text-[#7A6D61]">
              <span>Exams Recorded:</span>
              <span className="font-bold text-[#2C2621]">{academic?.marks?.length || 0} tests</span>
            </div>
          </div>

        </div>

        {/* Contributing Factors & Logic Explanation */}
        {risk?.factors && risk?.factors.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#EADFD4]">
            <h4 className="text-xs font-bold text-[#5C4F43] uppercase tracking-wider mb-2">
              Explainable Risk Indicators:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {risk.factors.map((f: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-white border border-[#E0D4C5] text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#2C2621]">{f.component}</span>
                    <p className="text-[10px] text-[#7A6D61]">{f.explanation}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono ${f.severity === 'high' ? 'bg-[#FEE2E2] text-[#DC2626]' : f.severity === 'medium' ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#DCFCE7] text-[#15803D]'}`}>
                    {f.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🌟 Algorithmic Trend Alerts Detected */}
      {trends?.alerts && trends.alerts.length > 0 && (
        <div className="rounded-3xl bg-[#FEF2F2] border border-[#FECACA] p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#991B1B]">
              Algorithmic Trend Alerts Detected
            </h3>
          </div>
          <div className="space-y-2">
            {trends.alerts.map((alert: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-white border border-[#FCA5A5] flex items-start gap-3 shadow-2xs">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase mt-0.5 font-mono ${alert.severity === 'high' ? 'bg-[#DC2626] text-white' : 'bg-[#D97706] text-white'}`}>
                  {alert.severity}
                </span>
                <div>
                  <span className="text-xs font-bold text-[#2C2621]">{alert.message}</span>
                  <p className="text-[11px] text-[#7A6D61] capitalize mt-0.5">Classification: {alert.type.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🌟 Two Column Layout: Assessments Ledger & Interventions Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Internal Exam Marks */}
        <div className="rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-6 shadow-xs">
          <h3 className="text-sm font-bold text-[#2C2621] pb-3 border-b border-[#EADFD4]">
            Internal Assessments Ledger
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EADFD4] text-[#7A6D61] font-bold uppercase bg-white/40">
                  <th className="py-2.5 px-3 rounded-l-xl">Subject</th>
                  <th className="py-2.5 px-3">Exam Type</th>
                  <th className="py-2.5 px-3 text-right">Score</th>
                  <th className="py-2.5 px-3 text-right rounded-r-xl">% Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFD4]/60">
                {academic?.marks?.length === 0 ? (
                  <tr><td colSpan={4} className="py-6 text-center text-[#8C7D70]">No marks recorded.</td></tr>
                ) : (
                  academic?.marks?.map((m: any, i: number) => (
                    <tr key={i} className="hover:bg-white/60 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#2C2621]">{m.subject}</td>
                      <td className="py-2.5 px-3 text-[#5C4F43]">{m.exam_type}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#2C2621]">{m.marks_obtained} / {m.max_marks}</td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono">
                        <span className={m.percentage < 60 ? 'text-[#DC2626]' : 'text-[#15803D]'}>
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
        <div className="rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADFD4]">
            <h3 className="text-sm font-bold text-[#2C2621]">
              Intervention History & Actions
            </h3>
            <span className="text-[11px] font-medium text-[#7A6D61]">
              {interventions?.length || 0} Assigned
            </span>
          </div>
          <div className="mt-3 space-y-3 max-h-[300px] overflow-y-auto">
            {interventions?.length === 0 ? (
              <p className="text-center py-8 text-xs text-[#8C7D70]">
                No interventions assigned for this student yet.
              </p>
            ) : (
              interventions?.map((iv: any) => (
                <div key={iv.id} className="p-3.5 rounded-2xl border border-[#E0D4C5] bg-white/80 space-y-1.5 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2C2621] capitalize">
                      {iv.type.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${iv.status === 'completed' || iv.status === 'evaluated' ? 'bg-[#DCFCE7] text-[#15803D]' : iv.status === 'in_progress' ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#EAE2D7] text-[#5C4F43]'}`}>
                      {iv.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[#5C4F43]">{iv.description}</p>
                  <div className="flex items-center justify-between pt-1.5 text-[10px] text-[#8C7D70] border-t border-[#EADFD4]">
                    <span>Mentor: {iv.faculty_name}</span>
                    {iv.deadline && <span>Target: {iv.deadline}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 🌟 New Intervention Modal */}
      {isInterventionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#F6EDE6] rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-white/60 animate-scale-in text-[#2C2621]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFD4]">
              <h2 className="text-base font-bold text-[#2C2621]">Assign Academic Intervention</h2>
              <button onClick={() => setIsInterventionOpen(false)} className="text-[#8C7D70] hover:text-[#2C2621]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateIntervention} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Assigned Faculty Mentor *</label>
                <select
                  required
                  value={interventionForm.faculty_id}
                  onChange={(e) => setInterventionForm({ ...interventionForm, faculty_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                >
                  <option value="">Select Mentor</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>{f.full_name} ({f.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Intervention Category *</label>
                <select
                  value={interventionForm.type}
                  onChange={(e) => setInterventionForm({ ...interventionForm, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                >
                  <option value="counseling">One-on-One Academic Counseling</option>
                  <option value="academic_support">Remedial Tutoring & Subject Support</option>
                  <option value="attendance_warning">Statutory Attendance Warning</option>
                  <option value="parent_meeting">Dean-Parent Advisory Conference</option>
                  <option value="peer_tutoring">Peer Mentor Study Group</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Action Description *</label>
                <textarea
                  required
                  rows={3}
                  value={interventionForm.description}
                  onChange={(e) => setInterventionForm({ ...interventionForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                  placeholder="Detail the remedial objectives and schedule..."
                />
              </div>

              <div>
                <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Target Completion Deadline</label>
                <input
                  type="date"
                  value={interventionForm.deadline}
                  onChange={(e) => setInterventionForm({ ...interventionForm, deadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#EADFD4]">
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
