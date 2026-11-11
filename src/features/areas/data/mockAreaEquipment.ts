import { MOCK_EQUIPMENT } from "@/features/equipment/data/mockEquipment";
import type { Equipment } from "@/features/equipment/types/equipment.types";

import type { AreaEquipment } from "../types/area.types";
import { MOCK_SUBLOCATIONS } from "./mockAreas";

/**
 * Project a full `Equipment` row into the lightweight shape the Areas
 * feature needs (id, plate, name, status, sublocation, area refs).
 *
 * MOCK_EQUIPMENT is the single source of truth — this module only derives.
 * The `sublocation` name is resolved from `MOCK_SUBLOCATIONS` since
 * Equipment stores `sub_location_id` (FK) — see ADR-ACTIVOS-001.
 */
const plateOf = (e: Equipment): string =>
  e.institutional_plate ?? e.internal_plate ?? `BULK-${e.id}`;

const SUBLOCATION_NAME_BY_ID = new Map(
  MOCK_SUBLOCATIONS.map((s) => [s.id, s.name] as const),
);

const resolveSublocationName = (id: number | null): string | null =>
  id == null ? null : SUBLOCATION_NAME_BY_ID.get(id) ?? null;

export const toAreaEquipment = (e: Equipment): AreaEquipment => ({
  id: e.id,
  plate: plateOf(e),
  name: e.name,
  status: e.status,
  sublocation: resolveSublocationName(e.sub_location_id),
  current_area_id: e.current_area_id,
  original_area_id: e.original_area_id,
});

/** Full projection of every equipment item into AreaEquipment shape. */
export const getAllAreaEquipment = (): AreaEquipment[] =>
  MOCK_EQUIPMENT.map(toAreaEquipment);

/** Equipment currently located in the given area. */
export const getAreaEquipment = (areaId: number): AreaEquipment[] =>
  MOCK_EQUIPMENT.filter((e) => e.current_area_id === areaId).map(toAreaEquipment);
