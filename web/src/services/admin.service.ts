import { api } from '@/lib/api';
import type { Category, Coupon, CustomerDetail, DashboardData, Paginated, User } from '@/types';

export const adminService = {
  async dashboard() {
    const { data } = await api.get<DashboardData>('/dashboard');
    return data;
  },

  async users(params: { page?: number; search?: string } = {}) {
    const { data } = await api.get<Paginated<User & { _count: { orders: number } }>>('/users', {
      params,
    });
    return data;
  },

  async userDetail(id: string) {
    const { data } = await api.get<CustomerDetail>(`/users/${id}`);
    return data;
  },

  // ---- Categories
  async createCategory(input: { name: string; description?: string; image?: string }) {
    const { data } = await api.post<Category>('/categories', input);
    return data;
  },

  async updateCategory(id: string, input: { name?: string; description?: string; image?: string }) {
    const { data } = await api.patch<Category>(`/categories/${id}`, input);
    return data;
  },

  async removeCategory(id: string) {
    await api.delete(`/categories/${id}`);
  },

  // ---- Coupons
  async coupons() {
    const { data } = await api.get<Coupon[]>('/coupons');
    return data;
  },

  async createCoupon(input: Partial<Coupon> & { code: string; type: Coupon['type']; value: number }) {
    const { data } = await api.post<Coupon>('/coupons', input);
    return data;
  },

  async updateCoupon(id: string, input: Partial<Coupon>) {
    const { data } = await api.patch<Coupon>(`/coupons/${id}`, input);
    return data;
  },

  async removeCoupon(id: string) {
    await api.delete(`/coupons/${id}`);
  },
};
