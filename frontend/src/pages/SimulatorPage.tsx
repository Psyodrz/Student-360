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
          // Default to the first student with medium/high risk if possible
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
      // Load current student baseline values first
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Student Recovery Simulator
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-academic-100 text-academic-800 border border-academic-300">
              Feature 2
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Interactive mathematical modeling: simulate remedial target outcomes before assigning intervention contracts
          </p>
        </div>

        {/* Student Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700">Simulate Student:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="text-xs border border-slate-300 rounded-md py-1.5 px-3 bg-white font-medium focus:ring-1 focus:ring-oxford-800 min-w-[240px]"
          >
            {studentsList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.enrollment_no}) — {s.risk_category || 'Low'} Risk
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Simulated Warning Banner */}
      <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-300 text-amber-900 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong className="font-semibold uppercase tracking-wider text-[11px] mr-1">
              Simulation Sandbox Mode:
            </strong>
            Values adjusted below reflect hypothetical remedial trajectories and will not modify verified student examination records.
          </span>
        </div>
        <button
          onClick={resetToActual}
          className="btn-secondary text-[11px] py-1 px-2.5 bg-white text-amber-900 border-amber-300 hover:bg-amber-100/50"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset to Actuals</span>
        </button>
      </div>

      {/* Main Simulation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (Sliders) */}
        <div className="lg:col-span-6 card-surface p-6 space-y-6">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-academic-700" />
            Hypothetical Improvement Sliders
          </h2>

          {/* Attendance Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">Hypothetical Attendance Rate</span>
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
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
              className="w-full accent-oxford-800 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (Severe Truancy)</span>
              <span className="text-academic-700 font-semibold">75% Target Threshold</span>
              <span>100% (Perfect)</span>
            </div>
          </div>

          {/* Assignment Completion Slider */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">Hypothetical Assignment Completion</span>
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
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
              className="w-full accent-oxford-800 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (Zero Submissions)</span>
              <span className="text-academic-700 font-semibold">100% Target</span>
              <span>100%</span>
            </div>
          </div>

          {/* Academic Marks Slider */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">Hypothetical Exam Performance</span>
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
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
              className="w-full accent-oxford-800 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (Failed)</span>
              <span className="text-academic-700 font-semibold">60% Safe Threshold</span>
              <span>100% (Distinction)</span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-3 border-t border-slate-100">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Apply Remedial Goals Presets:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSimAttendance(75); setSimAssignment(85); setSimAcademic(60);
                  runSimulation(75, 85, 60);
                }}
                className="btn-secondary text-[11px] py-1.5"
              >
                Minimum Pass (75/85/60)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimAttendance(85); setSimAssignment(95); setSimAcademic(75);
                  runSimulation(85, 95, 75);
                }}
                className="btn-secondary text-[11px] py-1.5"
              >
                Target Standing (85/95/75)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimAttendance(95); setSimAssignment(100); setSimAcademic(90);
                  runSimulation(95, 100, 90);
                }}
                className="btn-secondary text-[11px] py-1.5"
              >
                Dean's List (95/100/90)
              </button>
            </div>
          </div>
        </div>

        {/* Results Comparison Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="card-surface p-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100">
              Comparative Impact Analysis
            </h2>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* Baseline Current */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Baseline Actual Risk
                </span>
                <div className="mt-2 text-3xl font-black font-mono text-slate-800">
                  {simResult?.current?.risk_score ?? '—'}
                  <span className="text-xs font-normal text-slate-400">/100</span>
                </div>
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  simResult?.current?.risk_category === 'High' ? 'bg-risk-100 text-risk-800' :
                  simResult?.current?.risk_category === 'Medium' ? 'bg-amber-100 text-amber-800' :
                  'bg-stable-100 text-stable-800'
                }`}>
                  {simResult?.current?.risk_category || 'Low'} Risk
                </span>
                <div className="mt-3 text-[11px] text-slate-500 space-y-0.5 text-left w-full border-t border-slate-200 pt-2">
                  <div className="flex justify-between">
                    <span>Attendance:</span>
                    <span className="font-semibold">{simResult?.current?.attendance_pct ?? 'N/A'}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assignments:</span>
                    <span className="font-semibold">{simResult?.current?.assignment_completion_pct ?? 'N/A'}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Academic Marks:</span>
                    <span className="font-semibold">{simResult?.current?.academic_pct ?? 'N/A'}%</span>
                  </div>
                </div>
              </div>

              {/* Simulated Projected */}
              <div className="p-4 rounded-xl border border-academic-300 bg-academic-50/40 ring-1 ring-academic-400/40 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold text-academic-800 uppercase tracking-wider">
                  Projected Simulated Risk
                </span>
                <div className="mt-2 text-3xl font-black font-mono text-academic-900">
                  {simResult?.simulated?.risk_score ?? '—'}
                  <span className="text-xs font-normal text-slate-400">/100</span>
                </div>
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  simResult?.simulated?.risk_category === 'High' ? 'bg-risk-100 text-risk-800' :
                  simResult?.simulated?.risk_category === 'Medium' ? 'bg-amber-100 text-amber-800' :
                  'bg-stable-100 text-stable-800'
                }`}>
                  {simResult?.simulated?.risk_category || 'Low'} Risk
                </span>
                <div className="mt-3 text-[11px] text-slate-600 space-y-0.5 text-left w-full border-t border-academic-200 pt-2">
                  <div className="flex justify-between">
                    <span>Sim Attendance:</span>
                    <span className="font-semibold font-mono">{simAttendance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sim Assignments:</span>
                    <span className="font-semibold font-mono">{simAssignment}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sim Marks:</span>
                    <span className="font-semibold font-mono">{simAcademic}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Improvement Delta Badge */}
            {simResult && (
              <div className="mt-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block">
                      Expected Risk Mitigation Delta:
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      Hypothetical improvement achieves a net risk reduction of{' '}
                      <strong>{simResult.improvement} points</strong>.
                    </span>
                  </div>
                </div>
                <span className="text-lg font-black font-mono text-emerald-700 bg-white px-3 py-1 rounded shadow-xs border border-emerald-300">
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

