import { Heart } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { EMPTY_FAVORITES, useFavoritesStore } from "../stores/useFavoritesStore";
import { useToggleFavorite } from "../hooks/useToggleFavorite";

const FavoriteToggle = ({ equipmentId }: { equipmentId: number }) => {
  const userId = useAuthStore((s) => s.user?.id);
  const list = useFavoritesStore((s) => (userId ? s.favorites[userId] : undefined) ?? EMPTY_FAVORITES);
  const toggleFavorite = useToggleFavorite();
  const active = list.includes(equipmentId);

  return (
    <button
      type="button"
      aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={active}
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(equipmentId);
      }}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-glass-strong ring-1 ring-glass-highlight backdrop-blur transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <Heart className={cn("h-4 w-4", active ? "fill-destructive text-destructive" : "text-foreground/80")} />
    </button>
  );
};

export default FavoriteToggle;
