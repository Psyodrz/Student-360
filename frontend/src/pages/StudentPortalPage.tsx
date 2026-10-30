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
  Award,
  Sparkles,
  ChevronRight
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
          <div className="w-8 h-8 border-3 border-[#2C2621] border-t-amber-500 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#8C7D70] uppercase tracking-wider">
            Loading Your Student 360 Records...
          </span>
        </div>
      </div>
    );
  }

  if (!user?.student_id || !profile) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-12 rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] shadow-xs">
        <GraduationCap className="w-12 h-12 text-[#A69788] mx-auto mb-3" />
        <h2 className="text-base font-bold text-[#2C2621]">No Student Profile Linked</h2>
        <p className="text-xs text-[#7A6D61] mt-1">
          Your account is not linked to an active student enrollment record.
        </p>
      </div>
    );
  }

  const { student, attendance, assignments, academic, risk } = profile;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* 🌟 Student Cashmere Welcome Hero Canvas */}
      <div className="relative rounded-3xl sm:rounded-[36px] bg-gradient-to-b from-[#978676] via-[#9F8C7B] to-[#8C7B6D] p-6 sm:p-8 text-white shadow-xl shadow-black/10 border border-white/30 overflow-hidden">
        
        {/* Subtle Ambient Light Ribbon */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-radial from-amber-100/25 via-transparent to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white text-[#2C2621] flex items-center justify-center text-2xl font-black font-mono shadow-md">
              {student.full_name?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Welcome back, {student.full_name}
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] rounded-full font-bold uppercase bg-white/20 text-white font-mono border border-white/30">
                  {student.enrollment_no}
                </span>
              </div>
              <p className="text-xs text-[#EAE2D7] mt-1">
                {student.department} • Semester {student.semester} • Academic Session 2024-2025
              </p>
            </div>
          </div>

          {/* Academic Standing Pill Card */}
          <div className="p-4 rounded-2xl bg-[#F6EDE6] text-[#2C2621] shadow-md border border-white/40 text-left sm:text-right shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A6D61] block">
              Continuous Standing
            </span>
            <span className="text-sm sm:text-base font-extrabold text-[#2C2621] block mt-0.5">
              {risk?.category === 'High' ? '🚨 Remedial Plan Active' : risk?.category === 'Medium' ? '⚠️ Advisory Review' : '✓ Good Academic Standing'}
            </span>
            <span className="text-[11px] text-[#7A6D61] block mt-0.5">
              Overall Attendance: <strong className="text-[#2C2621]">{attendance?.percentage ?? '—'}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 🌟 Metric Cards Row (Warm Porcelain Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Attendance Card */}
        <div className="rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-6 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-[#7A6D61]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Attendance Rate</span>
            <Calendar className="w-4 h-4 text-[#8C7D70]" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-mono ${(attendance?.percentage ?? 100) < 75 ? 'text-[#DC2626]' : 'text-[#15803D]'}`}>
              {attendance?.percentage ?? 'N/A'}%
            </span>
            <span className="text-[11px] text-[#7A6D61] font-semibold">
              ({attendance?.present || 0} / {attendance?.total_classes || 0} classes)
            </span>
          </div>
          <p className="mt-2 text-[11px] text-[#7A6D61]">
            {(attendance?.percentage ?? 100) < 75 ? '⚠️ Below statutory minimum of 75%' : '✓ Meets statutory attendance quota'}
          </p>
        </div>

        {/* Assignments Card */}
        <div className="rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-6 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-[#7A6D61]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assignments Submitted</span>
            <BookOpen className="w-4 h-4 text-[#8C7D70]" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#2C2621]">
              {assignments?.completion_pct ?? 'N/A'}%
            </span>
            <span className="text-[11px] text-[#7A6D61] font-semibold">
              ({assignments?.submitted || 0} / {assignments?.total || 0} submitted)
            </span>
          </div>
          <p className="mt-2 text-[11px] text-[#7A6D61]">
            Coursework completion rate across subjects
          </p>
        </div>

        {/* Academic Marks Card */}
        <div className="rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-6 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-[#7A6D61]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assessment Average</span>
            <Award className="w-4 h-4 text-[#8C7D70]" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#2C2621]">
              {academic?.overall_percentage ?? 'N/A'}%
            </span>
            <span className="text-[11px] text-[#7A6D61] font-semibold">Test Marks Average</span>
          </div>
          <p className="mt-2 text-[11px] text-[#7A6D61]">
            Across {academic?.marks?.length || 0} recorded internal tests
          </p>
        </div>

      </div>

      {/* 🌟 Two Column Layout: Subject Attendance & Mentorship Directives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Subject-wise Attendance */}
        <div className="rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-6 shadow-xs">
          <h2 className="text-sm font-bold text-[#2C2621] pb-3 border-b border-[#EADFD4] flex items-center justify-between">
            <span>Subject-wise Attendance Breakdown</span>
            <span className="text-[11px] text-[#7A6D61]">Semester {student.semester}</span>
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EADFD4] text-[#7A6D61] font-bold uppercase bg-white/40">
                  <th className="py-2.5 px-3 rounded-l-xl">Subject</th>
                  <th className="py-2.5 px-3 text-center">Attended</th>
                  <th className="py-2.5 px-3 text-center">Total</th>
                  <th className="py-2.5 px-3 text-right rounded-r-xl">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADFD4]/60">
                {attendanceData?.subject_summary?.length === 0 ? (
                  <tr><td colSpan={4} className="py-6 text-center text-[#8C7D70]">No attendance records.</td></tr>
                ) : (
                  attendanceData?.subject_summary?.map((sub: any) => (
                    <tr key={sub.subject_id} className="hover:bg-white/60 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#2C2621]">
                        <div>{sub.subject_name}</div>
                        <span className="text-[10px] text-[#8C7D70] font-mono">{sub.subject_code}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#2C2621]">{sub.present + sub.late}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#7A6D61]">{sub.total}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold font-mono">
                        <span className={sub.percentage < 75 ? 'text-[#DC2626]' : 'text-[#15803D]'}>
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
        <div className="rounded-3xl bg-[#F6EDE6] border border-[#EADFD4] p-6 shadow-xs">
          <h2 className="text-sm font-bold text-[#2C2621] pb-3 border-b border-[#EADFD4] flex items-center justify-between">
            <span>Academic Mentorship & Action Directives</span>
            <span className="text-[11px] text-[#7A6D61]">{interventions.length} Assigned</span>
          </h2>
          <div className="mt-3 space-y-3">
            {interventions.length === 0 ? (
              <div className="py-8 text-center text-[#8C7D70] text-xs">
                No active remedial interventions. You are currently in good academic standing!
              </div>
            ) : (
              interventions.map((iv) => (
                <div key={iv.id} className="p-4 rounded-2xl border border-[#E0D4C5] bg-white/80 space-y-1.5 text-xs shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2C2621] capitalize">
                      {iv.type.replace('_', ' ')}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${iv.status === 'completed' || iv.status === 'evaluated' ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEF3C7] text-[#B45309]'}`}>
                      {iv.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[#5C4F43]">{iv.description}</p>
                  {iv.notes && (
                    <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#EADFD4] text-[11px] text-[#6F6255]">
                      <strong className="text-[#2C2621]">Advisor Note:</strong> {iv.notes}
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[10px] text-[#8C7D70] pt-1.5 border-t border-[#EADFD4]">
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
