import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

// Doctor API
export const doctorAPI = {
  getAll: () => api.get('/doctors'),
  getById: (id) => api.get(`/doctors/${id}`),
  getAvailability: (doctorId, date) => api.get(`/doctors/${doctorId}/availability`, { params: { date } }),
  updateAvailability: (data) => api.put('/doctors/availability', data),
};

// Appointment API
export const appointmentAPI = {
  create: (data) => api.post('/appointments', data),
  getAll: () => api.get('/appointments'),
  getById: (id) => api.get(`/appointments/${id}`),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  cancel: (id) => api.patch(`/appointments/${id}/cancel`),
};

// AI API
export const aiAPI = {
  symptomCheck: (symptoms) => api.post('/ai/symptom-check', { symptoms }),
  healthTips: () => api.get('/ai/health-tips'),
  recommendDoctors: (symptoms) => api.post('/ai/recommend-doctors', { symptoms }),
};

// Payment API
export const paymentAPI = {
  createOrder: (appointmentId) => api.post('/payments/create-order', { appointmentId }),
  verifyPayment: (data) => api.post('/payments/verify', data),
  getHistory: () => api.get('/payments/history'),
};

// Prescription API
export const prescriptionAPI = {
  getAll: () => api.get('/prescriptions'),
  getById: (id) => api.get(`/prescriptions/${id}`),
  create: (data) => api.post('/prescriptions', data),
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getDoctors: () => api.get('/admin/doctors'),
  approveDoctor: (id) => api.patch(`/admin/doctors/${id}/approve`),
  rejectDoctor: (id) => api.patch(`/admin/doctors/${id}/reject`),
  getStats: () => api.get('/admin/stats'),
};

export default api;
