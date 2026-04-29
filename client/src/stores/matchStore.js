import { create } from 'zustand';
import * as matchesApi from '../api/matches';

export const useMatchStore = create((set, get) => ({
  suggestions: [],
  matches: [],
  incomingRequests: [],
  outgoingRequests: [],
  isLoading: false,

  fetchSuggestions: async (params) => {
    set({ isLoading: true });
    try {
      const res = await matchesApi.getSuggestions(params);
      set({ suggestions: res.data.data });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMatches: async () => {
    const res = await matchesApi.getMatches();
    set({ matches: res.data });
  },

  fetchRequests: async () => {
    const [incomingRes, outgoingRes] = await Promise.all([
      matchesApi.getIncomingRequests(),
      matchesApi.getOutgoingRequests()
    ]);
    set({ 
      incomingRequests: incomingRes.data,
      outgoingRequests: outgoingRes.data 
    });
  },

  sendRequest: async (userId) => {
    await matchesApi.sendRequest(userId);
    // Remove from suggestions
    set(state => ({
      suggestions: state.suggestions.filter(s => s.user._id !== userId)
    }));
    await get().fetchRequests();
  },

  acceptRequest: async (id) => {
    await matchesApi.acceptRequest(id);
    set(state => ({
      incomingRequests: state.incomingRequests.filter(r => r._id !== id)
    }));
    await get().fetchMatches();
  },

  declineRequest: async (id) => {
    await matchesApi.declineRequest(id);
    set(state => ({
      incomingRequests: state.incomingRequests.filter(r => r._id !== id)
    }));
  }
}));
