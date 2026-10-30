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
  FileText
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
          <div className="w-8 h-8 border-3 border-oxford-900 border-t-academic-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Compiling Academic Analytics...
          </span>
        </div>
      </div>
    );
  }

  const riskPieData = [
    { name: 'High Risk', value: riskDist?.High || 0, color: '#dc2626' },
    { name: 'Medium Risk', value: riskDist?.Medium || 0, color: '#d97706' },
    { name: 'Low Risk', value: riskDist?.Low || 0, color: '#16a34a' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto print:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Institutional Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
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

      {/* High-level Efficacy Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-surface p-5 border-l-4 border-oxford-900">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Remedial Cases Handled
          </span>
          <div className="mt-2 text-3xl font-black font-mono text-slate-900">
            {effectiveness?.total || 0}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Total institutional cases initiated to date</p>
        </div>

        <div className="card-surface p-5 border-l-4 border-stable-600">
          <span className="text-[11px] font-bold text-stable-700 uppercase tracking-wider">
            Intervention Completion & Success Rate
          </span>
          <div className="mt-2 text-3xl font-black font-mono text-stable-700">
            {effectiveness?.completion_rate || 0}%
          </div>
          <p className="mt-1 text-[11px] text-slate-400">{effectiveness?.completed || 0} cases evaluated with confirmed turnaround</p>
        </div>

        <div className="card-surface p-5 border-l-4 border-academic-600">
          <span className="text-[11px] font-bold text-academic-800 uppercase tracking-wider">
            Participating Departments
          </span>
          <div className="mt-2 text-3xl font-black font-mono text-academic-900">
            {deptComparison.length}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Computer Science, EC, Mechanical, Civil, Mathematics</p>
        </div>
      </div>

      {/* Department Comparison Chart */}
      <div className="card-surface p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Departmental Risk & Attendance Comparison
            </h2>
            <p className="text-[11px] text-slate-400">Average Risk Score vs Average Attendance Rate across disciplines</p>
          </div>
        </div>
        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptComparison}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="avg_risk" name="Avg Risk Index (/100)" fill="#dc2626" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avg_attendance" name="Avg Attendance %" fill="#1e293b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Layout: Intervention Status & Department Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Data Ledger */}
        <div className="card-surface p-5">
          <h3 className="text-sm font-semibold text-slate-800 pb-3 border-b border-slate-100">
            Departmental Ledger Breakdown
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase bg-slate-50">
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-center">Students</th>
                  <th className="py-2.5 px-3 text-center">Avg Risk</th>
                  <th className="py-2.5 px-3 text-center">Avg Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deptComparison.map((d: any) => (
                  <tr key={d.code} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{d.department} ({d.code})</td>
                    <td className="py-2.5 px-3 text-center font-mono">{d.total_students}</td>
                    <td className="py-2.5 px-3 text-center font-bold font-mono text-slate-900">{d.avg_risk}</td>
                    <td className="py-2.5 px-3 text-center font-bold font-mono text-stable-700">{d.avg_attendance}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Intervention Status Breakdown */}
        <div className="card-surface p-5">
          <h3 className="text-sm font-semibold text-slate-800 pb-3 border-b border-slate-100">
            Intervention Case Status Distribution
          </h3>
          <div className="mt-4 space-y-3">
            {effectiveness?.by_status?.map((st: any) => {
              const total = effectiveness.total || 1;
              const pct = Math.round((st.count / total) * 100);
              return (
                <div key={st.status} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="capitalize text-slate-700">{st.status.replace('_', ' ')}</span>
                    <span className="text-slate-500 font-mono">{st.count} cases ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        st.status === 'completed' || st.status === 'evaluated'
                          ? 'bg-stable-600'
                          : st.status === 'in_progress'
                          ? 'bg-academic-600'
                          : 'bg-slate-400'
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

