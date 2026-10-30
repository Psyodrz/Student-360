import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interventionsAPI, analyticsAPI, studentsAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  PlusCircle,
  Search,
  User,
  Calendar,
  MessageSquare,
  Edit,
  Trash2,
  X,
  FileCheck2,
  Sparkles
} from 'lucide-react';

export default function InterventionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interventions, setInterventions] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [currentIv, setCurrentIv] = useState<any>(null);

  // Forms
  const [createForm, setCreateForm] = useState({
    student_id: '',
    faculty_id: '',
    type: 'academic_support',
    description: '',
    deadline: '',
    notes: '',
  });

  const [updateForm, setUpdateForm] = useState({
    status: '',
    notes: '',
    follow_up: '',
    improvement_notes: '',
  });

  const fetchInterventions = () => {
    setLoading(true);
    const params: any = {};
    if (selectedStatus) params.status = selectedStatus;
    if (selectedFaculty) params.faculty_id = selectedFaculty;

    interventionsAPI.list(params)
      .then((res) => setInterventions(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([
      analyticsAPI.faculty().catch(() => ({ data: [] })),
      studentsAPI.list({ limit: 300 }).catch(() => ({ data: [] })),
    ]).then(([facRes, stuRes]) => {
      setFacultyList(facRes.data || []);
      setStudentsList(stuRes.data || []);
    });
  }, []);

  useEffect(() => {
    fetchInterventions();
  }, [selectedStatus, selectedFaculty]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await interventionsAPI.create({
        student_id: Number(createForm.student_id),
        faculty_id: Number(createForm.faculty_id),
        type: createForm.type,
        description: createForm.description,
        deadline: createForm.deadline || null,
        notes: createForm.notes || null,
      });
      setIsCreateOpen(false);
      setCreateForm({ student_id: '', faculty_id: '', type: 'academic_support', description: '', deadline: '', notes: '' });
      fetchInterventions();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create intervention');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentIv) return;
    try {
      await interventionsAPI.update(currentIv.id, {
        status: updateForm.status,
        notes: updateForm.notes || null,
        follow_up: updateForm.follow_up || null,
        improvement_notes: updateForm.improvement_notes || null,
      });
      setIsUpdateOpen(false);
      fetchInterventions();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update intervention');
    }
  };

  const openUpdateModal = (iv: any) => {
    setCurrentIv(iv);
    setUpdateForm({
      status: iv.status,
      notes: iv.notes || '',
      follow_up: iv.follow_up || '',
      improvement_notes: iv.improvement_notes || '',
    });
    setIsUpdateOpen(true);
  };

  const completedCount = interventions.filter(i => ['completed', 'evaluated'].includes(i.status)).length;
  const inProgressCount = interventions.filter(i => i.status === 'in_progress').length;
  const pendingCount = interventions.filter(i => i.status === 'pending').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 🌟 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#EADFD4]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-[#D8CEBE] bg-[#F4EAE1] text-[10px] uppercase tracking-widest text-[#5C4F43] font-bold mb-1.5">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>REMEDIAL GOVERNANCE</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2C2621]">
            Academic Intervention Tracker
          </h1>
          <p className="text-xs text-[#7A6D61] mt-0.5">
            Systematic remediation workflows, mentor assignments, and post-intervention evaluations
          </p>
        </div>
        <button
          onClick={() => {
            setCreateForm({
              student_id: studentsList[0]?.id || '',
              faculty_id: facultyList[0]?.id || '',
              type: 'academic_support',
              description: '',
              deadline: '',
              notes: '',
            });
            setIsCreateOpen(true);
          }}
          className="btn-primary text-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Remedial Case</span>
        </button>
      </div>

      {/* 🌟 Metric Cards (Warm Porcelain Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl sm:rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-5 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
          <span className="text-[10px] font-bold text-[#7A6D61] uppercase tracking-wider">Total Recorded</span>
          <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#2C2621] font-mono">{interventions.length}</div>
        </div>
        <div className="rounded-2xl sm:rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-5 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
          <span className="text-[10px] font-bold text-[#7A6D61] uppercase tracking-wider">Pending Action</span>
          <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#7A6D61] font-mono">{pendingCount}</div>
        </div>
        <div className="rounded-2xl sm:rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-5 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
          <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider">In Progress</span>
          <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#B45309] font-mono">{inProgressCount}</div>
        </div>
        <div className="rounded-2xl sm:rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-5 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
          <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider">Resolved & Evaluated</span>
          <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#15803D] font-mono">{completedCount}</div>
        </div>
      </div>

      {/* 🌟 Filter Bar (Porcelain Card) */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-4 flex flex-wrap items-center gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#5C4F43]">
          <Filter className="w-3.5 h-3.5 text-[#8C7D70]" />
          <span>Filter Cases:</span>
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs border border-[#DACFBF] rounded-xl py-2 px-3 bg-white text-[#2C2621] font-medium focus:ring-2 focus:ring-[#8E7B68]"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="evaluated">Evaluated</option>
        </select>

        <select
          value={selectedFaculty}
          onChange={(e) => setSelectedFaculty(e.target.value)}
          className="text-xs border border-[#DACFBF] rounded-xl py-2 px-3 bg-white text-[#2C2621] font-medium focus:ring-2 focus:ring-[#8E7B68]"
        >
          <option value="">All Faculty Mentors</option>
          {facultyList.map((f) => (
            <option key={f.id} value={f.id}>{f.full_name}</option>
          ))}
        </select>

        {(selectedStatus || selectedFaculty) && (
          <button
            onClick={() => { setSelectedStatus(''); setSelectedFaculty(''); }}
            className="text-xs text-[#7A6D61] hover:text-[#2C2621] font-bold underline px-2 py-1"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* 🌟 Interventions Ledger Table (Warm Porcelain Style) */}
      <div className="rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EADFD4] text-[#7A6D61] font-bold uppercase tracking-wider bg-white/40">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Intervention Type</th>
                <th className="py-3 px-4">Faculty Mentor</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFD4]/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8C7D70]">
                    <div className="inline-block w-6 h-6 border-2 border-[#8C7D70] border-t-[#2C2621] rounded-full animate-spin mb-2" />
                    <div>Loading interventions...</div>
                  </td>
                </tr>
              ) : interventions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8C7D70]">
                    No intervention records found.
                  </td>
                </tr>
              ) : (
                interventions.map((iv) => (
                  <tr key={iv.id} className="hover:bg-white/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#2C2621] cursor-pointer hover:text-amber-800" onClick={() => navigate(`/students/${iv.student_id}`)}>
                      {iv.student_name || `Student #${iv.student_id}`}
                    </td>
                    <td className="py-3.5 px-4 capitalize text-[#2C2621]">
                      <div className="font-semibold">{iv.type.replace('_', ' ')}</div>
                      <div className="text-[11px] text-[#7A6D61] truncate max-w-xs">{iv.description}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#5C4F43]">
                      {iv.faculty_name || `Mentor #${iv.faculty_id}`}
                    </td>
                    <td className="py-3.5 px-4 text-[#7A6D61] font-mono">
                      {iv.deadline || 'No target'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                        iv.status === 'evaluated'
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : iv.status === 'completed'
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : iv.status === 'in_progress'
                          ? 'bg-[#FEF3C7] text-[#B45309]'
                          : 'bg-white text-[#7A6D61] border border-[#DACFBF]'
                      }`}>
                        {iv.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openUpdateModal(iv)}
                          className="px-3 py-1 text-xs font-bold rounded-xl bg-white hover:bg-[#F2ECE3] border border-[#DACFBF] text-[#2C2621] transition-all shadow-2xs"
                        >
                          Update Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🌟 Create Intervention Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#F6EDE6] rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-white/60 animate-scale-in text-[#2C2621]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFD4]">
              <h2 className="text-base font-bold text-[#2C2621]">Initiate Academic Intervention</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-[#8C7D70] hover:text-[#2C2621]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Target Student *</label>
                <select
                  required
                  value={createForm.student_id}
                  onChange={(e) => setCreateForm({ ...createForm, student_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                >
                  <option value="">Select Student</option>
                  {studentsList.map((s) => (
                    <option key={s.id} value={s.id}>{s.full_name} ({s.enrollment_no}) - Sem {s.semester}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Assign Faculty Mentor *</label>
                <select
                  required
                  value={createForm.faculty_id}
                  onChange={(e) => setCreateForm({ ...createForm, faculty_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                >
                  <option value="">Select Mentor</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>{f.full_name} ({f.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Intervention Type *</label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                >
                  <option value="academic_support">Academic Remedial Tutoring</option>
                  <option value="counseling">Individual Mentorship Session</option>
                  <option value="attendance_warning">Statutory Attendance Notice</option>
                  <option value="parent_meeting">Parent-Faculty Consultation</option>
                  <option value="peer_tutoring">Peer Academic Cohort</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Remediation Action Plan *</label>
                <textarea
                  required
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                  placeholder="Specific tasks, target chapters, and weekly milestones..."
                />
              </div>

              <div>
                <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Target Evaluation Date</label>
                <input
                  type="date"
                  value={createForm.deadline}
                  onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#EADFD4]">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Deploy Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 Update Intervention Modal */}
      {isUpdateOpen && currentIv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#F6EDE6] rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-white/60 animate-scale-in text-[#2C2621]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFD4]">
              <h2 className="text-base font-bold text-[#2C2621]">Update Remedial Progression</h2>
              <button onClick={() => setIsUpdateOpen(false)} className="text-[#8C7D70] hover:text-[#2C2621]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Progression Status *</label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="evaluated">Evaluated & Verified</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Mentor Session Notes</label>
                <textarea
                  rows={2}
                  value={updateForm.notes}
                  onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                  placeholder="Meeting logs, attendance at remedial classes..."
                />
              </div>

              <div>
                <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Follow-up Directives</label>
                <textarea
                  rows={2}
                  value={updateForm.follow_up}
                  onChange={(e) => setUpdateForm({ ...updateForm, follow_up: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                  placeholder="Future checkpoints or homework deadlines..."
                />
              </div>

              <div>
                <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Tangible Improvement Outcome</label>
                <textarea
                  rows={2}
                  value={updateForm.improvement_notes}
                  onChange={(e) => setUpdateForm({ ...updateForm, improvement_notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                  placeholder="Grade increase percentage, attendance recovery delta..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#EADFD4]">
                <button type="button" onClick={() => setIsUpdateOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Progression
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
