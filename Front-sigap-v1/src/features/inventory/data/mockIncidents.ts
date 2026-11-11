import type { InventoryIncident } from "../types/inventory.types";

/**
 * Isolated so the eventual migration to the shared `equipment_incidents` table
 * (real roadmap Fase 4) touches only this file.
 *
 * The `inventoryItemId` values reference items created in `mockInventories.ts`
 * for the "en_progreso" inventory (id 2). `reportedBy` uses `MOCK_AREA_USERS`
 * (Ramón Solano = 4, María Pérez = 5).
 */
export const MOCK_INVENTORY_INCIDENTS: InventoryIncident[] = [
  {
    id: 1,
    inventoryItemId: null,
    equipmentId: 13, // Monitor Samsung 27" — extraviado
    incidentType: "missing_equipment",
    severity: "alta",
    description:
      "Equipo esperado en el área no fue localizado durante el levantamiento.",
    status: "abierta",
    reportedBy: 5,
    createdAt: "2026-02-05T15:32:00Z",
  },
  {
    id: 2,
    inventoryItemId: 202, // ver mockInventories — item con locationMatch=false
    equipmentId: 5, // Cámara Canon EOS R50 (esperada en área 4, encontrada en otra)
    incidentType: "location_mismatch_unresolved",
    severity: "media",
    description:
      "La cámara fue localizada en un área distinta a la registrada y no se ha podido justificar el traslado.",
    status: "en_investigacion",
    reportedBy: 4,
    createdAt: "2026-02-05T16:10:00Z",
  },
  {
    id: 3,
    inventoryItemId: 203, // item con condición malo
    equipmentId: 3, // Monitor LG UltraWide 29" — reparacion
    incidentType: "severe_damage",
    severity: "media",
    description:
      "Pantalla presenta líneas verticales permanentes; el equipo continúa en reparación.",
    status: "abierta",
    reportedBy: 5,
    createdAt: "2026-02-05T17:02:00Z",
  },
];
