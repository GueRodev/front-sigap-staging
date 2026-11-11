import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { DEFAULT_CURRENCY } from "@/config/app.config";

import { equipmentSchema, type EquipmentFormValues } from "../schemas/equipmentSchema";
import type { Equipment } from "../types/equipment.types";

const emptyDefaults: EquipmentFormValues = {
  plate_type: "institutional",
  institutional_plate: undefined,
  internal_plate: undefined,
  oaf_name: undefined,
  barcode: undefined,
  serial_number: undefined,

  name: "",
  brand: undefined,
  model: undefined,
  color: undefined,
  description: undefined,

  category_id: undefined as unknown as number,
  equipment_type_id: undefined as unknown as number,
  quantity_total: 1,
  quantity_available: 1,

  current_area_id: undefined as unknown as number,
  status: "disponible",
  sub_location_id: null,

  // Patrón 6 — por defecto todo hereda del área (null).
  is_loanable: null,
  is_publicly_visible: null,
  loan_approval_level: null,
  transfer_requires_approval: null,
  transfer_approval_level: null,

  assigned_to_user_id: null,
  maintenance_order_number: undefined,

  acquisition_type: "compra",

  acquisition_cost: undefined,
  currency: DEFAULT_CURRENCY,
  purchase_order_number: undefined,
  invoice_number: undefined,

  acquired_at: undefined,
  received_at: undefined,
  warranty_expires_at: undefined,

  notes: undefined,
};

const fromEquipment = (equipment: Equipment): EquipmentFormValues => ({
  plate_type: equipment.plate_type,
  institutional_plate: equipment.institutional_plate ?? undefined,
  internal_plate: equipment.internal_plate ?? undefined,
  oaf_name: equipment.oaf_name ?? undefined,
  barcode: equipment.barcode ?? undefined,
  serial_number: equipment.serial_number ?? undefined,

  name: equipment.name,
  brand: equipment.brand ?? undefined,
  model: equipment.model ?? undefined,
  color: equipment.color ?? undefined,
  description: equipment.description ?? undefined,

  category_id: equipment.category_id,
  equipment_type_id: equipment.equipment_type_id,
  quantity_total: equipment.quantity_total,
  quantity_available: equipment.quantity_available,

  current_area_id: equipment.current_area_id,
  status: equipment.status,
  sub_location_id: equipment.sub_location_id ?? null,

  // Patrón 6 — se conservan tal cual: `null` significa "heredado".
  is_loanable: equipment.is_loanable,
  is_publicly_visible: equipment.is_publicly_visible,
  loan_approval_level: equipment.loan_approval_level,
  transfer_requires_approval: equipment.transfer_requires_approval,
  transfer_approval_level: equipment.transfer_approval_level,

  assigned_to_user_id: equipment.assigned_to_user_id,
  maintenance_order_number: equipment.maintenance_order_number ?? undefined,

  acquisition_type: equipment.acquisition_type,

  acquisition_cost: equipment.acquisition_cost ?? undefined,
  currency: equipment.currency || DEFAULT_CURRENCY,
  purchase_order_number: equipment.purchase_order_number ?? undefined,
  invoice_number: equipment.invoice_number ?? undefined,

  acquired_at: equipment.acquired_at ?? undefined,
  received_at: equipment.received_at ?? undefined,
  warranty_expires_at: equipment.warranty_expires_at ?? undefined,

  notes: equipment.notes ?? undefined,
});

export const useEquipmentForm = (initial?: Equipment | null) => {
  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: initial ? fromEquipment(initial) : emptyDefaults,
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset(initial ? fromEquipment(initial) : emptyDefaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id]);

  return form;
};
