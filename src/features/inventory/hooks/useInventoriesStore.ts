import { create } from "zustand";

import { MOCK_EQUIPMENT } from "@/features/equipment/data/mockEquipment";

import { MOCK_INVENTORY_INCIDENTS } from "../data/mockIncidents";
import {
  MOCK_INVENTORIES,
  MOCK_INVENTORY_AREAS,
  MOCK_INVENTORY_ITEMS,
} from "../data/mockInventories";
import type {
  Inventory,
  InventoryArea,
  InventoryAreaStatus,
  InventoryIncident,
  InventoryItem,
} from "../types/inventory.types";

/**
 * Zustand store — single source of truth for the Inventory feature.
 * Follows the same in-memory pattern as `useAreasStore`; no backend calls.
 *
 * Business rules enforced at store level (see plan / ADR-INVENTARIOS-001):
 * - `addInventoryItem` deduplicates by `(inventoryId, equipmentId)` → returns
 *   the existing row instead of creating a duplicate (simulates 409 Conflict).
 * - `addInventoryItem` derives `locationMatch` by comparing the source
 *   equipment's `current_area_id` against the target `inventoryArea.areaId`.
 * - `updateInventoryArea` with `status: 'rechazada'` auto-increments
 *   `rejectionCount`.
 * - Approving the final area does NOT auto-close the inventory — closing is
 *   an explicit action reserved for `administrative_chief`.
 */

export interface AddInventoryItemInput {
  inventoryId: number;
  inventoryAreaId: number;
  equipmentId: number;
  verifiedBy: number;
  condition?: InventoryItem["condition"];
  conditionNotes?: string | null;
}

export type AddInventoryItemResult =
  | { kind: "created"; item: InventoryItem }
  | { kind: "duplicate"; item: InventoryItem };

interface InventoriesState {
  inventories: Inventory[];
  inventoryAreas: InventoryArea[];
  inventoryItems: InventoryItem[];
  incidents: InventoryIncident[];

  // --- Inventory-level ---
  createInventory: (
    input: Omit<Inventory, "id" | "createdAt" | "updatedAt">,
  ) => Inventory;
  updateInventory: (id: number, patch: Partial<Inventory>) => void;

  // --- Area-level ---
  addAreaToInventory: (
    input: Omit<InventoryArea, "id" | "itemsCount" | "mismatchesCount" | "rejectionCount">,
  ) => InventoryArea;
  updateInventoryArea: (id: number, patch: Partial<InventoryArea>) => void;

  // --- Item-level ---
  addInventoryItem: (input: AddInventoryItemInput) => AddInventoryItemResult;

  // --- Incidents ---
  reportIncident: (
    input: Omit<InventoryIncident, "id" | "createdAt" | "status"> & {
      status?: InventoryIncident["status"];
    },
  ) => InventoryIncident;
}

const nowIso = () => new Date().toISOString();

const nextId = <T extends { id: number }>(rows: T[]) =>
  rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;

const buildSnapshot = (
  equipmentId: number,
  inventoryArea: InventoryArea,
): {
  snapshot: Pick<
    InventoryItem,
    | "snapshotPlateType"
    | "snapshotName"
    | "snapshotInstitutionalPlate"
    | "snapshotInternalPlate"
    | "snapshotSerialNumber"
    | "snapshotBrand"
    | "snapshotModel"
    | "snapshotCategory"
    | "snapshotType"
    | "snapshotArea"
    | "snapshotSubLocation"
    | "snapshotStatus"
  >;
  locationMatch: boolean;
  actualArea: string | null;
} => {
  const eq = MOCK_EQUIPMENT.find((e) => e.id === equipmentId);
  const locationMatch = eq ? eq.current_area_id === inventoryArea.areaId : false;
  return {
    snapshot: {
      snapshotPlateType: eq?.plate_type ?? "internal",
      snapshotName: eq?.name ?? "Equipo desconocido",
      snapshotInstitutionalPlate: eq?.institutional_plate ?? null,
      snapshotInternalPlate: eq?.internal_plate ?? null,
      snapshotSerialNumber: eq?.serial_number ?? null,
      snapshotBrand: eq?.brand ?? null,
      snapshotModel: eq?.model ?? null,
      snapshotCategory: null,
      snapshotType: null,
      snapshotArea: String(inventoryArea.areaId),
      snapshotSubLocation: null,
      snapshotStatus: eq?.status ?? "disponible",
    },
    locationMatch,
    actualArea: eq ? String(eq.current_area_id) : null,
  };
};

