import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');

// Dashboard
export const getDashboardStats = () => api.get('/employees/dashboard');

// Employees
export const getEmployees = (params) => api.get('/employees', { params });
export const getEmployee = (id) => api.get(`/employees/${id}`);
export const createEmployee = (data) => api.post('/employees', data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// Payroll
export const getPayroll = () => api.get('/payroll');
export const createPayroll = (data) => api.post('/payroll', data);

// Leaves
export const getLeaves = () => api.get('/leaves');
export const createLeave = (data) => api.post('/leaves', data);
export const approveLeave = (id) => api.put(`/leaves/${id}/approve`);
export const rejectLeave = (id) => api.put(`/leaves/${id}/reject`);

// Export
export const exportExcel = () => api.get('/employees/export/excel', { responseType: 'blob' });
export const exportPDF = () => api.get('/employees/export/pdf', { responseType: 'blob' });

export default api;
