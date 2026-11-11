import type { Area, AreaSublocation, AreaType, UserAreaAssignment } from "../types/area.types";
import { UNASSIGNED_AREA_ID } from "../constants/areaType.constants";

const ISO = new Date("2026-01-15T10:00:00Z").toISOString();

const codes = [
  "A-01","A-02","A-03","A-05","A-07","A-08","A-14","A-15",
  "B-02","B-05","B-10","B-12","B-14",
  "C-03","C-04","C-05","C-06","C-07","C-08","C-09",
  "D-02","D-03","D-04","D-05","D-06","D-07","D-08","D-09","D-10","D-11","D-12","D-13","D-14",
];

/** Realistic type distribution — mixed, not all the same. */
const typeByCode: Record<string, AreaType> = {
  "A-01": "office",       "A-02": "office",        "A-03": "laboratory",
  "A-05": "laboratory",   "A-07": "office",        "A-08": "technical",
  "A-14": "loan_public",  "A-15": "office",
  "B-02": "laboratory",   "B-05": "office",        "B-10": "technical",
  "B-12": "loan_public",  "B-14": "office",
  "C-03": "laboratory",   "C-04": "laboratory",    "C-05": "office",
  "C-06": "technical",    "C-07": "office",        "C-08": "loan_public",
  "C-09": "laboratory",
  "D-02": "office",       "D-03": "office",        "D-04": "laboratory",
  "D-05": "technical",    "D-06": "office",        "D-07": "office",
  "D-08": "loan_public",  "D-09": "laboratory",    "D-10": "office",
  "D-11": "technical",    "D-12": "office",        "D-13": "loan_public",
  "D-14": "office",
};

const buildingByZone = (zone: string | null) =>
  zone === "A" ? "Edificio Norte" :
  zone === "B" ? "Edificio Sur" :
  zone === "C" ? "Edificio Este" :
  zone === "D" ? "Edificio Oeste" : null;

const makeArea = (
  id: number,
  name: string,
  type: AreaType,
  zone: string | null,
  overrides: Partial<Area> = {},
): Area => ({
  id,
  name,
  type,
  zone,
  building: buildingByZone(zone),
  description: null,
  is_protected: false,
  deletedAt: null,
  default_is_loanable: type === "loan_public",
  default_is_publicly_visible: type === "loan_public",
  default_loan_approval_level: type === "loan_public" ? "single" : "none",
  default_transfer_requires_approval: type !== "loan_public",
  default_transfer_approval_level: type === "loan_public" ? "none" : "single",
  created_at: ISO,
  updated_at: ISO,
  ...overrides,
});

/** Nombres de las áreas de préstamo público usadas por el catálogo del solicitante. */
const LOAN_AREA_NAMES: Record<number, string> = {
  12: "Préstamos Audiovisuales", // B-12
  27: "Préstamos Talleres DG", // D-08
};

/** ID for the seed area that starts already soft-deleted. */
export const SEEDED_DELETED_AREA_ID = 14; // C-03, zone C

export const MOCK_AREAS: Area[] = [
  ...codes.map((code, idx) => {
    const zone = code.slice(0, 1);
    const id = idx + 1;
    return makeArea(id, LOAN_AREA_NAMES[id] ?? code, typeByCode[code], zone, {
      description: `Área ${code} ubicada en la zona ${zone}.`,
      deletedAt: id === SEEDED_DELETED_AREA_ID ? ISO : null,
    });
  }),
  makeArea(codes.length + 1, "Biblioteca", "office", null, {
    building: "Edificio Central",
    description: "Biblioteca institucional PED-AL.",
  }),
  makeArea(codes.length + 2, "Bodega (Mural)", "technical", null, {
    building: "Anexo",
    description: "Bodega técnica junto al mural.",
  }),
  {
    id: UNASSIGNED_AREA_ID,
    name: "Sin Área Asignada",
    type: "technical",
    zone: null,
    building: null,
    description:
      "Destino automático de equipos cuya área fue eliminada. Requieren reasignación.",
    is_protected: true,
    deletedAt: null,
    default_is_loanable: false,
    default_is_publicly_visible: false,
    default_loan_approval_level: "none",
    default_transfer_requires_approval: true,
    default_transfer_approval_level: "double",
    created_at: ISO,
    updated_at: ISO,
  },
];

/**
 * user_areas assignments. Leaves ~10 areas without any manager for the empty-state.
 * Includes 2 areas with multiple managers (avatar stack demo).
 */
export const MOCK_USER_AREAS: UserAreaAssignment[] = [
  { user_id: 4, area_id: 5 },   // A-07 — Ramón
  { user_id: 4, area_id: 14 },  // (deleted area — carried through)
  { user_id: 4, area_id: 22 },  // D-03
  { user_id: 6, area_id: 1 },   // A-01
  { user_id: 6, area_id: 8 },   // A-15
  { user_id: 7, area_id: 2 },   // A-02
  { user_id: 9, area_id: 12 },  // B-12
  { user_id: 9, area_id: 27 },  // D-08
  { user_id: 2, area_id: 3 },   // A-03 (Carlos)
  { user_id: 10, area_id: 4 },  // A-05
  { user_id: 3, area_id: 34 },  // Biblioteca
  { user_id: 8, area_id: 35 },  // Bodega
  // Multi-manager areas
  { user_id: 6, area_id: 15 },  // C-03
  { user_id: 2, area_id: 15 },
  { user_id: 4, area_id: 20 },  // C-08
  { user_id: 7, area_id: 20 },
  { user_id: 9, area_id: 20 },
];

export const MOCK_SUBLOCATIONS: AreaSublocation[] = [
  { id: 1, area_id: 1, name: "Estante A" },
  { id: 2, area_id: 1, name: "Estante B" },
  { id: 3, area_id: 3, name: "Mesa 1" },
  { id: 4, area_id: 3, name: "Mesa 2" },
  { id: 5, area_id: 3, name: "Vitrina" },
  { id: 6, area_id: 4, name: "Rack principal" },
  { id: 7, area_id: 12, name: "Mostrador" },
  { id: 8, area_id: 15, name: "Estación 1" },
  { id: 9, area_id: 15, name: "Estación 2" },
  { id: 10, area_id: 20, name: "Vitrina de préstamo" },
  { id: 11, area_id: 34, name: "Sala de lectura" },
  { id: 12, area_id: 35, name: "Pasillo" },
];
