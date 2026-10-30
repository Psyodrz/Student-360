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
  ChevronDown
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);
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
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Super Admin', email: 'superadmin@student360.edu', pass: 'superadmin123', desc: 'Central CMS authority' },
    { role: 'Administrator', email: 'admin@student360.edu', pass: 'admin123', desc: 'Operations & records' },
    { role: 'Head of Dept (CS)', email: 'hod.cs@student360.edu', pass: 'hod123', desc: 'Department oversight' },
    { role: 'Faculty Mentor', email: 'faculty1@student360.edu', pass: 'faculty123', desc: 'Mentorship & interventions' },
    { role: 'Student', email: 'student1@student360.edu', pass: 'student123', desc: 'Personal 360 portal' },
  ];

  const handleSelectDemo = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setError('');
    setShowDemoDropdown(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,53,15,0.18),rgba(2,6,23,0))]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-academic-500 to-academic-700 text-oxford-950 shadow-lg shadow-academic-900/40 mb-3 ring-1 ring-academic-400/40">
          <GraduationCap className="w-7 h-7 text-oxford-950" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Student<span className="text-academic-400">360</span>
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Academic Early-Warning & Intervention Intelligence Platform
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-risk-50 border border-risk-200 text-risk-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-risk-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Institutional Email
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-oxford-800 focus:border-oxford-800 placeholder-slate-400"
                  placeholder="name@student360.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-oxford-800 focus:border-oxford-800 placeholder-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 btn-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Student Registration Callout */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              New student?{' '}
              <Link to="/register" className="font-semibold text-oxford-900 hover:text-academic-700 underline transition-colors">
                Create Student Account
              </Link>
            </p>
          </div>

          {/* Discreet Demo Autofill Helper (Collapsed by default so it never clutters) */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDemoDropdown(!showDemoDropdown)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-academic-600" />
                  <span>Testing Demo Accounts? Quick Autofill</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDemoDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDemoDropdown && (
                <div className="mt-2 space-y-1 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleSelectDemo(acc.email, acc.pass)}
                      className="w-full flex items-center justify-between p-2 rounded hover:bg-white text-left transition-colors border border-transparent hover:border-slate-200"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 block text-[11px]">{acc.role}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{acc.email}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-academic-700 bg-academic-50 px-2 py-0.5 rounded border border-academic-200">
                        Fill
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
