import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = res.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendVerification: (data) => api.post('/auth/resend-verification', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// User API
export const userApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.patch('/users/me', data),
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/users/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getUser: (id) => api.get(`/users/${id}`),
  getSuggestions: () => api.get('/users/matches/suggestions'),
  searchUsers: (q, page = 1, limit = 20) => api.get('/users/search', { params: { q, page, limit } }),
  changePassword: (data) => api.patch('/users/settings/password', data),
  updateNotificationPrefs: (data) => api.patch('/users/settings/notifications', data),
  updatePrivacySettings: (data) => api.patch('/users/settings/privacy', data),
  deactivateAccount: () => api.post('/users/settings/deactivate'),
  deleteAccount: () => api.delete('/users/settings/account'),
};

// Match API
export const matchApi = {
  getMatches: (status) => api.get('/matches', { params: { status } }),
  sendRequest: (userId) => api.post(`/matches/request/${userId}`),
  acceptRequest: (id) => api.patch(`/matches/${id}/accept`),
  declineRequest: (id) => api.patch(`/matches/${id}/decline`),
  blockMatch: (id, reason) => api.post(`/matches/${id}/block`, { reason }),
  reportUser: (id, reason) => api.post(`/matches/${id}/report`, { reason }),
};

// Chat API
export const chatApi = {
  getChats: () => api.get('/chats'),
  getMessages: (chatId, page = 1, limit = 50, search) =>
    api.get(`/chats/${chatId}/messages`, { params: { page, limit, search } }),
  sendMessage: (chatId, data) => api.post(`/chats/${chatId}/messages`, data),
  uploadFile: (chatId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/chats/${chatId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteMessage: (chatId, msgId, forEveryone = false) =>
    api.delete(`/chats/${chatId}/messages/${msgId}`, { data: { forEveryone } }),
  markRead: (chatId) => api.post(`/chats/${chatId}/read`),
};

// Session API
export const sessionApi = {
  getSessions: (params) => api.get('/sessions', { params }),
  createSession: (data) => api.post('/sessions', data),
  getSession: (id) => api.get(`/sessions/${id}`),
  joinSession: (id) => api.post(`/sessions/${id}/join`),
  leaveSession: (id) => api.post(`/sessions/${id}/leave`),
};

// Notification API
export const notificationApi = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

// Leaderboard API
export const leaderboardApi = {
  getWeekly: (page = 1, limit = 20) => api.get('/leaderboard/weekly', { params: { page, limit } }),
  getUserBadges: (id) => api.get(`/leaderboard/${id}/badges`),
};

