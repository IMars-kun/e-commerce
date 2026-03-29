import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "../types";

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const existing = get().items.find(
          (i) => i.product.id === product.id
        );
        if (existing) {
          get().updateQty(product.id, existing.quantity + 1);
        } else {
          set((s) => ({ items: [...s.items, { product, quantity: 1 }] }));
        }
      },

      removeItem: (id) =>
        set((s) => ({
          items: s.items.filter((i) => i.product.id !== id),
        })),

      updateQty: (id, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.product.id === id ? { ...i, quantity: qty } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + i.product.price * i.quantity, 0
        ),
    }),
    { name: "tokoku-cart" } // Disimpan di localStorage otomatis
  )
);