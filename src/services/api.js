// API service layer - semua fetch via axios sesuai spesifikasi
import axios from 'axios';
import {
  mockDashboardStats, mockChartData,
  mockRecentActivities,
} from '../data/mockData';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new Error(error.response?.data?.message || error.message))
);

// Simulate network delay untuk realistic UX
const delay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

// Generic mock fetcher yang mengemulasi axios response shape
const mockFetch = async (data, ms = 600) => {
  await delay(ms);
  return { data, status: 200 };
};

// Auth credentials hardcoded untuk demo (sesuai mockUsers)
const AUTH_STORE_KEY = 'sagara_auth';

export const authService = {
  login: async (role, username, key) => {
    await delay(800);
    const user = mockUsers.find(
      (u) => u.username === username && u.key === key && u.role === role
    );
    if (!user) throw new Error('Username atau key salah');
    const session = { ...user, role };
    localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(session));
    return session;
  },
  logout: () => {
    localStorage.removeItem(AUTH_STORE_KEY);
  },
  getSession: () => {
    try {
      const data = localStorage.getItem(AUTH_STORE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
};

export const dashboardService = {
  getStats: () => mockFetch(mockDashboardStats),
  getChartData: () => mockFetch(mockChartData),
  getRecentActivities: () => mockFetch(mockRecentActivities),
};

export const kendaraanService = {
  getAll: (params = {}) => apiClient.get('/kendaraans', { params }),
  create: (payload) => apiClient.post('/kendaraans', payload),
  update: (id, payload) => apiClient.put(`/kendaraans/${id}`, payload),
  remove: (id) => apiClient.delete(`/kendaraans/${id}`),
};

export const userService = {
  getAll: (params = {}) => apiClient.get('/users', { params }),
  create: (payload) => apiClient.post('/users', payload),
  update: (id, payload) => apiClient.put(`/users/${id}`, payload),
  remove: (id) => apiClient.delete(`/users/${id}`),
};

export const kerusakanService = {
  getAll: (params = {}) => apiClient.get('/kerusakan', { params }),
  getByDriver: (driverId) => apiClient.get('/kerusakan', { params: { driver_id: driverId } }),
  create: (payload) => apiClient.post('/kerusakan', payload),
  approve: (id, mekanikId) => apiClient.patch(`/kerusakan/${id}/approve`, { mekanik_id: mekanikId }),
  cancel: (id, driverId) => apiClient.patch(`/kerusakan/${id}/cancel`, null, {
    params: { driver_id: driverId },
  }),
  complete: (id, mekanikId) => apiClient.patch(`/kerusakan/${id}/complete`, null, {
    params: { mekanik_id: mekanikId },
  }),
};

export const bensinService = {
  getAll: (params) => apiClient.get('/bensin', { params }),
  create: (payload) => apiClient.post('/bensin', payload),
  cancel: (id, driverId) => apiClient.patch(`/bensin/${id}/cancel`, null, {
    params: { driver_id: driverId },
  }),
};

export const towingService = {
  getAll: (params) => apiClient.get('/towing', { params }),
  create: (payload) => apiClient.post('/towing', payload),
  cancel: (id, driverId) => apiClient.patch(`/towing/${id}/cancel`, null, {
    params: { driver_id: driverId },
  }),
};

export const billService = {
  getAll: () => apiClient.get('/bills'),
  create: (payload) => apiClient.post('/bills', payload),
};

// External API call example (JSONPlaceholder) - sesuai spesifikasi "Public API"
export const externalApiService = {
  getWeather: async () => {
    try {
      const res = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
      return res.data;
    } catch (err) {
      console.error('External API error:', err);
      throw err;
    }
  },
};
