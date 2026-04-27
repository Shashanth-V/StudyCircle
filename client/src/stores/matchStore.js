import { create } from 'zustand';
import { matchApi, userApi } from '../lib/api';

export const useMatchStore = create((set, get) => ({
  suggestions: [],
  matches: [],
  requests: {
    sent: [],
    received: [],
  },
  isLoading: false,

  fetchSuggestions: async () => {
    set({ isLoading: true });
    try {
      const res = await userApi.getSuggestions();
      set({ suggestions: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchMatches: async () => {
    set({ isLoading: true });
    try {
      const [acceptedRes, pendingRes] = await Promise.all([
        matchApi.getMatches('accepted'),
        matchApi.getMatches('pending'),
      ]);
      set({
        matches: acceptedRes.data,
        requests: {
          sent: pendingRes.data.filter((m) => m.requester._id === get().userId),
          received: pendingRes.data.filter((m) => m.receiver._id === get().userId),
        },
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  sendRequest: async (userId) => {
    await matchApi.sendRequest(userId);
    set((state) => ({
      suggestions: state.suggestions.filter((s) => s._id !== userId),
    }));
  },

  acceptRequest: async (matchId) => {
    await matchApi.acceptRequest(matchId);
    set((state) => {
      const req = state.requests.received.find((r) => r._id === matchId);
      return {
        requests: {
          ...state.requests,
          received: state.requests.received.filter((r) => r._id !== matchId),
        },
        matches: req ? [...state.matches, { ...req, status: 'accepted' }] : state.matches,
      };
    });
  },

  declineRequest: async (matchId) => {
    await matchApi.declineRequest(matchId);
    set((state) => ({
      requests: {
        ...state.requests,
        received: state.requests.received.filter((r) => r._id !== matchId),
        sent: state.requests.sent.filter((r) => r._id !== matchId),
      },
    }));
  },

  blockMatch: async (matchId, reason) => {
    await matchApi.blockMatch(matchId, reason);
    set((state) => ({
      matches: state.matches.filter((m) => m._id !== matchId),
    }));
  },
}));

