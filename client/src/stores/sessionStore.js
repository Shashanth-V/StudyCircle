import { create } from 'zustand';
import * as sessionsApi from '../api/sessions';

export const useSessionStore = create((set, get) => ({
  sessions: [],
  activeSession: null,
  isLoading: false,

  fetchSessions: async (params) => {
    set({ isLoading: true });
    try {
      const res = await sessionsApi.getSessions(params);
      set({ sessions: res.data });
    } finally {
      set({ isLoading: false });
    }
  },

  createSession: async (data) => {
    const res = await sessionsApi.createSession(data);
    set(state => ({ sessions: [...state.sessions, res.data] }));
    return res;
  },

  joinSession: async (id) => {
    const res = await sessionsApi.joinSession(id);
    return res;
  },

  leaveSession: async (id) => {
    const res = await sessionsApi.leaveSession(id);
    return res;
  },
  
  setActiveSession: (session) => set({ activeSession: session })
}));
