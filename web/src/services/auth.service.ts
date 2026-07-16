import { api } from '@/lib/api';
import type { AuthResponse, User } from '@/types';

export const authService = {
  async register(input: { name: string; email: string; password: string }) {
    const { data } = await api.post<AuthResponse>('/auth/register', input);
    return data;
  },

  async login(input: { email: string; password: string }) {
    const { data } = await api.post<AuthResponse>('/auth/login', input);
    return data;
  },

  async logout() {
    await api.post('/auth/logout').catch(() => undefined);
  },

  async forgotPassword(email: string) {
    const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(input: { token: string; password: string }) {
    const { data } = await api.post<{ message: string }>('/auth/reset-password', input);
    return data;
  },

  async changePassword(input: { currentPassword: string; newPassword: string }) {
    const { data } = await api.patch<{ message: string }>('/auth/change-password', input);
    return data;
  },

  async me() {
    const { data } = await api.get<User>('/users/me');
    return data;
  },

  async updateMe(input: { name?: string; avatar?: string | null }) {
    const { data } = await api.patch<User>('/users/me', input);
    return data;
  },
};
