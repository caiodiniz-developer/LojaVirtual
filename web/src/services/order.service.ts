import { api } from '@/lib/api';
import type { CouponValidation, Order, Paginated, OrderStatus, ShippingOption } from '@/types';

export interface CheckoutInput {
  items: { productId: string; quantity: number }[];
  addressId: string;
  shippingMethod: 'standard' | 'express' | 'priority';
  couponCode?: string;
  payment: {
    method: 'CREDIT_CARD' | 'PIX' | 'BOLETO';
    cardNumber?: string;
    cardHolder?: string;
  };
}

export const orderService = {
  async quoteShipping(zipCode: string, subtotal: number) {
    const { data } = await api.post<ShippingOption[]>('/orders/shipping/quote', {
      zipCode,
      subtotal,
    });
    return data;
  },

  async validateCoupon(code: string, subtotal: number) {
    const { data } = await api.post<CouponValidation>('/coupons/validate', { code, subtotal });
    return data;
  },

  async checkout(input: CheckoutInput) {
    const { data } = await api.post<Order>('/orders/checkout', input);
    return data;
  },

  async listMine() {
    const { data } = await api.get<Order[]>('/orders/mine');
    return data;
  },

  async getMine(id: string) {
    const { data } = await api.get<Order>(`/orders/mine/${id}`);
    return data;
  },

  async cancelMine(id: string) {
    const { data } = await api.post<Order>(`/orders/mine/${id}/cancel`);
    return data;
  },

  async reorder(id: string) {
    const { data } = await api.post<{ added: number; total: number }>(`/orders/mine/${id}/reorder`);
    return data;
  },

  async listAll(params: { page?: number; status?: OrderStatus } = {}) {
    const { data } = await api.get<Paginated<Order>>('/orders', { params });
    return data;
  },

  async updateStatus(id: string, status: OrderStatus) {
    const { data } = await api.patch<Order>(`/orders/${id}/status`, { status });
    return data;
  },
};
