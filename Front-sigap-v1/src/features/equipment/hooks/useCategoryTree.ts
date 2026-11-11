import { useMemo, useSyncExternalStore } from "react";

import type { EquipmentCategory, EquipmentType } from "../types/equipment.types";
import { useCategoriesStore } from "./useCategoriesStore";
import { _equipmentStore } from "./useEquipmentList";

export interface CategoryNode extends EquipmentCategory {
  children: CategoryNode[];
  types: EquipmentType[];
  equipmentCount: number;
}

/** Conteo vivo de equipos por subcategoría (store en memoria de activos). */
export const useEquipmentCountsByCategory = () => {
  const equipment = useSyncExternalStore(_equipmentStore.subscribe, _equipmentStore.getAll);
  return useMemo(() => {
    const counts = new Map<number, number>();
    equipment.forEach((e) => counts.set(e.category_id, (counts.get(e.category_id) ?? 0) + 1));
    return counts;
  }, [equipment]);
};

/** Árbol de 2 niveles con sus tipos activos y conteo de equipos. */
export const useCategoryTree = () => {
  const categories = useCategoriesStore((s) => s.categories);
  const types = useCategoriesStore((s) => s.types);
  const counts = useEquipmentCountsByCategory();

  return useMemo(() => {
    const active = categories.filter((c) => !c.deleted_at);
    const activeTypes = types.filter((t) => !t.deleted_at);

    const tree: CategoryNode[] = active
      .filter((c) => c.level === 0)
      .sort((a, b) => a.order - b.order)
      .map((parent) => ({
        ...parent,
        types: [],
        equipmentCount: 0,
        children: active
          .filter((c) => c.parent_id === parent.id)
          .sort((a, b) => a.order - b.order)
          .map((child) => ({
            ...child,
            children: [],
            types: activeTypes.filter((t) => t.category_id === child.id),
            equipmentCount: counts.get(child.id) ?? 0,
          })),
      }));

    tree.forEach((parent) => {
      parent.equipmentCount = parent.children.reduce((sum, c) => sum + c.equipmentCount, 0);
    });

    const deleted = categories
      .filter((c) => c.deleted_at)
      .sort((a, b) => (a.deleted_at! < b.deleted_at! ? 1 : -1));

    return { tree, deleted };
  }, [categories, types, counts]);
};
