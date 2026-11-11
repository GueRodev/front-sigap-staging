import type {
  Inventory,
  InventoryArea,
  InventoryItem,
} from "../types/inventory.types";

/**
 * Coherent seed data that references the real mock catalogs:
 * - Areas: `MOCK_AREAS` in `src/features/areas/data/mockAreas.ts`
 *     A-01 = 1, A-03 = 3, A-05 = 4, B-12 = 12, C-03 = 15, C-08 area (multi-manager) = 20
 * - Users: `MOCK_AREA_USERS` in `src/features/areas/data/mockUsers.ts`
 *     Carlos Rojas (2) — GAM (creador)
 *     Laura Mora (3) — Jefatura (cierra)
 *     Ramón Solano (4) — area_manager (aprobador de A-05)
 *     María Pérez (5) — Profesora (colaboradora / escanea)
 *     Jorge Herrera (6) — area_manager (A-01)
 *     Sofía Cambronero (7) — area_manager (A-03 no, pero área 20)
 *     Paula Chinchilla (9) — area_manager (B-12)
 * - Equipment: `MOCK_EQUIPMENT` in `src/features/equipment/data/mockEquipment.ts`
 *     Items 101-103 → área 1 (A-01)
 *     Items 110-113 → área 3 (A-03)
 *     Items 120-121 → área 4 (A-05)
 *     Ítems 140-142 → área 12 (B-12)
 *     Ítems 150-151 → área 15 (C-03)
 *     Ítem 160     → área 20 (multi-manager)
 */

// ---------------------------------------------------------------------------
// Inventories
// ---------------------------------------------------------------------------

