import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useFavoritesStore } from "../stores/useFavoritesStore";

/** Alterna favoritos del usuario actual y muestra el toast con acción "Ver favoritos". */
export const useToggleFavorite = () => {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.user?.id);
  const toggle = useFavoritesStore((s) => s.toggle);

  return useCallback(
    (equipmentId: number) => {
      if (!userId) return;
      const wasFavorite = useFavoritesStore
        .getState()
        .isFavorite(userId, equipmentId);
      toggle(userId, equipmentId);
      if (wasFavorite) {
        toast("Quitado de favoritos");
      } else {
        toast.success("Agregado a favoritos", {
          action: { label: "Ver favoritos", onClick: () => navigate("/favoritos") },
        });
      }
    },
    [userId, toggle, navigate],
  );
};
