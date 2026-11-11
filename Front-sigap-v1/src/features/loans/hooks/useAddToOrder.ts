import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useLoanCartStore } from "../stores/useLoanCartStore";
import type { LoanCartItem } from "../types/loan.types";

/** Agrega al pedido del usuario actual y muestra el toast con acción "Ver pedido". */
export const useAddToOrder = () => {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.user?.id);
  const addItem = useLoanCartStore((s) => s.addItem);

  return useCallback(
    (item: LoanCartItem) => {
      if (!userId) return;
      addItem(userId, item);
      toast.success("Agregado a tu pedido", {
        action: { label: "Ver pedido", onClick: () => navigate("/pedido") },
      });
    },
    [userId, addItem, navigate],
  );
};
