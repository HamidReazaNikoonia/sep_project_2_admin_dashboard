import api from '../axios';
import type { LoginPayload, LoginResponse } from './types';

export const authApi = {
  // Login with username and password
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post('/auth/login-otp', payload);
    return response.data;
  },
  loginWithOtpCode: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post('/auth/validate-otp', payload);
    console.log({kir: response})
    return response.data;
  },
};