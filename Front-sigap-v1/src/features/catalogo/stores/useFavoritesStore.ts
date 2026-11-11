import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const EMPTY_FAVORITES: number[] = [];

/** Favoritos por usuario, persistidos en localStorage. */
interface FavoritesState {
  favorites: Record<string, number[]>;
  toggle: (userId: string, equipmentId: number) => void;
  isFavorite: (userId: string, equipmentId: number) => boolean;
  countFor: (userId: string) => number;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: {},
      toggle: (userId, equipmentId) =>
        set((s) => {
          const list = s.favorites[userId] ?? EMPTY_FAVORITES;
          const next = list.includes(equipmentId)
            ? list.filter((id) => id !== equipmentId)
            : [...list, equipmentId];
          return { favorites: { ...s.favorites, [userId]: next } };
        }),
      isFavorite: (userId, equipmentId) =>
        (get().favorites[userId] ?? EMPTY_FAVORITES).includes(equipmentId),
      countFor: (userId) => (get().favorites[userId] ?? EMPTY_FAVORITES).length,
    }),
    {
      name: "sigap:favorites",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ favorites: s.favorites }),
    }
  )
);
