import { useCallback, useMemo, useState } from "react";
import type { CatalogItem, CatalogOption } from "../types/catalog.types";

const uniqueOptions = (pairs: Array<[number | null, string]>): CatalogOption[] => {
  const map = new Map<number, string>();
  for (const [id, name] of pairs) if (id !== null && !map.has(id)) map.set(id, name);
  return [...map].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
};

/** Búsqueda, categoría padre, área y "Disponibles ahora" sobre la lista del catálogo. */
export const useCatalogFilters = (items: CatalogItem[]) => {
  const [search, setSearch] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState<number | null>(null);
  const [areaId, setAreaId] = useState<number | null>(null);
  const [onlyAvailableNow, setOnlyAvailableNow] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (parentCategoryId !== null && i.parentCategoryId !== parentCategoryId) return false;
      if (areaId !== null && i.areaId !== areaId) return false;
      if (onlyAvailableNow && i.status !== "disponible") return false;
      if (!q) return true;
      return [i.name, i.brand, i.model, i.plateLabel]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, search, parentCategoryId, areaId, onlyAvailableNow]);

  const categoryOptions = useMemo(
    () => uniqueOptions(items.map((i) => [i.parentCategoryId, i.parentCategoryName])),
    [items],
  );
  const areaOptions = useMemo(() => uniqueOptions(items.map((i) => [i.areaId, i.areaName])), [items]);

  const reset = useCallback(() => {
    setSearch("");
    setParentCategoryId(null);
    setAreaId(null);
    setOnlyAvailableNow(false);
  }, []);

  const hasActiveFilters =
    search.trim() !== "" || parentCategoryId !== null || areaId !== null || onlyAvailableNow;

  return {
    search, setSearch,
    parentCategoryId, setParentCategoryId,
    areaId, setAreaId,
    onlyAvailableNow, setOnlyAvailableNow,
    filtered, total: filtered.length,
    categoryOptions, areaOptions,
    hasActiveFilters, reset,
  };
};
