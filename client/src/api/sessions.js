import client from './client';

export const getSessions = (params) => client.get('/sessions', { params });
export const createSession = (data) => client.post('/sessions', data);
export const getSessionById = (id) => client.get(`/sessions/${id}`);
export const joinSession = (id) => client.post(`/sessions/${id}/join`);
export const leaveSession = (id) => client.post(`/sessions/${id}/leave`);
export const startSession = (id) => client.patch(`/sessions/${id}/start`);
export const endSession = (id) => client.patch(`/sessions/${id}/end`);
export const addSessionChat = (id, text) => client.post(`/sessions/${id}/chat`, { text });
