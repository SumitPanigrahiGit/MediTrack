import axios from 'axios';
axios.post('/api/auth/login', data)
// ─── Configure API base URL ───────────────────────────────────────
// This reads from environment variable for production, falls back to localhost for dev
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Auto-inject JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('meditrack_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('meditrack_token');
      localStorage.removeItem('meditrack_user');
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ─── Auth ─────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// ─── Doctors ──────────────────────────────────────────────────────
export const doctorsAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getSpecialisations: () => api.get('/doctors/specialisations'),
  updateAvailability: (data) => api.put('/doctors/availability', data),
  getMyAppointments: (id) => api.get(`/doctors/${id}/appointments`)
};

// ─── Appointments ──────────────────────────────────────────────────
export const appointmentsAPI = {
  getMyAppointments: () => api.get('/appointments'),
  book: (data) => api.post('/appointments', data),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }),
  getById: (id) => api.get(`/appointments/${id}`)
};

// ─── AI ───────────────────────────────────────────────────────────
export const aiAPI = {
  checkSymptoms: (symptoms) => api.post('/ai/symptom-check', { symptoms }),
  getHealthTips: (data) => api.post('/ai/health-tips', data),
  recommendDoctors: (data) => api.post('/ai/recommend-doctors', data)
};

// ─── Payments ─────────────────────────────────────────────────────
export const paymentsAPI = {
  initiate: (appointmentId) => api.post('/payments/initiate', { appointmentId }),
  confirm: (data) => api.post('/payments/confirm', data),
  getHistory: () => api.get('/payments/history')
};

// ─── Prescriptions ────────────────────────────────────────────────
export const prescriptionsAPI = {
  create: (data) => api.post('/prescriptions', data),
  getMyPrescriptions: () => api.get('/prescriptions'),
  getById: (id) => api.get(`/prescriptions/${id}`),
  addReminder: (data) => api.post('/prescriptions/medication-reminder', data),
  getReminders: () => api.get('/prescriptions/reminders/me')
};

// ─── Admin ────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  approveDoctor: (id) => api.put(`/admin/approve-doctor/${id}`),
  removeUser: (id) => api.delete(`/admin/users/${id}`)
};

export default api;

