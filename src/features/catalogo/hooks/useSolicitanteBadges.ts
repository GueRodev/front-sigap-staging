import { useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useLoanCartStore, EMPTY_CART } from "@/features/loans/stores/useLoanCartStore";
import { countActiveLoansForUser } from "@/features/loans/helpers/loanQueries";
import { useFavoritesStore } from "../stores/useFavoritesStore";

/** Conteos de badges del navbar del solicitante (préstamos activos, pedido y favoritos). */
export const useSolicitanteBadges = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const cart = useLoanCartStore((s) => (userId ? s.carts[userId] : undefined) ?? EMPTY_CART);
  const favorites = useFavoritesStore((s) => (userId ? s.favorites[userId] : undefined));
  const activeLoans = useMemo(() => (userId ? countActiveLoansForUser(userId) : 0), [userId]);
  return { activeLoans, cart: cart.length, favorites: favorites?.length ?? 0 };
};
