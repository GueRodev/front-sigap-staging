import type {
  AcquisitionType,
  EquipmentCondition,
  EquipmentStatus,
  PlateType,
  StockMovementType,
} from "../types/equipment.types";

export const STATUS_LABELS: Record<EquipmentStatus, string> = {
  disponible: "Disponible",
  asignado: "Asignado",
  prestado: "Prestado",
  reparacion: "Reparación",
  mantenimiento: "Mantenimiento",
  desechado: "Desechado",
  extraviado: "Extraviado",
  donado: "Donado",
  traslado: "En traslado",
};

export const PLATE_TYPE_LABELS: Record<PlateType, string> = {
  institutional: "Institucional",
  internal: "Interno",
  bulk: "Insumo",
};

/**
 * Per-status visual styles split into `dot` (color of the indicator) and
 * `pill` (background + text + border for the badge container).
 * All classes use semantic tokens / sigap palette — no raw hex.
 */
export const STATUS_STYLES: Record<EquipmentStatus, { dot: string; pill: string }> = {
  disponible: {
    dot: "bg-emerald-500",
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  prestado: {
    dot: "bg-sigap-sky",
    pill: "bg-sigap-sky/10 text-sigap-blue dark:text-sigap-sky border-sigap-sky/20",
  },
  asignado: {
    dot: "bg-sigap-blue",
    pill: "bg-sigap-blue/10 text-sigap-blue dark:text-sigap-sky border-sigap-blue/20",
  },
  reparacion: {
    dot: "bg-amber-500",
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  mantenimiento: {
    dot: "bg-amber-500",
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  desechado: {
    dot: "bg-rose-500",
    pill: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
  },
  extraviado: {
    dot: "bg-destructive",
    pill: "bg-destructive/10 text-destructive border-destructive/20",
  },
  donado: {
    dot: "bg-violet-500",
    pill: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  },
  traslado: {
    dot: "bg-sky-600",
    pill: "bg-sky-600/10 text-sky-700 dark:text-sky-300 border-sky-600/20",
  },
};

export const PLATE_TYPE_STYLES: Record<PlateType, { dot: string; pill: string }> = {
  institutional: {
    dot: "bg-sigap-blue border-destructive-foreground",
    pill: "border-sigap-blue/20 bg-primary text-sidebar-foreground",
  },
  internal: {
    dot: "bg-sigap-sky",
    pill: "border-sidebar/20 bg-sidebar text-sidebar-foreground",
  },
  bulk: {
    dot: "bg-muted-foreground",
    pill: "border-neutral-500/20 bg-neutral-500 text-neutral-50",
  },
};

export const STATUS_OPTIONS = (Object.keys(STATUS_LABELS) as EquipmentStatus[]).map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

export const PLATE_TYPE_OPTIONS = (Object.keys(PLATE_TYPE_LABELS) as PlateType[]).map((value) => ({
  value,
  label: PLATE_TYPE_LABELS[value],
}));

/**
 * Estados que exigen un `reason` obligatorio al cambiar de estado
 * (ADR-ACTIVOS-001 — `EquipmentStatus::REQUIRES_REASON`).
 * `traslado` se excluye: el motivo vive en `transfers.request_reason`.
 */
export const STATUS_REQUIRES_REASON: ReadonlySet<EquipmentStatus> = new Set([
  "reparacion",
  "mantenimiento",
  "desechado",
  "extraviado",
  "donado",
]);

export const ACQUISITION_TYPE_LABELS: Record<AcquisitionType, string> = {
  compra: "Compra",
  donacion: "Donación",
  transferencia: "Transferencia",
  comodato: "Comodato",
  produccion_propia: "Producción propia",
};

export const ACQUISITION_TYPE_OPTIONS = (
  Object.keys(ACQUISITION_TYPE_LABELS) as AcquisitionType[]
).map((value) => ({ value, label: ACQUISITION_TYPE_LABELS[value] }));

export const STOCK_MOVEMENT_TYPE_LABELS: Record<StockMovementType, string> = {
  entrada: "Entrada",
  salida: "Salida",
  ajuste: "Ajuste",
  prestamo: "Préstamo",
  devolucion: "Devolución",
  reserva: "Reserva",
  cancelacion_reserva: "Cancelación de reserva",
};

export const STOCK_MOVEMENT_TYPE_OPTIONS = (
  Object.keys(STOCK_MOVEMENT_TYPE_LABELS) as StockMovementType[]
).map((value) => ({ value, label: STOCK_MOVEMENT_TYPE_LABELS[value] }));

export const EQUIPMENT_CONDITION_LABELS: Record<EquipmentCondition, string> = {
  bueno: "Bueno",
  regular: "Regular",
  malo: "Malo",
};

export const EQUIPMENT_CONDITION_OPTIONS = (
  Object.keys(EQUIPMENT_CONDITION_LABELS) as EquipmentCondition[]
).map((value) => ({ value, label: EQUIPMENT_CONDITION_LABELS[value] }));