export const MOCK_INVENTORIES: Inventory[] = [
  // 1) COMPLETADO — año 2026, cerrado, con summaryStats
  {
    id: 1,
    title: "Levantamiento anual 2026 — Fase piloto",
    year: 2026,
    scope: "area",
    description:
      "Piloto institucional cubriendo áreas administrativas y de laboratorio del Edificio Norte.",
    status: "completado",
    createdById: 2,
    startedAt: "2026-01-20T08:00:00Z",
    completedById: 3,
    completedAt: "2026-02-02T17:30:00Z",
    summaryStats: {
      totalVerified: 6,
      byArea: { "A-01": 3, "A-03": 3 },
      locationMismatches: 1,
      incidentsCount: 0,
      mismatchesDetail: [
        {
          plate: "SIGAP-0012",
          expectedArea: "A-03",
          foundInArea: "A-01",
        },
      ],
    },
    createdAt: "2026-01-18T10:00:00Z",
    updatedAt: "2026-02-02T17:30:00Z",
  },

  // 2) EN PROGRESO — 5 áreas simultáneas en distintos estados (kanban demo)
  {
    id: 2,
    title: "Levantamiento anual 2026 — Fase general",
    year: 2026,
    scope: "all",
    description:
      "Levantamiento institucional completo. Coordinación GAM, ejecución distribuida por áreas.",
    status: "en_progreso",
    createdById: 2,
    startedAt: "2026-02-04T08:00:00Z",
    completedById: null,
    completedAt: null,
    summaryStats: null,
    createdAt: "2026-02-01T09:00:00Z",
    updatedAt: "2026-02-05T18:00:00Z",
  },

  // 3) PLANIFICADO — usa área 20 (3 area_managers) para forzar "sin approver único"
  {
    id: 3,
    title: "Levantamiento focalizado — Préstamo Público C-08",
    year: 2026,
    scope: "area",
    description:
      "Levantamiento del área de préstamo público con múltiples encargados. Requiere designación manual del aprobador.",
    status: "planificado",
    createdById: 2,
    startedAt: null,
    completedById: null,
    completedAt: null,
    summaryStats: null,
    createdAt: "2026-02-06T14:00:00Z",
    updatedAt: "2026-02-06T14:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// InventoryArea rows
// ---------------------------------------------------------------------------

const ISO_START = "2026-02-04T08:15:00Z";
const ISO_SUBMIT = "2026-02-05T16:45:00Z";
const ISO_APPROVED = "2026-02-05T17:20:00Z";
const ISO_REJECTED = "2026-02-05T18:00:00Z";

export const MOCK_INVENTORY_AREAS: InventoryArea[] = [
  // --- Inventario 1 (completado) ---
  {
    id: 1,
    inventoryId: 1,
    areaId: 1, // A-01
    status: "aprobada",
    assignedTo: 5,
    approverId: 6,
    startedAt: "2026-01-20T08:15:00Z",
    submittedBy: 5,
    submittedAt: "2026-01-25T15:00:00Z",
    approvedBy: 6,
    approvedAt: "2026-01-25T16:00:00Z",
    rejectionReason: null,
    rejectedBy: null,
    rejectedAt: null,
    rejectionCount: 0,
    itemsCount: 3,
    mismatchesCount: 0,
  },
  {
    id: 2,
    inventoryId: 1,
    areaId: 3, // A-03
    status: "aprobada",
    assignedTo: 5,
    approverId: 2, // Carlos (aparece en MOCK_USER_AREAS como manager de A-03)
    startedAt: "2026-01-26T08:00:00Z",
    submittedBy: 5,
    submittedAt: "2026-01-30T15:00:00Z",
    approvedBy: 2,
    approvedAt: "2026-01-30T16:00:00Z",
    rejectionReason: null,
    rejectedBy: null,
    rejectedAt: null,
    rejectionCount: 0,
    itemsCount: 3,
    mismatchesCount: 1,
  },

  // --- Inventario 2 (en progreso) — 5 estados ---
  {
    id: 3,
    inventoryId: 2,
    areaId: 12, // B-12
    status: "pendiente",
    assignedTo: 9,
    approverId: 9,
    startedAt: null,
    submittedBy: null,
    submittedAt: null,
    approvedBy: null,
    approvedAt: null,
    rejectionReason: null,
    rejectedBy: null,
    rejectedAt: null,
    rejectionCount: 0,
    itemsCount: 0,
    mismatchesCount: 0,
  },
  {
    id: 4,
    inventoryId: 2,
    areaId: 1, // A-01
    status: "en_progreso",
    assignedTo: 5,
    approverId: 6,
    startedAt: ISO_START,
    submittedBy: null,
    submittedAt: null,
    approvedBy: null,
    approvedAt: null,
    rejectionReason: null,
    rejectedBy: null,
    rejectedAt: null,
    rejectionCount: 0,
    itemsCount: 2,
    mismatchesCount: 1,
  },
  {
    id: 5,
    inventoryId: 2,
    areaId: 3, // A-03
    status: "lista_revision",
    assignedTo: 5,
    approverId: 2,
    startedAt: ISO_START,
    submittedBy: 5,
    submittedAt: ISO_SUBMIT,
    approvedBy: null,
    approvedAt: null,
    rejectionReason: null,
    rejectedBy: null,
    rejectedAt: null,
    rejectionCount: 0,
    itemsCount: 3,
    mismatchesCount: 1,
  },
  {
    id: 6,
    inventoryId: 2,
    areaId: 4, // A-05
    status: "aprobada",
    assignedTo: 5,
    approverId: 4,
    startedAt: ISO_START,
    submittedBy: 5,
    submittedAt: ISO_SUBMIT,
    approvedBy: 4,
    approvedAt: ISO_APPROVED,
    rejectionReason: null,
    rejectedBy: null,
    rejectedAt: null,
    rejectionCount: 0,
    itemsCount: 2,
    mismatchesCount: 0,
  },
  {
    id: 7,
    inventoryId: 2,
    areaId: 15, // C-03
    status: "rechazada",
    assignedTo: 5,
    approverId: 6,
    startedAt: ISO_START,
    submittedBy: 5,
    submittedAt: ISO_SUBMIT,
    approvedBy: null,
    approvedAt: null,
    rejectionReason:
      "Faltan al menos 2 equipos por verificar según el listado esperado. Reingresar tras la validación.",
    rejectedBy: 6,
    rejectedAt: ISO_REJECTED,
    rejectionCount: 1,
    itemsCount: 1,
    mismatchesCount: 0,
  },

  // --- Inventario 3 (planificado, área multi-manager sin approver único) ---
  {
    id: 8,
    inventoryId: 3,
    areaId: 20,
    status: "pendiente",
    assignedTo: null,
    approverId: null, // GAM debe elegir entre los 3 managers
    startedAt: null,
    submittedBy: null,
    submittedAt: null,
    approvedBy: null,
    approvedAt: null,
    rejectionReason: null,
    rejectedBy: null,
    rejectedAt: null,
    rejectionCount: 0,
    itemsCount: 0,
    mismatchesCount: 0,
  },
];

// ---------------------------------------------------------------------------
// InventoryItem rows — enfocado en Inventario 2 (en progreso) para probar UI
// ---------------------------------------------------------------------------

const T = (min: number) =>
  new Date(Date.parse("2026-02-05T14:00:00Z") + min * 60_000).toISOString();

export const MOCK_INVENTORY_ITEMS: InventoryItem[] = [
  // Inventory 2 · area 4 (A-01) · en_progreso — 2 verificados, 1 con mismatch
  {
    id: 201,
    inventoryId: 2,
    inventoryAreaId: 4,
    equipmentId: 101,
    snapshotPlateType: "internal",
    snapshotName: "Monitor Dell 24\"",
    snapshotInstitutionalPlate: null,
    snapshotInternalPlate: "SIGAP-0001",
    snapshotSerialNumber: null,
    snapshotBrand: null,
    snapshotModel: null,
    snapshotCategory: "Cómputo — General",
    snapshotType: "Monitor",
    snapshotArea: "A-01",
    snapshotSubLocation: "Estante A",
    snapshotStatus: "disponible",
    verified: true,
    verifiedAt: T(10),
    verifiedBy: 5,
    condition: "bueno",
    conditionNotes: null,
    locationMatch: true,
    actualArea: "A-01",
    createdAt: T(10),
  },
  {
    id: 202,
    inventoryId: 2,
    inventoryAreaId: 4,
    equipmentId: 5,
    snapshotPlateType: "institutional",
    snapshotName: "Cámara Canon EOS R50",
    snapshotInstitutionalPlate: "UCR-2023-00891",
    snapshotInternalPlate: null,
    snapshotSerialNumber: "SN-CN-EOS-7732",
    snapshotBrand: "Canon",
    snapshotModel: "EOS R50",
    snapshotCategory: "Audiovisual — General",
    snapshotType: "Cámara",
    snapshotArea: "Sala de Conferencias (esperada)",
    snapshotSubLocation: null,
    snapshotStatus: "asignado",
    verified: true,
    verifiedAt: T(35),
    verifiedBy: 5,
    condition: "regular",
    conditionNotes: "Localizada en A-01, esperada en Sala de Conferencias.",
    locationMatch: false,
    actualArea: "A-01",
    createdAt: T(35),
  },

  // Inventory 2 · area 5 (A-03) · lista_revision — 3 verificados, 1 mismatch
  {
    id: 203,
    inventoryId: 2,
    inventoryAreaId: 5,
    equipmentId: 3,
    snapshotPlateType: "internal",
    snapshotName: "Monitor LG UltraWide 29\"",
    snapshotInstitutionalPlate: null,
    snapshotInternalPlate: "INT-LAB-0007",
    snapshotSerialNumber: null,
    snapshotBrand: "LG",
    snapshotModel: "29WL500-B",
    snapshotCategory: "Cómputo — General",
    snapshotType: "Monitor",
    snapshotArea: "A-03",
    snapshotSubLocation: "Mesa 1",
    snapshotStatus: "reparacion",
    verified: true,
    verifiedAt: T(50),
    verifiedBy: 5,
    condition: "malo",
    conditionNotes: "Pantalla con líneas verticales; queda en reparación.",
    locationMatch: true,
    actualArea: "A-03",
    createdAt: T(50),
  },
  {
    id: 204,
    inventoryId: 2,
    inventoryAreaId: 5,
    equipmentId: 111,
    snapshotPlateType: "internal",
    snapshotName: "Microscopio",
    snapshotInstitutionalPlate: null,
    snapshotInternalPlate: "SIGAP-0011",
    snapshotSerialNumber: null,
    snapshotBrand: null,
    snapshotModel: null,
    snapshotCategory: "Herramientas — General",
    snapshotType: "Alicate",
    snapshotArea: "A-03",
    snapshotSubLocation: "Mesa 2",
    snapshotStatus: "mantenimiento",
    verified: true,
    verifiedAt: T(65),
    verifiedBy: 5,
    condition: "regular",
    conditionNotes: null,
    locationMatch: true,
    actualArea: "A-03",
    createdAt: T(65),
  },
  {
    id: 205,
    inventoryId: 2,
    inventoryAreaId: 5,
    equipmentId: 112,
    snapshotPlateType: "internal",
    snapshotName: "Balanza digital",
    snapshotInstitutionalPlate: null,
    snapshotInternalPlate: "SIGAP-0012",
    snapshotSerialNumber: null,
    snapshotBrand: null,
    snapshotModel: null,
    snapshotCategory: "Herramientas — General",
    snapshotType: "Alicate",
    snapshotArea: "A-03",
    snapshotSubLocation: "Vitrina",
    snapshotStatus: "disponible",
    verified: true,
    verifiedAt: T(80),
    verifiedBy: 5,
    condition: "bueno",
    conditionNotes: null,
    locationMatch: false,
    actualArea: "A-01",
    createdAt: T(80),
  },
  // Item de A-03 no encontrado (verified=false)
  {
    id: 206,
    inventoryId: 2,
    inventoryAreaId: 5,
    equipmentId: 113,
    snapshotPlateType: "internal",
    snapshotName: "Osciloscopio",
    snapshotInstitutionalPlate: null,
    snapshotInternalPlate: "SIGAP-0013",
    snapshotSerialNumber: null,
    snapshotBrand: null,
    snapshotModel: null,
    snapshotCategory: "Herramientas — General",
    snapshotType: "Alicate",
    snapshotArea: "A-03",
    snapshotSubLocation: "Mesa 1",
    snapshotStatus: "disponible",
    verified: false,
    verifiedAt: null,
    verifiedBy: null,
    condition: null,
    conditionNotes: null,
    locationMatch: null,
    actualArea: null,
    createdAt: T(95),
  },

  // Inventory 2 · area 6 (A-05) · aprobada — 2 verificados sin mismatch
  {
    id: 207,
    inventoryId: 2,
    inventoryAreaId: 6,
    equipmentId: 120,
    snapshotPlateType: "internal",
    snapshotName: "PC Escritorio",
    snapshotInstitutionalPlate: null,
    snapshotInternalPlate: "SIGAP-0020",
    snapshotSerialNumber: null,
    snapshotBrand: null,
    snapshotModel: null,
    snapshotCategory: "Cómputo — General",
    snapshotType: "Desktop",
    snapshotArea: "A-05",
    snapshotSubLocation: null,
    snapshotStatus: "disponible",
    verified: true,
    verifiedAt: T(20),
    verifiedBy: 5,
    condition: "bueno",
    conditionNotes: null,
    locationMatch: true,
    actualArea: "A-05",
    createdAt: T(20),
  },
  {
    id: 208,
    inventoryId: 2,
    inventoryAreaId: 6,
    equipmentId: 121,
    snapshotPlateType: "internal",
    snapshotName: "Impresora láser",
    snapshotInstitutionalPlate: null,
    snapshotInternalPlate: "SIGAP-0021",
    snapshotSerialNumber: null,
    snapshotBrand: null,
    snapshotModel: null,
    snapshotCategory: "Cómputo — General",
    snapshotType: "Desktop",
    snapshotArea: "A-05",
    snapshotSubLocation: null,
    snapshotStatus: "disponible",
    verified: true,
    verifiedAt: T(30),
    verifiedBy: 5,
    condition: "bueno",
    conditionNotes: null,
    locationMatch: true,
    actualArea: "A-05",
    createdAt: T(30),
  },

  // Inventory 2 · area 7 (C-03) · rechazada — 1 item insuficiente
  {
    id: 209,
    inventoryId: 2,
    inventoryAreaId: 7,
    equipmentId: 150,
    snapshotPlateType: "internal",
    snapshotName: "Estación de trabajo A",
    snapshotInstitutionalPlate: null,
    snapshotInternalPlate: "SIGAP-0050",
    snapshotSerialNumber: null,
    snapshotBrand: null,
    snapshotModel: null,
    snapshotCategory: "Cómputo — General",
    snapshotType: "Desktop",
    snapshotArea: "C-03",
    snapshotSubLocation: "Estación 1",
    snapshotStatus: "disponible",
    verified: true,
    verifiedAt: T(5),
    verifiedBy: 5,
    condition: "bueno",
    conditionNotes: null,
    locationMatch: true,
    actualArea: "C-03",
    createdAt: T(5),
  },
];
