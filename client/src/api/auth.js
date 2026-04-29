import client from './client';

export const login = (data) => client.post('/auth/login', data);
export const signup = (data) => client.post('/auth/signup', data);
export const logout = () => client.post('/auth/logout');
export const verifyEmail = (data) => client.post('/auth/verify-email', data);
export const resendVerification = (data) => client.post('/auth/resend-verification', data);
export const forgotPassword = (data) => client.post('/auth/forgot-password', data);
export const resetPassword = (token, data) => client.post(`/auth/reset-password/${token}`, data);
