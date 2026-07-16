import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CouponValidation, Product } from '@/types';
import { finalPrice } from '@/lib/utils';

export type CartProduct = Pick<
  Product,
  'id' | 'title' | 'slug' | 'price' | 'discount' | 'images' | 'stock'
>;

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  savedItems: CartProduct[];
  coupon: CouponValidation | null;
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  saveForLater: (productId: string) => void;
  moveToCart: (productId: string) => void;
  removeSaved: (productId: string) => void;
  setCoupon: (coupon: CouponValidation | null) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      savedItems: [],
      coupon: null,
      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock, 99) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity: Math.min(quantity, product.stock) }] };
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.product.stock, 99)) }
              : i
          ),
        })),
      // Moves an item out of the active cart without losing it
      saveForLater: (productId) =>
        set((state) => {
          const item = state.items.find((i) => i.product.id === productId);
          if (!item) return state;
          return {
            items: state.items.filter((i) => i.product.id !== productId),
            savedItems: [
              item.product,
              ...state.savedItems.filter((p) => p.id !== productId),
            ],
          };
        }),
      moveToCart: (productId) =>
        set((state) => {
          const product = state.savedItems.find((p) => p.id === productId);
          if (!product) return state;
          const existing = state.items.find((i) => i.product.id === productId);
          return {
            savedItems: state.savedItems.filter((p) => p.id !== productId),
            items: existing
              ? state.items
              : [...state.items, { product, quantity: 1 }],
          };
        }),
      removeSaved: (productId) =>
        set((state) => ({ savedItems: state.savedItems.filter((p) => p.id !== productId) })),
      setCoupon: (coupon) => set({ coupon }),
      clear: () => set({ items: [], coupon: null }),
    }),
    { name: 'shopsphere:cart' }
  )
);

// ---- Derived selectors
export const selectCartCount = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectCartSubtotal = (state: CartState) =>
  state.items.reduce((sum, i) => sum + finalPrice(i.product) * i.quantity, 0);
