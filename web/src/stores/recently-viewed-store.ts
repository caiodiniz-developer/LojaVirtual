import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartProduct } from '@/stores/cart-store';

const MAX_ITEMS = 8;

interface RecentlyViewedState {
  products: CartProduct[];
  add: (product: CartProduct) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      products: [],
      add: (product) =>
        set((state) => ({
          products: [product, ...state.products.filter((p) => p.id !== product.id)].slice(
            0,
            MAX_ITEMS
          ),
        })),
    }),
    { name: 'shopsphere:recently-viewed' }
  )
);
