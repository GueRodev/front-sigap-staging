import { Check, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { useAddToOrder } from "@/features/loans/hooks/useAddToOrder";
import { EMPTY_CART, useLoanCartStore } from "@/features/loans/stores/useLoanCartStore";
import type { CatalogItem } from "../types/catalog.types";

// Copiado de AreaCard: ghost legible sobre vidrio.
const glassGhostBtn =
  "text-foreground/75 hover:bg-glass-action-hover hover:text-foreground focus-visible:ring-1 focus-visible:ring-primary/60";

const AddToOrderButton = ({ item }: { item: CatalogItem }) => {
  const userId = useAuthStore((s) => s.user?.id);
  const cart = useLoanCartStore((s) => (userId ? s.carts[userId] : undefined) ?? EMPTY_CART);
  const removeItem = useLoanCartStore((s) => s.removeItem);
  const addToOrder = useAddToOrder();
  const inCart = cart.some((i) => i.equipmentId === item.id);

  if (!inCart) {
    return (
      <Button
        size="sm"
        className="w-full bg-primary font-semibold"
        onClick={(e) => {
          e.stopPropagation();
          addToOrder({ equipmentId: item.id, quantity: 1, approvalActor: item.approvalActor });
        }}
      >
        <ShoppingBag className="mr-2 h-4 w-4" />
        Agregar al pedido
      </Button>
    );
  }

  return (
    <div className="flex w-full items-center gap-1">
      <Button variant="ghost" size="sm" disabled className={cn("flex-1 disabled:opacity-100", glassGhostBtn)}>
        <Check className="mr-2 h-4 w-4 text-primary" />
        En tu pedido
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Quitar del pedido"
        className={cn("h-8 w-8", glassGhostBtn)}
        onClick={(e) => {
          e.stopPropagation();
          if (userId) removeItem(userId, item.id);
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AddToOrderButton;
