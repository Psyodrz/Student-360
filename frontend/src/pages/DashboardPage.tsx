import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI, riskAPI } from '../lib/api';
import {
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Download,
  Building,
  GraduationCap,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Clock
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const navigate = useNavigate();

  const fetchDashboard = () => {
    setLoading(true);
    analyticsAPI.dashboard()
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRecalculateAll = async () => {
    setRecalculating(true);
    try {
      await riskAPI.calculateAll();
      fetchDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setRecalculating(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await analyticsAPI.exportCSV('students');
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students_academic_report.csv');
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
            Loading Academic Metrics...
          </span>
        </div>
      </div>
    );
  }

  // Color mapping: Authoritative institutional colors
  const RISK_COLORS: Record<string, string> = {
    High: '#dc2626',   // Crimson
    Medium: '#d97706', // Amber
    Low: '#16a34a',    // Forest Emerald
  };

  const riskData = stats?.risk_distribution?.map((d: any) => ({
    name: `${d.category} Risk`,
    value: d.count,
    color: RISK_COLORS[d.category] || '#64748b',
  })) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Executive Academic Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-dimensional student performance early-warning telemetry
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRecalculateAll}
            disabled={recalculating}
            className="btn-secondary text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            <span>{recalculating ? 'Computing...' : 'Recalculate Risk Engine'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="btn-primary text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Master Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card-surface p-4 border-l-4 border-oxford-800">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Enrolled</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats?.total_students || 0}</span>
            <span className="text-[11px] text-slate-500">Active Students</span>
          </div>
        </div>

        <div className="card-surface p-4 border-l-4 border-risk-600">
          <div className="flex items-center justify-between text-risk-700">
            <span className="text-xs font-semibold uppercase tracking-wider">High Risk</span>
            <ShieldAlert className="w-4 h-4 text-risk-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-risk-700">{stats?.high_risk || 0}</span>
            <span className="text-[11px] text-risk-600 font-medium">Critical Attention</span>
          </div>
        </div>

        <div className="card-surface p-4 border-l-4 border-academic-600">
          <div className="flex items-center justify-between text-academic-800">
            <span className="text-xs font-semibold uppercase tracking-wider">Medium Risk</span>
            <AlertTriangle className="w-4 h-4 text-academic-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-academic-800">{stats?.medium_risk || 0}</span>
            <span className="text-[11px] text-academic-700">Advisory Review</span>
          </div>
        </div>

        <div className="card-surface p-4 border-l-4 border-stable-600">
          <div className="flex items-center justify-between text-stable-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Low Risk</span>
            <CheckCircle className="w-4 h-4 text-stable-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stable-700">{stats?.low_risk || 0}</span>
            <span className="text-[11px] text-stable-600 font-medium">In Good Standing</span>
          </div>
        </div>

        <div className="card-surface p-4 border-l-4 border-slate-600">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Faculty Mentors</span>
            <GraduationCap className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats?.total_faculty || 0}</span>
            <span className="text-[11px] text-slate-500">Active Staff</span>
          </div>
        </div>
      </div>

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Donut */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Student Risk Stratification</h3>
            <span className="text-[11px] font-medium text-slate-400">Current Cohort</span>
          </div>
          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} Students`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4-Week Attendance Trend */}
        <div className="card-surface p-5 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Weekly Attendance Telemetry</h3>
              <p className="text-[11px] text-slate-400">Institutional aggregated attendance percentage over past 4 weeks</p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
              Target: 75%+
            </span>
          </div>
          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.attendance_trends || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Attendance Rate']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#1e293b"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#d97706', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Breakdown & Early-Warning Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Performance Table */}
        <div className="card-surface p-5 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Department Performance Index</h3>
              <p className="text-[11px] text-slate-400">Comparative risk distribution across 5 core academic divisions</p>
            </div>
          </div>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider bg-slate-50/50">
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-center">Total Students</th>
                  <th className="py-2.5 px-3 text-center">High Risk</th>
                  <th className="py-2.5 px-3 text-center">Medium Risk</th>
                  <th className="py-2.5 px-3 text-center">Average Risk Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.departments?.map((dept: any) => (
                  <tr key={dept.name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-800 flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {dept.name}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-700">{dept.total}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${dept.high > 0 ? 'bg-risk-50 text-risk-700' : 'text-slate-400'}`}>
                        {dept.high}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${dept.medium > 0 ? 'bg-amber-50 text-amber-700' : 'text-slate-400'}`}>
                        {dept.medium}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {dept.avg_risk} / 100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Early-Warning Alerts Feed */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-risk-600" />
              <h3 className="text-sm font-semibold text-slate-800">Priority Academic Alerts</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-risk-100 text-risk-800 font-bold">
              Critical Flag
            </span>
          </div>
          <div className="mt-3 space-y-2.5 max-h-[350px] overflow-y-auto">
            {stats?.recent_alerts?.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No high-risk alerts at this moment.
              </div>
            ) : (
              stats?.recent_alerts?.map((alert: any) => (
                <div
                  key={alert.student_id}
                  onClick={() => navigate(`/students/${alert.student_id}`)}
                  className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 group-hover:text-academic-700 transition-colors">
                        {alert.student_name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {alert.enrollment_no}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                      <span className="font-bold text-risk-600">Risk Score: {alert.risk_score}</span>
                      <span>•</span>
                      <span>Category: {alert.category}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

