import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../lib/api';
import {
  GraduationCap,
  ArrowRight,
  Mail,
  Lock,
  User,
  Hash,
  Building,
  Calendar,
  Phone,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerStudent } = useAuth();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    enrollment_no: '',
    department_id: '',
    semester: 3,
    admission_year: 2024,
    phone: '',
  });

  useEffect(() => {
    authAPI.publicDepartments()
      .then((res) => {
        setDepartments(res.data);
        if (res.data.length > 0) {
          setForm((prev) => ({ ...prev, department_id: String(res.data[0].id) }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (!form.department_id) {
      setError('Please select your academic department.');
      return;
    }

    setLoading(true);
    try {
      await registerStudent({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        enrollment_no: form.enrollment_no,
        department_id: Number(form.department_id),
        semester: Number(form.semester),
        admission_year: Number(form.admission_year),
        phone: form.phone || null,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1B18] text-[#F5EFEB] font-sans selection:bg-[#EADBCE] selection:text-[#2C2621] flex flex-col justify-center items-center py-10 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Ambient Warm Golden Sheen */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-radial from-amber-200/15 via-[#C7B9AA]/10 to-transparent blur-3xl pointer-events-none" />

      {/* Top Breadcrumb */}
      <div className="w-full max-w-xl mb-4 flex items-center justify-between text-xs text-[#C5B8AB]">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/15 transition-all text-[11px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Signin</span>
        </Link>
        <div className="inline-flex items-center gap-1 text-[11px] font-mono text-white/50">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
          <span>Student Self-Service Portal</span>
        </div>
      </div>

      {/* 🌟 MAIN CASHMERE & PORCELAIN CONTAINER */}
      <div className="w-full max-w-xl p-2 sm:p-3 rounded-[34px] sm:rounded-[44px] bg-gradient-to-b from-[#C4B5A5]/70 via-[#B09F8F]/50 to-[#998777]/60 border border-white/35 shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
        <div className="relative rounded-[28px] sm:rounded-[38px] bg-gradient-to-b from-[#978676] via-[#9F8C7B] to-[#8C7B6D] p-6 sm:p-10 overflow-hidden">
          
          {/* Header & Emblem */}
          <div className="relative z-10 text-center mb-7">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white text-[#2C2621] shadow-lg shadow-black/15 mb-3.5">
              <GraduationCap className="w-6 h-6 text-[#2C2621]" />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-white/40 bg-white/10 text-[10px] uppercase tracking-widest text-white/95 font-medium mb-2.5">
              <span>NEW ENROLLMENT REGISTRATION</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              Create Student Account
            </h1>
            <p className="mt-1 text-xs text-[#EAE2D7] max-w-sm mx-auto">
              Link your enrollment to access transparent 360 metrics, remedial contracts, and recovery goals.
            </p>
          </div>

          {/* 🌟 FLOATING PORCELAIN FORM CARD */}
          <div className="relative z-10 rounded-3xl bg-[#F6EDE6] p-6 sm:p-8 text-[#2C2621] shadow-xl shadow-black/15 border border-white/60">
            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[11px] font-bold text-[#5C4F43] uppercase tracking-wider mb-1">
                  Full Legal Name *
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A7B6D]">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="block w-full pl-10 pr-3.5 py-2.5 text-xs bg-white/90 border border-[#DACFBF] rounded-xl text-[#2C2621] placeholder-[#A69788] focus:outline-none focus:ring-2 focus:ring-[#8E7B68] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#5C4F43] uppercase tracking-wider mb-1">
                    Institutional Email *
                  </label>
                  <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A7B6D]">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="student@apex.edu"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="block w-full pl-10 pr-3.5 py-2.5 text-xs bg-white/90 border border-[#DACFBF] rounded-xl text-[#2C2621] placeholder-[#A69788] focus:outline-none focus:ring-2 focus:ring-[#8E7B68] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5C4F43] uppercase tracking-wider mb-1">
                    Enrollment Number *
                  </label>
                  <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A7B6D]">
                      <Hash className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS-2023-014"
                      value={form.enrollment_no}
                      onChange={(e) => setForm({ ...form, enrollment_no: e.target.value.toUpperCase() })}
                      className="block w-full pl-10 pr-3.5 py-2.5 text-xs bg-white/90 border border-[#DACFBF] rounded-xl text-[#2C2621] placeholder-[#A69788] font-mono focus:outline-none focus:ring-2 focus:ring-[#8E7B68] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#5C4F43] uppercase tracking-wider mb-1">
                    Department *
                  </label>
                  <select
                    value={form.department_id}
                    onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                    className="block w-full px-3 py-2.5 text-xs bg-white/90 border border-[#DACFBF] rounded-xl text-[#2C2621] focus:outline-none focus:ring-2 focus:ring-[#8E7B68] focus:border-transparent transition-all"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5C4F43] uppercase tracking-wider mb-1">
                    Semester *
                  </label>
                  <select
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                    className="block w-full px-3 py-2.5 text-xs bg-white/90 border border-[#DACFBF] rounded-xl text-[#2C2621] focus:outline-none focus:ring-2 focus:ring-[#8E7B68] focus:border-transparent transition-all"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5C4F43] uppercase tracking-wider mb-1">
                    Admission Year *
                  </label>
                  <input
                    type="number"
                    value={form.admission_year}
                    onChange={(e) => setForm({ ...form, admission_year: Number(e.target.value) })}
                    className="block w-full px-3 py-2.5 text-xs bg-white/90 border border-[#DACFBF] rounded-xl text-[#2C2621] focus:outline-none focus:ring-2 focus:ring-[#8E7B68] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5C4F43] uppercase tracking-wider mb-1">
                  Contact Phone (Optional)
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A7B6D]">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="block w-full pl-10 pr-3.5 py-2.5 text-xs bg-white/90 border border-[#DACFBF] rounded-xl text-[#2C2621] placeholder-[#A69788] focus:outline-none focus:ring-2 focus:ring-[#8E7B68] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-[#5C4F43] uppercase tracking-wider mb-1">
                    Account Password *
                  </label>
                  <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A7B6D]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="block w-full pl-10 pr-3.5 py-2.5 text-xs bg-white/90 border border-[#DACFBF] rounded-xl text-[#2C2621] placeholder-[#A69788] focus:outline-none focus:ring-2 focus:ring-[#8E7B68] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5C4F43] uppercase tracking-wider mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A7B6D]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={form.confirm_password}
                      onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                      className="block w-full pl-10 pr-3.5 py-2.5 text-xs bg-white/90 border border-[#DACFBF] rounded-xl text-[#2C2621] placeholder-[#A69788] focus:outline-none focus:ring-2 focus:ring-[#8E7B68] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 px-4 rounded-xl bg-[#2C2621] hover:bg-[#3E342D] text-white text-xs font-semibold shadow-md shadow-black/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Complete Enrollment & Enter Portal</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-[#E5DACD] text-center text-xs text-[#6F6255]">
              Already registered your student account?{' '}
              <Link to="/login" className="font-bold text-[#2C2621] hover:text-amber-800 underline transition-colors">
                Sign In
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
