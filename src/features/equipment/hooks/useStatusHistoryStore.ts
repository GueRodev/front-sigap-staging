import { create } from "zustand";

import type { EquipmentStatus, EquipmentStatusChange } from "../types/equipment.types";
import { _equipmentStore } from "./useEquipmentList";

/**
 * Submódulo Cambios de Estado (ADR-ACTIVOS-001) — store mock en memoria.
 *
 * Cada cambio de estado queda registrado con su motivo (obligatorio en las
 * transiciones críticas, ver `STATUS_REQUIRES_REASON`) y metadata opcional
 * (acta de baja, institución receptora, etc.). El historial es inmutable:
 * nunca se edita ni se borra, solo se agregan registros.
 */

const nowIso = () => new Date().toISOString();

export interface RegisterStatusChangeInput {
  equipment_id: number;
  to_status: EquipmentStatus;
  reason?: string | null;
  metadata?: Record<string, string> | null;
  changed_by_user_id: number | null;
  changed_by_name: string;
}

interface StatusHistoryState {
  changes: EquipmentStatusChange[];
  registerStatusChange: (input: RegisterStatusChangeInput) => EquipmentStatusChange | null;
  historyOf: (equipmentId: number) => EquipmentStatusChange[];
}

export const useStatusHistoryStore = create<StatusHistoryState>((set, get) => ({
  changes: [],

  registerStatusChange: (input) => {
    const all = _equipmentStore.getAll();
    const target = all.find((e) => e.id === input.equipment_id);
    if (!target) return null;
    if (target.status === input.to_status) return null;

    const record: EquipmentStatusChange = {
      id: get().changes.reduce((max, c) => Math.max(max, c.id), 0) + 1,
      equipment_id: input.equipment_id,
      from_status: target.status,
      to_status: input.to_status,
      reason: input.reason?.trim() ? input.reason.trim() : null,
      metadata: input.metadata && Object.keys(input.metadata).length > 0 ? input.metadata : null,
      changed_by_user_id: input.changed_by_user_id,
      changed_by_name: input.changed_by_name,
      created_at: nowIso(),
    };

    // El equipo es la fuente de verdad del estado actual; el historial solo acumula.
    _equipmentStore.setAll(
      all.map((e) =>
        e.id === input.equipment_id
          ? { ...e, status: input.to_status, updated_at: record.created_at }
          : e,
      ),
    );

    set((state) => ({ changes: [record, ...state.changes] }));
    return record;
  },

  historyOf: (equipmentId) => get().changes.filter((c) => c.equipment_id === equipmentId),
}));
