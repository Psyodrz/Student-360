import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Compass,
  Activity,
  Sparkles,
  Cpu,
  FileSpreadsheet,
  Clock,
  ArrowUpRight,
  BarChart3,
  Target,
  Zap,
  Check,
  Search,
  Star,
  Settings,
  Menu,
  X,
  History,
  FileCheck
} from 'lucide-react';
import NoticeBanner from '../components/NoticeBanner';

export default function HomePage() {
  // Mobile Drawer Toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scrollytelling Active Step State
  const [scrollyStep, setScrollyStep] = useState<number>(0);
  const scrollyContainerRef = useRef<HTMLDivElement>(null);

  // Interactive Hero Telemetry Sandbox State
  const [attVal, setAttVal] = useState<number>(68);
  const [asgVal, setAsgVal] = useState<number>(75);
  const [examVal, setExamVal] = useState<number>(55);

  // Active Role Tab State
  const [activeRole, setActiveRole] = useState<'superadmin' | 'dean' | 'faculty' | 'student'>('faculty');

  // Active Student Case Study in Spotlight
  const [selectedCase, setSelectedCase] = useState<number>(0);

  // Real-time Deterministic Calculation for the Telemetry Lab
  const heroRisk = useMemo(() => {
    const A = attVal < 75 ? Math.max(0, ((75 - attVal) / 75) * 100) : 0;
    const B = Math.max(0, 100 - asgVal);
    const C = examVal < 60 ? Math.max(0, ((60 - examVal) / 60) * 100) : 0;
    const score = Math.round((0.35 * A + 0.25 * B + 0.40 * C) * 10) / 10;
    const clamped = Math.min(100, Math.max(0, score));

    let category: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let color = '#2E7D32'; // Forest green
    let bg = '#E8F5E9';
    let border = '#A5D6A7';

    if (clamped >= 65) {
      category = 'HIGH';
      color = '#C62828'; // Crimson
      bg = '#FFEBEE';
      border = '#EF9A9A';
    } else if (clamped >= 35) {
      category = 'MEDIUM';
      color = '#B78103'; // Warm amber
      bg = '#FFF8E1';
      border = '#FFE082';
    }

    return {
      score: clamped,
      category,
      color,
      bg,
      border,
      contribA: Math.round(0.35 * A * 10) / 10,
      contribB: Math.round(0.25 * B * 10) / 10,
      contribC: Math.round(0.40 * C * 10) / 10,
    };
  }, [attVal, asgVal, examVal]);

  // Scrollytelling Narrative Data Chapters
  const scrollyChapters = [
    {
      step: "01",
      week: "Week 03",
      title: "Initial Attendance Deviation Detected",
      description: "Alex's lecture attendance quietly slips from 90% down to 58%, dipping below the statutory 75% institutional quota. Traditional university systems remain silent until finals, but Student360 immediately initiates a telemetry alert.",
      att: 58,
      asg: 85,
      exam: 74,
      risk: 25.4,
      level: "LOW WARNING",
      levelColor: "#B78103",
      levelBg: "#FFF8E1",
      badge: "QUOTA THRESHOLD BREACH",
      insight: "Statutory 75% quota breached. Factor A penalty engaged (+7.9 pts to composite score).",
      action: "System flags student in faculty advisor's weekly digest."
    },
    {
      step: "02",
      week: "Week 06",
      title: "Coursework Incompletion Backlog",
      description: "Compounding missed lectures lead to unsubmitted laboratory exercises. Continuous coursework completion falls to 45%. The multi-dimensional algorithm captures the deficit without waiting for midterms.",
      att: 54,
      asg: 45,
      exam: 70,
      risk: 41.2,
      level: "MODERATE RISK",
      levelColor: "#D97706",
      levelBg: "#FEF3C7",
      badge: "COMPOUNDING HOMEWORK DEFICIT",
      insight: "Coursework submission completion dropped to 45%. Factor B contributes +13.8 risk points.",
      action: "Automated peer-tutoring suggestion generated."
    },
    {
      step: "03",
      week: "Week 09",
      title: "Algorithmic Sudden Drop Alert (>15%)",
      description: "Alex scores 44% on the midterm exam after averaging 68% previously. The automated trend detection engine identifies a -24% sudden performance collapse, crossing the critical >15% volatility alert.",
      att: 52,
      asg: 45,
      exam: 44,
      risk: 74.2,
      level: "CRITICAL RISK",
      levelColor: "#DC2626",
      levelBg: "#FEE2E2",
      badge: "🚨 SUDDEN PERFORMANCE DROP (>15%)",
      insight: "Sudden Performance Drop (-24%) triggers high-priority advisor escalation.",
      action: "Formal remedial intervention case opened automatically."
    },
    {
      step: "04",
      week: "Week 10",
      title: "What-If Recovery Simulator Engaged",
      description: "Rather than issuing a punitive suspension, the faculty mentor meets with Alex and opens the Recovery Simulator. They model what happens if attendance recovers to 80% and the remedial midterm hits 68%.",
      att: 80,
      asg: 75,
      exam: 68,
      risk: 24.5,
      level: "PROJECTED SAFE",
      levelColor: "#059669",
      levelBg: "#D1FAE5",
      badge: "PROVABLE RECOVERY FEASIBILITY",
      insight: "Simulator proves feasibility: an attainable +28% attendance jump eliminates 49.7 risk points.",
      action: "Alex signs customized remedial attendance & tutoring contract."
    },
    {
      step: "05",
      week: "Week 14",
      title: "Intervention Fulfilled & Dropout Prevented",
      description: "Supported by peer mentors and accountable office hours, Alex achieves 82% attendance and scores 72% on the semester final. The case lifecycle advances to Evaluated & Successfully Retained.",
      att: 82,
      asg: 80,
      exam: 72,
      risk: 15.0,
      level: "RETAINED & PASSING",
      levelColor: "#16A34A",
      levelBg: "#DCFCE7",
      badge: "100% RETENTION SUCCESS",
      insight: "Composite risk index lowered to 15.0 (Low Risk). Student fully back on track for graduation.",
      action: "Intervention closed with verified credit clearance."
    }
  ];

  // IntersectionObserver for Scrollytelling narrative step detection
  useEffect(() => {
    const stepElements = document.querySelectorAll('.scrolly-step-card');
    if (!stepElements || stepElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = Number(entry.target.getAttribute('data-step-index'));
            if (!isNaN(stepIndex)) {
              setScrollyStep(stepIndex);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-15% 0px -40% 0px',
        threshold: 0.4
      }
    );

    stepElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const studentCases = [
    {
      name: "Alex Johnson",
      dept: "Computer Science",
      rollNo: "CS-2023-014",
      risk: 76.4,
      level: "HIGH",
      att: 52,
      asg: 45,
      exam: 48,
      trend: "Declining (-19.2% sudden drop)",
      intervention: "Attendance Monitoring & Peer Tutoring",
      status: "In Progress"
    },
    {
      name: "Priya Sharma",
      dept: "Data Science",
      rollNo: "DS-2023-088",
      risk: 48.2,
      level: "MEDIUM",
      att: 68,
      asg: 80,
      exam: 55,
      trend: "Fluctuating (Midterm Deficit)",
      intervention: "Linear Algebra Faculty Office Hours",
      status: "Pending Review"
    },
    {
      name: "Marcus Vance",
      dept: "Electrical Eng",
      rollNo: "EE-2022-031",
      risk: 14.2,
      level: "LOW",
      att: 94,
      asg: 95,
      exam: 88,
      trend: "Consistently Strong (+4.5%)",
      intervention: "Honors Research Assistantship",
      status: "Nominated"
    }
  ];

  return (
    <div className="min-h-screen bg-[#1F1B18] text-[#F5EFEB] font-sans selection:bg-[#EADBCE] selection:text-[#2C2621] overflow-x-hidden p-2 sm:p-5 lg:p-8">
      
      {/* 🌟 Dynamic Campus Notice Ticker (Accessible on Mobile & Desktop) */}
      <NoticeBanner className="mb-3 sm:mb-4 rounded-xl sm:rounded-2xl max-w-7xl mx-auto overflow-hidden" />
      
      {/* ============================================================ */}
      {/* 🌟 HERO CANVAS CONTAINER (MATCHING THE USER REFERENCE DESIGN) */}
      {/* ============================================================ */}
      <div className="relative mx-auto max-w-7xl p-2 sm:p-3 rounded-[32px] sm:rounded-[44px] lg:rounded-[52px] bg-gradient-to-b from-[#C4B5A5]/70 via-[#B09F8F]/50 to-[#998777]/60 border border-white/35 shadow-[0_25px_70px_rgba(0,0,0,0.5)]">
        <div className="relative rounded-[26px] sm:rounded-[38px] lg:rounded-[44px] bg-gradient-to-b from-[#978676] via-[#9F8C7B] to-[#8C7B6D] overflow-hidden">
        
        {/* Ambient Warm Aurora Lighting in Hero */}
        <div className="absolute top-0 right-0 w-[550px] h-[350px] bg-radial from-amber-100/25 via-[#FFF4E8]/10 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[250px] bg-radial from-amber-50/15 via-transparent to-transparent blur-3xl pointer-events-none" />
        
        {/* 🌟 Glowing Curved Silk Ribbon (SVG Bezier Arc with Radial Glow) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <svg
            className="w-full h-full object-cover min-w-[700px] sm:min-w-full opacity-95"
            viewBox="0 0 1200 650"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="silkGlow" x1="0%" y1="60%" x2="100%" y2="30%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.1" />
                <stop offset="35%" stopColor="#FFF9F2" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="85%" stopColor="#FFF3E2" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.15" />
              </linearGradient>

              <filter id="silkBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="16" result="blur1" />
                <feGaussianBlur stdDeviation="6" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glowing Diffused Ambient Under-Curve */}
            <path
              d="M -50 380 C 250 440, 480 470, 680 420 C 880 370, 1050 240, 1250 180"
              stroke="#FFF5E8"
              strokeWidth="32"
              strokeOpacity="0.25"
              filter="url(#silkBlur)"
            />

            {/* Crisp High-Intensity Illuminated Silk Wave */}
            <path
              d="M -50 380 C 250 440, 480 470, 680 420 C 880 370, 1050 240, 1250 180"
              stroke="url(#silkGlow)"
              strokeWidth="4"
              filter="url(#silkBlur)"
            />
          </svg>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* INTEGRATED NAVBAR (MATCHING REFERENCE HEADER) */}
        {/* ------------------------------------------------------------ */}
        <header className="relative z-30 px-6 sm:px-10 lg:px-14 pt-6 sm:pt-8 flex items-center justify-between">
          {/* Logo with Soft Rounded Square */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white flex items-center justify-center text-[#2C2621] shadow-md shadow-black/10 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-5 h-5 text-[#2C2621]" />
            </div>
            <span className="text-base sm:text-lg font-semibold tracking-tight text-white/95 font-sans">
              Student<span className="font-bold">360</span>
            </span>
          </Link>

          {/* Center Links (Clean & Airy) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#E0D7CD] tracking-wide">
            <a href="#scrollytelling" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Interactive Story</span>
            </a>
            <a href="#about" className="hover:text-white transition-colors">Risk Sandbox</a>
            <a href="#formula" className="hover:text-white transition-colors">Equation Audit</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Services</a>
            <a href="#roles" className="hover:text-white transition-colors">Governance</a>
          </nav>

          {/* Right Action: Pill Outlined Signin Button */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-1.5 rounded-full border border-white/35 text-xs font-medium text-white/95 hover:bg-white/10 hover:border-white/60 active:scale-95 transition-all"
            >
              Signin
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden relative z-40 px-6 py-4 mx-6 mt-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/15 space-y-3 animate-fade-in text-xs font-medium">
            <a href="#scrollytelling" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-amber-200 hover:text-white font-semibold">Interactive Scrollytelling Story</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-slate-200 hover:text-white">Risk Simulator Sandbox</a>
            <a href="#formula" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-slate-200 hover:text-white">Deterministic Risk Engine</a>
            <a href="#capabilities" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-slate-200 hover:text-white">Services & Capabilities</a>
            <a href="#roles" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-slate-200 hover:text-white">Institutional Governance</a>
            <div className="pt-2 border-t border-white/10 flex gap-2">
              <Link to="/login" className="flex-1 py-2 text-center rounded-lg bg-white/10 text-white font-semibold">Sign In</Link>
              <Link to="/register" className="flex-1 py-2 text-center rounded-lg bg-white text-[#2C2621] font-semibold">Register</Link>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* CENTER HERO CONTENT (MATCHING REFERENCE COMPOSITION) */}
        {/* ------------------------------------------------------------ */}
        <div className="relative z-20 px-6 sm:px-10 lg:px-14 pt-14 sm:pt-20 lg:pt-24 pb-14 text-center max-w-3xl mx-auto">
          {/* Subtle Pill Outline Badge */}
          <div className="inline-flex items-center justify-center px-4 py-1 rounded-full border border-white/30 bg-white/5 backdrop-blur-xs text-[11px] uppercase tracking-widest text-white/90 font-medium mb-6">
            DISCOVER STUDENT360
          </div>

          {/* Display Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
            Start your journey
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base text-[#E2DACD] leading-relaxed max-w-xl mx-auto font-normal">
            Eliminate student dropouts with explainable multi-signal telemetry. Powered by open mathematical risk modeling, automated trend detection, and simulated remedial trajectories.
          </p>

          {/* Primary Pill Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl bg-[#FAF7F2] text-[#2C2621] font-semibold text-sm shadow-xl shadow-black/15 hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Get Started
            </Link>
            <a
              href="#scrollytelling"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 text-white font-medium text-sm border border-white/20 hover:bg-white/15 transition-all"
            >
              <span>Explore Interactive Story</span>
              <ChevronRight className="w-4 h-4 text-amber-300" />
            </a>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* BOTTOM FLOATING FROSTED CARDS (EXACT MATCH TO REFERENCE) */}
        {/* ------------------------------------------------------------ */}
        <div className="relative z-20 px-6 sm:px-10 lg:px-14 pb-8 sm:pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Card 1: Rating / Precision */}
            <div className="rounded-3xl bg-[#F6EDE6] p-6 sm:p-7 text-[#2D2721] shadow-lg shadow-black/10 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex items-center gap-1 text-amber-500 mb-3">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="text-sm font-bold text-[#2D2721] ml-1.5 font-mono">4.8 / 5.0</span>
              </div>
              <h3 className="text-base font-bold text-[#2D2721]">
                99.4% Early Detection
              </h3>
              <p className="text-xs text-[#6F6459] mt-2 leading-relaxed">
                Explainable student telemetry flags academic decline weeks before finals with zero black-box guesswork.
              </p>
            </div>

            {/* Card 2: Emblem / Feature Headline */}
            <div className="rounded-3xl bg-[#F6EDE6] p-6 sm:p-7 text-[#2D2721] shadow-lg shadow-black/10 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#EAE2D7] text-[#2D2721] flex items-center justify-center">
                  <Settings className="w-4 h-4 text-[#2D2721]" />
                </div>
                <span className="text-base font-bold text-[#2D2721]">
                  Deterministic Risk
                </span>
              </div>
              <p className="text-xs text-[#6F6459] mt-2 leading-relaxed">
                R = 0.35A + 0.25B + 0.40C auditable by faculty councils, deans, and student union representatives.
              </p>
            </div>

            {/* Card 3: Big 87% Display Numeral */}
            <div className="rounded-3xl bg-[#F6EDE6] p-6 sm:p-7 text-[#2D2721] shadow-lg shadow-black/10 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#2D2721] font-mono tracking-tight">
                87%
              </div>
              <p className="text-xs text-[#6F6459] mt-2 leading-relaxed">
                Intervention recovery rate achieved when simulated attendance and test remediation plans are enacted early.
              </p>
            </div>

          </div>

          {/* Floating Pill Tag (Bottom Left - "Visit site" style) */}
          <div className="mt-4 flex items-center justify-between text-xs text-white/60">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 hover:text-white border border-white/15 transition-all text-[11px]"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Institutional Portal</span>
            </Link>
            <span className="text-[11px] font-mono text-white/40">
              Apex Institute of Higher Technology
            </span>
          </div>
        </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 🎬 SCROLLYTELLING SECTION: THE ANATOMY OF AN EARLY RECOVERY */}
      {/* ============================================================ */}
      <section id="scrollytelling" ref={scrollyContainerRef} className="max-w-7xl mx-auto mt-20 sm:mt-28 px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-200 text-xs font-mono font-semibold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Interactive Scrollytelling Case Study</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            How Student360 Rescues At-Risk Students
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#D4C8BC] leading-relaxed">
            Scroll down to watch a student's real-time academic telemetry evolve week-by-week. See how early signals, algorithmic sudden drop detection, and what-if simulation prevent an unpredicted dropout.
          </p>
        </div>

        {/* Scrollytelling Layout: Sticky Console on Left + Narrative Cards on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative">
          
          {/* ========================================== */}
          {/* STICKY VISUAL STAGE (PINS DURING SCROLL)   */}
          {/* ========================================== */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 z-20">
            <div className="rounded-[32px] sm:rounded-[40px] bg-[#FAF6F0] p-6 sm:p-8 text-[#2D2721] shadow-2xl border border-white/60 transition-all duration-300">
              
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EAE2D7]">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A6E63]">
                    Live Telemetry Stage • {scrollyChapters[scrollyStep].week}
                  </span>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider transition-all duration-300"
                  style={{
                    backgroundColor: scrollyChapters[scrollyStep].levelBg,
                    color: scrollyChapters[scrollyStep].levelColor,
                  }}
                >
                  {scrollyChapters[scrollyStep].level}
                </span>
              </div>

              {/* Student Dossier Quick Strip */}
              <div className="my-4 p-3.5 rounded-2xl bg-[#EFE8DD] flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="font-bold text-[#2D2721] block">Alex Johnson</span>
                  <span className="text-[#7A6E63] text-[11px]">CS-2023-014 • Computer Science</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#7A6E63] uppercase block">Telemetry Step</span>
                  <span className="font-bold text-[#2D2721]">{scrollyChapters[scrollyStep].step} / 05</span>
                </div>
              </div>

              {/* Dynamic Risk Gauge */}
              <div className="py-4 text-center">
                <div className="text-5xl sm:text-6xl font-extrabold text-[#2D2721] font-mono tracking-tight transition-all duration-300">
                  {scrollyChapters[scrollyStep].risk.toFixed(1)}
                  <span className="text-lg text-[#7A6E63] font-normal"> / 100</span>
                </div>
                <div className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold font-mono text-white transition-all duration-300"
                  style={{ backgroundColor: scrollyChapters[scrollyStep].levelColor }}
                >
                  {scrollyChapters[scrollyStep].badge}
                </div>
              </div>

              {/* Real-time Metric Bars */}
              <div className="space-y-3.5 my-4 pt-4 border-t border-[#EAE2D7]">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[#7A6E63]">Lecture Attendance (A)</span>
                    <span className="font-bold text-[#2D2721]">{scrollyChapters[scrollyStep].att}%</span>
                  </div>
                  <div className="w-full bg-[#EAE2D7] h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        scrollyChapters[scrollyStep].att < 75 ? 'bg-rose-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${scrollyChapters[scrollyStep].att}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[#7A6E63]">Assignment Completion (B)</span>
                    <span className="font-bold text-[#2D2721]">{scrollyChapters[scrollyStep].asg}%</span>
                  </div>
                  <div className="w-full bg-[#EAE2D7] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${scrollyChapters[scrollyStep].asg}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[#7A6E63]">Midterm Exam Performance (C)</span>
                    <span className="font-bold text-[#2D2721]">{scrollyChapters[scrollyStep].exam}%</span>
                  </div>
                  <div className="w-full bg-[#EAE2D7] h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        scrollyChapters[scrollyStep].exam < 60 ? 'bg-rose-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${scrollyChapters[scrollyStep].exam}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Telemetry Log Callout */}
              <div className="mt-4 p-3.5 rounded-2xl bg-[#EFE8DD] text-xs font-mono text-[#574C42] border border-[#E0D5C7]">
                <strong className="text-[#2D2721] block mb-1">System Action Taken:</strong>
                {scrollyChapters[scrollyStep].action}
              </div>

              {/* Scrollytelling Step Quick Jumper */}
              <div className="mt-5 pt-3 border-t border-[#EAE2D7] flex items-center justify-between text-xs font-mono text-[#7A6E63]">
                <span>Jump to Chapter:</span>
                <div className="flex items-center gap-1.5">
                  {scrollyChapters.map((ch, idx) => (
                    <button
                      key={ch.step}
                      type="button"
                      onClick={() => {
                        setScrollyStep(idx);
                        const target = document.getElementById(`scrolly-chapter-${idx}`);
                        target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        scrollyStep === idx
                          ? 'bg-[#2D2721] text-white shadow-md'
                          : 'bg-[#EFE8DD] text-[#7A6E63] hover:bg-[#E0D5C7]'
                      }`}
                    >
                      {ch.step}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ========================================== */}
          {/* SCROLLING NARRATIVE CHAPTERS (RIGHT SIDE)  */}
          {/* ========================================== */}
          <div className="lg:col-span-6 space-y-8 sm:space-y-16 py-4 lg:py-12">
            {scrollyChapters.map((chapter, index) => {
              const isActive = scrollyStep === index;
              return (
                <div
                  key={chapter.step}
                  id={`scrolly-chapter-${index}`}
                  data-step-index={index}
                  className={`scrolly-step-card rounded-[28px] sm:rounded-[36px] p-7 sm:p-9 text-left border transition-all duration-300 ${
                    isActive
                      ? 'bg-[#312A24] border-amber-300/40 shadow-2xl scale-[1.01]'
                      : 'bg-[#241F1B]/80 border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* Step Ribbon & Timeline Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-mono text-amber-200 font-bold border border-white/15">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      {chapter.week} • Chapter {chapter.step}
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: chapter.levelBg,
                        color: chapter.levelColor,
                      }}
                    >
                      {chapter.level}
                    </span>
                  </div>

                  {/* Chapter Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {chapter.title}
                  </h3>

                  {/* Narrative Body */}
                  <p className="mt-3 text-xs sm:text-sm text-[#D5CDC2] leading-relaxed">
                    {chapter.description}
                  </p>

                  {/* Analytical Insight Box */}
                  <div className="mt-5 p-4 rounded-2xl bg-black/30 border border-white/5 space-y-1.5 font-mono text-xs">
                    <div className="text-amber-200 font-bold flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" />
                      <span>Mathematical Signal:</span>
                    </div>
                    <p className="text-white/80 leading-relaxed text-[11px]">
                      {chapter.insight}
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-white/50 pt-3 border-t border-white/10">
                    <span>Active Telemetry: {chapter.risk} / 100</span>
                    <span className={isActive ? 'text-amber-300 font-bold' : 'text-white/40'}>
                      {isActive ? '● Stage Viewing' : '○ Scroll to View'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION: LIVE TELEMETRY LAB & RECOVERY SANDBOX */}
      {/* ============================================================ */}
      <section id="about" className="max-w-7xl mx-auto mt-20 sm:mt-28 px-4 sm:px-6">
        <div className="rounded-[32px] sm:rounded-[40px] bg-[#2A241F] border border-white/10 p-6 sm:p-10 lg:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Interactive Telemetry Controls */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full border border-white/20 bg-white/5 text-[10px] font-mono uppercase tracking-wider text-[#EADBCE]">
                  Interactive Telemetry Sandbox
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold text-white mt-3 tracking-tight">
                  Test the Deterministic Engine
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-[#C8BEB2] leading-relaxed">
                  Drag the sliders to see how real-time attendance, assignment submissions, and internal test marks synthesize into an auditable composite score.
                </p>
              </div>

              {/* Sliders */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-[#EADBCE]">Lecture Attendance (A)</span>
                    <span className={`font-bold ${attVal < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {attVal}% <span className="text-[10px] text-white/40">(Statutory: 75%)</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={attVal}
                    onChange={(e) => setAttVal(Number(e.target.value))}
                    className="w-full h-2 bg-[#1A1613] rounded-lg appearance-none cursor-pointer accent-[#FAF7F2]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-[#EADBCE]">Assignment Completion (B)</span>
                    <span className={`font-bold ${asgVal < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {asgVal}% <span className="text-[10px] text-white/40">(Target: 100%)</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={asgVal}
                    onChange={(e) => setAsgVal(Number(e.target.value))}
                    className="w-full h-2 bg-[#1A1613] rounded-lg appearance-none cursor-pointer accent-[#FAF7F2]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-[#EADBCE]">Midterm Exam Score (C)</span>
                    <span className={`font-bold ${examVal < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {examVal}% <span className="text-[10px] text-white/40">(Pass: 60%)</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={examVal}
                    onChange={(e) => setExamVal(Number(e.target.value))}
                    className="w-full h-2 bg-[#1A1613] rounded-lg appearance-none cursor-pointer accent-[#FAF7F2]"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[11px] font-mono text-white/50">Load Profile:</span>
                <button
                  type="button"
                  onClick={() => { setAttVal(52); setAsgVal(45); setExamVal(48); }}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 text-xs font-mono font-semibold border border-rose-500/30 transition-colors"
                >
                  High Risk (52%)
                </button>
                <button
                  type="button"
                  onClick={() => { setAttVal(68); setAsgVal(75); setExamVal(58); }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 text-xs font-mono font-semibold border border-amber-500/30 transition-colors"
                >
                  Borderline (68%)
                </button>
                <button
                  type="button"
                  onClick={() => { setAttVal(92); setAsgVal(95); setExamVal(88); }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 text-xs font-mono font-semibold border border-emerald-500/30 transition-colors"
                >
                  Compliant (92%)
                </button>
              </div>
            </div>

            {/* Right: Dynamic Output Card Styled in Porcelain Glass */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-[#FAF6F0] p-6 sm:p-8 text-[#2D2721] shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-[#EAE2D7]">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#7A6E63] font-mono">
                    Telemetry Output
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider"
                    style={{
                      backgroundColor: heroRisk.bg,
                      color: heroRisk.color,
                      border: `1px solid ${heroRisk.border}`
                    }}
                  >
                    {heroRisk.category} RISK
                  </span>
                </div>

                {/* Big Score Dial */}
                <div className="py-6 text-center">
                  <div className="text-6xl sm:text-7xl font-extrabold text-[#2D2721] font-mono tracking-tight">
                    {heroRisk.score}
                  </div>
                  <span className="text-xs text-[#7A6E63] font-mono mt-1 block">
                    Composite Risk Index (out of 100)
                  </span>
                </div>

                {/* Factor Decomposition */}
                <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-[#EAE2D7] text-left">
                  <div className="bg-[#EFE8DD] p-2.5 rounded-xl">
                    <span className="text-[10px] text-[#7A6E63] font-mono block">Att (35%)</span>
                    <span className="text-xs font-bold text-[#2D2721] font-mono">+{heroRisk.contribA} pts</span>
                  </div>
                  <div className="bg-[#EFE8DD] p-2.5 rounded-xl">
                    <span className="text-[10px] text-[#7A6E63] font-mono block">Asg (25%)</span>
                    <span className="text-xs font-bold text-[#2D2721] font-mono">+{heroRisk.contribB} pts</span>
                  </div>
                  <div className="bg-[#EFE8DD] p-2.5 rounded-xl">
                    <span className="text-[10px] text-[#7A6E63] font-mono block">Exam (40%)</span>
                    <span className="text-xs font-bold text-[#2D2721] font-mono">+{heroRisk.contribC} pts</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 text-[11px] text-[#7A6E63] font-mono text-center">
                  Formula: R = 0.35A + 0.25B + 0.40C • 100% Deterministic
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION: MATHEMATICAL AUDIT & EQUATION BREAKDOWN */}
      {/* ============================================================ */}
      <section id="formula" className="max-w-7xl mx-auto mt-16 sm:mt-24 px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="inline-block px-3 py-1 rounded-full border border-white/20 bg-white/5 text-[10px] font-mono uppercase tracking-widest text-[#EADBCE]">
            Mathematical Auditing
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white mt-3 tracking-tight">
            How Risk Is Calculated
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#C8BEB2]">
            Zero black-box neural networks deciding academic futures. Transparent, provable math.
          </p>
        </div>

        {/* 3 Component Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          <div className="rounded-3xl bg-[#2A241F] border border-white/10 p-6 sm:p-7 text-left hover:border-white/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono uppercase font-bold text-[#EADBCE]">
                Weight: 35%
              </span>
              <span className="text-xs font-mono text-white/40">Factor A</span>
            </div>
            <h3 className="text-lg font-bold text-white">Attendance Velocity</h3>
            <p className="text-xs text-[#C8BEB2] mt-2 leading-relaxed">
              Monitors lecture session presence against the statutory 75% institutional quota.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-[#FAF7F2]">
              A = max(0, ((75 - Att%) / 75) * 100)
            </div>
          </div>

          <div className="rounded-3xl bg-[#2A241F] border border-white/10 p-6 sm:p-7 text-left hover:border-white/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono uppercase font-bold text-[#EADBCE]">
                Weight: 25%
              </span>
              <span className="text-xs font-mono text-white/40">Factor B</span>
            </div>
            <h3 className="text-lg font-bold text-white">Continuous Coursework</h3>
            <p className="text-xs text-[#C8BEB2] mt-2 leading-relaxed">
              Tracks ongoing laboratory submissions, homework deliverables, and deadlines.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-[#FAF7F2]">
              B = 100 - Assignment_Completion%
            </div>
          </div>

          <div className="rounded-3xl bg-[#2A241F] border border-white/10 p-6 sm:p-7 text-left hover:border-white/30 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono uppercase font-bold text-[#EADBCE]">
                Weight: 40%
              </span>
              <span className="text-xs font-mono text-white/40">Factor C</span>
            </div>
            <h3 className="text-lg font-bold text-white">Midterm Exam Marks</h3>
            <p className="text-xs text-[#C8BEB2] mt-2 leading-relaxed">
              Aggregates periodic midterms and quizzes against the 60% passing benchmark.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-[#FAF7F2]">
              C = max(0, ((60 - Exam%) / 60) * 100)
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION: PLATFORM SERVICES & BENTO CAPABILITIES */}
      {/* ============================================================ */}
      <section id="capabilities" className="max-w-7xl mx-auto mt-16 sm:mt-24 px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="inline-block px-3 py-1 rounded-full border border-white/20 bg-white/5 text-[10px] font-mono uppercase tracking-widest text-[#EADBCE]">
            Modular Services
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white mt-3 tracking-tight">
            Comprehensive Retention Platform
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#C8BEB2]">
            Equipping deans, mentors, and students with proactive tools.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
          
          {/* Card 1: Trend Alerts (Feature 1) */}
          <div className="md:col-span-7 rounded-3xl bg-[#2A241F] border border-white/10 p-6 sm:p-8 text-left flex flex-col justify-between hover:border-white/30 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center mb-4">
                <TrendingDown className="w-5 h-5 text-[#FAF7F2]" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Algorithmic Trend Alerts (Feature 1)
              </h3>
              <p className="text-xs sm:text-sm text-[#C8BEB2] mt-2 leading-relaxed">
                Flags downward performance momentum automatically: consecutive exam drops, absenteeism streaks, and sudden score collapses (&gt;15%).
              </p>

              {/* Trajectory Preview */}
              <div className="mt-6 p-4 rounded-2xl bg-black/30 border border-white/5">
                <div className="flex justify-between text-xs font-mono text-white/50 mb-2">
                  <span>Term Trajectory</span>
                  <span className="text-rose-400 font-bold">Sudden Drop Detected (-19%)</span>
                </div>
                <div className="h-16 flex items-end justify-between gap-2 pt-2">
                  <div className="flex-1 bg-white/20 h-12 rounded-t text-center"><span className="text-[9px] font-mono text-white/60">T1 74%</span></div>
                  <div className="flex-1 bg-white/20 h-10 rounded-t text-center"><span className="text-[9px] font-mono text-white/60">T2 68%</span></div>
                  <div className="flex-1 bg-white/20 h-9 rounded-t text-center"><span className="text-[9px] font-mono text-white/60">T3 61%</span></div>
                  <div className="flex-1 bg-rose-500 h-6 rounded-t text-center shadow-lg shadow-rose-500/20"><span className="text-[9px] font-mono text-white font-bold">T4 48%</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Recovery Simulator (Feature 2) */}
          <div className="md:col-span-5 rounded-3xl bg-[#2A241F] border border-white/10 p-6 sm:p-8 text-left flex flex-col justify-between hover:border-white/30 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center mb-4">
                <Sliders className="w-5 h-5 text-[#FAF7F2]" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Recovery Simulator (Feature 2)
              </h3>
              <p className="text-xs sm:text-sm text-[#C8BEB2] mt-2 leading-relaxed">
                Mentors test "what-if" recovery hypotheses: determine the minimal attendance jump or test score needed to pull a student out of danger.
              </p>

              <div className="mt-6 p-4 rounded-2xl bg-black/30 border border-white/5 font-mono text-xs space-y-2">
                <div className="flex justify-between text-white/50">
                  <span>Current Baseline:</span>
                  <span className="text-rose-400 font-bold">76.4 High Risk</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-white/10">
                  <span>Simulated +15% Att:</span>
                  <span>28.1 SAFE ZONE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Central CMS */}
          <div className="md:col-span-4 rounded-3xl bg-[#2A241F] border border-white/10 p-6 text-left hover:border-white/30 transition-all">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5 text-[#FAF7F2]" />
            </div>
            <h4 className="text-base font-bold text-white">Central CMS Console</h4>
            <p className="text-xs text-[#C8BEB2] mt-1.5 leading-relaxed">
              Super Admin control over users, departments, curriculum, and systemic threshold weights.
            </p>
          </div>

          {/* Card 4: Remedial Contracts */}
          <div className="md:col-span-4 rounded-3xl bg-[#2A241F] border border-white/10 p-6 text-left hover:border-white/30 transition-all">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-[#FAF7F2]" />
            </div>
            <h4 className="text-base font-bold text-white">Intervention Lifecycle</h4>
            <p className="text-xs text-[#C8BEB2] mt-1.5 leading-relaxed">
              Track remedial contracts across 4 defined states: Pending, In Progress, Completed, Evaluated.
            </p>
          </div>

          {/* Card 5: Student 360 Portal */}
          <div className="md:col-span-4 rounded-3xl bg-[#2A241F] border border-white/10 p-6 text-left hover:border-white/30 transition-all">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-[#FAF7F2]" />
            </div>
            <h4 className="text-base font-bold text-white">Private Student Portal</h4>
            <p className="text-xs text-[#C8BEB2] mt-1.5 leading-relaxed">
              Clear personal attendance tallies, upcoming deadlines, and mentor guidance feedback.
            </p>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION: LIVE COHORT SPOTLIGHT */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto mt-16 sm:mt-24 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-block px-3 py-1 rounded-full border border-white/20 bg-white/5 text-[10px] font-mono uppercase tracking-widest text-[#EADBCE]">
              Cohort Dossier
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mt-2 tracking-tight">
              Real-Time Student Telemetry
            </h2>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#2A241F] border border-white/10 overflow-x-auto max-w-full">
            {studentCases.map((s, idx) => (
              <button
                key={s.rollNo}
                type="button"
                onClick={() => setSelectedCase(idx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                  selectedCase === idx
                    ? 'bg-[#FAF6F0] text-[#2D2721] font-bold shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Dossier Panel */}
        <div className="rounded-3xl bg-[#FAF6F0] p-6 sm:p-8 text-[#2D2721] shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EAE2D7] flex items-center justify-center font-bold text-lg font-mono">
                  {studentCases[selectedCase].name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#2D2721]">{studentCases[selectedCase].name}</h4>
                  <span className="text-xs font-mono text-[#7A6E63]">
                    {studentCases[selectedCase].rollNo} • {studentCases[selectedCase].dept}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#EFE8DD]">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-mono text-[#7A6E63] uppercase">Composite Risk</span>
                  <span className={`text-3xl font-black font-mono ${
                    studentCases[selectedCase].level === 'HIGH' ? 'text-rose-700' :
                    studentCases[selectedCase].level === 'MEDIUM' ? 'text-amber-700' : 'text-emerald-700'
                  }`}>
                    {studentCases[selectedCase].risk} / 100
                  </span>
                </div>
                <div className="text-xs font-mono text-[#7A6E63] mt-2">
                  Trend: <strong>{studentCases[selectedCase].trend}</strong>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-[#EFE8DD]">
                <span className="text-[11px] font-mono text-[#7A6E63] block">Attendance</span>
                <span className="text-2xl font-bold text-[#2D2721] font-mono mt-1 block">
                  {studentCases[selectedCase].att}%
                </span>
                <span className="text-[10px] text-[#7A6E63] font-mono">Statutory: 75%</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#EFE8DD]">
                <span className="text-[11px] font-mono text-[#7A6E63] block">Assignments</span>
                <span className="text-2xl font-bold text-[#2D2721] font-mono mt-1 block">
                  {studentCases[selectedCase].asg}%
                </span>
                <span className="text-[10px] text-[#7A6E63] font-mono">Target: 100%</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#EFE8DD]">
                <span className="text-[11px] font-mono text-[#7A6E63] block">Exam Score</span>
                <span className="text-2xl font-bold text-[#2D2721] font-mono mt-1 block">
                  {studentCases[selectedCase].exam}%
                </span>
                <span className="text-[10px] text-[#7A6E63] font-mono">Passing: 60%</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION: INSTITUTIONAL GOVERNANCE ROLE MATRIX */}
      {/* ============================================================ */}
      <section id="roles" className="max-w-7xl mx-auto mt-16 sm:mt-24 px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block px-3 py-1 rounded-full border border-white/20 bg-white/5 text-[10px] font-mono uppercase tracking-widest text-[#EADBCE]">
            Institutional Roles
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white mt-2 tracking-tight">
            Tailored by Academic Responsibility
          </h2>
        </div>

        {/* Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {(['superadmin', 'dean', 'faculty', 'student'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setActiveRole(r)}
              className={`px-5 py-2 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeRole === r
                  ? 'bg-[#FAF7F2] text-[#2C2621] shadow-lg'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {r === 'superadmin' ? 'Super Admin' : r === 'dean' ? 'Deans / HODs' : r === 'faculty' ? 'Faculty Mentors' : 'Students'}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="rounded-3xl bg-[#2A241F] border border-white/10 p-6 sm:p-8 text-left max-w-4xl mx-auto">
          {activeRole === 'superadmin' && (
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white">Super Administrator Authority</h3>
              <p className="text-xs sm:text-sm text-[#C8BEB2] leading-relaxed">
                Centralized CMS authority: manage user roles, adjust institutional risk equation thresholds, broadcast official announcements, and inspect tamper-evident audit logs.
              </p>
            </div>
          )}
          {activeRole === 'dean' && (
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white">Division Telemetry & Ingestion</h3>
              <p className="text-xs sm:text-sm text-[#C8BEB2] leading-relaxed">
                Department-wide macro telemetry: evaluate attrition velocity across majors and batch-ingest historical attendance or exam records via validated CSV upload.
              </p>
            </div>
          )}
          {activeRole === 'faculty' && (
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white">Mentorship & What-If Recovery</h3>
              <p className="text-xs sm:text-sm text-[#C8BEB2] leading-relaxed">
                360 student dossiers: simulate recovery scenarios with students during office hours and assign accountable remedial intervention contracts.
              </p>
            </div>
          )}
          {activeRole === 'student' && (
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white">Confidential Student Portal</h3>
              <p className="text-xs sm:text-sm text-[#C8BEB2] leading-relaxed">
                Full transparency into personal standing: track attendance quotas down to individual lecture hours and review faculty recommendations privately.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* BOTTOM CTA & FOOTER */}
      {/* ============================================================ */}
      <footer className="max-w-7xl mx-auto mt-20 sm:mt-28 px-4 sm:px-6 pt-10 border-t border-white/10 text-xs font-mono text-white/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#2C2621]">
              <GraduationCap className="w-4 h-4 text-[#2C2621]" />
            </div>
            <span className="font-bold text-white text-sm">Student360 Platform</span>
          </div>
          <div className="flex items-center gap-5 text-white/70">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Student Portal</Link>
            <a href="https://github.com/Psyodrz/Student-360" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              GitHub <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
        <div className="text-center sm:text-left text-[11px] text-white/40 pb-6">
          &copy; 2024–2026 Student360 System • Apex Institute of Higher Technology • All Rights Reserved.
        </div>
      </footer>

    </div>
  );
}
