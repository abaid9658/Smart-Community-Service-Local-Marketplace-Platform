// ─── LocalHub API Client ────────────────────────────────────────
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Auto-refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        
        // Sync Zustand store
        const { useAuthStore } = await import('@/store/auth.store');
        const store = useAuthStore.getState();
        if (store.user) {
          store.setAuth(store.user, newToken);
        }

        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        
        // Clear Zustand store to trigger logout and break any active loops
        const { useAuthStore } = await import('@/store/auth.store');
        useAuthStore.getState().clearAuth();
        
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Typed API helpers ────────────────────────────────────────────
export const authAPI = {
  register: (data: Record<string, unknown>) => api.post('/auth/register', data),
  login: (data: Record<string, unknown>) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: Record<string, unknown>) => api.post('/auth/reset-password', data),
};

export const productAPI = {
  list: (params?: Record<string, unknown>) => api.get('/products', { params }),
  get: (id: string) => api.get(`/products/${id}`),
  create: (data: FormData) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: Record<string, unknown>) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  my: (params?: Record<string, unknown>) => api.get('/products/my', { params }),
  moderate: (id: string, action: string, reason?: string) => api.put(`/products/${id}/moderate`, { action, reason }),
};

export const serviceAPI = {
  list: (params?: Record<string, unknown>) => api.get('/services', { params }),
  get: (id: string) => api.get(`/services/${id}`),
  create: (data: FormData) => api.post('/services', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: Record<string, unknown>) => api.put(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
  my: (params?: Record<string, unknown>) => api.get('/services/my', { params }),
  moderate: (id: string, action: string, reason?: string) => api.put(`/services/${id}/moderate`, { action, reason }),
};

export const bookingAPI = {
  create: (data: Record<string, unknown>) => api.post('/bookings', data),
  my: (params?: Record<string, unknown>) => api.get('/bookings/my', { params }),
  provider: (params?: Record<string, unknown>) => api.get('/bookings/provider', { params }),
  get: (id: string) => api.get(`/bookings/${id}`),
  updateStatus: (id: string, status: string, reason?: string) =>
    api.put(`/bookings/${id}/status`, { status, cancellationReason: reason }),
};

export const messageAPI = {
  conversations: () => api.get('/messages/conversations'),
  getOrCreate: (userId: string) => api.post('/messages/conversations', { userId }),
  messages: (conversationId: string, params?: Record<string, unknown>) =>
    api.get(`/messages/conversations/${conversationId}/messages`, { params }),
  send: (conversationId: string, content: string) =>
    api.post(`/messages/conversations/${conversationId}/messages`, { content }),
};

export const reviewAPI = {
  list: (params: Record<string, unknown>) => api.get('/reviews', { params }),
  create: (data: Record<string, unknown>) => api.post('/reviews', data),
  reply: (id: string, reply: string) => api.put(`/reviews/${id}/reply`, { reply }),
};

export const notificationAPI = {
  list: () => api.get('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

export const favoriteAPI = {
  list: () => api.get('/favorites'),
  toggle: (data: { productId?: string; serviceId?: string }) => api.post('/favorites/toggle', data),
};

export const categoryAPI = {
  list: () => api.get('/categories'),
};

export const userAPI = {
  profile: (username: string) => api.get(`/users/profile/${username}`),
  updateProfile: (data: Record<string, unknown>) => api.put('/users/profile', data),
  uploadAvatar: (data: FormData) => api.post('/users/avatar', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateRole: (role: string) => api.put('/users/role', { role }),
};

export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  pendingListings: () => api.get('/admin/pending-listings'),
  reports: (params?: Record<string, unknown>) => api.get('/admin/reports', { params }),
  updateReport: (id: string, data: Record<string, unknown>) => api.put(`/admin/reports/${id}`, data),
  logs: (params?: Record<string, unknown>) => api.get('/admin/logs', { params }),
  users: (params?: Record<string, unknown>) => api.get('/users', { params }),
  suspendUser: (id: string, suspend: boolean, reason?: string) =>
    api.put(`/users/${id}/suspend`, { suspend, reason }),
};
