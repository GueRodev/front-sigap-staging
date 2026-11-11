/**
 * Fase 7 — Permisos y visibilidad del módulo de Activos (ADR-ACTIVOS-001).
 *
 * NOTA DE IMPLEMENTACIÓN (field-level authorization):
 * en el prototipo el filtrado se aplica en el store (`useEquipmentList`) por
 * simplicidad. En producción el ocultamiento vive en la serialización del
 * modelo `Equipment` (trait `HasFieldLevelAuthorization`), nunca en el
 * componente React — así cubre también exports y PDFs.
 */

import type { FunctionalRole } from "@/features/areas/types/area.types";

/** Alcance de lectura del catálogo de activos. */
export type EquipmentScope =
  /** Todo el inventario institucional. */
  | "all"
  /** Solo los activos de las áreas que administra el usuario. */
  | "own_areas"
  /** Solo el activo asignado personalmente. */
  | "assigned";

export interface EquipmentPermissions {
  /** Campos financieros: `acquisition_cost`, orden de compra y factura. */
  view_equipment_financial_fields: boolean;
  /** Lectura de `technical_specs`. */
  view_technical_specs: boolean;
  /** Edición de `technical_specs` — exclusivo de roles TI. */
  edit_technical_specs: boolean;
  /** CRUD del catálogo de activos. */
  manage_equipment: boolean;
  scope: EquipmentScope;
  /**
   * Mecanismo 3 — visibilidad global sobre todo lo que cuelgue de la categoría
   * con slug `computo`, independientemente de `user_areas`.
   */
  computo_global_visibility: boolean;
}

export const EQUIPMENT_ROLE_PERMISSIONS: Record<FunctionalRole, EquipmentPermissions> = {
  super_admin: {
    view_equipment_financial_fields: true,
    view_technical_specs: true,
    edit_technical_specs: true,
    manage_equipment: true,
    scope: "all",
    computo_global_visibility: true,
  },
  general_assets_manager: {
    view_equipment_financial_fields: true,
    view_technical_specs: true,
    edit_technical_specs: false,
    manage_equipment: true,
    scope: "all",
    computo_global_visibility: true,
  },
  administrative_chief: {
    view_equipment_financial_fields: true,
    view_technical_specs: true,
    edit_technical_specs: false,
    manage_equipment: false,
    scope: "all",
    computo_global_visibility: true,
  },
  it_coordinator: {
    view_equipment_financial_fields: false,
    view_technical_specs: true,
    edit_technical_specs: true,
    manage_equipment: false,
    scope: "own_areas",
    computo_global_visibility: true,
  },
  it_technician: {
    view_equipment_financial_fields: false,
    view_technical_specs: true,
    edit_technical_specs: true,
    manage_equipment: false,
    scope: "own_areas",
    computo_global_visibility: true,
  },
  area_manager: {
    view_equipment_financial_fields: false,
    view_technical_specs: true,
    edit_technical_specs: false,
    manage_equipment: false,
    scope: "own_areas",
    computo_global_visibility: false,
  },
  professor: {
    view_equipment_financial_fields: false,
    view_technical_specs: false,
    edit_technical_specs: false,
    manage_equipment: false,
    scope: "assigned",
    computo_global_visibility: false,
  },
  student: {
    view_equipment_financial_fields: false,
    view_technical_specs: false,
    edit_technical_specs: false,
    manage_equipment: false,
    scope: "assigned",
    computo_global_visibility: false,
  },
};

/** Campos financieros ocultados cuando falta `view_equipment_financial_fields`. */
export const FINANCIAL_FIELDS = [
  "acquisition_cost",
  "purchase_order_number",
  "invoice_number",
] as const;