export const useInventoriesStore = create<InventoriesState>((set, get) => ({
  inventories: MOCK_INVENTORIES,
  inventoryAreas: MOCK_INVENTORY_AREAS,
  inventoryItems: MOCK_INVENTORY_ITEMS,
  incidents: MOCK_INVENTORY_INCIDENTS,

  createInventory: (input) => {
    const created: Inventory = {
      ...input,
      id: nextId(get().inventories),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    set((s) => ({ inventories: [...s.inventories, created] }));
    return created;
  },

  updateInventory: (id, patch) =>
    set((s) => ({
      inventories: s.inventories.map((inv) =>
        inv.id === id ? { ...inv, ...patch, updatedAt: nowIso() } : inv,
      ),
    })),

  addAreaToInventory: (input) => {
    const created: InventoryArea = {
      ...input,
      id: nextId(get().inventoryAreas),
      itemsCount: 0,
      mismatchesCount: 0,
      rejectionCount: 0,
    };
    set((s) => ({ inventoryAreas: [...s.inventoryAreas, created] }));
    return created;
  },

  updateInventoryArea: (id, patch) =>
    set((s) => ({
      inventoryAreas: s.inventoryAreas.map((a) => {
        if (a.id !== id) return a;
        const nextRejectionCount =
          patch.status === "rechazada"
            ? a.rejectionCount + 1
            : (patch.rejectionCount ?? a.rejectionCount);
        return { ...a, ...patch, rejectionCount: nextRejectionCount };
      }),
    })),

  addInventoryItem: (input) => {
    const state = get();

    // Dedupe rule (409): (inventoryId, equipmentId)
    const existing = state.inventoryItems.find(
      (it) =>
        it.inventoryId === input.inventoryId && it.equipmentId === input.equipmentId,
    );
    if (existing) return { kind: "duplicate", item: existing };

    const area = state.inventoryAreas.find((a) => a.id === input.inventoryAreaId);
    if (!area) {
      throw new Error(
        `[useInventoriesStore] inventoryArea ${input.inventoryAreaId} not found`,
      );
    }

    const { snapshot, locationMatch, actualArea } = buildSnapshot(
      input.equipmentId,
      area,
    );

    const created: InventoryItem = {
      id: nextId(state.inventoryItems),
      inventoryId: input.inventoryId,
      inventoryAreaId: input.inventoryAreaId,
      equipmentId: input.equipmentId,
      ...snapshot,
      verified: true,
      verifiedAt: nowIso(),
      verifiedBy: input.verifiedBy,
      condition: input.condition ?? null,
      conditionNotes: input.conditionNotes ?? null,
      locationMatch,
      actualArea,
      createdAt: nowIso(),
    };

    set((s) => ({
      inventoryItems: [...s.inventoryItems, created],
      inventoryAreas: s.inventoryAreas.map((a) =>
        a.id === input.inventoryAreaId
          ? {
              ...a,
              itemsCount: a.itemsCount + 1,
              mismatchesCount: a.mismatchesCount + (locationMatch ? 0 : 1),
              status:
                a.status === "pendiente"
                  ? ("en_progreso" as InventoryAreaStatus)
                  : a.status,
              startedAt: a.startedAt ?? nowIso(),
            }
          : a,
      ),
    }));

    return { kind: "created", item: created };
  },

  reportIncident: (input) => {
    const created: InventoryIncident = {
      ...input,
      id: nextId(get().incidents),
      status: input.status ?? "abierta",
      createdAt: nowIso(),
    };
    set((s) => ({ incidents: [...s.incidents, created] }));
    return created;
  },
}));
