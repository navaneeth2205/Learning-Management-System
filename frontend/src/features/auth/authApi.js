import { api } from '../../services/api';

const unwrap = (response) => response.data?.data;

export const registerApi = (payload) => api.post('/auth/register', payload).then(unwrap);

export const loginApi = (payload) => api.post('/auth/login', payload).then(unwrap);

export const verifyOtpApi = (payload) => api.post('/auth/verify-otp', payload).then(unwrap);

export const resendOtpApi = (payload) => api.post('/auth/resend-otp', payload).then(unwrap);

export const googleLoginApi = (payload) => api.post('/auth/google', payload).then(unwrap);

export const forgotPasswordApi = (payload) => api.post('/auth/forgot-password', payload).then(unwrap);

export const resetPasswordApi = (payload) => api.post('/auth/reset-password', payload).then(unwrap);
