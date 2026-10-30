import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || (
    typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:8000/api'
      : 'https://ganduyadav-student360.hf.space/server'
  ),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth ──
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  registerStudent: (data: any) =>
    api.post('/auth/register-student', data),
  publicDepartments: () =>
    api.get('/auth/departments'),
  me: () => api.get('/auth/me'),
};

// ── Students ──
export const studentsAPI = {
  list: (params?: Record<string, any>) => api.get('/students', { params }),
  get: (id: number) => api.get(`/students/${id}`),
  getProfile: (id: number) => api.get(`/students/${id}/profile`),
  create: (data: any) => api.post('/students', data),
  update: (id: number, data: any) => api.put(`/students/${id}`, data),
  delete: (id: number) => api.delete(`/students/${id}`),
};

// ── Academic Records ──
export const academicAPI = {
  subjects: (params?: Record<string, any>) => api.get('/academic/subjects', { params }),
  attendance: (studentId: number) => api.get(`/academic/student/${studentId}/attendance`),
  assignments: (studentId: number) => api.get(`/academic/student/${studentId}/assignments`),
  marks: (studentId: number) => api.get(`/academic/student/${studentId}/marks`),
  addAttendance: (data: any) => api.post('/academic/attendance', data),
  addAssignment: (data: any) => api.post('/academic/assignments', data),
  addMarks: (data: any) => api.post('/academic/marks', data),
  importCSV: (file: File, recordType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/academic/import/csv?record_type=${recordType}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ── Risk Engine ──
export const riskAPI = {
  getStudent: (studentId: number) => api.get(`/risk/student/${studentId}`),
  calculateAll: () => api.post('/risk/calculate-all'),
  trends: (studentId: number) => api.get(`/risk/trends/${studentId}`),
  simulate: (data: any) => api.post('/risk/simulate', data),
};

// ── Interventions ──
export const interventionsAPI = {
  list: (params?: Record<string, any>) => api.get('/interventions', { params }),
  create: (data: any) => api.post('/interventions', data),
  update: (id: number, data: any) => api.put(`/interventions/${id}`, data),
  getForStudent: (studentId: number) => api.get(`/interventions/student/${studentId}`),
};

// ── Analytics ──
export const analyticsAPI = {
  dashboard: () => api.get('/analytics/dashboard'),
  riskDistribution: () => api.get('/analytics/risk-distribution'),
  departmentComparison: () => api.get('/analytics/department-comparison'),
  interventionEffectiveness: () => api.get('/analytics/intervention-effectiveness'),
  exportCSV: (exportType: string) =>
    api.get(`/analytics/export/csv?export_type=${exportType}`, { responseType: 'blob' }),
  departments: () => api.get('/analytics/departments'),
  faculty: () => api.get('/analytics/faculty'),
};

// ── CMS (Super Admin) ──
export const cmsAPI = {
  dashboard: () => api.get('/cms/dashboard'),
  // Users
  users: (params?: Record<string, any>) => api.get('/cms/users', { params }),
  createUser: (data: any) => api.post('/cms/users', data),
  updateUser: (id: number, data: any) => api.put(`/cms/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/cms/users/${id}`),
  // Departments
  departments: () => api.get('/cms/departments'),
  createDepartment: (data: any) => api.post('/cms/departments', data),
  updateDepartment: (id: number, data: any) => api.put(`/cms/departments/${id}`, data),
  deleteDepartment: (id: number) => api.delete(`/cms/departments/${id}`),
  // Subjects
  subjects: (params?: Record<string, any>) => api.get('/cms/subjects', { params }),
  createSubject: (data: any) => api.post('/cms/subjects', data),
  updateSubject: (id: number, data: any) => api.put(`/cms/subjects/${id}`, data),
  deleteSubject: (id: number) => api.delete(`/cms/subjects/${id}`),
  // Students
  students: (params?: Record<string, any>) => api.get('/cms/students', { params }),
  createStudent: (data: any) => api.post('/cms/students', data),
  updateStudent: (id: number, data: any) => api.put(`/cms/students/${id}`, data),
  deleteStudent: (id: number) => api.delete(`/cms/students/${id}`),
  deleteIntervention: (id: number) => api.delete(`/cms/interventions/${id}`),
  // Settings & Risk config
  getSettings: (category?: string) => api.get('/cms/settings', { params: { category } }),
  updateSettings: (items: any[]) => api.put('/cms/settings', items),
  getRiskConfig: () => api.get('/cms/risk-config'),
  updateRiskConfig: (data: any) => api.put('/cms/risk-config', data),
  // Announcements
  announcements: () => api.get('/cms/announcements'),
  createAnnouncement: (data: any) => api.post('/cms/announcements', data),
  updateAnnouncement: (id: number, data: any) => api.put(`/cms/announcements/${id}`, data),
  deleteAnnouncement: (id: number) => api.delete(`/cms/announcements/${id}`),
  // Audit Logs
  auditLogs: (params?: Record<string, any>) => api.get('/cms/audit-logs', { params }),
  // Pages
  pages: () => api.get('/cms/pages'),
  createPage: (data: any) => api.post('/cms/pages', data),
  updatePage: (id: number, data: any) => api.put(`/cms/pages/${id}`, data),
  deletePage: (id: number) => api.delete(`/cms/pages/${id}`),
  // Bulk operations
  recalculateAll: () => api.post('/cms/bulk/recalculate-risks'),
  resetDatabase: () => api.post('/cms/bulk/reset-database'),
  // Public announcements
  getPublicAnnouncements: () => api.get('/cms/public/announcements'),
};
