import { useState } from "react";

import type { Area } from "../types/area.types";
import type { AreaFormValues } from "../schemas/area.schemas";
import { useAreasStore } from "./useAreasStore";

const nowIso = () => new Date().toISOString();

const toArea = (id: number, values: AreaFormValues, base?: Area): Area => ({
  id,
  name: values.name.trim(),
  type: values.type,
  zone: values.zone?.trim() || null,
  building: values.building?.trim() || null,
  description: values.description?.trim() || null,
  is_protected: base?.is_protected ?? false,
  deletedAt: base?.deletedAt ?? null,
  default_is_loanable: values.default_is_loanable,
  default_is_publicly_visible: values.default_is_publicly_visible,
  default_loan_approval_level: values.default_loan_approval_level,
  default_transfer_requires_approval: values.default_transfer_requires_approval,
  default_transfer_approval_level: values.default_transfer_approval_level,
  created_at: base?.created_at ?? nowIso(),
  updated_at: nowIso(),
});

/**
 * Area mutations. Uses the in-memory store; signatures match the
 * TanStack-Query surface we'll expose when wired to the API.
 */
export const useAreaMutations = () => {
  const [isPending, setIsPending] = useState(false);
  const store = useAreasStore.getState;

  const createArea = async (values: AreaFormValues) => {
    setIsPending(true);
    await new Promise((r) => setTimeout(r, 200));
    const { areas, addArea } = store();
    const nextId = areas.reduce((m, a) => Math.max(m, a.id), 0) + 1;
    const created = toArea(nextId, values);
    addArea(created);
    setIsPending(false);
    return created;
  };

  const updateArea = async (id: number, values: AreaFormValues) => {
    setIsPending(true);
    await new Promise((r) => setTimeout(r, 200));
    const { areas, updateArea: patch } = store();
    const base = areas.find((a) => a.id === id);
    const next = toArea(id, values, base);
    patch(id, next);
    setIsPending(false);
    return next;
  };

  /** Soft-delete with cascade: move equipment to "Sin Área Asignada", drop user_areas. */
  const deleteArea = async (id: number) => {
    setIsPending(true);
    await new Promise((r) => setTimeout(r, 200));
    const { moveEquipmentToUnassigned, softDeleteArea } = store();
    moveEquipmentToUnassigned(id);
    softDeleteArea(id);
    setIsPending(false);
  };

  /** Restore: only items still parked in "Sin Área Asignada" with matching original_area_id come back. */
  const restoreArea = async (id: number) => {
    setIsPending(true);
    await new Promise((r) => setTimeout(r, 200));
    const { restoreEquipmentToArea, restoreArea: undelete } = store();
    restoreEquipmentToArea(id);
    undelete(id);
    setIsPending(false);
  };

  const assignManager = async (userId: number, areaId: number) => {
    await new Promise((r) => setTimeout(r, 120));
    store().assignUser(userId, areaId);
  };

  const removeManager = async (userId: number, areaId: number) => {
    await new Promise((r) => setTimeout(r, 120));
    store().unassignUser(userId, areaId);
  };

  const addSublocation = async (areaId: number, name: string) => {
    await new Promise((r) => setTimeout(r, 120));
    store().addSublocation(areaId, name);
  };

  const removeSublocation = async (id: number) => {
    await new Promise((r) => setTimeout(r, 120));
    store().removeSublocation(id);
  };

  return {
    isPending,
    createArea,
    updateArea,
    deleteArea,
    restoreArea,
    assignManager,
    removeManager,
    addSublocation,
    removeSublocation,
  };
};
