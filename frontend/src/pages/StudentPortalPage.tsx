import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { studentsAPI, academicAPI, interventionsAPI } from '../lib/api';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Mail,
  User,
  ShieldCheck,
  TrendingUp,
  Award
} from 'lucide-react';

export default function StudentPortalPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [assignmentsData, setAssignmentsData] = useState<any>(null);
  const [marksData, setMarksData] = useState<any>(null);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.student_id) {
      setLoading(false);
      return;
    }

    const studentId = user.student_id;
    Promise.all([
      studentsAPI.getProfile(studentId),
      academicAPI.attendance(studentId),
      academicAPI.assignments(studentId),
      academicAPI.marks(studentId),
      interventionsAPI.getForStudent(studentId),
    ])
      .then(([profRes, attRes, asgRes, marksRes, ivRes]) => {
        setProfile(profRes.data);
        setAttendanceData(attRes.data);
        setAssignmentsData(asgRes.data);
        setMarksData(marksRes.data);
        setInterventions(ivRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-oxford-900 border-t-academic-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading Your Student 360 Records...
          </span>
        </div>
      </div>
    );
  }

  if (!user?.student_id || !profile) {
    return (
      <div className="card-surface p-8 text-center max-w-md mx-auto mt-12">
        <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">No Student Profile Linked</h2>
        <p className="text-xs text-slate-500 mt-1">
          Your account is not linked to an active student enrollment record.
        </p>
      </div>
    );
  }

  const { student, attendance, assignments, academic, risk } = profile;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Student Welcome Hero */}
      <div className="card-surface p-6 bg-gradient-to-r from-oxford-900 via-oxford-800 to-oxford-900 text-white rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-academic-600/30 border border-academic-400/50 flex items-center justify-center text-academic-300 text-2xl font-black font-mono shadow-inner">
              {student.full_name?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Welcome back, {student.full_name}
                </h1>
                <span className="px-2 py-0.5 text-[10px] rounded font-bold uppercase bg-academic-500 text-oxford-950 font-mono">
                  {student.enrollment_no}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {student.department} • Semester {student.semester} • Academic Session 2024-2025
              </p>
            </div>
          </div>

          {/* Academic Standing Pill */}
          <div className="p-3.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10 text-right sm:text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-academic-300 block">
              Academic Standing
            </span>
            <span className="text-base font-bold text-white block mt-0.5">
              {risk?.category === 'High' ? 'Academic Attention Required' : risk?.category === 'Medium' ? 'Advisory Standing' : 'Good Standing'}
            </span>
            <span className="text-[11px] text-slate-300 block mt-0.5">
              Attendance: <strong>{attendance?.percentage ?? '—'}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Attendance Card */}
        <div className="card-surface p-5 border-l-4 border-oxford-800">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Attendance Rate</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono ${(attendance?.percentage ?? 100) < 75 ? 'text-risk-600' : 'text-stable-700'}`}>
              {attendance?.percentage ?? 'N/A'}%
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              ({attendance?.present || 0} / {attendance?.total_classes || 0} lectures)
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {(attendance?.percentage ?? 100) < 75 ? '⚠️ Below statutory minimum of 75%' : '✓ Meets statutory attendance quota'}
          </p>
        </div>

        {/* Assignments Card */}
        <div className="card-surface p-5 border-l-4 border-academic-600">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Assignments Submitted</span>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-academic-800">
              {assignments?.completion_pct ?? 'N/A'}%
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              ({assignments?.submitted || 0} / {assignments?.total || 0} completed)
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Coursework completion rate across all subjects
          </p>
        </div>

        {/* Academic Marks Card */}
        <div className="card-surface p-5 border-l-4 border-stable-600">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Assessment Average</span>
            <Award className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900">
              {academic?.overall_percentage ?? 'N/A'}%
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Internal Marks Average</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Across {academic?.marks?.length || 0} recorded internal tests
          </p>
        </div>
      </div>

      {/* Two Column Layout: Subject Attendance & Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-wise Attendance */}
        <div className="card-surface p-5">
          <h2 className="text-sm font-semibold text-slate-800 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Subject-wise Attendance Breakdown</span>
            <span className="text-[11px] text-slate-400">Semester {student.semester}</span>
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase bg-slate-50">
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3 text-center">Attended</th>
                  <th className="py-2.5 px-3 text-center">Total</th>
                  <th className="py-2.5 px-3 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceData?.subject_summary?.length === 0 ? (
                  <tr><td colSpan={4} className="py-6 text-center text-slate-400">No attendance records.</td></tr>
                ) : (
                  attendanceData?.subject_summary?.map((sub: any) => (
                    <tr key={sub.subject_id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        <div>{sub.subject_name}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{sub.subject_code}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">{sub.present + sub.late}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{sub.total}</td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono">
                        <span className={sub.percentage < 75 ? 'text-risk-600' : 'text-stable-700'}>
                          {sub.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assigned Interventions & Mentor Directives */}
        <div className="card-surface p-5">
          <h2 className="text-sm font-semibold text-slate-800 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Academic Mentorship & Action Directives</span>
            <span className="text-[11px] text-slate-400">{interventions.length} Assigned</span>
          </h2>
          <div className="mt-3 space-y-3">
            {interventions.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No active remedial interventions. You are currently in good academic standing!
              </div>
            ) : (
              interventions.map((iv) => (
                <div key={iv.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 capitalize">
                      {iv.type.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${iv.status === 'completed' || iv.status === 'evaluated' ? 'bg-stable-100 text-stable-800' : 'bg-academic-100 text-academic-800'}`}>
                      {iv.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-600">{iv.description}</p>
                  {iv.notes && (
                    <div className="p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-600">
                      <strong>Mentor Note:</strong> {iv.notes}
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                    <span>Assigned Mentor: {iv.faculty_name}</span>
                    {iv.deadline && <span>Target Date: {iv.deadline}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

