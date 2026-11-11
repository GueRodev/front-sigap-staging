import { useMemo, useState } from 'react';

import type { Transfer, TransferStatus, TransferType } from '../types/transfer.types';
import { useTransfersStore } from './useTransfersStore';

export interface TransferListFilters {
  search?: string;
  type?: TransferType;
  status?: TransferStatus;
  area_id?: number;
}

const EMPTY: TransferListFilters = {};

const matches = (
  t: Transfer,
  filters: TransferListFilters,
  equipmentIndex: Map<number, string>,
): boolean => {
  if (filters.type && t.type !== filters.type) return false;
  if (filters.status && t.status !== filters.status) return false;
  if (
    filters.area_id &&
    t.origin_area_id !== filters.area_id &&
    t.destination_area_id !== filters.area_id
  ) {
    return false;
  }
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    const haystack = [
      equipmentIndex.get(t.equipment_id) ?? '',
      t.request_reason ?? '',
    ]
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
};

export const useTransferFilters = (initial: TransferListFilters = EMPTY) => {
  const [filters, setFilters] = useState<TransferListFilters>(initial);
  const reset = () => setFilters(EMPTY);
  const hasActive = !!(filters.search || filters.type || filters.status || filters.area_id);
  return { filters, setFilters, reset, hasActive };
};

/**
 * Lista de traslados filtrada + ordenada por `created_at` descendente.
 * Recibe un índice `equipmentId → nombre|placa` para permitir búsquedas
 * por texto sin acoplar el hook al módulo de Equipment.
 */
export const useTransfers = (
  filters: TransferListFilters,
  equipmentIndex: Map<number, string>,
) => {
  const transfers = useTransfersStore((s) => s.transfers);
  const items = useMemo(() => {
    return transfers
      .filter((t) => matches(t, filters, equipmentIndex))
      .slice()
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }, [transfers, filters, equipmentIndex]);

  return { items, totalAll: transfers.length };
};
