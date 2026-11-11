import { useEffect, useState } from "react";

import { MOCK_EQUIPMENT } from "../data/mockEquipment";
import { useEquipmentPermissions } from "./useEquipmentPermissions";
import type {
  Equipment,
  EquipmentListFilters,
  EquipmentListPagination,
  EquipmentListResult,
} from "../types/equipment.types";

/**
 * Equipment list hook (mock).
 * Same input/output shape it will have when wired to Laravel.
 *
 * NOTE: in-memory store lives in module scope so create/update/remove
 * mutations from `useEquipmentMutations` are reflected here.
 */

let store: Equipment[] = [...MOCK_EQUIPMENT];
const listeners = new Set<() => void>();

export const _equipmentStore = {
  getAll: () => store,
  setAll: (next: Equipment[]) => {
    store = next;
    listeners.forEach((listener) => listener());
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

const matchesFilters = (item: Equipment, filters: EquipmentListFilters) => {
  if (filters.status && item.status !== filters.status) return false;
  if (filters.plate_type && item.plate_type !== filters.plate_type) return false;
  if (filters.category_id && item.category_id !== filters.category_id) return false;
  if (filters.area_id && item.current_area_id !== filters.area_id) return false;

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    const haystack = [
      item.name,
      item.institutional_plate,
      item.internal_plate,
      item.serial_number,
      item.brand,
      item.model,
      item.barcode,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
};

export const useEquipmentList = (
  filters: EquipmentListFilters,
  pagination: EquipmentListPagination,
): EquipmentListResult => {
  const { canView, sanitize } = useEquipmentPermissions();

  // Force re-render when store mutates.
  const [, setVersion] = useState(0);
  useEffect(() => {
    const unsubscribe = _equipmentStore.subscribe(() => setVersion((v) => v + 1));
    return () => {
      unsubscribe();
    };
  }, []);

  // Field-level authorization: alcance por rol + enmascarado de financieros.
  const all = _equipmentStore.getAll().filter(canView).map(sanitize);
  const filtered = all.filter((item) => matchesFilters(item, filters));
  const total = filtered.length;
  const totalAll = all.length;

  const start = (pagination.page - 1) * pagination.pageSize;
  const items = filtered.slice(start, start + pagination.pageSize);

  return { items, total, totalAll, isLoading: false };
};
