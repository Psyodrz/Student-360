import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  TrendingDown,
  Sliders,
  Users,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Building,
  AlertTriangle,
  Award,
  Layers,
  ChevronRight,
  Lock,
  Compass
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Institutional Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-academic-500 to-academic-700 flex items-center justify-center text-oxford-950 font-black shadow-md shadow-academic-900/30">
              <GraduationCap className="w-5 h-5 text-oxford-950" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1">
                Student<span className="text-academic-700">360</span>
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold -mt-0.5">
                Apex Institute of Higher Technology
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#formula" className="hover:text-oxford-900 transition-colors">Risk Engine</a>
            <a href="#features" className="hover:text-oxford-900 transition-colors">Platform Modules</a>
            <a href="#roles" className="hover:text-oxford-900 transition-colors">Role Architecture</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-md transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="btn-primary text-xs py-1.5 px-4 shadow-sm"
            >
              Student Portal
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-oxford-950 text-white py-20 lg:py-28 bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(217,119,6,0.18),rgba(2,6,23,1))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-academic-600/20 border border-academic-400/40 text-academic-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-academic-400" />
            <span>Deterministic Academic Intelligence Framework</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Early Academic Intervention & Retention Governance Platform
          </h1>

          <p className="mt-6 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Eliminate student dropouts with explainable multi-signal telemetry. Powered by open mathematical risk modeling, automated trend detection, and simulated remedial trajectories.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to="/login"
              className="btn-accent px-6 py-2.5 text-sm font-semibold shadow-md"
            >
              <span>Access Institutional Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="btn-secondary px-6 py-2.5 text-sm font-semibold bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <span>New Student Enrollment</span>
            </Link>
          </div>

          {/* Key Assurance Metric Chips */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-[10px] text-academic-300 font-bold uppercase tracking-wider">Formula Transparency</span>
              <p className="text-sm font-bold text-white mt-0.5">100% Deterministic</p>
              <span className="text-[11px] text-slate-400">Zero Black-Box Guesswork</span>
            </div>
            <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-[10px] text-academic-300 font-bold uppercase tracking-wider">Early Alerts</span>
              <p className="text-sm font-bold text-white mt-0.5">4 Risk Vectors</p>
              <span className="text-[11px] text-slate-400">Attendance & Grade Shifts</span>
            </div>
            <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-[10px] text-academic-300 font-bold uppercase tracking-wider">Governance</span>
              <p className="text-sm font-bold text-white mt-0.5">Central CMS</p>
              <span className="text-[11px] text-slate-400">Super Admin Complete Control</span>
            </div>
            <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-[10px] text-academic-300 font-bold uppercase tracking-wider">Student Care</span>
              <p className="text-sm font-bold text-white mt-0.5">360° Ledgers</p>
              <span className="text-[11px] text-slate-400">Private Student Portal</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Deterministic Risk Equation Breakdown */}
      <section id="formula" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-academic-800 uppercase tracking-wider">
              Transparent Mathematical Modeling
            </h2>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              How Risk Is Computed: Explainable & Auditable
            </p>
            <p className="mt-2 text-xs text-slate-500">
              No black-box machine learning models deciding academic status. Every stakeholder can verify calculations down to the exact examination score and class attendance date.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Factor A */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/60 relative overflow-hidden">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-oxford-900 text-white uppercase tracking-wider">
                Weight: 35%
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-3">Attendance Velocity (A)</h3>
              <p className="text-xs text-slate-600 mt-1">
                Monitors class lecture presence across all enrolled subjects against the statutory 75% quota.
              </p>
              <div className="mt-4 p-3 rounded bg-white border border-slate-200 font-mono text-xs text-slate-800">
                A = max(0, ((75 - att%) / 75) * 100)
              </div>
            </div>

            {/* Factor B */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/60 relative overflow-hidden">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-academic-700 text-white uppercase tracking-wider">
                Weight: 25%
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-3">Coursework Completion (B)</h3>
              <p className="text-xs text-slate-600 mt-1">
                Tracks ongoing assignment submissions, lab exercises, and deadline adherence.
              </p>
              <div className="mt-4 p-3 rounded bg-white border border-slate-200 font-mono text-xs text-slate-800">
                B = 100 - assignment_completion%
              </div>
            </div>

            {/* Factor C */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/60 relative overflow-hidden">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-oxford-900 text-white uppercase tracking-wider">
                Weight: 40%
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-3">Internal Test Marks (C)</h3>
              <p className="text-xs text-slate-600 mt-1">
                Aggregates internal assessments and periodic midterms against the 60% baseline pass mark.
              </p>
              <div className="mt-4 p-3 rounded bg-white border border-slate-200 font-mono text-xs text-slate-800">
                C = max(0, ((60 - marks%) / 60) * 100)
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-oxford-900 text-white text-center font-mono text-xs max-w-xl mx-auto shadow-md">
            Composite Risk Index: <span className="text-academic-400 font-bold">R = 0.35A + 0.25B + 0.40C</span>
            <span className="block text-[11px] text-slate-400 font-sans mt-0.5">
              Low: 0–29 • Medium: 30–59 • High: 60–100
            </span>
          </div>
        </div>
      </section>

      {/* Section: Platform Capabilities */}
      <section id="features" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-academic-800 uppercase tracking-wider">
              Comprehensive Capabilities
            </h2>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Built for Academic Deans, Mentors & Students
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-surface p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-oxford-900 text-academic-400 flex items-center justify-center font-bold">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Algorithmic Trend Alerts (Feature 1)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automatically identifies consecutive attendance declines, progressive drops in test marks, and sudden score drops (&gt;15%) before finals arrive.
              </p>
            </div>

            <div className="card-surface p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-academic-600 text-oxford-950 flex items-center justify-center font-bold">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Recovery Simulator (Feature 2)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interactive "what-if" modeling sandbox for faculty mentors. Slide attendance and assignment goals to instantly recalculate projected risk score mitigation.
              </p>
            </div>

            <div className="card-surface p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-oxford-900 text-academic-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Super Admin CMS</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Centralized command console to add, edit, or purge users, departments, subjects, announcements, site settings, and audit logs with zero technical friction.
              </p>
            </div>

            <div className="card-surface p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Intervention Case Lifecycle</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track formal remedial contracts across four defined states: Pending, In Progress, Completed, and Evaluated with mentor logs and improvement metrics.
              </p>
            </div>

            <div className="card-surface p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Subject-by-Subject Ledgers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full academic history detailing individual course attendance rates, assignment submission scores, and internal test progressions.
              </p>
            </div>

            <div className="card-surface p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Private Student Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated student view providing full transparency into personal standing, statutory attendance quotas, and assigned mentor recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Role Pathways */}
      <section id="roles" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-academic-800 uppercase tracking-wider">
              Role-Based Architecture
            </h2>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Tailored Experiences by Institutional Responsibility
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50 text-left">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-academic-600 text-white uppercase">
                Super Admin
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Central CMS Governance</h4>
              <p className="text-xs text-slate-500 mt-1">
                Full authority over users, curriculum, system risk thresholds, broadcast notices, and audit trails.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50 text-left">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-oxford-800 text-white uppercase">
                Deans & HODs
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Division Telemetry</h4>
              <p className="text-xs text-slate-500 mt-1">
                Cross-departmental comparisons, aggregate risk stratification, and batch CSV records ingestion.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50 text-left">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-white uppercase">
                Faculty Mentors
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Dossiers & Simulator</h4>
              <p className="text-xs text-slate-500 mt-1">
                Inspect individual 360 dossiers, run hypothetical recovery models, and assign remedial interventions.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50 text-left">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-700 text-white uppercase">
                Enrolled Students
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Personal 360 Portal</h4>
              <p className="text-xs text-slate-500 mt-1">
                Check personal attendance percentages, upcoming assignment tasks, and mentor guidance notes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="mt-auto bg-oxford-950 text-slate-400 py-10 border-t border-oxford-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-academic-600 flex items-center justify-center text-oxford-950 font-bold">
              <GraduationCap className="w-3.5 h-3.5 text-oxford-950" />
            </div>
            <span className="font-bold text-white">Student360 Academic Intelligence</span>
          </div>
          <div className="text-center sm:text-right text-[11px] text-slate-500">
            <span>Apex Institute of Higher Technology • Academic Year 2024-2025</span>
            <span className="block mt-0.5">Aligned with Institutional Accreditation & Student Retention Standards</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
