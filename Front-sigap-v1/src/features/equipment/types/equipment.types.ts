/**
 * Domain types for the Equipment feature.
 * Mirrors the `equipment` table schema (PostgreSQL).
 */

import type {
  FunctionalRole,
  LoanApprovalLevel,
  TransferApprovalLevel,
} from "@/features/areas/types/area.types";

export type PlateType = "institutional" | "internal" | "bulk";


/**
 * Tipo de adquisición original del registro (ADR-ACTIVOS-001).
 * `acquisition_type` también se repite por movimiento de stock para entradas
 * posteriores de distinto origen.
 */
export type AcquisitionType =
  | "compra"
  | "donacion"
  | "transferencia"
  | "comodato"
  | "produccion_propia";

/**
 * Tipos de movimiento de stock (ADR-ACTIVOS-001).
 * Aplicable a los tres `PlateType`.
 */
export type StockMovementType =
  | "entrada"
  | "salida"
  | "ajuste"
  | "prestamo"
  | "devolucion"
  | "reserva"
  | "cancelacion_reserva";

/**
 * Condición física del activo (ADR-ACTIVOS-001).
 */
export type EquipmentCondition = "bueno" | "regular" | "malo";

export type EquipmentStatus =
  | "disponible"
  | "asignado"
  | "prestado"
  | "reparacion"
  | "mantenimiento"
  | "desechado"
  | "extraviado"
  | "donado"
  | "traslado";

export interface EquipmentCategory {
  id: number;
  name: string;
  parent_id: number | null;
  /** 0 = categoría padre, 1 = subcategoría (la que lleva `equipment.category_id`). */
  level: 0 | 1;
  slug: string | null;
  description: string | null;
  /** Categorías del seeder que no se pueden eliminar ni renombrar. */
  is_protected: boolean;
  /** Orden de despliegue dentro de su nivel. */
  order: number;
  deleted_at: string | null;
}

export interface EquipmentType {
  id: number;
  name: string;
  category_id: number;
  description: string | null;
  deleted_at: string | null;
}


export interface Area {
  id: number;
  name: string;
}

export interface Equipment {
  id: number;

  // Identification
  plate_type: PlateType;
  institutional_plate: string | null;
  internal_plate: string | null;
  barcode: string | null;
  qr_code_value: string | null;
  serial_number: string | null;

  // Description
  name: string;
  oaf_name: string | null;
  description: string | null;
  brand: string | null;
  model: string | null;
  color: string | null;
  technical_specs: Record<string, unknown> | null;

  // Classification
  category_id: number;
  equipment_type_id: number;
  quantity_total: number;
  quantity_available: number;

  // Status
  status: EquipmentStatus;

  // ── Patrón 6 — Overrides individuales (ADR-ACTIVOS-001) ─────────────────
  // `null` = hereda el default del área actual. Usar los helpers de
  // `utils/resolveEquipmentPolicy.ts` para obtener el valor efectivo.
  is_loanable: boolean | null;
  is_publicly_visible: boolean | null;
  loan_approval_level: LoanApprovalLevel | null;
  transfer_requires_approval: boolean | null;
  transfer_approval_level: TransferApprovalLevel | null;
  /**
   * Exclusivo del equipo: NO se hereda ni se resuelve contra el área.
   * `null` = sin restricción de rol para el préstamo.
   */
  allowed_loan_roles: FunctionalRole[] | null;

  // Location
  current_area_id: number;
  /**
   * References `area_sublocations.id`. Written by Equipment only at registration;
   * every subsequent change is exclusive to the Transfers module (see ADR-ACTIVOS-001).
   */
  sub_location_id: number | null;
  /** Set when the equipment was moved to "Sin Área Asignada" by a cascade from a soft-deleted area. */
  original_area_id: number | null;
  /** Subcategoría original antes de una cascada de borrado de categorías. */
  original_category_id: number | null;

  /** Área anterior (informativo, escrito por Traslados). */
  previous_area_id: number | null;
  /** Área temporal durante un préstamo o traslado temporal. */
  temporary_area_id: number | null;

  // Assignment
  /** Responsable individual del activo (asignación personal). */
  assigned_to_user_id: number | null;

  // Financial
  acquisition_type: AcquisitionType;
  acquisition_cost: number | null;
  currency: string;
  purchase_order_number: string | null;
  invoice_number: string | null;

  // Maintenance & warranty
  maintenance_order_number: string | null;
  warranty_notified_at: string | null;

  // Files
  image_path: string | null;
  attachment_path: string | null;

  // Key dates (ISO strings)
  acquired_at: string | null;
  received_at: string | null;
  warranty_expires_at: string | null;

  // Notes
  notes: string | null;

  // Audit & lifecycle
  created_at: string;
  updated_at: string;
  /** Soft delete (ADR-ACTIVOS-001). Reemplaza al antiguo `retired_at`. */
  deleted_at: string | null;
}


/**
 * Historial de cambios de estado (ADR-ACTIVOS-001 — submódulo 3).
 * Registro inmutable: nunca se edita ni se borra.
 */
export interface EquipmentStatusChange {
  id: number;
  equipment_id: number;
  from_status: EquipmentStatus;
  to_status: EquipmentStatus;
  /** Obligatorio en las transiciones de `STATUS_REQUIRES_REASON`. */
  reason: string | null;
  /** Datos extra según la transición (acta de baja, institución receptora…). */
  metadata: Record<string, string> | null;
  changed_by_user_id: number | null;
  changed_by_name: string;
  created_at: string;
}

/**
 * Movimiento de stock (ADR-ACTIVOS-001 — submódulo 4).
 * Registro inmutable: nunca se edita ni se borra.
 * Aplica a los tres `PlateType`; en activos con placa la cantidad es siempre 1.
 */
export interface EquipmentStockMovement {
  id: number;
  equipment_id: number;
  type: StockMovementType;
  /** Cantidad absoluta del movimiento (siempre > 0). */
  quantity: number;
  /** Delta aplicado a `quantity_total` (puede ser 0 o negativo). */
  total_delta: number;
  /** Delta aplicado a `quantity_available`. */
  available_delta: number;
  /** Snapshot inmutable de las existencias después del movimiento. */
  snapshot_quantity_total: number;
  snapshot_quantity_available: number;
  /** Origen de la entrada, solo aplica a `entrada`. */
  acquisition_type: AcquisitionType | null;
  condition: EquipmentCondition | null;
  reason: string | null;
  reference: string | null;
  performed_by_user_id: number | null;
  performed_by_name: string;
  created_at: string;
}



export interface EquipmentListFilters {
  search?: string;
  status?: EquipmentStatus;
  plate_type?: PlateType;
  category_id?: number;
  area_id?: number;
}

export interface EquipmentListPagination {
  page: number;
  pageSize: number;
}

export interface EquipmentListResult {
  items: Equipment[];
  total: number;
  totalAll: number;
  isLoading: boolean;
}
