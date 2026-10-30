import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentsAPI, analyticsAPI, academicAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Upload,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles
} from 'lucide-react';

export default function StudentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedRisk, setSelectedRisk] = useState<string>('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    enrollment_no: '',
    full_name: '',
    email: '',
    department_id: '',
    semester: 3,
    admission_year: 2023,
    phone: '',
  });

  // CSV Import state
  const [importType, setImportType] = useState('attendance');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [importing, setImporting] = useState(false);

  const fetchStudents = () => {
    setLoading(true);
    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedDept) params.department_id = selectedDept;
    if (selectedSemester) params.semester = selectedSemester;
    if (selectedRisk) params.risk_category = selectedRisk;

    studentsAPI.list(params)
      .then((res) => setStudents(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    analyticsAPI.departments().then((res) => setDepartments(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedDept, selectedSemester, selectedRisk]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await studentsAPI.create({
        ...formData,
        department_id: Number(formData.department_id),
        semester: Number(formData.semester),
        admission_year: Number(formData.admission_year),
      });
      setIsAddOpen(false);
      setFormData({ enrollment_no: '', full_name: '', email: '', department_id: '', semester: 3, admission_year: 2023, phone: '' });
      fetchStudents();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create student');
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;
    try {
      await studentsAPI.update(currentStudent.id, {
        full_name: formData.full_name,
        email: formData.email,
        department_id: Number(formData.department_id),
        semester: Number(formData.semester),
        admission_year: Number(formData.admission_year),
        phone: formData.phone || null,
      });
      setIsEditOpen(false);
      fetchStudents();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update student');
    }
  };

  const handleDeleteStudent = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove student "${name}" from the system?`)) return;
    try {
      await studentsAPI.delete(id);
      fetchStudents();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete student');
    }
  };

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const res = await academicAPI.importCSV(importFile, importType);
      setImportResult(res.data);
      if (res.data.success) {
        fetchStudents();
      }
    } catch (err: any) {
      setImportResult({ success: false, records_imported: 0, errors: [err.response?.data?.detail || 'Import failed'] });
    } finally {
      setImporting(false);
    }
  };

  const openEditModal = (student: any) => {
    setCurrentStudent(student);
    setFormData({
      enrollment_no: student.enrollment_no,
      full_name: student.full_name,
      email: student.email,
      department_id: student.department_id,
      semester: student.semester,
      admission_year: student.admission_year,
      phone: student.phone || '',
    });
    setIsEditOpen(true);
  };

  const getRiskBadge = (category?: string, score?: number) => {
    if (category === 'High') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />
          High ({score ?? '—'})
        </span>
      );
    }
    if (category === 'Medium') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
          Medium ({score ?? '—'})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
        Low ({score ?? '—'})
      </span>
    );
  };

  const canManage = ['admin', 'super_admin'].includes(user?.role || '');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 🌟 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#EADFD4]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-[#D8CEBE] bg-[#F4EAE1] text-[10px] uppercase tracking-widest text-[#5C4F43] font-bold mb-1.5">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>COHORT DIRECTORY</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2C2621]">
            Students Directory
          </h1>
          <p className="text-xs text-[#7A6D61] mt-0.5">
            Complete institutional enrollment register and individual academic telemetry
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportOpen(true)}
            className="btn-secondary text-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV Records</span>
          </button>
          {canManage && (
            <button
              onClick={() => {
                setFormData({ enrollment_no: '', full_name: '', email: '', department_id: departments[0]?.id || '', semester: 3, admission_year: 2023, phone: '' });
                setIsAddOpen(true);
              }}
              className="btn-primary text-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Enroll New Student</span>
            </button>
          )}
        </div>
      </div>

      {/* 🌟 Filter and Search Bar (Porcelain Card) */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7D70]" />
          <input
            type="text"
            placeholder="Search by student name, enrollment no, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white/90 border border-[#DACFBF] rounded-xl text-[#2C2621] placeholder-[#A69788] focus:outline-none focus:ring-2 focus:ring-[#8E7B68] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs border border-[#DACFBF] rounded-xl py-2 px-3 bg-white/90 text-[#2C2621] font-medium focus:ring-2 focus:ring-[#8E7B68]"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="text-xs border border-[#DACFBF] rounded-xl py-2 px-3 bg-white/90 text-[#2C2621] font-medium focus:ring-2 focus:ring-[#8E7B68]"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>

          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="text-xs border border-[#DACFBF] rounded-xl py-2 px-3 bg-white/90 text-[#2C2621] font-medium focus:ring-2 focus:ring-[#8E7B68]"
          >
            <option value="">All Risk Tiers</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          {(searchTerm || selectedDept || selectedSemester || selectedRisk) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDept('');
                setSelectedSemester('');
                setSelectedRisk('');
              }}
              className="text-xs text-[#7A6D61] hover:text-[#2C2621] px-2.5 py-1.5 font-bold underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 🌟 Students Data Table (Warm Porcelain Style) */}
      <div className="rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EADFD4] text-[#7A6D61] font-bold uppercase tracking-wider bg-white/40">
                <th className="py-3 px-4">Enrollment No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Semester</th>
                <th className="py-3 px-4 text-center">Academic Risk Tier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFD4]/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8C7D70]">
                    <div className="inline-block w-6 h-6 border-2 border-[#8C7D70] border-t-[#2C2621] rounded-full animate-spin mb-2" />
                    <div>Loading student records...</div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8C7D70]">
                    No students found matching current filters.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-white/60 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/students/${student.id}`)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#2C2621]">
                      {student.enrollment_no}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#2C2621] group-hover:text-amber-800 transition-colors">
                        {student.full_name}
                      </div>
                      <div className="text-[11px] text-[#7A6D61]">{student.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#5C4F43] font-medium">
                      {student.department_name || `Dept #${student.department_id}`}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-[#2C2621]">
                      Sem {student.semester}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getRiskBadge(student.risk_category, student.risk_score)}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/students/${student.id}`)}
                          className="px-3 py-1 text-xs font-bold rounded-xl bg-white hover:bg-[#F2ECE3] border border-[#DACFBF] text-[#2C2621] transition-all shadow-2xs"
                        >
                          View 360
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => openEditModal(student)}
                              title="Edit"
                              className="p-1.5 rounded-lg text-[#8C7D70] hover:text-[#2C2621] hover:bg-white"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id, student.full_name)}
                              title="Delete"
                              className="p-1.5 rounded-lg text-[#8C7D70] hover:text-[#DC2626] hover:bg-white"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🌟 Add Student Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#F6EDE6] rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-white/60 animate-scale-in text-[#2C2621]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFD4]">
              <h2 className="text-base font-bold text-[#2C2621]">Enroll New Student</h2>
              <button onClick={() => setIsAddOpen(false)} className="text-[#8C7D70] hover:text-[#2C2621]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateStudent} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Enrollment Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS-2024-001"
                  value={formData.enrollment_no}
                  onChange={(e) => setFormData({ ...formData, enrollment_no: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl font-mono text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aryan Mehra"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Institutional Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="aryan.mehra@apex.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Department *</label>
                  <select
                    required
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                  >
                    <option value="">Select</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Semester *</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Sem {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Admission Year *</label>
                  <input
                    type="number"
                    value={formData.admission_year}
                    onChange={(e) => setFormData({ ...formData, admission_year: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-[#EADFD4]">
                <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 Edit Student Modal */}
      {isEditOpen && currentStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#F6EDE6] rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-white/60 animate-scale-in text-[#2C2621]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFD4]">
              <h2 className="text-base font-bold text-[#2C2621]">Edit Student Record</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-[#8C7D70] hover:text-[#2C2621]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateStudent} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Enrollment (Immutable)</label>
                <input
                  type="text"
                  disabled
                  value={formData.enrollment_no}
                  className="w-full px-3.5 py-2.5 bg-[#EAE2D7] border border-[#DACFBF] rounded-xl font-mono text-[#5C4F43]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Institutional Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Department</label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Sem {s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-[#EADFD4]">
                <button type="button" onClick={() => setIsEditOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 CSV Bulk Ingestion Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#F6EDE6] rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-white/60 animate-scale-in text-[#2C2621]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFD4]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-700" />
                <h2 className="text-base font-bold text-[#2C2621]">Bulk Academic CSV Ingestion</h2>
              </div>
              <button onClick={() => { setIsImportOpen(false); setImportResult(null); }} className="text-[#8C7D70] hover:text-[#2C2621]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleImportCSV} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Record Type *</label>
                <select
                  value={importType}
                  onChange={(e) => setImportType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:ring-2 focus:ring-[#8E7B68]"
                >
                  <option value="attendance">Class Attendance (enrollment_no, subject_code, date, status)</option>
                  <option value="assignments">Assignments (enrollment_no, subject_code, title, due_date, submitted, score)</option>
                  <option value="marks">Internal Exam Marks (enrollment_no, subject_code, exam_type, marks_obtained, max_marks)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5C4F43] uppercase tracking-wider mb-1">Select CSV File *</label>
                <input
                  type="file"
                  required
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2.5 bg-white border border-[#DACFBF] rounded-xl text-[#2C2621] focus:outline-none"
                />
              </div>

              {importResult && (
                <div className={`p-4 rounded-2xl text-xs ${importResult.success ? 'bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D]' : 'bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B]'}`}>
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {importResult.success ? <CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> : <AlertCircle className="w-4 h-4 text-[#DC2626]" />}
                    <span>{importResult.success ? 'Ingestion Successful' : 'Ingestion Completed with Errors'}</span>
                  </div>
                  <p>Records Imported: <span className="font-mono font-bold">{importResult.records_imported}</span></p>
                  {importResult.errors?.length > 0 && (
                    <ul className="mt-1 list-disc list-inside space-y-0.5 text-[11px]">
                      {importResult.errors.map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-[#EADFD4]">
                <button type="button" onClick={() => { setIsImportOpen(false); setImportResult(null); }} className="btn-secondary">
                  Close
                </button>
                <button type="submit" disabled={importing || !importFile} className="btn-primary">
                  {importing ? 'Processing Ingestion...' : 'Upload & Process CSV'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
