/**
 * Zustand store para el módulo de Traslados (SIGAP).
 *
 * Mantiene la lista in-memory de `MOCK_TRANSFERS` y ofrece las mutaciones
 * descritas en el ADR. Cada mutación válida también sincroniza el estado
 * del equipo en `_equipmentStore` (única regla: sólo Traslados escribe
 * `current_area_id` / `sub_location_id` tras el registro inicial).
 */

import { create } from 'zustand';

import { _equipmentStore } from '@/features/equipment/hooks/useEquipmentList';

import { MOCK_TRANSFERS } from '../data/mockTransfers';
import type { Transfer, TransferStatus } from '../types/transfer.types';

interface DirectPayload {
  equipment_id: number;
  origin_area_id: number;
  destination_area_id: number;
  reason: string;
  executed_by_id: number;
}

interface RequestPayload {
  equipment_id: number;
  origin_area_id: number;
  destination_area_id: number;
  requested_by_id: number;
  justification: string;
  expected_date: string;
  is_temporary: boolean;
  return_date: string | null;
}

interface SublocationPayload {
  equipment_id: number;
  area_id: number;
  origin_sublocation_id: number | null;
  destination_sublocation_id: number;
  reason: string;
  executed_by_id: number;
}

interface ApprovePayload {
  transfer_id: number;
  approved_by_id: number;
  notes?: string | null;
}
interface RejectPayload {
  transfer_id: number;
  rejected_by_id: number;
  reason: string;
}
interface CancelPayload {
  transfer_id: number;
  cancelled_by_id: number;
}

interface TransfersState {
  transfers: Transfer[];
  createDirect: (payload: DirectPayload) => Transfer;
  createRequest: (payload: RequestPayload) => Transfer;
  changeSublocation: (payload: SublocationPayload) => Transfer;
  approve: (payload: ApprovePayload) => Transfer | null;
  reject: (payload: RejectPayload) => Transfer | null;
  cancel: (payload: CancelPayload) => Transfer | null;
}

const nowIso = () => new Date().toISOString();

/** Aplica al equipo el efecto de un traslado completado. */
const applyEquipmentMove = (
  equipmentId: number,
  patch: Partial<{ current_area_id: number; sub_location_id: number | null }>,
) => {
  const all = _equipmentStore.getAll();
  _equipmentStore.setAll(
    all.map((e) =>
      e.id === equipmentId ? { ...e, ...patch, updated_at: nowIso() } : e,
    ),
  );
};

const baseTransfer = (id: number, status: TransferStatus): Transfer => ({
  id,
  type: 'direct',
  status,
  equipment_id: 0,
  origin_area_id: 0,
  destination_area_id: 0,
  origin_sublocation_id: null,
  destination_sublocation_id: null,
  is_temporary: false,
  requested_by_id: 0,
  request_reason: null,
  expected_date: null,
  return_date: null,
  approved_by_id: null,
  approved_at: null,
  approval_notes: null,
  rejected_by_id: null,
  rejected_at: null,
  rejection_reason: null,
  executed_by_id: null,
  executed_at: null,
  cancelled_by_id: null,
  cancelled_at: null,
  created_at: nowIso(),
  updated_at: nowIso(),
});

export const useTransfersStore = create<TransfersState>((set, get) => ({
  transfers: MOCK_TRANSFERS,

  createDirect: (p) => {
    const nextId = get().transfers.reduce((m, t) => Math.max(m, t.id), 0) + 1;
    const t: Transfer = {
      ...baseTransfer(nextId, 'completed'),
      type: 'direct',
      equipment_id: p.equipment_id,
      origin_area_id: p.origin_area_id,
      destination_area_id: p.destination_area_id,
      requested_by_id: p.executed_by_id,
      request_reason: p.reason,
      executed_by_id: p.executed_by_id,
      executed_at: nowIso(),
    };
    // Efecto sobre el equipo: nueva área + reset de sub_location_id.
    applyEquipmentMove(p.equipment_id, {
      current_area_id: p.destination_area_id,
      sub_location_id: null,
    });
    set((s) => ({ transfers: [t, ...s.transfers] }));
    return t;
  },

  createRequest: (p) => {
    const nextId = get().transfers.reduce((m, t) => Math.max(m, t.id), 0) + 1;
    const t: Transfer = {
      ...baseTransfer(nextId, 'pending'),
      type: 'request',
      equipment_id: p.equipment_id,
      origin_area_id: p.origin_area_id,
      destination_area_id: p.destination_area_id,
      requested_by_id: p.requested_by_id,
      request_reason: p.justification,
      expected_date: p.expected_date,
      is_temporary: p.is_temporary,
      return_date: p.is_temporary ? p.return_date : null,
    };
    set((s) => ({ transfers: [t, ...s.transfers] }));
    return t;
  },

  changeSublocation: (p) => {
    const nextId = get().transfers.reduce((m, t) => Math.max(m, t.id), 0) + 1;
    const t: Transfer = {
      ...baseTransfer(nextId, 'completed'),
      type: 'sublocation_change',
      equipment_id: p.equipment_id,
      origin_area_id: p.area_id,
      destination_area_id: p.area_id,
      origin_sublocation_id: p.origin_sublocation_id,
      destination_sublocation_id: p.destination_sublocation_id,
      requested_by_id: p.executed_by_id,
      request_reason: p.reason || null,
      executed_by_id: p.executed_by_id,
      executed_at: nowIso(),
    };
    applyEquipmentMove(p.equipment_id, {
      sub_location_id: p.destination_sublocation_id,
    });
    set((s) => ({ transfers: [t, ...s.transfers] }));
    return t;
  },

  approve: (p) => {
    const current = get().transfers.find((t) => t.id === p.transfer_id);
    if (!current || current.status !== 'pending') return null;
    // Aprobar ejecuta el traslado en la misma operación (ADR §Solicitud).
    applyEquipmentMove(current.equipment_id, {
      current_area_id: current.destination_area_id,
      sub_location_id: null,
    });
    const updated: Transfer = {
      ...current,
      status: 'approved',
      approved_by_id: p.approved_by_id,
      approved_at: nowIso(),
      approval_notes: p.notes ?? null,
      executed_by_id: p.approved_by_id,
      executed_at: nowIso(),
      updated_at: nowIso(),
    };
    set((s) => ({
      transfers: s.transfers.map((t) => (t.id === p.transfer_id ? updated : t)),
    }));
    return updated;
  },

  reject: (p) => {
    const current = get().transfers.find((t) => t.id === p.transfer_id);
    if (!current || current.status !== 'pending') return null;
    const updated: Transfer = {
      ...current,
      status: 'rejected',
      rejected_by_id: p.rejected_by_id,
      rejected_at: nowIso(),
      rejection_reason: p.reason,
      updated_at: nowIso(),
    };
    set((s) => ({
      transfers: s.transfers.map((t) => (t.id === p.transfer_id ? updated : t)),
    }));
    return updated;
  },

  cancel: (p) => {
    const current = get().transfers.find((t) => t.id === p.transfer_id);
    if (!current || current.status !== 'pending') return null;
    const updated: Transfer = {
      ...current,
      status: 'cancelled',
      cancelled_by_id: p.cancelled_by_id,
      cancelled_at: nowIso(),
      updated_at: nowIso(),
    };
    set((s) => ({
      transfers: s.transfers.map((t) => (t.id === p.transfer_id ? updated : t)),
    }));
    return updated;
  },
}));
