import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { studentsAPI, riskAPI } from '../lib/api';
import {
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingDown,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  User,
  Activity
} from 'lucide-react';

export default function SimulatorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preSelectedId = searchParams.get('student_id');

  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(preSelectedId || '');
  const [simResult, setSimResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Sliders state
  const [simAttendance, setSimAttendance] = useState<number>(85);
  const [simAssignment, setSimAssignment] = useState<number>(90);
  const [simAcademic, setSimAcademic] = useState<number>(75);

  useEffect(() => {
    studentsAPI.list({ limit: 300 })
      .then((res) => {
        setStudentsList(res.data);
        if (!selectedStudentId && res.data.length > 0) {
          const riskCandidate = res.data.find((s: any) => s.risk_category === 'High' || s.risk_category === 'Medium');
          setSelectedStudentId(String(riskCandidate ? riskCandidate.id : res.data[0].id));
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const runSimulation = (att: number, asg: number, aca: number) => {
    if (!selectedStudentId) return;
    setLoading(true);
    riskAPI.simulate({
      student_id: Number(selectedStudentId),
      attendance_pct: att,
      assignment_completion_pct: asg,
      academic_pct: aca,
    })
      .then((res) => {
        setSimResult(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedStudentId) {
      riskAPI.getStudent(Number(selectedStudentId))
        .then((res) => {
          const r = res.data;
          const initialAtt = r.attendance_pct ?? 75;
          const initialAsg = r.assignment_completion_pct ?? 80;
          const initialAca = r.academic_pct ?? 65;
          setSimAttendance(initialAtt);
          setSimAssignment(initialAsg);
          setSimAcademic(initialAca);
          runSimulation(initialAtt, initialAsg, initialAca);
        })
        .catch(() => {});
    }
  }, [selectedStudentId]);

  const handleSliderChange = (type: string, val: number) => {
    let newAtt = simAttendance;
    let newAsg = simAssignment;
    let newAca = simAcademic;

    if (type === 'att') { newAtt = val; setSimAttendance(val); }
    if (type === 'asg') { newAsg = val; setSimAssignment(val); }
    if (type === 'aca') { newAca = val; setSimAcademic(val); }

    runSimulation(newAtt, newAsg, newAca);
  };

  const resetToActual = () => {
    if (simResult?.current) {
      const cur = simResult.current;
      setSimAttendance(cur.attendance_pct ?? 75);
      setSimAssignment(cur.assignment_completion_pct ?? 80);
      setSimAcademic(cur.academic_pct ?? 65);
      runSimulation(cur.attendance_pct ?? 75, cur.assignment_completion_pct ?? 80, cur.academic_pct ?? 65);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 🌟 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#EADFD4]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#2C2621]">
              Student Recovery Simulator
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#F4EAE1] text-[#2C2621] border border-[#DACFBF] font-mono">
              Hypothetical Modeling
            </span>
          </div>
          <p className="text-xs text-[#7A6D61] mt-0.5">
            Interactive mathematical modeling: simulate remedial target outcomes before assigning intervention contracts
          </p>
        </div>

        {/* Student Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#5C4F43]">Target Student:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="text-xs border border-[#DACFBF] rounded-xl py-2 px-3.5 bg-white text-[#2C2621] font-medium focus:ring-2 focus:ring-[#8E7B68] min-w-[240px] shadow-xs"
          >
            {studentsList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.enrollment_no}) — {s.risk_category || 'Low'} Risk
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 🌟 Simulation Banner */}
      <div className="p-4 rounded-2xl sm:rounded-3xl bg-[#FAF4ED] border border-[#E3D6C8] text-[#5C4F43] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong className="font-bold uppercase tracking-wider text-[11px] text-[#2C2621] mr-1">
              Simulation Sandbox Active:
            </strong>
            Values adjusted below model hypothetical trajectories and will not alter statutory institutional ledgers.
          </span>
        </div>
        <button
          onClick={resetToActual}
          className="btn-secondary text-[11px] py-1.5 px-3 bg-white text-[#2C2621] border-[#DACFBF] hover:bg-[#F6EDE6] self-start sm:self-auto shrink-0"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset to Actuals</span>
        </button>
      </div>

      {/* 🌟 Main Simulation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls Column (Sliders in Porcelain Card) */}
        <div className="lg:col-span-6 rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-6 space-y-6 shadow-xs">
          <h2 className="text-sm font-bold text-[#2C2621] uppercase tracking-wider pb-3 border-b border-[#EADFD4] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#8C7D70]" />
            <span>Remedial Levers & Hypothetical Sliders</span>
          </h2>

          {/* Attendance Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#2C2621]">Hypothetical Attendance Rate</span>
              <span className="font-mono font-extrabold text-[#2C2621] bg-white px-2.5 py-0.5 rounded-lg border border-[#E0D4C5]">
                {simAttendance}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={simAttendance}
              onChange={(e) => handleSliderChange('att', Number(e.target.value))}
              className="w-full accent-[#2C2621] h-2 bg-[#E0D4C5] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8C7D70]">
              <span>0% (Truancy)</span>
              <span className="text-[#B45309] font-bold">75% Statutory Quota</span>
              <span>100% (Full)</span>
            </div>
          </div>

          {/* Assignment Completion Slider */}
          <div className="space-y-2 pt-3 border-t border-[#EADFD4]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#2C2621]">Hypothetical Coursework Submissions</span>
              <span className="font-mono font-extrabold text-[#2C2621] bg-white px-2.5 py-0.5 rounded-lg border border-[#E0D4C5]">
                {simAssignment}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={simAssignment}
              onChange={(e) => handleSliderChange('asg', Number(e.target.value))}
              className="w-full accent-[#2C2621] h-2 bg-[#E0D4C5] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8C7D70]">
              <span>0% (Zero Submissions)</span>
              <span className="text-[#B45309] font-bold">100% Target</span>
              <span>100%</span>
            </div>
          </div>

          {/* Academic Marks Slider */}
          <div className="space-y-2 pt-3 border-t border-[#EADFD4]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#2C2621]">Hypothetical Exam Performance</span>
              <span className="font-mono font-extrabold text-[#2C2621] bg-white px-2.5 py-0.5 rounded-lg border border-[#E0D4C5]">
                {simAcademic}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={simAcademic}
              onChange={(e) => handleSliderChange('aca', Number(e.target.value))}
              className="w-full accent-[#2C2621] h-2 bg-[#E0D4C5] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8C7D70]">
              <span>0% (Failed)</span>
              <span className="text-[#B45309] font-bold">60% Safe Threshold</span>
              <span>100% (Distinction)</span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-3 border-t border-[#EADFD4]">
            <span className="block text-[11px] font-bold text-[#7A6D61] uppercase tracking-wider mb-2">
              Instant Remedial Benchmarks:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSimAttendance(75); setSimAssignment(85); setSimAcademic(60);
                  runSimulation(75, 85, 60);
                }}
                className="btn-secondary text-[11px] py-2 text-center"
              >
                Minimum Pass (75/85/60)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimAttendance(85); setSimAssignment(95); setSimAcademic(75);
                  runSimulation(85, 95, 75);
                }}
                className="btn-secondary text-[11px] py-2 text-center"
              >
                Target Safe (85/95/75)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimAttendance(95); setSimAssignment(100); setSimAcademic(90);
                  runSimulation(95, 100, 90);
                }}
                className="btn-secondary text-[11px] py-2 text-center"
              >
                Dean's List (95/100/90)
              </button>
            </div>
          </div>
        </div>

        {/* Results Comparison Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-6 shadow-xs">
            <h2 className="text-sm font-bold text-[#2C2621] uppercase tracking-wider pb-3 border-b border-[#EADFD4]">
              Comparative Trajectory Analysis
            </h2>

            <div className="grid grid-cols-2 gap-4 mt-4">
              
              {/* Baseline Current */}
              <div className="p-4 rounded-2xl border border-[#E0D4C5] bg-white/80 flex flex-col items-center justify-center text-center shadow-xs">
                <span className="text-[10px] font-bold text-[#7A6D61] uppercase tracking-wider">
                  Baseline Actual Risk
                </span>
                <div className="mt-2 text-3xl font-extrabold font-mono text-[#2C2621]">
                  {simResult?.current?.risk_score ?? '—'}
                  <span className="text-xs font-normal text-[#8C7D70]"> / 100</span>
                </div>
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                  simResult?.current?.risk_category === 'High' ? 'bg-[#FEE2E2] text-[#DC2626]' :
                  simResult?.current?.risk_category === 'Medium' ? 'bg-[#FEF3C7] text-[#B45309]' :
                  'bg-[#DCFCE7] text-[#15803D]'
                }`}>
                  {simResult?.current?.risk_category || 'Low'} Risk
                </span>
                <div className="mt-3 text-[11px] text-[#7A6D61] space-y-0.5 text-left w-full border-t border-[#EADFD4] pt-2">
                  <div className="flex justify-between">
                    <span>Attendance:</span>
                    <span className="font-semibold text-[#2C2621]">{simResult?.current?.attendance_pct ?? 'N/A'}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assignments:</span>
                    <span className="font-semibold text-[#2C2621]">{simResult?.current?.assignment_completion_pct ?? 'N/A'}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Academic Marks:</span>
                    <span className="font-semibold text-[#2C2621]">{simResult?.current?.academic_pct ?? 'N/A'}%</span>
                  </div>
                </div>
              </div>

              {/* Simulated Projected */}
              <div className="p-4 rounded-2xl border border-amber-300 bg-[#FAF4ED] ring-1 ring-amber-400/40 flex flex-col items-center justify-center text-center shadow-xs">
                <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider">
                  Projected Simulated Risk
                </span>
                <div className="mt-2 text-3xl font-extrabold font-mono text-[#2C2621]">
                  {simResult?.simulated?.risk_score ?? '—'}
                  <span className="text-xs font-normal text-[#8C7D70]"> / 100</span>
                </div>
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                  simResult?.simulated?.risk_category === 'High' ? 'bg-[#FEE2E2] text-[#DC2626]' :
                  simResult?.simulated?.risk_category === 'Medium' ? 'bg-[#FEF3C7] text-[#B45309]' :
                  'bg-[#DCFCE7] text-[#15803D]'
                }`}>
                  {simResult?.simulated?.risk_category || 'Low'} Risk
                </span>
                <div className="mt-3 text-[11px] text-[#5C4F43] space-y-0.5 text-left w-full border-t border-[#E3D6C8] pt-2">
                  <div className="flex justify-between">
                    <span>Sim Attendance:</span>
                    <span className="font-bold text-[#2C2621] font-mono">{simAttendance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sim Assignments:</span>
                    <span className="font-bold text-[#2C2621] font-mono">{simAssignment}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sim Marks:</span>
                    <span className="font-bold text-[#2C2621] font-mono">{simAcademic}%</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Improvement Delta Badge */}
            {simResult && (
              <div className="mt-5 p-4 rounded-2xl bg-[#DCFCE7] border border-[#86EFAC] text-[#166534] flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-5 h-5 text-[#16A34A] shrink-0" />
                  <div>
                    <span className="text-xs font-bold block">
                      Expected Risk Mitigation Delta:
                    </span>
                    <span className="text-[11px] text-[#15803D]">
                      Hypothetical improvement achieves a net risk reduction of{' '}
                      <strong>{simResult.improvement} points</strong>.
                    </span>
                  </div>
                </div>
                <span className="text-lg font-extrabold font-mono text-[#166534] bg-white px-3 py-1 rounded-xl shadow-xs border border-[#86EFAC]">
                  {simResult.improvement > 0 ? `-${simResult.improvement}` : `+${Math.abs(simResult.improvement)}`}
                </span>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate(`/students/${selectedStudentId}`)}
              className="btn-secondary text-xs"
            >
              <span>View Full Student 360 Dossier</span>
            </button>
            <button
              onClick={() => navigate(`/interventions?student_id=${selectedStudentId}`)}
              className="btn-primary text-xs"
            >
              <span>Assign Formal Recovery Contract</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
