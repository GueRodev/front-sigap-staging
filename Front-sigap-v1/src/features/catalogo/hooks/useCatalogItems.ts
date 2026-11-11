import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useAreasStore } from "@/features/areas/hooks/useAreasStore";
import { useCategoriesStore } from "@/features/equipment/hooks/useCategoriesStore";
import { _equipmentStore } from "@/features/equipment/hooks/useEquipmentList";
import { isVisibleInCatalog } from "../helpers/catalogVisibility";
import { toCatalogItem } from "../helpers/toCatalogItem";
import type { CatalogItem } from "../types/catalog.types";

/** Equipos visibles en el catálogo para el usuario actual. */
export const useCatalogItems = (): CatalogItem[] => {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const unsubscribe = _equipmentStore.subscribe(() => setVersion((v) => v + 1));
    return () => {
      unsubscribe();
    };
  }, []);

  const areas = useAreasStore((s) => s.areas);
  const categories = useCategoriesStore((s) => s.categories);
  const role = useAuthStore((s) => s.user?.role);

  return useMemo(() => {
    if (!role) return [];
    const areasById = new Map(areas.map((a) => [a.id, a]));
    const categoriesById = new Map(categories.map((c) => [c.id, c]));
    const items: CatalogItem[] = [];
    for (const eq of _equipmentStore.getAll()) {
      const area = areasById.get(eq.current_area_id);
      if (area && isVisibleInCatalog(eq, area, role)) {
        items.push(toCatalogItem(eq, area, categoriesById));
      }
    }
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areas, categories, role, version]);
};
