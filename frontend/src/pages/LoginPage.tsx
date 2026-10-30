import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ArrowLeft,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);
  const [copiedRole, setCopiedRole] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Super Admin', email: 'superadmin@student360.edu', pass: 'superadmin123', tag: 'Central CMS' },
    { role: 'Administrator', email: 'admin@student360.edu', pass: 'admin123', tag: 'Registry' },
    { role: 'Head of Dept', email: 'hod.cs@student360.edu', pass: 'hod123', tag: 'CS Oversight' },
    { role: 'Faculty Mentor', email: 'faculty1@student360.edu', pass: 'faculty123', tag: 'Advising' },
    { role: 'Student', email: 'student1@student360.edu', pass: 'student123', tag: '360 Portal' },
  ];

  const handleSelectDemo = (accEmail: string, accPass: string, roleName: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setError('');
    setCopiedRole(roleName);
    setTimeout(() => setCopiedRole(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#1F1B18] text-[#F5EFEB] font-sans selection:bg-[#EADBCE] selection:text-[#2C2621] flex flex-col justify-center items-center py-10 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Ambient Warm Golden Sheen */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-radial from-amber-200/15 via-[#C7B9AA]/10 to-transparent blur-3xl pointer-events-none" />

      {/* Top Breadcrumb to Return Home */}
      <div className="w-full max-w-xl mb-4 flex items-center justify-between text-xs text-[#C5B8AB]">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/15 transition-all text-[11px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </Link>
        <div className="inline-flex items-center gap-1 text-[11px] font-mono text-white/50">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
          <span>Deterministic Auth 256-bit</span>
        </div>
      </div>

      {/* 🌟 MAIN CASHMERE & PORCELAIN CONTAINER */}
      <div className="w-full max-w-xl p-2 sm:p-3 rounded-[34px] sm:rounded-[44px] bg-gradient-to-b from-[#C4B5A5]/70 via-[#B09F8F]/50 to-[#998777]/60 border border-white/35 shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
        <div className="relative rounded-[28px] sm:rounded-[38px] bg-gradient-to-b from-[#978676] via-[#9F8C7B] to-[#8C7B6D] p-6 sm:p-10 overflow-hidden">
          
          {/* Ethereal Silk Curve in Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <svg
              className="w-full h-full object-cover min-w-[500px] opacity-80"
              viewBox="0 0 600 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <defs>
                <filter id="loginSilkBlur" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="10" result="blur1" />
                  <feMerge>
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M -50 200 C 150 260, 300 280, 420 230 C 520 190, 600 110, 680 70"
                stroke="#FFF4E6"
                strokeWidth="20"
                strokeOpacity="0.18"
                filter="url(#loginSilkBlur)"
              />
              <path
                d="M -50 200 C 150 260, 300 280, 420 230 C 520 190, 600 110, 680 70"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                filter="url(#loginSilkBlur)"
              />
            </svg>
          </div>

          {/* Header & Logo */}
          <div className="relative z-10 text-center mb-7">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white text-[#2C2621] shadow-lg shadow-black/15 mb-3.5">
              <GraduationCap className="w-6 h-6 text-[#2C2621]" />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-white/40 bg-white/10 text-[10px] uppercase tracking-widest text-white/95 font-medium mb-2.5">
              <span>SECURE ACCESS PORTAL</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              Start your journey
            </h1>
            <p className="mt-1 text-xs text-[#EAE2D7] max-w-sm mx-auto">
              Access the Student360 early-warning intelligence and retention governance platform.
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
                <label className="block text-[11px] font-bold text-[#5C4F43] uppercase tracking-wider mb-1.5">
                  Institutional Email
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A7B6D]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3.5 py-2.5 text-xs bg-white/90 border border-[#DACFBF] rounded-xl text-[#2C2621] placeholder-[#A69788] focus:outline-none focus:ring-2 focus:ring-[#8E7B68] focus:border-transparent transition-all"
                    placeholder="advisor@apex.edu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5C4F43] uppercase tracking-wider mb-1.5">
                  Security Password
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A7B6D]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3.5 py-2.5 text-xs bg-white/90 border border-[#DACFBF] rounded-xl text-[#2C2621] placeholder-[#A69788] focus:outline-none focus:ring-2 focus:ring-[#8E7B68] focus:border-transparent transition-all"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#2C2621] hover:bg-[#3E342D] text-white text-xs font-semibold shadow-md shadow-black/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter Governance Portal</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Role Autofill Chips */}
            <div className="mt-6 pt-5 border-t border-[#E5DACD]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A6D61] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>One-Click Role Demonstration</span>
                </span>
                {copiedRole && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Loaded {copiedRole}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectDemo(acc.email, acc.pass, acc.role)}
                    className="text-left px-2.5 py-2 rounded-xl bg-white/70 hover:bg-white border border-[#DACFBF] text-[11px] text-[#2C2621] transition-all hover:shadow-xs group"
                  >
                    <div className="font-semibold truncate text-[#2C2621] group-hover:text-amber-800">
                      {acc.role}
                    </div>
                    <div className="text-[9px] text-[#8C7D70] font-mono truncate">
                      {acc.tag}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Student Registration Callout */}
            <div className="mt-5 pt-4 border-t border-[#E5DACD] text-center text-xs text-[#6F6255]">
              Enrolled student without an account?{' '}
              <Link to="/register" className="font-bold text-[#2C2621] hover:text-amber-800 underline transition-colors">
                Register Student 360
              </Link>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
