import type { FunctionalRole } from "@/features/areas/types/area.types";

import type {
  EquipmentCondition,
  InventoryAreaStatus,
  InventoryScope,
  InventoryStatus,
} from "../types/inventory.types";

// ---------------------------------------------------------------------------
// Inventory (global) status
// ---------------------------------------------------------------------------

export const INVENTORY_STATUS_LABELS: Record<InventoryStatus, string> = {
  planificado: "Planificado",
  en_progreso: "En Progreso",
  en_revision: "En Revisión",
  completado: "Completado",
  cancelado: "Cancelado",
};

export const INVENTORY_STATUS_STYLES: Record<
  InventoryStatus,
  { dot: string; pill: string }
> = {
  planificado: {
    dot: "bg-muted-foreground",
    pill: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
  en_progreso: {
    dot: "bg-amber-500",
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  en_revision: {
    dot: "bg-sigap-sky",
    pill: "bg-sigap-sky/10 text-sigap-blue dark:text-sigap-sky border-sigap-sky/20",
  },
  completado: {
    dot: "bg-emerald-500",
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  cancelado: {
    dot: "bg-destructive",
    pill: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export const INVENTORY_STATUS_OPTIONS = (
  Object.keys(INVENTORY_STATUS_LABELS) as InventoryStatus[]
).map((value) => ({ value, label: INVENTORY_STATUS_LABELS[value] }));

// ---------------------------------------------------------------------------
// Per-area status (Kanban columns)
// ---------------------------------------------------------------------------

export const INVENTORY_AREA_STATUS_LABELS: Record<InventoryAreaStatus, string> = {
  pendiente: "Pendiente",
  en_progreso: "En Progreso",
  lista_revision: "Lista para Revisión",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

export const INVENTORY_AREA_STATUS_STYLES: Record<
  InventoryAreaStatus,
  { dot: string; pill: string }
> = {
  pendiente: {
    dot: "bg-sigap-sky",
    pill: "bg-sigap-sky/10 text-sigap-blue dark:text-sigap-sky border-sigap-sky/20",
  },
  en_progreso: {
    dot: "bg-amber-500",
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  lista_revision: {
    dot: "bg-secondary",
    pill: "bg-secondary/10 text-secondary border-secondary/20",
  },
  aprobada: {
    dot: "bg-emerald-500",
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  rechazada: {
    dot: "bg-destructive",
    pill: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export const INVENTORY_AREA_STATUS_OPTIONS = (
  Object.keys(INVENTORY_AREA_STATUS_LABELS) as InventoryAreaStatus[]
).map((value) => ({ value, label: INVENTORY_AREA_STATUS_LABELS[value] }));

/** Kanban column order — stable, drives the layout of `InventoryDetailPage`. */
export const KANBAN_COLUMN_ORDER: InventoryAreaStatus[] = [
  "pendiente",
  "en_progreso",
  "lista_revision",
  "aprobada",
  "rechazada",
];

// ---------------------------------------------------------------------------
// Equipment condition (per verified item)
// ---------------------------------------------------------------------------

export const CONDITION_LABELS: Record<EquipmentCondition, string> = {
  bueno: "Bueno",
  regular: "Regular",
  malo: "Malo",
};

export const CONDITION_STYLES: Record<
  EquipmentCondition,
  { dot: string; pill: string }
> = {
  bueno: {
    dot: "bg-emerald-500",
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  regular: {
    dot: "bg-amber-500",
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  malo: {
    dot: "bg-destructive",
    pill: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export const CONDITION_OPTIONS = (
  Object.keys(CONDITION_LABELS) as EquipmentCondition[]
).map((value) => ({ value, label: CONDITION_LABELS[value] }));

// ---------------------------------------------------------------------------
// Scope
// ---------------------------------------------------------------------------

export const INVENTORY_SCOPE_LABELS: Record<InventoryScope, string> = {
  all: "Institucional (todas las áreas)",
  area: "Focalizado (áreas específicas)",
};

export const INVENTORY_SCOPE_OPTIONS = (
  Object.keys(INVENTORY_SCOPE_LABELS) as InventoryScope[]
).map((value) => ({ value, label: INVENTORY_SCOPE_LABELS[value] }));

// ---------------------------------------------------------------------------
// Role permissions specific to Inventory
// ---------------------------------------------------------------------------

export interface InventoryPermissions {
  crudInventory: boolean;
  assignInventoryAreas: boolean;
  assignInventoryCollaborators: boolean;
  /** Hard rule: `false` for `student` — a student can never scan. */
  executeInventoryScan: boolean;
  approveAreaInventory: boolean;
  finalizeInventory: boolean;
  cancelInventory: boolean;
  scanScope: "all" | "own_assigned" | "none";
}

export const INVENTORY_ROLE_PERMISSIONS: Record<FunctionalRole, InventoryPermissions> = {
  super_admin: {
    crudInventory: true,
    assignInventoryAreas: true,
    assignInventoryCollaborators: true,
    executeInventoryScan: true,
    approveAreaInventory: true,
    finalizeInventory: true,
    cancelInventory: true,
    scanScope: "all",
  },
  general_assets_manager: {
    crudInventory: true,
    assignInventoryAreas: true,
    assignInventoryCollaborators: true,
    executeInventoryScan: true,
    approveAreaInventory: true,
    finalizeInventory: false,
    cancelInventory: true,
    scanScope: "all",
  },
  administrative_chief: {
    crudInventory: false,
    assignInventoryAreas: false,
    assignInventoryCollaborators: false,
    executeInventoryScan: false,
    approveAreaInventory: false,
    finalizeInventory: true,
    cancelInventory: true,
    scanScope: "none",
  },
  area_manager: {
    crudInventory: false,
    assignInventoryAreas: false,
    assignInventoryCollaborators: false,
    executeInventoryScan: true,
    approveAreaInventory: true,
    finalizeInventory: false,
    cancelInventory: false,
    scanScope: "own_assigned",
  },
  it_coordinator: {
    crudInventory: false,
    assignInventoryAreas: false,
    assignInventoryCollaborators: false,
    executeInventoryScan: true,
    approveAreaInventory: false,
    finalizeInventory: false,
    cancelInventory: false,
    scanScope: "own_assigned",
  },
  it_technician: {
    crudInventory: false,
    assignInventoryAreas: false,
    assignInventoryCollaborators: false,
    executeInventoryScan: true,
    approveAreaInventory: false,
    finalizeInventory: false,
    cancelInventory: false,
    scanScope: "own_assigned",
  },
  professor: {
    crudInventory: false,
    assignInventoryAreas: false,
    assignInventoryCollaborators: false,
    executeInventoryScan: true,
    approveAreaInventory: false,
    finalizeInventory: false,
    cancelInventory: false,
    scanScope: "own_assigned",
  },
  student: {
    crudInventory: false,
    assignInventoryAreas: false,
    assignInventoryCollaborators: false,
    executeInventoryScan: false,
    approveAreaInventory: false,
    finalizeInventory: false,
    cancelInventory: false,
    scanScope: "none",
  },
};
