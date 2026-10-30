import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import StudentProfilePage from './pages/StudentProfilePage';
import InterventionsPage from './pages/InterventionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import StudentPortalPage from './pages/StudentPortalPage';
import SimulatorPage from './pages/SimulatorPage';
import CMSPage from './pages/CMSPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="w-8 h-8 border-3 border-oxford-900 border-t-academic-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  // Super admin has access to everything
  if (user.role === 'super_admin') return <>{children}</>;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (user.role === 'student') {
    return (
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<StudentPortalPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="students" element={<ProtectedRoute allowedRoles={['admin', 'hod', 'faculty']}><StudentsPage /></ProtectedRoute>} />
        <Route path="students/:id" element={<ProtectedRoute allowedRoles={['admin', 'hod', 'faculty']}><StudentProfilePage /></ProtectedRoute>} />
        <Route path="interventions" element={<ProtectedRoute allowedRoles={['admin', 'hod', 'faculty']}><InterventionsPage /></ProtectedRoute>} />
        <Route path="analytics" element={<ProtectedRoute allowedRoles={['admin', 'hod']}><AnalyticsPage /></ProtectedRoute>} />
        <Route path="simulator" element={<ProtectedRoute allowedRoles={['admin', 'faculty']}><SimulatorPage /></ProtectedRoute>} />
        <Route path="cms" element={<ProtectedRoute allowedRoles={['super_admin']}><CMSPage /></ProtectedRoute>} />
      </Route>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
