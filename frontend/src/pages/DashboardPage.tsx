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
  Clock,
  Sparkles
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
          <div className="w-8 h-8 border-3 border-[#2C2621] border-t-amber-500 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#8C7D70] uppercase tracking-wider">
            Loading Academic Metrics...
          </span>
        </div>
      </div>
    );
  }

  // Institutional Palette matching cashmere/porcelain
  const RISK_COLORS: Record<string, string> = {
    High: '#DC2626',   // Crimson
    Medium: '#D97706', // Amber
    Low: '#16A34A',    // Emerald
  };

  const riskData = stats?.risk_distribution?.map((d: any) => ({
    name: `${d.category} Risk`,
    value: d.count,
    color: RISK_COLORS[d.category] || '#8C7D70',
  })) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 🌟 Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#EADFD4]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-[#D8CEBE] bg-[#F4EAE1] text-[10px] uppercase tracking-widest text-[#5C4F43] font-bold mb-1.5">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>INSTITUTIONAL TELEMETRY</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2C2621]">
            Executive Academic Dashboard
          </h1>
          <p className="text-xs text-[#7A6D61] mt-0.5">
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

      {/* 🌟 KPI Stat Cards (Warm Porcelain Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Enrolled */}
        <div className="rounded-2xl sm:rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-5 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-[#7A6D61]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Enrolled</span>
            <Users className="w-4 h-4 text-[#8C7D70]" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] font-mono">{stats?.total_students || 0}</span>
            <span className="text-[11px] text-[#7A6D61]">Active Cohort</span>
          </div>
        </div>

        {/* Card 2: High Risk */}
        <div className="rounded-2xl sm:rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-5 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-[#991B1B]">
            <span className="text-[11px] font-bold uppercase tracking-wider">High Risk</span>
            <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#DC2626] font-mono">{stats?.high_risk || 0}</span>
            <span className="text-[11px] text-[#991B1B] font-semibold">Critical Priority</span>
          </div>
        </div>

        {/* Card 3: Medium Risk */}
        <div className="rounded-2xl sm:rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-5 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-[#B45309]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Medium Risk</span>
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#B45309] font-mono">{stats?.medium_risk || 0}</span>
            <span className="text-[11px] text-[#B45309]">Advisory Review</span>
          </div>
        </div>

        {/* Card 4: Low Risk */}
        <div className="rounded-2xl sm:rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-5 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-[#15803D]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Low Risk</span>
            <CheckCircle className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#15803D] font-mono">{stats?.low_risk || 0}</span>
            <span className="text-[11px] text-[#15803D] font-semibold">In Good Standing</span>
          </div>
        </div>

        {/* Card 5: Faculty Mentors */}
        <div className="rounded-2xl sm:rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-5 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-[#7A6D61]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Faculty Mentors</span>
            <GraduationCap className="w-4 h-4 text-[#8C7D70]" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] font-mono">{stats?.total_faculty || 0}</span>
            <span className="text-[11px] text-[#7A6D61]">Active Advisors</span>
          </div>
        </div>

      </div>

      {/* 🌟 Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Distribution Donut */}
        <div className="rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADFD4]">
            <h3 className="text-sm font-bold text-[#2C2621]">Risk Stratification</h3>
            <span className="text-[11px] font-medium text-[#7A6D61]">Current Cohort</span>
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
                  contentStyle={{ backgroundColor: '#1F1B18', color: '#FAF7F2', borderRadius: '12px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.15)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px', color: '#5C4F43' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4-Week Attendance Trend */}
        <div className="rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADFD4]">
            <div>
              <h3 className="text-sm font-bold text-[#2C2621]">Weekly Attendance Telemetry</h3>
              <p className="text-[11px] text-[#7A6D61]">Institutional aggregated attendance percentage over past 4 weeks</p>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/80 border border-[#DACFBF] text-[#2C2621] font-semibold">
              Statutory Quota: 75%+
            </span>
          </div>
          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.attendance_trends || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3DACD" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#7A6D61' }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#7A6D61' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Attendance Rate']}
                  contentStyle={{ backgroundColor: '#1F1B18', color: '#FAF7F2', borderRadius: '12px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.15)' }}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#2C2621"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#D97706', strokeWidth: 2, stroke: '#FAF7F2' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 🌟 Department Breakdown & Early-Warning Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Performance Table */}
        <div className="rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADFD4]">
            <div>
              <h3 className="text-sm font-bold text-[#2C2621]">Department Performance Index</h3>
              <p className="text-[11px] text-[#7A6D61]">Comparative risk distribution across academic divisions</p>
            </div>
          </div>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EADFD4] text-[#7A6D61] font-bold uppercase tracking-wider bg-white/40">
                  <th className="py-2.5 px-3 rounded-l-xl">Department</th>
                  <th className="py-2.5 px-3 text-center">Total Students</th>
                  <th className="py-2.5 px-3 text-center">High Risk</th>
                  <th className="py-2.5 px-3 text-center">Medium Risk</th>
                  <th className="py-2.5 px-3 text-center rounded-r-xl">Average Risk Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFD4]/60">
                {stats?.departments?.map((dept: any) => (
                  <tr key={dept.name} className="hover:bg-white/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#2C2621] flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-[#8C7D70]" />
                      {dept.name}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-[#2C2621]">{dept.total}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] font-mono ${dept.high > 0 ? 'bg-[#FEE2E2] text-[#DC2626]' : 'text-[#A69788]'}`}>
                        {dept.high}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] font-mono ${dept.medium > 0 ? 'bg-[#FEF3C7] text-[#B45309]' : 'text-[#A69788]'}`}>
                        {dept.medium}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-extrabold text-[#2C2621] font-mono">
                      {dept.avg_risk} <span className="text-[10px] text-[#8C7D70] font-normal">/ 100</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Priority Academic Alerts Feed */}
        <div className="rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADFD4]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
              <h3 className="text-sm font-bold text-[#2C2621]">Priority Alerts</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#991B1B] font-bold">
              Action Required
            </span>
          </div>
          <div className="mt-3 space-y-2.5 max-h-[350px] overflow-y-auto">
            {stats?.recent_alerts?.length === 0 ? (
              <div className="text-center py-8 text-[#8C7D70] text-xs">
                No high-risk alerts at this moment.
              </div>
            ) : (
              stats?.recent_alerts?.map((alert: any) => (
                <div
                  key={alert.student_id}
                  onClick={() => navigate(`/students/${alert.student_id}`)}
                  className="p-3.5 rounded-2xl bg-white/80 border border-[#E0D4C5] hover:border-[#8E7B68] hover:bg-white cursor-pointer transition-all flex items-center justify-between group shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#2C2621] group-hover:text-amber-800 transition-colors">
                        {alert.student_name}
                      </span>
                      <span className="text-[10px] text-[#8C7D70] font-mono">
                        {alert.enrollment_no}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-[#7A6D61]">
                      <span className="font-bold text-[#DC2626]">Risk: {alert.risk_score}</span>
                      <span>•</span>
                      <span>Status: {alert.category}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8C7D70] group-hover:text-[#2C2621] transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
