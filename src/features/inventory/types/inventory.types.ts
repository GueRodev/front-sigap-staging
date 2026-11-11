/**
 * Domain types for the Inventory (Levantamiento de Activos) feature.
 * Mirrors the intended `inventories` / `inventory_areas` / `inventory_items` /
 * `inventory_incidents` schema described in the spec.
 */

export type InventoryScope = "all" | "area";

export type InventoryStatus =
  | "planificado"
  | "en_progreso"
  | "en_revision"
  | "completado"
  | "cancelado";

export type InventoryAreaStatus =
  | "pendiente"
  | "en_progreso"
  | "lista_revision"
  | "aprobada"
  | "rechazada";

export type EquipmentCondition = "bueno" | "regular" | "malo";

export interface InventorySummaryStats {
  totalVerified: number;
  byArea: Record<string, number>;
  locationMismatches: number;
  incidentsCount: number;
  mismatchesDetail: Array<{
    plate: string;
    expectedArea: string;
    foundInArea: string;
  }>;
}

export interface Inventory {
  id: number;
  title: string;
  year: number;
  scope: InventoryScope;
  description: string | null;
  status: InventoryStatus;
  createdById: number;
  startedAt: string | null;
  completedById: number | null;
  completedAt: string | null;
  summaryStats: InventorySummaryStats | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryArea {
  id: number;
  inventoryId: number;
  areaId: number;
  status: InventoryAreaStatus;
  assignedTo: number | null;
  approverId: number | null;
  startedAt: string | null;
  submittedBy: number | null;
  submittedAt: string | null;
  approvedBy: number | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  rejectedBy: number | null;
  rejectedAt: string | null;
  rejectionCount: number;
  itemsCount: number;
  mismatchesCount: number;
}

export interface InventoryItem {
  id: number;
  inventoryId: number;
  inventoryAreaId: number;
  equipmentId: number;

  snapshotPlateType: string;
  snapshotName: string;
  snapshotInstitutionalPlate: string | null;
  snapshotInternalPlate: string | null;
  snapshotSerialNumber: string | null;
  snapshotBrand: string | null;
  snapshotModel: string | null;
  snapshotCategory: string | null;
  snapshotType: string | null;
  snapshotArea: string;
  snapshotSubLocation: string | null;
  snapshotStatus: string;

  verified: boolean;
  verifiedAt: string | null;
  verifiedBy: number | null;

  condition: EquipmentCondition | null;
  conditionNotes: string | null;

  locationMatch: boolean | null;
  actualArea: string | null;

  createdAt: string;
}

/**
 * Local incidence for the module — placeholder until centralized with
 * `equipment_incidents` (real roadmap Fase 4). Isolated in its own file so the
 * migration to the shared table is trivial.
 */
export interface InventoryIncident {
  id: number;
  inventoryItemId: number | null;
  equipmentId: number | null;
  incidentType:
    | "missing_equipment"
    | "severe_damage"
    | "location_mismatch_unresolved"
    | "unregistered_equipment"
    | "other";
  severity: "baja" | "media" | "alta" | "critica";
  description: string;
  status: "abierta" | "en_investigacion" | "resuelta" | "descartada";
  reportedBy: number;
  createdAt: string;
}

export interface InventoryListFilters {
  search?: string;
  year?: number;
  status?: InventoryStatus;
  scope?: InventoryScope;
}

export type InventoryAreaView = "kanban" | "table";
