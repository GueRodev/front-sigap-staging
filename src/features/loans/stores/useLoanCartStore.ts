import { create } from "zustand";
import type { LoanCartItem } from "../types/loan.types";

/**
 * Pedido (carrito) separado por usuario. Store puro: solo estado y acciones.
 * No navega ni muestra toasts (eso vive en `useAddToOrder`).
 */
interface LoanCartState {
  carts: Record<string, LoanCartItem[]>;
  addItem: (userId: string, item: LoanCartItem) => void;
  removeItem: (userId: string, equipmentId: number) => void;
  /** Solo para bulk; el llamador pasa el máximo (`quantity_available`). */
  updateQuantity: (userId: string, equipmentId: number, quantity: number, max: number) => void;
  clear: (userId: string) => void;
  hasItem: (userId: string, equipmentId: number) => boolean;
  count: (userId: string) => number;
}

export const EMPTY_CART: LoanCartItem[] = [];

export const useLoanCartStore = create<LoanCartState>((set, get) => ({
  carts: {},
  addItem: (userId, item) =>
    set((s) => {
      const cart = s.carts[userId] ?? EMPTY_CART;
      if (cart.some((i) => i.equipmentId === item.equipmentId)) return s;
      return { carts: { ...s.carts, [userId]: [...cart, item] } };
    }),
  removeItem: (userId, equipmentId) =>
    set((s) => ({
      carts: {
        ...s.carts,
        [userId]: (s.carts[userId] ?? EMPTY_CART).filter((i) => i.equipmentId !== equipmentId),
      },
    })),
  updateQuantity: (userId, equipmentId, quantity, max) =>
    set((s) => {
      const q = Math.max(1, Math.min(Math.floor(quantity), max));
      return {
        carts: {
          ...s.carts,
          [userId]: (s.carts[userId] ?? EMPTY_CART).map((i) =>
            i.equipmentId === equipmentId ? { ...i, quantity: q } : i,
          ),
        },
      };
    }),
  clear: (userId) => set((s) => ({ carts: { ...s.carts, [userId]: EMPTY_CART } })),
  hasItem: (userId, equipmentId) =>
    (get().carts[userId] ?? EMPTY_CART).some((i) => i.equipmentId === equipmentId),
  count: (userId) => (get().carts[userId] ?? EMPTY_CART).length,
}));
