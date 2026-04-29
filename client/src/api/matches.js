import client from './client';

export const getSuggestions = (params) => client.get('/matches/suggestions', { params });
export const sendRequest = (userId) => client.post(`/matches/request/${userId}`);
export const getIncomingRequests = () => client.get('/matches/requests/incoming');
export const getOutgoingRequests = () => client.get('/matches/requests/outgoing');
export const getMatches = () => client.get('/matches');
export const acceptRequest = (id) => client.patch(`/matches/${id}/accept`);
export const declineRequest = (id) => client.patch(`/matches/${id}/decline`);
