import { useState } from "react";

import type { Equipment } from "../types/equipment.types";
import type { EquipmentFormValues } from "../schemas/equipmentSchema";
import { _equipmentStore } from "./useEquipmentList";

/**
 * Mutations against the in-memory equipment store.
 * Signatures match what the Laravel-backed mutations will expose later.
 */

const nowIso = () => new Date().toISOString();

const toEquipment = (id: number, values: EquipmentFormValues, base?: Equipment): Equipment => ({
  id,
  plate_type: values.plate_type,
  institutional_plate: values.institutional_plate ?? null,
  internal_plate: values.internal_plate ?? null,
  barcode: values.barcode ?? null,
  qr_code_value: base?.qr_code_value ?? null,
  serial_number: values.serial_number ?? null,

  name: values.name,
  oaf_name: values.oaf_name ?? null,
  description: values.description ?? null,
  brand: values.brand ?? null,
  model: values.model ?? null,
  color: values.color ?? null,
  technical_specs: base?.technical_specs ?? null,

  category_id: values.category_id,
  equipment_type_id: values.equipment_type_id,
  // Los activos con placa son siempre unitarios; sólo `bulk` maneja cantidades.
  quantity_total: values.plate_type === "bulk" ? values.quantity_total : 1,
  quantity_available:
    values.plate_type === "bulk" ? values.quantity_available : Math.min(values.quantity_available, 1),

  status: values.status,
  // Patrón 6 — overrides nullable (`null` = hereda el default del área).
  is_loanable: values.is_loanable ?? null,
  is_publicly_visible: values.is_publicly_visible ?? null,
  loan_approval_level: values.loan_approval_level ?? null,
  transfer_requires_approval: values.transfer_requires_approval ?? null,
  transfer_approval_level: values.transfer_approval_level ?? null,
  allowed_loan_roles: base?.allowed_loan_roles ?? null,

  current_area_id: values.current_area_id,
  // TODO: Traslados resetea sub_location_id a NULL en cada traslado inter-área
  // (ver ADR-ACTIVOS-001 / ADR-TRANSFERS-001)
  sub_location_id: values.sub_location_id ?? null,
  original_area_id: base?.original_area_id ?? null,
  original_category_id: base?.original_category_id ?? null,
  previous_area_id: base?.previous_area_id ?? null,
  temporary_area_id: base?.temporary_area_id ?? null,

  assigned_to_user_id: values.assigned_to_user_id ?? null,

  acquisition_type: values.acquisition_type,

  acquisition_cost:
    typeof values.acquisition_cost === "number" ? values.acquisition_cost : null,
  currency: values.currency,
  purchase_order_number: values.purchase_order_number ?? null,
  invoice_number: values.invoice_number ?? null,

  acquired_at: values.acquired_at ?? null,
  received_at: values.received_at ?? null,
  warranty_expires_at: values.warranty_expires_at ?? null,
  maintenance_order_number: values.maintenance_order_number ?? null,
  warranty_notified_at: base?.warranty_notified_at ?? null,

  image_path: base?.image_path ?? null,
  attachment_path: base?.attachment_path ?? null,
  deleted_at: base?.deleted_at ?? null,

  notes: values.notes ?? null,

  created_at: base?.created_at ?? nowIso(),
  updated_at: nowIso(),
});

export const useEquipmentMutations = () => {
  const [isPending, setIsPending] = useState(false);

  const createEquipment = async (values: EquipmentFormValues) => {
    setIsPending(true);
    await new Promise((r) => setTimeout(r, 200));
    const all = _equipmentStore.getAll();
    const nextId = (all.reduce((max, item) => Math.max(max, item.id), 0) ?? 0) + 1;
    const created = toEquipment(nextId, values);
    _equipmentStore.setAll([created, ...all]);
    setIsPending(false);
    return created;
  };

  const updateEquipment = async (id: number, values: EquipmentFormValues) => {
    setIsPending(true);
    await new Promise((r) => setTimeout(r, 200));
    const all = _equipmentStore.getAll();
    const target = all.find((item) => item.id === id);
    const updated = toEquipment(id, values, target);
    _equipmentStore.setAll(all.map((item) => (item.id === id ? updated : item)));
    setIsPending(false);
    return updated;
  };

  const removeEquipment = async (id: number) => {
    setIsPending(true);
    await new Promise((r) => setTimeout(r, 150));
    _equipmentStore.setAll(_equipmentStore.getAll().filter((item) => item.id !== id));
    setIsPending(false);
  };

  const toggleLoanable = async (id: number, isLoanable: boolean) => {
    const all = _equipmentStore.getAll();
    _equipmentStore.setAll(
      all.map((item) =>
        item.id === id ? { ...item, is_loanable: isLoanable, updated_at: nowIso() } : item,
      ),
    );
  };

  return { createEquipment, updateEquipment, removeEquipment, toggleLoanable, isPending };
};
