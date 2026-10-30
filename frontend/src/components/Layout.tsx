import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cmsAPI } from '../lib/api';
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
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  useEffect(() => {
    // Fetch public announcements for top notification bar
    cmsAPI.getPublicAnnouncements()
      .then(res => {
        if (res.data && res.data.length > 0) {
          setAnnouncements(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;
  const isFacultyOrAbove = ['faculty', 'hod', 'admin', 'super_admin'].includes(user?.role || '');

  const navItems = [
    // Standard dashboard for staff
    ...(user?.role !== 'student' ? [
      { to: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
    ] : []),
    // Student portal
    ...(user?.role === 'student' ? [
      { to: '/', label: 'My Academic 360', icon: GraduationCap },
    ] : []),
    // Staff routes
    ...(isFacultyOrAbove && user?.role !== 'student' ? [
      { to: '/students', label: 'Students Directory', icon: Users },
      { to: '/interventions', label: 'Interventions Tracker', icon: AlertTriangle },
      { to: '/simulator', label: 'Recovery Simulator', icon: Sliders },
    ] : []),
    ...(isAdmin && user?.role !== 'student' ? [
      { to: '/analytics', label: 'Reports & Analytics', icon: BarChart3 },
    ] : []),
    // SUPER ADMIN EXCLUSIVE: Complete CMS
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
        return 'bg-academic-700 text-white font-semibold ring-1 ring-academic-500/50';
      case 'admin':
        return 'bg-oxford-800 text-oxford-100 font-medium';
      case 'hod':
        return 'bg-slate-700 text-slate-100 font-medium';
      case 'faculty':
        return 'bg-slate-200 text-slate-800 font-medium';
      case 'student':
        return 'bg-amber-100 text-amber-900 font-medium';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const formatRoleLabel = (role?: string) => {
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'hod') return 'Head of Dept.';
    if (role === 'faculty') return 'Faculty Mentor';
    if (role === 'admin') return 'Administrator';
    if (role === 'student') return 'Student';
    return role || '';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Urgent Announcement Banner */}
      {announcements.length > 0 && !announcementDismissed && (
        <div className="bg-gradient-to-r from-oxford-950 via-oxford-900 to-oxford-950 text-white px-4 py-2.5 text-xs font-medium border-b border-academic-600/30 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 max-w-5xl mx-auto flex-1">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-academic-600 text-oxford-950">
              Notice
            </span>
            <span className="font-semibold text-academic-200">{announcements[0].title}:</span>
            <span className="text-slate-300 truncate">{announcements[0].content}</span>
          </div>
          <button
            onClick={() => setAnnouncementDismissed(true)}
            className="text-slate-400 hover:text-white ml-3 p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-oxford-900 border-r border-oxford-800 text-slate-300 flex-shrink-0">
          {/* Logo / Brand */}
          <div className="h-16 flex items-center px-6 border-b border-oxford-800 bg-oxford-950/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-academic-500 to-academic-700 flex items-center justify-center text-oxford-950 font-black shadow-md shadow-academic-900/40">
                <GraduationCap className="w-5 h-5 text-oxford-950" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  Student<span className="text-academic-400">360</span>
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  Academic Intelligence
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-md transition-all duration-150 ${
                      isActive
                        ? 'bg-oxford-800 text-white font-semibold shadow-sm border border-oxford-700/60'
                        : 'text-slate-300 hover:bg-oxford-800/60 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-academic-300 transition-colors" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-academic-600/90 text-oxford-950">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="p-3.5 border-t border-oxford-800/80 bg-oxford-950/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-oxford-800 border border-oxford-700 flex items-center justify-center text-xs font-bold text-academic-300">
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
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-oxford-800 rounded transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Modal */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-oxford-950/70 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-oxford-900 border-r border-oxford-800 text-slate-300 z-50">
              <div className="h-16 flex items-center justify-between px-6 border-b border-oxford-800">
                <span className="text-base font-bold text-white">Student<span className="text-academic-400">360</span></span>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-md ${
                          isActive
                            ? 'bg-oxford-800 text-white font-semibold'
                            : 'text-slate-300 hover:bg-oxford-800/60'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-academic-500 text-oxford-950">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-oxford-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
                  <p className="text-[10px] text-slate-400">{user?.email}</p>
                </div>
                <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-red-400">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50">
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-800">Apex Institute of Higher Technology</span>
                <span className="text-slate-300">/</span>
                <span>Academic Session 2024-2025</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isSuperAdmin && (
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-200/80 text-academic-800 text-[11px] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-academic-600" />
                  <span>Super Admin Privilege Active</span>
                </div>
              )}
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
                  {user?.full_name}
                </span>
                <span className={`px-2 py-0.5 text-[10px] rounded font-bold uppercase ${getRoleBadge(user?.role)}`}>
                  {user?.role === 'super_admin' ? 'Super Admin' : user?.role}
                </span>
              </div>
            </div>
          </header>

          {/* Page Body with Smooth Transition */}
          <main key={location.pathname} className="flex-1 p-4 sm:p-8 animate-slide-up">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

