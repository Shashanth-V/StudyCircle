import { create } from 'zustand';
import * as authApi from '../api/auth';
import client from '../api/client';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  init: async () => {
    try {
      const res = await client.post('/auth/refresh');
      set({ 
        user: res.data.user, 
        accessToken: res.data.accessToken,
        isAuthenticated: true,
        isLoading: false 
      });
    } catch {
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  login: async (credentials) => {
    const res = await authApi.login(credentials);
    set({
      user: res.data.user,
      accessToken: res.data.accessToken,
      isAuthenticated: true
    });
    return res;
  },

  signup: async (data) => {
    const res = await authApi.signup(data);
    set({
      user: res.data.user,
      accessToken: res.data.accessToken,
      isAuthenticated: true
    });
    return res;
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },

  refreshToken: async () => {
    const res = await client.post('/auth/refresh');
    set({ 
      user: res.data.user, 
      accessToken: res.data.accessToken,
      isAuthenticated: true 
    });
    return res;
  },

  setUser: (user) => set({ user })
}));
