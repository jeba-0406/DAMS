import apiClient from '@/lib/apiClient';
import { ApiResponse, AuthResponse } from '@/types';

export const authService = {
  async register(data: { name: string; email: string; password: string; role?: string }) {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/auth/register', data);
    return response.data;
  },

  async login(data: { email: string; password: string }) {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', data);
    return response.data;
  },
};
