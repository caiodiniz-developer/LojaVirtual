import { api } from '@/lib/api';
import type { Address, Product, WishlistItem } from '@/types';

export type AddressInput = Omit<Address, 'id'>;

export const addressService = {
  async list() {
    const { data } = await api.get<Address[]>('/addresses');
    return data;
  },

  async create(input: AddressInput) {
    const { data } = await api.post<Address>('/addresses', input);
    return data;
  },

  async update(id: string, input: Partial<AddressInput>) {
    const { data } = await api.patch<Address>(`/addresses/${id}`, input);
    return data;
  },

  async remove(id: string) {
    await api.delete(`/addresses/${id}`);
  },
};

export const wishlistService = {
  async list() {
    const { data } = await api.get<WishlistItem[]>('/wishlist');
    return data;
  },

  async toggle(productId: string) {
    const { data } = await api.post<{ wished: boolean }>(`/wishlist/${productId}/toggle`);
    return data;
  },

  async share() {
    const { data } = await api.post<{ token: string }>('/wishlist/share');
    return data;
  },

  async shared(token: string) {
    const { data } = await api.get<{ owner: string; items: { product: Product }[] }>(
      `/wishlist/shared/${token}`
    );
    return data;
  },
};

export const newsletterService = {
  async subscribe(email: string) {
    const { data } = await api.post<{ message: string }>('/newsletter', { email });
    return data;
  },
};
