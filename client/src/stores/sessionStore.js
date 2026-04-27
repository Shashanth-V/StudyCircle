import { create } from 'zustand';
import { sessionApi } from '../lib/api';

export const useSessionStore = create((set, get) => ({
  sessions: [],
  activeSession: null,
  isLoading: false,

  fetchSessions: async (params = {}) => {
    set({ isLoading: true });
    try {
      const res = await sessionApi.getSessions(params);
      set({ sessions: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  getSession: async (id) => {
    set({ isLoading: true });
    try {
      const res = await sessionApi.getSession(id);
      set({ activeSession: res.data, isLoading: false });
      return res.data;
    } catch {
      set({ isLoading: false });
      return null;
    }
  },

  createSession: async (data) => {
    const res = await sessionApi.createSession(data);
    set((state) => ({
      sessions: [res.data, ...state.sessions],
    }));
    return res.data;
  },

  joinSession: async (id) => {
    const res = await sessionApi.joinSession(id);
    set((state) => ({
      sessions: state.sessions.map((s) => (s._id === id ? res.data : s)),
      activeSession: state.activeSession?._id === id ? res.data : state.activeSession,
    }));
    return res.data;
  },

  leaveSession: async (id) => {
    const res = await sessionApi.leaveSession(id);
    set((state) => ({
      sessions: state.sessions.map((s) => (s._id === id ? res.data : s)),
      activeSession: state.activeSession?._id === id ? res.data : state.activeSession,
    }));
    return res.data;
  },

  updateActiveSession: (updates) => {
    set((state) => ({
      activeSession: state.activeSession ? { ...state.activeSession, ...updates } : null,
    }));
  },
}));

