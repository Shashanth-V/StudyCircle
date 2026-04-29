import client from './client';

export const getChats = () => client.get('/chats');
export const getMessages = (chatId, params) => client.get(`/chats/${chatId}/messages`, { params });
export const sendMessage = (chatId, data) => client.post(`/chats/${chatId}/messages`, data);
export const sendFileMessage = (chatId, formData) => client.post(`/chats/${chatId}/messages/file`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
