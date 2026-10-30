import React, { useState, useEffect } from 'react';
import { cmsAPI, analyticsAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import {
  ShieldCheck,
  Users,
  Building,
  BookOpen,
  Settings,
  Bell,
  Sliders,
  History,
  PlusCircle,
  Edit,
  Trash2,
  RefreshCw,
  RotateCcw,
  Save,
  CheckCircle,
  AlertCircle,
  X,
  Search,
  KeyRound,
  FileText,
  SlidersHorizontal
} from 'lucide-react';

export default function CMSPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'depts' | 'subjects' | 'settings' | 'announcements' | 'risk' | 'audit'>('users');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tab Data States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [deptsList, setDeptsList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [settingsList, setSettingsList] = useState<any[]>([]);
  const [announcementsList, setAnnouncementsList] = useState<any[]>([]);
  const [riskConfig, setRiskConfig] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Search/Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  // Modals
  const [modalType, setModalType] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Form States
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'faculty',
    department_id: '',
    is_active: true,
  });

  const [deptForm, setDeptForm] = useState({ name: '', code: '' });
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    department_id: '',
    semester: 3,
    credits: 3,
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'normal',
    is_active: true,
  });

  const notify = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  // Fetch data per active tab
  const refreshTab = () => {
    setLoading(true);
    if (activeTab === 'users') {
      const params: any = {};
      if (userSearch) params.search = userSearch;
      if (userRoleFilter) params.role = userRoleFilter;
      cmsAPI.users(params)
        .then((res) => setUsersList(res.data))
        .catch((err) => notify('error', 'Failed to fetch users'))
        .finally(() => setLoading(false));
    } else if (activeTab === 'depts') {
      cmsAPI.departments()
        .then((res) => setDeptsList(res.data))
        .catch((err) => notify('error', 'Failed to fetch departments'))
        .finally(() => setLoading(false));
    } else if (activeTab === 'subjects') {
      cmsAPI.subjects()
        .then((res) => setSubjectsList(res.data))
        .catch((err) => notify('error', 'Failed to fetch subjects'))
        .finally(() => setLoading(false));
    } else if (activeTab === 'settings') {
      cmsAPI.getSettings()
        .then((res) => setSettingsList(res.data))
        .catch((err) => notify('error', 'Failed to fetch settings'))
        .finally(() => setLoading(false));
    } else if (activeTab === 'announcements') {
      cmsAPI.announcements()
        .then((res) => setAnnouncementsList(res.data))
        .catch((err) => notify('error', 'Failed to fetch announcements'))
        .finally(() => setLoading(false));
    } else if (activeTab === 'risk') {
      cmsAPI.getRiskConfig()
        .then((res) => setRiskConfig(res.data))
        .catch((err) => notify('error', 'Failed to fetch risk configuration'))
        .finally(() => setLoading(false));
    } else if (activeTab === 'audit') {
      cmsAPI.auditLogs()
        .then((res) => setAuditLogs(res.data.logs))
        .catch((err) => notify('error', 'Failed to fetch audit logs'))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    refreshTab();
  }, [activeTab, userRoleFilter]);

  // Load departments for select dropdowns once
  useEffect(() => {
    cmsAPI.departments().then((res) => setDeptsList(res.data)).catch(() => {});
  }, []);

  // ── USER HANDLERS ──
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await cmsAPI.updateUser(selectedItem.id, {
          full_name: userForm.full_name,
          email: userForm.email,
          role: userForm.role,
          department_id: userForm.department_id ? Number(userForm.department_id) : null,
          is_active: userForm.is_active,
          ...(userForm.password ? { password: userForm.password } : {}),
        });
        notify('success', `User ${userForm.email} updated successfully`);
      } else {
        await cmsAPI.createUser({
          ...userForm,
          department_id: userForm.department_id ? Number(userForm.department_id) : null,
        });
        notify('success', `User ${userForm.email} created successfully`);
      }
      setModalType(null);
      setSelectedItem(null);
      refreshTab();
    } catch (err: any) {
      notify('error', err.response?.data?.detail || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (u: any) => {
    if (!window.confirm(`Delete user ${u.email} permanently?`)) return;
    try {
      await cmsAPI.deleteUser(u.id);
      notify('success', 'User deleted');
      refreshTab();
    } catch (err: any) {
      notify('error', err.response?.data?.detail || 'Cannot delete user');
    }
  };

  // ── DEPARTMENT HANDLERS ──
  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await cmsAPI.updateDepartment(selectedItem.id, deptForm);
        notify('success', 'Department updated');
      } else {
        await cmsAPI.createDepartment(deptForm);
        notify('success', 'Department created');
      }
      setModalType(null);
      setSelectedItem(null);
      refreshTab();
    } catch (err: any) {
      notify('error', err.response?.data?.detail || 'Department operation failed');
    }
  };

  const handleDeleteDept = async (d: any) => {
    if (!window.confirm(`Delete department ${d.name} (${d.code})?`)) return;
    try {
      await cmsAPI.deleteDepartment(d.id);
      notify('success', 'Department removed');
      refreshTab();
    } catch (err: any) {
      notify('error', err.response?.data?.detail || 'Cannot delete department');
    }
  };

  // ── SUBJECT HANDLERS ──
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...subjectForm,
        department_id: Number(subjectForm.department_id),
        semester: Number(subjectForm.semester),
        credits: Number(subjectForm.credits),
      };
      if (selectedItem) {
        await cmsAPI.updateSubject(selectedItem.id, payload);
        notify('success', 'Subject updated');
      } else {
        await cmsAPI.createSubject(payload);
        notify('success', 'Subject created');
      }
      setModalType(null);
      setSelectedItem(null);
      refreshTab();
    } catch (err: any) {
      notify('error', err.response?.data?.detail || 'Subject operation failed');
    }
  };

  const handleDeleteSubject = async (s: any) => {
    if (!window.confirm(`Delete subject ${s.name} (${s.code}) and all records?`)) return;
    try {
      await cmsAPI.deleteSubject(s.id);
      notify('success', 'Subject deleted');
      refreshTab();
    } catch (err: any) {
      notify('error', err.response?.data?.detail || 'Failed to delete subject');
    }
  };

  // ── SETTINGS HANDLERS ──
  const handleSettingChange = (index: number, val: string) => {
    const updated = [...settingsList];
    updated[index].value = val;
    setSettingsList(updated);
  };

  const handleSaveAllSettings = async () => {
    try {
      await cmsAPI.updateSettings(settingsList);
      notify('success', 'System settings saved and applied');
    } catch (err: any) {
      notify('error', 'Failed to update settings');
    }
  };

  // ── ANNOUNCEMENTS HANDLERS ──
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await cmsAPI.updateAnnouncement(selectedItem.id, announcementForm);
        notify('success', 'Announcement updated');
      } else {
        await cmsAPI.createAnnouncement(announcementForm);
        notify('success', 'Announcement published');
      }
      setModalType(null);
      setSelectedItem(null);
      refreshTab();
    } catch (err: any) {
      notify('error', err.response?.data?.detail || 'Announcement error');
    }
  };

  const handleDeleteAnnouncement = async (a: any) => {
    if (!window.confirm(`Delete announcement "${a.title}"?`)) return;
    try {
      await cmsAPI.deleteAnnouncement(a.id);
      notify('success', 'Announcement deleted');
      refreshTab();
    } catch (err: any) {
      notify('error', 'Failed to delete announcement');
    }
  };

  // ── RISK CONFIG HANDLERS ──
  const handleSaveRiskConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await cmsAPI.updateRiskConfig(riskConfig);
      notify('success', 'Risk engine thresholds updated successfully');
    } catch (err: any) {
      notify('error', 'Failed to update risk config');
    }
  };

  // ── BULK SYSTEM ACTIONS ──
  const handleBulkRecalculate = async () => {
    try {
      const res = await cmsAPI.recalculateAll();
      notify('success', res.data.message);
    } catch (err: any) {
      notify('error', 'Recalculation error');
    }
  };

  const handleResetDatabase = async () => {
    const confirmText = prompt('WARNING: This will purge all synthetic data and re-seed from scratch. Type "RESET" to confirm:');
    if (confirmText !== 'RESET') return;
    setLoading(true);
    try {
      const res = await cmsAPI.resetDatabase();
      notify('success', res.data.message);
      refreshTab();
    } catch (err: any) {
      notify('error', 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Super Admin Authority */}
      <div className="card-surface p-5 bg-gradient-to-r from-oxford-950 via-oxford-900 to-oxford-950 text-white border-l-4 border-academic-500 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-academic-500/20 border border-academic-400/40 flex items-center justify-center text-academic-300">
              <ShieldCheck className="w-6 h-6 text-academic-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Central Content Management System (CMS)
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-academic-600 text-oxford-950">
                  Super Admin Exclusive
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Full administrative read, write, edit, and purge authority across the entire platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkRecalculate}
              className="btn-secondary text-xs bg-oxford-800 text-white border-oxford-700 hover:bg-oxford-700"
            >
              <RefreshCw className="w-3.5 h-3.5 text-academic-400" />
              <span>Bulk Recalculate</span>
            </button>
            <button
              onClick={handleResetDatabase}
              className="btn-danger text-xs bg-risk-700 hover:bg-risk-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Database</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Status Notification */}
      {msg && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm ${msg.type === 'success' ? 'bg-emerald-50 border border-emerald-300 text-emerald-800' : 'bg-risk-50 border border-risk-300 text-risk-800'}`}>
          {msg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-risk-600" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* CMS Navigation Tabs */}
      <div className="border-b border-[#EADFD4]">
        <nav className="flex space-x-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'users', label: 'Users & Roles', icon: Users },
            { id: 'depts', label: 'Departments', icon: Building },
            { id: 'subjects', label: 'Curriculum & Subjects', icon: BookOpen },
            { id: 'settings', label: 'Site Settings & Branding', icon: Settings },
            { id: 'announcements', label: 'Broadcast Announcements', icon: Bell },
            { id: 'risk', label: 'Risk Engine Thresholds', icon: SlidersHorizontal },
            { id: 'audit', label: 'System Audit Trail', icon: History },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-2 py-2.5 px-3.5 font-bold rounded-t-2xl transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-amber-600 text-[#2C2621] bg-[#F6EDE6] shadow-xs'
                    : 'border-transparent text-[#7A6D61] hover:text-[#2C2621] hover:bg-[#F4EAE1]/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-700' : 'text-[#8C7D70]'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ──────────────────────── TAB 1: USERS & ROLES ──────────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="card-surface p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && refreshTab()}
                className="w-full text-xs border border-slate-300 rounded-md py-1.5 px-3"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-md py-1.5 px-3 bg-white"
              >
                <option value="">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="hod">HOD</option>
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
              </select>
              <button
                onClick={() => {
                  setUserForm({ email: '', password: '', full_name: '', role: 'faculty', department_id: '', is_active: true });
                  setSelectedItem(null);
                  setModalType('user');
                }}
                className="btn-primary text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create User</span>
              </button>
            </div>
          </div>

          <div className="card-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase bg-slate-50">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4 text-center">Role</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{u.full_name}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{u.email}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'super_admin' ? 'bg-academic-600 text-white' :
                          u.role === 'admin' ? 'bg-oxford-800 text-white' :
                          u.role === 'hod' ? 'bg-blue-100 text-blue-800' :
                          u.role === 'faculty' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-amber-100 text-amber-900'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {u.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedItem(u);
                              setUserForm({
                                email: u.email,
                                password: '',
                                full_name: u.full_name,
                                role: u.role,
                                department_id: u.department_id || '',
                                is_active: u.is_active,
                              });
                              setModalType('user');
                            }}
                            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            title="Edit User"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {u.id !== user?.id && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────── TAB 2: DEPARTMENTS ──────────────────────── */}
      {activeTab === 'depts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Academic Divisions</h2>
              <p className="text-xs text-slate-500">Manage institutional departments and faculty allocations</p>
            </div>
            <button
              onClick={() => {
                setDeptForm({ name: '', code: '' });
                setSelectedItem(null);
                setModalType('dept');
              }}
              className="btn-primary text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Department</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deptsList.map((d) => (
              <div key={d.id} className="card-surface p-5 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded font-bold bg-oxford-900 text-white">
                    {d.code}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedItem(d);
                        setDeptForm({ name: d.name, code: d.code });
                        setModalType('dept');
                      }}
                      className="p-1 text-slate-500 hover:text-slate-800"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDept(d)}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{d.name}</h3>
                  <div className="mt-2 text-xs text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Total Students:</span>
                      <span className="font-semibold text-slate-800">{d.student_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Faculty Members:</span>
                      <span className="font-semibold text-slate-800">{d.faculty_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subjects Offered:</span>
                      <span className="font-semibold text-slate-800">{d.subject_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────── TAB 3: CURRICULUM & SUBJECTS ──────────────────────── */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Curriculum Catalog</h2>
              <p className="text-xs text-slate-500">Manage subjects, credit allocations, and semester schedules</p>
            </div>
            <button
              onClick={() => {
                setSubjectForm({ name: '', code: '', department_id: deptsList[0]?.id || '', semester: 3, credits: 3 });
                setSelectedItem(null);
                setModalType('subject');
              }}
              className="btn-primary text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </button>
          </div>

          <div className="card-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase bg-slate-50">
                    <th className="py-3 px-4">Subject Code</th>
                    <th className="py-3 px-4">Subject Name</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4 text-center">Semester</th>
                    <th className="py-3 px-4 text-center">Credits</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjectsList.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{s.name}</td>
                      <td className="py-3 px-4 text-slate-600">{s.department_name}</td>
                      <td className="py-3 px-4 text-center font-mono">Sem {s.semester}</td>
                      <td className="py-3 px-4 text-center font-mono">{s.credits} Credits</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedItem(s);
                              setSubjectForm({
                                name: s.name,
                                code: s.code,
                                department_id: s.department_id,
                                semester: s.semester,
                                credits: s.credits,
                              });
                              setModalType('subject');
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(s)}
                            className="p-1 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────── TAB 4: SITE SETTINGS ──────────────────────── */}
      {activeTab === 'settings' && (
        <div className="card-surface p-6 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Institutional Branding & Global Parameters
              </h2>
              <p className="text-xs text-slate-500">Configure public headers, term calendars, and institutional credentials</p>
            </div>
            <button onClick={handleSaveAllSettings} className="btn-primary text-xs">
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {settingsList.map((st, i) => (
              <div key={st.key} className="space-y-1.5 text-xs">
                <label className="font-semibold text-slate-700 block">
                  {st.label || st.key}
                </label>
                {st.value_type === 'boolean' ? (
                  <select
                    value={st.value}
                    onChange={(e) => handleSettingChange(i, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-xs"
                  >
                    <option value="true">Enabled (True)</option>
                    <option value="false">Disabled (False)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={st.value || ''}
                    onChange={(e) => handleSettingChange(i, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-oxford-800"
                  />
                )}
                <span className="text-[10px] text-slate-400 font-mono">Key: {st.key}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────── TAB 5: ANNOUNCEMENTS ──────────────────────── */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Campus Broadcast Notices</h2>
              <p className="text-xs text-slate-500">Publish urgent banners and notifications across the website</p>
            </div>
            <button
              onClick={() => {
                setAnnouncementForm({ title: '', content: '', priority: 'normal', is_active: true });
                setSelectedItem(null);
                setModalType('announcement');
              }}
              className="btn-primary text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Broadcast Notice</span>
            </button>
          </div>

          <div className="space-y-3">
            {announcementsList.map((a) => (
              <div key={a.id} className="card-surface p-4 border border-slate-200 flex items-start justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${a.priority === 'urgent' ? 'bg-risk-600 text-white' : 'bg-oxford-800 text-white'}`}>
                      {a.priority}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{a.title}</h3>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${a.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                      {a.is_active ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{a.content}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedItem(a);
                      setAnnouncementForm({
                        title: a.title,
                        content: a.content,
                        priority: a.priority,
                        is_active: a.is_active,
                      });
                      setModalType('announcement');
                    }}
                    className="p-1 text-slate-500 hover:text-slate-800"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAnnouncement(a)}
                    className="p-1 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────── TAB 6: RISK CONFIGURATION ──────────────────────── */}
      {activeTab === 'risk' && riskConfig && (
        <div className="card-surface p-6 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Risk Engine Calibration & Mathematical Thresholds
              </h2>
              <p className="text-xs text-slate-500">Fine-tune weights and cutoff boundaries for deterministic early warnings</p>
            </div>
            <button onClick={handleSaveRiskConfig} className="btn-primary text-xs">
              <Save className="w-3.5 h-3.5" />
              <span>Update Risk Parameters</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">
                Threshold Triggers
              </h3>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Attendance Warning Threshold (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={riskConfig.attendance_threshold}
                  onChange={(e) => setRiskConfig({ ...riskConfig, attendance_threshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
                <span className="text-[10px] text-slate-400">Default: 75.0%. Penalty triggers below this percentage.</span>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Academic Passing Mark Threshold (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={riskConfig.academic_threshold}
                  onChange={(e) => setRiskConfig({ ...riskConfig, academic_threshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
                <span className="text-[10px] text-slate-400">Default: 60.0%. Academic penalty triggers below this percentage.</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">
                Mathematical Component Weights (Must sum to 1.0)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Attendance W_att</label>
                  <input
                    type="number"
                    step="0.05"
                    value={riskConfig.risk_weight_attendance}
                    onChange={(e) => setRiskConfig({ ...riskConfig, risk_weight_attendance: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                  <span className="text-[10px] text-slate-400">e.g. 0.35</span>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assignment W_asg</label>
                  <input
                    type="number"
                    step="0.05"
                    value={riskConfig.risk_weight_assignment}
                    onChange={(e) => setRiskConfig({ ...riskConfig, risk_weight_assignment: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                  <span className="text-[10px] text-slate-400">e.g. 0.25</span>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Academic W_aca</label>
                  <input
                    type="number"
                    step="0.05"
                    value={riskConfig.risk_weight_academic}
                    onChange={(e) => setRiskConfig({ ...riskConfig, risk_weight_academic: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                  <span className="text-[10px] text-slate-400">e.g. 0.40</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded border text-[11px] text-slate-600">
                Formula: <code>R = (W_att * A) + (W_asg * B) + (W_aca * C)</code>. Current sum: {(riskConfig.risk_weight_attendance + riskConfig.risk_weight_assignment + riskConfig.risk_weight_academic).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────── TAB 7: AUDIT TRAIL ──────────────────────── */}
      {activeTab === 'audit' && (
        <div className="card-surface overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Cryptographic & Administrative Audit Trail
            </h2>
            <p className="text-xs text-slate-500">Tamper-evident record of all create, update, and delete events across Student360</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase bg-slate-50">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Audit Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-400">No audit logs recorded yet.</td></tr>
                ) : (
                  auditLogs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 text-slate-500">{l.created_at}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{l.user_email || 'System'}</td>
                      <td className="py-2.5 px-4 uppercase font-bold text-oxford-800">{l.action}</td>
                      <td className="py-2.5 px-4 text-slate-600">{l.entity_type} {l.entity_id ? `#${l.entity_id}` : ''}</td>
                      <td className="py-2.5 px-4 text-slate-500 truncate max-w-xs">{JSON.stringify(l.details || {})}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────── USER MODAL ──────────────────────── */}
      {modalType === 'user' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                {selectedItem ? 'Edit User Record' : 'Create User Account'}
              </h2>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institutional Email *</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {selectedItem ? 'Reset Password (Leave blank to keep current)' : 'Account Password *'}
                </label>
                <input
                  type="password"
                  required={!selectedItem}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  placeholder={selectedItem ? '••••••••' : 'Password123'}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">System Role *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white font-medium"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="hod">HOD</option>
                    <option value="faculty">Faculty</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={userForm.department_id}
                    onChange={(e) => setUserForm({ ...userForm, department_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                  >
                    <option value="">None / All</option>
                    {deptsList.map((d) => (
                      <option key={d.id} value={d.id}>{d.code}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={userForm.is_active}
                  onChange={(e) => setUserForm({ ...userForm, is_active: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <label htmlFor="activeCheck" className="text-xs font-semibold text-slate-700">
                  Account Active and Enabled
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setModalType(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────── DEPT MODAL ──────────────────────── */}
      {modalType === 'dept' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                {selectedItem ? 'Edit Department' : 'New Department'}
              </h2>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveDept} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & Data Science"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setModalType(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────── SUBJECT MODAL ──────────────────────── */}
      {modalType === 'subject' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                {selectedItem ? 'Edit Subject' : 'Add Subject'}
              </h2>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSubject} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neural Networks & Deep Learning"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS601"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    required
                    value={subjectForm.department_id}
                    onChange={(e) => setSubjectForm({ ...subjectForm, department_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                  >
                    <option value="">Select Dept</option>
                    {deptsList.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={subjectForm.semester}
                    onChange={(e) => setSubjectForm({ ...subjectForm, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm({ ...subjectForm, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setModalType(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────── ANNOUNCEMENT MODAL ──────────────────────── */}
      {modalType === 'announcement' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                {selectedItem ? 'Edit Announcement' : 'Publish Campus Broadcast'}
              </h2>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAnnouncement} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Intervention Advisory"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Broadcast Content *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed notification message visible across the platform..."
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
                  <select
                    value={announcementForm.priority}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent Banner</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <input
                    type="checkbox"
                    id="annActive"
                    checked={announcementForm.is_active}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, is_active: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  <label htmlFor="annActive" className="ml-2 text-xs font-semibold text-slate-700">
                    Live Broadcast Active
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setModalType(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

