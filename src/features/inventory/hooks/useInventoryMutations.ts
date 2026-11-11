import { useCallback } from "react";

import type {
  Inventory,
  InventoryArea,
  InventoryScope,
} from "../types/inventory.types";
import {
  useInventoriesStore,
  type AddInventoryItemInput,
  type AddInventoryItemResult,
} from "./useInventoriesStore";

/**
 * Thin façade that groups every mutation used by wizards, modals and pages.
 * Every callback is stable so it can be passed down without triggering
 * re-renders of memoized components.
 */

export interface CreateInventoryInput {
  title: string;
  year: number;
  scope: InventoryScope;
  description?: string | null;
  createdById: number;
}

export interface AddAreaToInventoryInput {
  inventoryId: number;
  areaId: number;
  assignedTo?: number | null;
  approverId?: number | null;
}

export const useInventoryMutations = () => {
  const createInventoryRaw = useInventoriesStore((s) => s.createInventory);
  const updateInventoryRaw = useInventoriesStore((s) => s.updateInventory);
  const addAreaRaw = useInventoriesStore((s) => s.addAreaToInventory);
  const updateAreaRaw = useInventoriesStore((s) => s.updateInventoryArea);
  const addItemRaw = useInventoriesStore((s) => s.addInventoryItem);
  const reportIncidentRaw = useInventoriesStore((s) => s.reportIncident);

  const createInventory = useCallback(
    (input: CreateInventoryInput): Inventory =>
      createInventoryRaw({
        title: input.title,
        year: input.year,
        scope: input.scope,
        description: input.description ?? null,
        status: "planificado",
        createdById: input.createdById,
        startedAt: null,
        completedById: null,
        completedAt: null,
        summaryStats: null,
      }),
    [createInventoryRaw],
  );

  const addAreaToInventory = useCallback(
    (input: AddAreaToInventoryInput): InventoryArea =>
      addAreaRaw({
        inventoryId: input.inventoryId,
        areaId: input.areaId,
        status: "pendiente",
        assignedTo: input.assignedTo ?? null,
        approverId: input.approverId ?? null,
        startedAt: null,
        submittedBy: null,
        submittedAt: null,
        approvedBy: null,
        approvedAt: null,
        rejectionReason: null,
        rejectedBy: null,
        rejectedAt: null,
      }),
    [addAreaRaw],
  );

  const startArea = useCallback(
    (inventoryAreaId: number) =>
      updateAreaRaw(inventoryAreaId, {
        status: "en_progreso",
        startedAt: new Date().toISOString(),
      }),
    [updateAreaRaw],
  );

  const scanItem = useCallback(
    (input: AddInventoryItemInput): AddInventoryItemResult => addItemRaw(input),
    [addItemRaw],
  );

  const submitAreaForReview = useCallback(
    (inventoryAreaId: number, submittedBy: number) =>
      updateAreaRaw(inventoryAreaId, {
        status: "lista_revision",
        submittedBy,
        submittedAt: new Date().toISOString(),
      }),
    [updateAreaRaw],
  );

  const approveArea = useCallback(
    (inventoryAreaId: number, approvedBy: number) =>
      updateAreaRaw(inventoryAreaId, {
        status: "aprobada",
        approvedBy,
        approvedAt: new Date().toISOString(),
      }),
    [updateAreaRaw],
  );

  const rejectArea = useCallback(
    (inventoryAreaId: number, rejectedBy: number, reason: string) =>
      updateAreaRaw(inventoryAreaId, {
        status: "rechazada",
        rejectedBy,
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason,
      }),
    [updateAreaRaw],
  );

  const closeInventory = useCallback(
    (inventoryId: number, completedById: number) =>
      updateInventoryRaw(inventoryId, {
        status: "completado",
        completedById,
        completedAt: new Date().toISOString(),
      }),
    [updateInventoryRaw],
  );

  const cancelInventory = useCallback(
    (inventoryId: number) => updateInventoryRaw(inventoryId, { status: "cancelado" }),
    [updateInventoryRaw],
  );

  return {
    createInventory,
    addAreaToInventory,
    startArea,
    scanItem,
    submitAreaForReview,
    approveArea,
    rejectArea,
    closeInventory,
    cancelInventory,
    reportIncident: reportIncidentRaw,
  };
};
