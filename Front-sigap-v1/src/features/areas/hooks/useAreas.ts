import { useMemo } from "react";

import type { Area, AreaListFilters } from "../types/area.types";
import { UNASSIGNED_AREA_ID } from "../constants/areaType.constants";
import { useAreasStore } from "./useAreasStore";

const matches = (
  area: Area,
  filters: AreaListFilters,
  hasManager: boolean,
) => {
  if (area.deletedAt) return false;
  if (filters.types?.length && !filters.types.includes(area.type)) return false;
  if (filters.zone && (area.zone ?? "__none__") !== filters.zone) return false;
  if (filters.withoutManager && hasManager) return false;
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    if (!area.name.toLowerCase().includes(q)) return false;
  }
  return true;
};

/**
 * Returns the visible areas filtered by `filters`, with the protected
 * "Sin Área Asignada" area pinned first (only for the cards view).
 */
export const useAreas = (filters: AreaListFilters) => {
  const areas = useAreasStore((s) => s.areas);
  const userAreas = useAreasStore((s) => s.userAreas);

  return useMemo(() => {
    const managerCountByArea = new Map<number, number>();
    userAreas.forEach((ua) => {
      managerCountByArea.set(ua.area_id, (managerCountByArea.get(ua.area_id) ?? 0) + 1);
    });

    const filtered = areas.filter((a) =>
      matches(a, filters, (managerCountByArea.get(a.id) ?? 0) > 0),
    );

    // Pin protected area first
    const pinned = filtered.find((a) => a.id === UNASSIGNED_AREA_ID);
    const rest = filtered
      .filter((a) => a.id !== UNASSIGNED_AREA_ID)
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      items: pinned ? [pinned, ...rest] : rest,
      total: filtered.length,
      totalAll: areas.filter((a) => !a.deletedAt).length,
    };
  }, [areas, userAreas, filters]);
};

export const useDeletedAreas = () => {
  const areas = useAreasStore((s) => s.areas);
  return useMemo(() => areas.filter((a) => a.deletedAt), [areas]);
};

export const useZoneOptions = () => {
  const areas = useAreasStore((s) => s.areas);
  return useMemo(() => {
    const set = new Set<string>();
    areas.forEach((a) => {
      if (!a.deletedAt && a.zone) set.add(a.zone);
    });
    return Array.from(set).sort();
  }, [areas]);
};
