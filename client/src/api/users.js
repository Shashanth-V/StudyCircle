import client from './client';

export const getMe = () => client.get('/users/me');
export const updateMe = (data) => client.patch('/users/me', data);
export const uploadProfilePhoto = (formData) => client.post('/users/me/photo', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getUserById = (id) => client.get(`/users/${id}`);
export const changePassword = (data) => client.post('/users/me/change-password', data);
export const deleteAccount = () => client.delete('/users/me');
