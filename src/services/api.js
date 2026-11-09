// API service layer - semua fetch via axios sesuai spesifikasi
import axios from 'axios';
import {
  mockUsers, mockKerusakans, mockBillPerbaikan,
  mockStruKBensin, mockTowings, mockDashboardStats, mockChartData,
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
  getAll: (params = {}) => {
    let data = [...mockUsers];
    if (params.search) {
      const q = params.search.toLowerCase();
      data = data.filter((u) => u.username.toLowerCase().includes(q));
    }
    if (params.role && params.role !== 'all') {
      data = data.filter((u) => u.role === params.role);
    }
    return mockFetch(data);
  },
  create: async (payload) => {
    await delay(700);
    const exists = mockUsers.find((u) => u.username === payload.username);
    if (exists) throw new Error('Username sudah digunakan');
    const newUser = { ...payload, id: Date.now(), gambar: null, created_at: new Date().toISOString() };
    mockUsers.push(newUser);
    return { data: newUser, status: 201 };
  },
  update: async (id, payload) => {
    await delay(700);
    const idx = mockUsers.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User tidak ditemukan');
    mockUsers[idx] = { ...mockUsers[idx], ...payload };
    return { data: mockUsers[idx], status: 200 };
  },
  remove: async (id) => {
    await delay(600);
    const idx = mockUsers.findIndex((u) => u.id === id);
    if (idx !== -1) mockUsers.splice(idx, 1);
    return { data: { message: 'Deleted' }, status: 200 };
  },
};

export const kerusakanService = {
  getAll: (params = {}) => {
    let data = [...mockKerusakans];
    if (params.status) data = data.filter((k) => k.status === params.status);
    return mockFetch(data);
  },
  getByDriver: (driverId) => mockFetch(mockKerusakans.filter((k) => k.driver?.username !== undefined)),
  approve: async (id, mekanikId) => {
    await delay(700);
    const idx = mockKerusakans.findIndex((k) => k.id === id);
    if (idx === -1) throw new Error('Data tidak ditemukan');
    const mekanik = mockUsers.find((u) => u.id === mekanikId);
    mockKerusakans[idx] = { ...mockKerusakans[idx], is_accept: true, status: 'Perbaikan', mekanik_id: mekanikId, mekanik };
    return { data: mockKerusakans[idx], status: 200 };
  },
  create: async (payload) => {
    await delay(700);
    const newItem = { ...payload, id: Date.now(), is_accept: false, status: 'Pending', created_at: new Date().toISOString() };
    mockKerusakans.push(newItem);
    return { data: newItem, status: 201 };
  },
  cancel: async (id) => {
    await delay(600);
    const idx = mockKerusakans.findIndex((k) => k.id === id);
    if (idx !== -1) mockKerusakans[idx].status = 'Cancelled';
    return { data: { message: 'Cancelled' }, status: 200 };
  },
  markAsPending: async (id) => {
    await delay(600);
    const idx = mockKerusakans.findIndex((k) => k.id === id);
    if (idx !== -1) mockKerusakans[idx].status = 'Perbaikan';
    return { data: mockKerusakans[idx], status: 200 };
  },
};

export const bensinService = {
  getAll: () => mockFetch(mockStruKBensin),
  create: async (payload) => {
    await delay(700);
    const newItem = { ...payload, id: Date.now(), status: 'Pending', created_at: new Date().toISOString() };
    mockStruKBensin.push(newItem);
    return { data: newItem, status: 201 };
  },
  cancel: async (id) => {
    await delay(600);
    const idx = mockStruKBensin.findIndex((b) => b.id === id);
    if (idx !== -1) mockStruKBensin[idx].status = 'Cancelled';
    return { data: { message: 'Cancelled' }, status: 200 };
  },
};

export const towingService = {
  getAll: () => mockFetch(mockTowings),
  create: async (payload) => {
    await delay(700);
    const newItem = { ...payload, id: Date.now(), status: 'Pending', created_at: new Date().toISOString() };
    mockTowings.push(newItem);
    return { data: newItem, status: 201 };
  },
  cancel: async (id) => {
    await delay(600);
    const idx = mockTowings.findIndex((t) => t.id === id);
    if (idx !== -1) mockTowings[idx].status = 'Cancelled';
    return { data: { message: 'Cancelled' }, status: 200 };
  },
};

export const billService = {
  getAll: () => mockFetch(mockBillPerbaikan),
  create: async (payload) => {
    await delay(700);
    const newItem = { ...payload, id: Date.now(), created_at: new Date().toISOString() };
    mockBillPerbaikan.push(newItem);
    return { data: newItem, status: 201 };
  },
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
