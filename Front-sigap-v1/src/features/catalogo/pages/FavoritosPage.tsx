import { useMemo } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import CatalogEmptyState from "../components/CatalogEmptyState";
import CatalogGrid from "../components/CatalogGrid";
import CatalogPageHeader from "../components/CatalogPageHeader";
import { useCatalogItems } from "../hooks/useCatalogItems";
import { EMPTY_FAVORITES, useFavoritesStore } from "../stores/useFavoritesStore";

const FavoritosPage = () => {
  const navigate = useNavigate();
  const items = useCatalogItems();
  const userId = useAuthStore((s) => s.user?.id);
  const favIds = useFavoritesStore((s) => (userId ? s.favorites[userId] : undefined) ?? EMPTY_FAVORITES);
  const favorites = useMemo(() => items.filter((i) => favIds.includes(i.id)), [items, favIds]);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <CatalogPageHeader
          title="Mis Favoritos"
          description="Los equipos que guardaste para pedir después"
          icon={Heart}
          count={favorites.length}
        />
      </div>
      {favorites.length === 0 ? (
        <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CatalogEmptyState
            icon={Heart}
            message="Aún no tenés favoritos"
            actionLabel="Explorar catálogo"
            onAction={() => navigate("/catalogo")}
          />
        </div>
      ) : (
        <CatalogGrid items={favorites} />
      )}
    </div>
  );
};

export default FavoritosPage;
