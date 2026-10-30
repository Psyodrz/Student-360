import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../lib/api';
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  Building,
  CheckCircle2,
  PieChart as PieIcon,
  Award,
  Layers,
  FileText,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AnalyticsPage() {
  const [deptComparison, setDeptComparison] = useState<any[]>([]);
  const [effectiveness, setEffectiveness] = useState<any>(null);
  const [riskDist, setRiskDist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.departmentComparison(),
      analyticsAPI.interventionEffectiveness(),
      analyticsAPI.riskDistribution(),
    ])
      .then(([deptRes, effRes, riskRes]) => {
        setDeptComparison(deptRes.data);
        setEffectiveness(effRes.data);
        setRiskDist(riskRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = async (type: string) => {
    try {
      const res = await analyticsAPI.exportCSV(type);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_analytics_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#2C2621] border-t-amber-500 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#8C7D70] uppercase tracking-wider">
            Compiling Academic Analytics...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto print:space-y-4">
      
      {/* 🌟 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#EADFD4] print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-[#D8CEBE] bg-[#F4EAE1] text-[10px] uppercase tracking-widest text-[#5C4F43] font-bold mb-1.5">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>EXECUTIVE AUDIT</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2C2621]">
            Institutional Analytics & Reports
          </h1>
          <p className="text-xs text-[#7A6D61] mt-0.5">
            Aggregated cross-departmental telemetry, intervention efficacy metrics, and audit exports
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="btn-secondary text-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={() => handleExportCSV('students')}
            className="btn-secondary text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Students CSV</span>
          </button>
          <button
            onClick={() => handleExportCSV('risk')}
            className="btn-primary text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Risk Index CSV</span>
          </button>
        </div>
      </div>

      {/* 🌟 Efficacy Summary Cards (Warm Porcelain Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl sm:rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-5 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
          <span className="text-[10px] font-bold text-[#7A6D61] uppercase tracking-wider">
            Total Remedial Cases Handled
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-[#2C2621]">
            {effectiveness?.total || 0}
          </div>
          <p className="mt-1 text-[11px] text-[#7A6D61]">Total institutional cases initiated to date</p>
        </div>

        <div className="rounded-2xl sm:rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-5 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
          <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider">
            Intervention Recovery Success Rate
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-[#15803D]">
            {effectiveness?.completion_rate || 0}%
          </div>
          <p className="mt-1 text-[11px] text-[#7A6D61]">{effectiveness?.completed || 0} cases evaluated with confirmed turnaround</p>
        </div>

        <div className="rounded-2xl sm:rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-5 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
          <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider">
            Participating Academic Divisions
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-[#2C2621]">
            {deptComparison.length}
          </div>
          <p className="mt-1 text-[11px] text-[#7A6D61]">Computer Science, EC, Mechanical, Civil, Mathematics</p>
        </div>
      </div>

      {/* 🌟 Department Comparison Chart (Porcelain Card) */}
      <div className="rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#EADFD4]">
          <div>
            <h2 className="text-sm font-bold text-[#2C2621] uppercase tracking-wider">
              Departmental Risk & Attendance Comparison
            </h2>
            <p className="text-[11px] text-[#7A6D61]">Average Risk Score vs Average Attendance Rate across disciplines</p>
          </div>
        </div>
        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptComparison}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3DACD" />
              <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#7A6D61' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#7A6D61' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F1B18', color: '#FAF7F2', borderRadius: '12px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.15)' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#5C4F43' }} />
              <Bar dataKey="avg_risk" name="Avg Risk Index (/100)" fill="#DC2626" radius={[6, 6, 0, 0]} />
              <Bar dataKey="avg_attendance" name="Avg Attendance %" fill="#2C2621" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🌟 Two Column Layout: Intervention Status & Department Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Data Ledger */}
        <div className="rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-6 shadow-xs">
          <h3 className="text-sm font-bold text-[#2C2621] pb-3 border-b border-[#EADFD4]">
            Departmental Ledger Breakdown
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EADFD4] text-[#7A6D61] font-bold uppercase bg-white/40">
                  <th className="py-2.5 px-3 rounded-l-xl">Department</th>
                  <th className="py-2.5 px-3 text-center">Students</th>
                  <th className="py-2.5 px-3 text-center">Avg Risk</th>
                  <th className="py-2.5 px-3 text-center rounded-r-xl">Avg Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFD4]/60">
                {deptComparison.map((d: any) => (
                  <tr key={d.code} className="hover:bg-white/60 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#2C2621]">{d.department} ({d.code})</td>
                    <td className="py-2.5 px-3 text-center font-mono text-[#2C2621]">{d.total_students}</td>
                    <td className="py-2.5 px-3 text-center font-bold font-mono text-[#DC2626]">{d.avg_risk}</td>
                    <td className="py-2.5 px-3 text-center font-bold font-mono text-[#15803D]">{d.avg_attendance}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Intervention Status Breakdown */}
        <div className="rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-6 shadow-xs">
          <h3 className="text-sm font-bold text-[#2C2621] pb-3 border-b border-[#EADFD4]">
            Intervention Case Status Distribution
          </h3>
          <div className="mt-4 space-y-3.5">
            {effectiveness?.by_status?.map((st: any) => {
              const total = effectiveness.total || 1;
              const pct = Math.round((st.count / total) * 100);
              return (
                <div key={st.status} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="capitalize text-[#2C2621]">{st.status.replace('_', ' ')}</span>
                    <span className="text-[#7A6D61] font-mono">{st.count} cases ({pct}%)</span>
                  </div>
                  <div className="w-full bg-white/80 border border-[#DACFBF] rounded-full h-2.5 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        st.status === 'completed' || st.status === 'evaluated'
                          ? 'bg-[#16A34A]'
                          : st.status === 'in_progress'
                          ? 'bg-[#D97706]'
                          : 'bg-[#8C7D70]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
