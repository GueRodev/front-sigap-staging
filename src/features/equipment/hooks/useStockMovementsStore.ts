import { create } from "zustand";

import type {
  AcquisitionType,
  EquipmentCondition,
  EquipmentStockMovement,
  StockMovementType,
} from "../types/equipment.types";
import { _equipmentStore } from "./useEquipmentList";

/**
 * Submódulo Movimientos de Stock (ADR-ACTIVOS-001) — store mock en memoria.
 *
 * El historial es inmutable: sólo se agregan registros. Cada movimiento guarda
 * un snapshot de las existencias resultantes (Patrón Snapshot Inmutable) para
 * que los reportes no reconstruyan el estado consultando el activo en vivo.
 */

const nowIso = () => new Date().toISOString();

/** Efecto de cada tipo de movimiento sobre total / disponible, por unidad. */
const MOVEMENT_EFFECT: Record<StockMovementType, { total: number; available: number }> = {
  entrada: { total: 1, available: 1 },
  salida: { total: -1, available: -1 },
  ajuste: { total: 0, available: 0 }, // el ajuste define sus deltas por signo explícito
  prestamo: { total: 0, available: -1 },
  devolucion: { total: 0, available: 1 },
  reserva: { total: 0, available: -1 },
  cancelacion_reserva: { total: 0, available: 1 },
};

export interface RegisterStockMovementInput {
  equipment_id: number;
  type: StockMovementType;
  /** Cantidad absoluta (> 0). En `ajuste` se usa junto con `adjustment_sign`. */
  quantity: number;
  /** Sólo para `ajuste`: +1 suma existencias, -1 las resta. */
  adjustment_sign?: 1 | -1;
  acquisition_type?: AcquisitionType | null;
  condition?: EquipmentCondition | null;
  reason?: string | null;
  reference?: string | null;
  performed_by_user_id: number | null;
  performed_by_name: string;
}

export type StockMovementError =
  | "equipment_not_found"
  | "invalid_quantity"
  | "insufficient_available"
  | "insufficient_total";

export type RegisterStockMovementResult =
  | { ok: true; movement: EquipmentStockMovement }
  | { ok: false; error: StockMovementError };

interface StockMovementsState {
  movements: EquipmentStockMovement[];
  registerMovement: (input: RegisterStockMovementInput) => RegisterStockMovementResult;
  movementsOf: (equipmentId: number) => EquipmentStockMovement[];
}

export const useStockMovementsStore = create<StockMovementsState>((set, get) => ({
  movements: [],

  registerMovement: (input) => {
    const all = _equipmentStore.getAll();
    const target = all.find((e) => e.id === input.equipment_id);
    if (!target) return { ok: false, error: "equipment_not_found" };

    const quantity = Math.trunc(input.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { ok: false, error: "invalid_quantity" };
    }

    const effect = MOVEMENT_EFFECT[input.type];
    const sign = input.type === "ajuste" ? input.adjustment_sign ?? 1 : 1;

    const totalDelta =
      input.type === "ajuste" ? quantity * sign : effect.total * quantity;
    const availableDelta =
      input.type === "ajuste" ? quantity * sign : effect.available * quantity;

    const nextTotal = target.quantity_total + totalDelta;
    const nextAvailable = target.quantity_available + availableDelta;

    if (nextAvailable < 0) return { ok: false, error: "insufficient_available" };
    if (nextTotal < 0) return { ok: false, error: "insufficient_total" };

    const createdAt = nowIso();
    const movement: EquipmentStockMovement = {
      id: get().movements.reduce((max, m) => Math.max(max, m.id), 0) + 1,
      equipment_id: input.equipment_id,
      type: input.type,
      quantity,
      total_delta: totalDelta,
      available_delta: availableDelta,
      snapshot_quantity_total: nextTotal,
      snapshot_quantity_available: nextAvailable,
      acquisition_type: input.type === "entrada" ? input.acquisition_type ?? null : null,
      condition: input.condition ?? null,
      reason: input.reason?.trim() ? input.reason.trim() : null,
      reference: input.reference?.trim() ? input.reference.trim() : null,
      performed_by_user_id: input.performed_by_user_id,
      performed_by_name: input.performed_by_name,
      created_at: createdAt,
    };

    // El activo es la fuente de verdad de las existencias; el historial acumula.
    _equipmentStore.setAll(
      all.map((e) =>
        e.id === input.equipment_id
          ? {
              ...e,
              quantity_total: nextTotal,
              quantity_available: nextAvailable,
              updated_at: createdAt,
            }
          : e,
      ),
    );

    set((state) => ({ movements: [movement, ...state.movements] }));
    return { ok: true, movement };
  },

  movementsOf: (equipmentId) =>
    get().movements.filter((m) => m.equipment_id === equipmentId),
}));
