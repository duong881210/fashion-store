import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ICartItem } from '@/types';

interface CartStore {
  items: ICartItem[];
  addItem: (item: ICartItem) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, qty: number) => void;
  clearCart: () => void;
  total: () => number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  totalItems: () => number;
  setCart: (items: ICartItem[]) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen: boolean) => set({ isOpen }),
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) =>
              i.product === item.product &&
              i.color === item.color &&
              i.size === item.size
          );
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.product === item.product &&
                i.color === item.color &&
                i.size === item.size
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
              isOpen: true, // open the cart automatically
            };
          }
          return { items: [...state.items, item], isOpen: true }; // open the cart automatically
        }),
      removeItem: (productId, color, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(i.product === productId && i.color === color && i.size === size)
          ),
        })),
      updateQuantity: (productId, color, size, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product === productId && i.color === color && i.size === size
              ? { ...i, quantity: qty }
              : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      setCart: (items) => set({ items }),
      total: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'fashion-cart-storage',
      // We explicitly avoid saving the 'isOpen' state so the cart doesn't automatically open on page reload
      partialize: (state) => ({ items: state.items }),
    }
  )
);
