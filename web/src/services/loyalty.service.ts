import { api } from '@/lib/api';
import type { LoyaltySummary, Notification } from '@/types';

export const loyaltyService = {
  async summary() {
    const { data } = await api.get<LoyaltySummary>('/loyalty/me');
    return data;
  },
};

export const notificationService = {
  async list() {
    const { data } = await api.get<{ items: Notification[]; unread: number }>('/notifications');
    return data;
  },

  async markAllRead() {
    await api.post('/notifications/read');
  },
};
