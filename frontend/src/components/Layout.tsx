import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NoticeBanner from './NoticeBanner';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Activity,
  Sliders,
  BarChart3,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Bell,
  GraduationCap,
  ChevronRight,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;
  const isFacultyOrAbove = ['faculty', 'hod', 'admin', 'super_admin'].includes(user?.role || '');

  const navItems = [
    ...(user?.role !== 'student' ? [
      { to: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
    ] : []),
    ...(user?.role === 'student' ? [
      { to: '/', label: 'My Academic 360', icon: GraduationCap },
    ] : []),
    ...(isFacultyOrAbove && user?.role !== 'student' ? [
      { to: '/students', label: 'Students Directory', icon: Users },
      { to: '/interventions', label: 'Interventions Tracker', icon: AlertTriangle },
      { to: '/simulator', label: 'Recovery Simulator', icon: Sliders },
    ] : []),
    ...(isAdmin && user?.role !== 'student' ? [
      { to: '/analytics', label: 'Reports & Analytics', icon: BarChart3 },
    ] : []),
    ...(isSuperAdmin ? [
      {
        to: '/cms',
        label: 'Central CMS Console',
        icon: ShieldCheck,
        badge: 'Super Admin',
      },
    ] : []),
  ];

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-amber-400 text-[#1F1B18] font-bold ring-1 ring-amber-300';
      case 'admin':
        return 'bg-[#3E342D] text-amber-100 font-medium';
      case 'hod':
        return 'bg-[#4A3E35] text-[#F5EFEB] font-medium';
      case 'faculty':
        return 'bg-[#D8CEBE] text-[#2C2621] font-medium';
      case 'student':
        return 'bg-[#F4EAE1] text-[#2C2621] font-semibold border border-[#E3D4C4]';
      default:
        return 'bg-[#EAE2D7] text-[#2C2621]';
    }
  };

  const formatRoleLabel = (role?: string) => {
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'hod') return 'Head of Dept.';
    if (role === 'faculty') return 'Faculty Mentor';
    if (role === 'admin') return 'Administrator';
    if (role === 'student') return 'Student Portal';
    return role || 'Guest';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#2C2621] selection:bg-[#EADBCE] selection:text-[#2C2621]">
      
      {/* 🌟 Dynamic Mobile & Desktop Institutional Campus Notice Ticker */}
      <NoticeBanner />

      <div className="flex flex-1 overflow-hidden">
        
        {/* 🌟 LUXURIOUS CASHMERE & CHARCOAL SIDEBAR */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-[#1F1B18] border-r border-[#352D27] text-[#D8CEBE] flex-shrink-0">
          
          {/* Brand Emblem */}
          <div className="h-16 flex items-center px-6 border-b border-[#352D27] bg-[#181512]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#2C2621] shadow-md shadow-black/20">
                <GraduationCap className="w-5 h-5 text-[#2C2621]" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white flex items-center gap-1">
                  Student<span className="font-extrabold text-amber-400">360</span>
                </span>
                <span className="block text-[9px] uppercase tracking-widest text-[#A89886] font-mono">
                  Academic Intelligence
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#8C7D70]">
              Governance Modules
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-xl transition-all duration-150 ${
                      isActive
                        ? 'bg-[#332A24] text-white font-semibold shadow-xs border border-white/10 ring-1 ring-amber-500/25'
                        : 'text-[#C2B5A5] hover:bg-[#2A231E] hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[#8C7D70] group-hover:text-amber-300 transition-colors" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-amber-400 text-[#1F1B18]">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="p-3.5 border-t border-[#352D27] bg-[#181512]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#332A24] border border-[#483B32] flex items-center justify-center text-xs font-bold text-amber-300">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate leading-tight">
                    {user?.full_name}
                  </p>
                  <span className={`inline-block mt-0.5 px-1.5 py-0.5 text-[9px] rounded uppercase tracking-wider ${getRoleBadge(user?.role)}`}>
                    {formatRoleLabel(user?.role)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 text-[#8C7D70] hover:text-red-400 hover:bg-[#2A231E] rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer Modal */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#1F1B18] border-r border-[#352D27] text-[#D8CEBE] z-50 animate-fade-in">
              <div className="h-16 flex items-center justify-between px-6 border-b border-[#352D27]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#2C2621]">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="text-base font-bold text-white">Student<span className="text-amber-400">360</span></span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-[#8C7D70] hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-xl ${
                          isActive
                            ? 'bg-[#332A24] text-white font-semibold'
                            : 'text-[#C2B5A5] hover:bg-[#2A231E]'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#8C7D70]" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-400 text-[#1F1B18]">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-[#352D27] bg-[#181512] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
                  <p className="text-[10px] text-[#8C7D70]">{user?.email}</p>
                </div>
                <button onClick={handleLogout} className="p-1.5 text-[#8C7D70] hover:text-red-400">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🌟 INTERIOR PAGE SURFACE */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#FBF9F5]">
          
          {/* Clean Top Alabaster Bar */}
          <header className="h-16 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#EADFD4] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-[#5C4F43] hover:text-[#2C2621] rounded-xl hover:bg-[#F2ECE3]"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-2 text-xs text-[#7A6D61]">
                <span className="font-semibold text-[#2C2621]">Apex Institute of Higher Technology</span>
                <span className="text-[#C5B8AB]">/</span>
                <span>Academic Session 2024-2025</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isSuperAdmin && (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E6] border border-[#E0D2C3] text-[#4A3E33] text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Super Admin Privilege Active</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 pl-3 border-l border-[#EADFD4]">
                <span className="text-xs font-semibold text-[#2C2621] hidden sm:inline">
                  {user?.full_name}
                </span>
                <span className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold uppercase ${getRoleBadge(user?.role)}`}>
                  {formatRoleLabel(user?.role)}
                </span>
              </div>
            </div>
          </header>

          {/* Page Body with Smooth Transition */}
          <main key={location.pathname} className="flex-1 p-4 sm:p-6 lg:p-8 animate-slide-up">
            <Outlet />
          </main>
        </div>

      </div>
    </div>
  );
}
