import type { Area, Equipment, EquipmentCategory, EquipmentType } from "../types/equipment.types";
import {
  COMPUTO_SLUG,
  GENERAL_CATEGORY_ID,
  UNCATEGORIZED_CATEGORY_ID,
} from "../constants/category.constants";

const cat = (
  id: number,
  name: string,
  parent_id: number | null,
  level: 0 | 1,
  order: number,
  extra?: Partial<EquipmentCategory>,
): EquipmentCategory => ({
  id,
  name,
  parent_id,
  level,
  order,
  slug: null,
  description: null,
  is_protected: false,
  deleted_at: null,
  ...extra,
});

/**
 * Categorías jerárquicas (2 niveles) — ADR-ACTIVOS-001.
 * - Nivel 0 (padre): agrupador, NUNCA se asigna a un equipo.
 * - Nivel 1 (subcategoría): la que efectivamente lleva `equipment.category_id`.
 *
 * Categorías protegidas del seeder: `Sin Categoría` (0), `General` (1) y `Cómputo` (0).
 */
export const MOCK_CATEGORIES: EquipmentCategory[] = [
  // --- Nivel 0 — Padres ---
  cat(1, "Cómputo", null, 0, 1, {
    slug: COMPUTO_SLUG,
    is_protected: true,
    description: "Slug reservado para el Mecanismo 3 (visibilidad global TI).",
  }),
  cat(2, "Audiovisual", null, 0, 2, { slug: "audiovisual" }),
  cat(3, "Mobiliario", null, 0, 3, { slug: "mobiliario" }),
  cat(4, "Herramientas", null, 0, 4, { slug: "herramientas" }),
  cat(5, "Insumos", null, 0, 5, { slug: "insumos" }),
  cat(UNCATEGORIZED_CATEGORY_ID, "Sin Categoría", null, 0, 99, {
    slug: "sin-categoria",
    is_protected: true,
    description: "Destino de equipos huérfanos por cascada de categorías.",
  }),

  // --- Nivel 1 — Subcategorías ---
  cat(10, "Equipo de cómputo", 1, 1, 1, { slug: "equipo-de-computo" }),
  cat(11, "Proyección y sonido", 2, 1, 1, { slug: "proyeccion-y-sonido" }),
  cat(12, "Mobiliario de oficina", 3, 1, 1, { slug: "mobiliario-de-oficina" }),
  cat(13, "Herramienta manual", 4, 1, 1, { slug: "herramienta-manual" }),
  cat(14, "Consumibles", 5, 1, 1, { slug: "consumibles" }),

  // --- Nivel 1 — Subcategorías críticas de Cómputo ---
  cat(20, "Servidores", 1, 1, 2, { slug: "servidores" }),
  cat(21, "Switches de red", 1, 1, 3, { slug: "switches-de-red" }),
  cat(22, "Cámaras IP", 1, 1, 4, { slug: "camaras-ip" }),
  cat(23, "Access Points", 1, 1, 5, { slug: "access-points" }),
  cat(24, "Firewalls", 1, 1, 6, { slug: "firewalls" }),

  cat(GENERAL_CATEGORY_ID, "General", UNCATEGORIZED_CATEGORY_ID, 1, 1, {
    slug: "general",
    is_protected: true,
    description: "Subcategoría destino de los equipos huérfanos (nivel 1).",
  }),
];

// La lista dura de IDs críticos de Cómputo se eliminó en la Fase 7:
// la pertenencia a "Cómputo" se resuelve navegando `parent_id` hasta el slug
// reservado `computo` (Mecanismo 3, ADR-ACTIVOS-001).

/** Navega `parent_id` hasta la raíz y devuelve `true` si su slug es `computo`. */
export const isComputoEquipment = (categoryId: number): boolean => {
  let current = MOCK_CATEGORIES.find((c) => c.id === categoryId);
  while (current) {
    if (current.slug === COMPUTO_SLUG) return true;
    if (current.parent_id == null) return false;
    current = MOCK_CATEGORIES.find((c) => c.id === current!.parent_id);
  }
  return false;
};

/** `true` si la subcategoría cuelga de "Cómputo" (crítica para traslados/TI). */
export const isCriticalComputo = (categoryId: number): boolean =>
  isComputoEquipment(categoryId);

const type = (id: number, name: string, category_id: number): EquipmentType => ({
  id,
  name,
  category_id,
  description: null,
  deleted_at: null,
});

export const MOCK_EQUIPMENT_TYPES: EquipmentType[] = [
  type(1, "Laptop", 10),
  type(2, "Desktop", 10),
  type(3, "Monitor", 10),
  type(4, "Proyector", 11),
  type(5, "Cámara", 11),
  type(6, "Micrófono", 11),
  type(7, "Silla", 12),
  type(8, "Escritorio", 12),
  type(9, "Alicate", 13),
  type(10, "Taladro", 13),
  type(11, "Cable HDMI", 14),
  // Tipos críticos de Cómputo
  type(20, "Servidor rack", 20),
  type(21, "Switch gestionado", 21),
  type(22, "Cámara IP", 22),
  // Tipo genérico para equipos huérfanos
  type(30, "Sin tipo", GENERAL_CATEGORY_ID),
];


export const MOCK_AREAS: Area[] = [
  { id: 1, name: "Laboratorio Norte" },
  { id: 2, name: "Laboratorio Sur" },
  { id: 3, name: "Aula 201" },
  { id: 4, name: "Sala de Conferencias" },
  { id: 5, name: "Bodega Central" },
  { id: 6, name: "Oficinas Administrativas" },
];

const today = new Date().toISOString();

const make = (
  id: number,
  partial: Partial<Equipment> & Pick<Equipment, "name" | "plate_type" | "category_id" | "equipment_type_id" | "current_area_id" | "status">,
): Equipment => ({
  id,
  institutional_plate: null,
  internal_plate: null,
  barcode: null,
  qr_code_value: null,
  serial_number: null,
  oaf_name: null,
  description: null,
  brand: null,
  model: null,
  color: null,
  technical_specs: null,
  quantity_total: 1,
  quantity_available: 1,
  is_loanable: null,
  is_publicly_visible: null,
  loan_approval_level: null,
  transfer_requires_approval: null,
  transfer_approval_level: null,
  allowed_loan_roles: null,
  sub_location_id: null,
  original_area_id: null,
  original_category_id: null,
  previous_area_id: null,
  temporary_area_id: null,
  assigned_to_user_id: null,
  acquisition_type: "compra",
  acquisition_cost: null,
  currency: "CRC",
  purchase_order_number: null,
  invoice_number: null,
  acquired_at: null,
  received_at: null,
  warranty_expires_at: null,
  maintenance_order_number: null,
  warranty_notified_at: null,
  image_path: null,
  attachment_path: null,
  deleted_at: null,
  notes: null,
  created_at: today,
  updated_at: today,
  ...partial,
});

export const MOCK_EQUIPMENT: Equipment[] = [
  make(1, {
    plate_type: "institutional",
    institutional_plate: "UCR-2024-00125",
    serial_number: "SN-DELL-LP-9981",
    name: "Laptop Dell Latitude 5440",
    brand: "Dell",
    model: "Latitude 5440",
    color: "Negro",
    category_id: 10,
    equipment_type_id: 1,
    current_area_id: 1,
    status: "disponible",
    is_loanable: true,
    quantity_total: 1,
    quantity_available: 1,
    acquisition_cost: 850000,
    acquired_at: "2024-03-15",
    warranty_expires_at: "2027-03-15",
  }),
  make(2, {
    plate_type: "institutional",
    institutional_plate: "UCR-2024-00126",
    serial_number: "SN-EPSON-PJ-441",
    name: "Proyector Epson PowerLite",
    brand: "Epson",
    model: "PowerLite X51+",
    category_id: 11,
    equipment_type_id: 4,
    current_area_id: 4,
    status: "prestado",
    is_loanable: true,
    quantity_total: 1,
    quantity_available: 0,
    acquisition_cost: 420000,
  }),
  make(3, {
    plate_type: "internal",
    internal_plate: "INT-LAB-0007",
    name: "Monitor LG UltraWide 29\"",
    brand: "LG",
    model: "29WL500-B",
    category_id: 10,
    equipment_type_id: 3,
    current_area_id: 2,
    status: "reparacion",
    is_loanable: false,
  }),
  make(4, {
    plate_type: "bulk",
    name: "Cable HDMI 2.0 (1.8m)",
    category_id: 14,
    equipment_type_id: 11,
    current_area_id: 5,
    status: "disponible",
    quantity_total: 50,
    quantity_available: 38,
    // Caso bulk: override explícito de préstamo + visibilidad pública.
    is_loanable: true,
    is_publicly_visible: true,
    acquisition_type: "donacion",
  }),
  make(5, {
    plate_type: "institutional",
    institutional_plate: "UCR-2023-00891",
    name: "Cámara Canon EOS R50",
    brand: "Canon",
    model: "EOS R50",
    serial_number: "SN-CN-EOS-7732",
    category_id: 11,
    equipment_type_id: 5,
    current_area_id: 4,
    status: "asignado",
    // Caso override explícito en los 5 campos del Patrón 6.
    is_loanable: true,
    is_publicly_visible: false,
    loan_approval_level: "double",
    transfer_requires_approval: true,
    transfer_approval_level: "double",
    allowed_loan_roles: ["area_manager", "it_coordinator"],
  }),
  make(6, {
    plate_type: "internal",
    internal_plate: "INT-MOB-0033",
    name: "Silla ergonómica Herman Miller",
    brand: "Herman Miller",
    category_id: 12,
    equipment_type_id: 7,
    current_area_id: 6,
    status: "disponible",
    // Caso herencia: todos los overrides quedan en `null` (defaults del área 6).
  }),
  make(7, {
    plate_type: "institutional",
    institutional_plate: "UCR-2022-00455",
    name: "Desktop HP EliteDesk 800",
    brand: "HP",
    model: "EliteDesk 800 G6",
    category_id: 10,
    equipment_type_id: 2,
    current_area_id: 6,
    status: "mantenimiento",
  }),
  make(8, {
    plate_type: "bulk",
    name: "Alicate de corte 6\"",
    category_id: 13,
    equipment_type_id: 9,
    current_area_id: 5,
    status: "disponible",
    quantity_total: 12,
    quantity_available: 12,
  }),
  make(9, {
    plate_type: "institutional",
    institutional_plate: "UCR-2024-00200",
    name: "Micrófono Shure SM58",
    brand: "Shure",
    model: "SM58",
    category_id: 11,
    equipment_type_id: 6,
    current_area_id: 4,
    status: "disponible",
    is_loanable: true,
  }),
  make(10, {
    plate_type: "internal",
    internal_plate: "INT-HER-0002",
    name: "Taladro Bosch GSB 13 RE",
    brand: "Bosch",
    model: "GSB 13 RE",
    category_id: 13,
    equipment_type_id: 10,
    current_area_id: 5,
    status: "disponible",
  }),
  make(11, {
    plate_type: "institutional",
    institutional_plate: "UCR-2021-00099",
    name: "Laptop MacBook Pro 14\"",
    brand: "Apple",
    model: "MacBook Pro 14 M2",
    category_id: 10,
    equipment_type_id: 1,
    current_area_id: 1,
    status: "desechado",
    deleted_at: "2024-01-10",
  }),
  make(12, {
    plate_type: "institutional",
    institutional_plate: "UCR-2023-00712",
    name: "Escritorio modular roble",
    category_id: 12,
    equipment_type_id: 8,
    current_area_id: 6,
    status: "disponible",
  }),
  make(13, {
    plate_type: "internal",
    internal_plate: "INT-CMP-0044",
    name: "Monitor Samsung 27\"",
    brand: "Samsung",
    model: "S27F350",
    category_id: 10,
    equipment_type_id: 3,
    current_area_id: 3,
    status: "extraviado",
  }),
  make(14, {
    plate_type: "institutional",
    institutional_plate: "UCR-2024-00301",
    name: "Laptop Lenovo ThinkPad T14",
    brand: "Lenovo",
    model: "ThinkPad T14 Gen 4",
    category_id: 10,
    equipment_type_id: 1,
    current_area_id: 2,
    status: "disponible",
    is_loanable: true,
  }),
  make(15, {
    plate_type: "bulk",
    name: "Cable HDMI 2.1 (3m)",
    category_id: 14,
    equipment_type_id: 11,
    current_area_id: 5,
    status: "disponible",
    quantity_total: 25,
    quantity_available: 17,
  }),
  make(16, {
    plate_type: "institutional",
    institutional_plate: "UCR-2024-00302",
    name: "Cámara Sony Alpha A6400",
    brand: "Sony",
    model: "Alpha A6400",
    category_id: 11,
    equipment_type_id: 5,
    current_area_id: 4,
    status: "prestado",
    is_loanable: true,
  }),
  make(17, {
    plate_type: "internal",
    internal_plate: "INT-MOB-0050",
    name: "Silla operativa básica",
    category_id: 12,
    equipment_type_id: 7,
    current_area_id: 6,
    status: "disponible",
  }),
  make(18, {
    plate_type: "institutional",
    institutional_plate: "UCR-2023-00500",
    name: "Proyector BenQ MX560",
    brand: "BenQ",
    model: "MX560",
    category_id: 11,
    equipment_type_id: 4,
    current_area_id: 3,
    status: "reparacion",
  }),
  make(19, {
    plate_type: "internal",
    internal_plate: "INT-CMP-0080",
    name: "Desktop Dell OptiPlex",
    brand: "Dell",
    model: "OptiPlex 7090",
    category_id: 10,
    equipment_type_id: 2,
    current_area_id: 1,
    status: "asignado",
  }),
  make(20, {
    plate_type: "bulk",
    name: "Alicate de presión",
    category_id: 13,
    equipment_type_id: 9,
    current_area_id: 5,
    status: "disponible",
    quantity_total: 8,
    quantity_available: 6,
  }),
  make(21, {
    plate_type: "institutional",
    institutional_plate: "UCR-2024-00400",
    name: "Micrófono Rode NT-USB",
    brand: "Rode",
    model: "NT-USB",
    category_id: 11,
    equipment_type_id: 6,
    current_area_id: 1,
    status: "disponible",
  }),
  make(22, {
    plate_type: "internal",
    internal_plate: "INT-HER-0010",
    name: "Taladro percutor DeWalt",
    brand: "DeWalt",
    model: "DCD771C2",
    category_id: 13,
    equipment_type_id: 10,
    current_area_id: 5,
    status: "disponible",
  }),
  make(23, {
    plate_type: "institutional",
    institutional_plate: "UCR-2022-00880",
    name: "Monitor Dell P2422H",
    brand: "Dell",
    model: "P2422H",
    category_id: 10,
    equipment_type_id: 3,
    current_area_id: 6,
    status: "disponible",
  }),
  make(24, {
    plate_type: "internal",
    internal_plate: "INT-MOB-0099",
    name: "Escritorio compacto blanco",
    category_id: 12,
    equipment_type_id: 8,
    current_area_id: 6,
    status: "disponible",
  }),
  make(25, {
    plate_type: "institutional",
    institutional_plate: "UCR-2024-00501",
    name: "Laptop HP ProBook 450",
    brand: "HP",
    model: "ProBook 450 G10",
    category_id: 10,
    equipment_type_id: 1,
    current_area_id: 2,
    status: "disponible",
    is_loanable: true,
  }),

  // ---------------------------------------------------------------------------
  // Area-scoped equipment (previously in areas/data/mockAreaEquipment.ts).
  // Merged here so MOCK_EQUIPMENT is the single source of truth. Area IDs
  // reference the areas feature's MOCK_AREAS (A-01 = 1, A-03 = 3, etc.).
  // ---------------------------------------------------------------------------
  make(101, { plate_type: "internal", internal_plate: "SIGAP-0001", name: "Monitor Dell 24\"", category_id: 10, equipment_type_id: 3, current_area_id: 1, status: "disponible", sub_location_id: 1 }),
  make(102, { plate_type: "internal", internal_plate: "SIGAP-0002", name: "Silla ergonómica", category_id: 12, equipment_type_id: 7, current_area_id: 1, status: "asignado", sub_location_id: 2 }),
  make(103, { plate_type: "internal", internal_plate: "SIGAP-0003", name: "Laptop HP", category_id: 10, equipment_type_id: 1, current_area_id: 1, status: "prestado", is_loanable: true }),

  make(110, { plate_type: "internal", internal_plate: "SIGAP-0010", name: "Proyector Epson", category_id: 11, equipment_type_id: 4, current_area_id: 3, status: "disponible", sub_location_id: 3 }),
  make(111, { plate_type: "internal", internal_plate: "SIGAP-0011", name: "Microscopio", category_id: 13, equipment_type_id: 9, current_area_id: 3, status: "mantenimiento", sub_location_id: 4 }),
  make(112, { plate_type: "internal", internal_plate: "SIGAP-0012", name: "Balanza digital", category_id: 13, equipment_type_id: 9, current_area_id: 3, status: "disponible", sub_location_id: 5 }),
  make(113, { plate_type: "internal", internal_plate: "SIGAP-0013", name: "Osciloscopio", category_id: 13, equipment_type_id: 9, current_area_id: 3, status: "disponible", sub_location_id: 3 }),

  make(120, { plate_type: "internal", internal_plate: "SIGAP-0020", name: "PC Escritorio", category_id: 10, equipment_type_id: 2, current_area_id: 4, status: "disponible" }),
  make(121, { plate_type: "internal", internal_plate: "SIGAP-0021", name: "Impresora láser", category_id: 10, equipment_type_id: 2, current_area_id: 4, status: "disponible" }),

  make(130, { plate_type: "internal", internal_plate: "SIGAP-0030", name: "Cámara Canon", category_id: 11, equipment_type_id: 5, current_area_id: 5, status: "disponible" }),
  make(131, { plate_type: "internal", internal_plate: "SIGAP-0031", name: "Trípode", category_id: 11, equipment_type_id: 5, current_area_id: 5, status: "disponible" }),

  make(140, { plate_type: "bulk", name: "Cable HDMI", category_id: 14, equipment_type_id: 11, current_area_id: 12, status: "disponible", sub_location_id: 7, quantity_total: 10, quantity_available: 10 }),
  make(141, { plate_type: "bulk", name: "Adaptador USB-C", category_id: 14, equipment_type_id: 11, current_area_id: 12, status: "disponible", sub_location_id: 7, quantity_total: 8, quantity_available: 8 }),
  make(142, { plate_type: "bulk", name: "Control remoto", category_id: 14, equipment_type_id: 11, current_area_id: 12, status: "disponible", sub_location_id: 7, quantity_total: 5, quantity_available: 5 }),

  make(150, { plate_type: "internal", internal_plate: "SIGAP-0050", name: "Estación de trabajo A", category_id: 10, equipment_type_id: 2, current_area_id: 15, status: "disponible", sub_location_id: 8 }),
  make(151, { plate_type: "internal", internal_plate: "SIGAP-0051", name: "Estación de trabajo B", category_id: 10, equipment_type_id: 2, current_area_id: 15, status: "disponible", sub_location_id: 9 }),

  make(160, { plate_type: "bulk", name: "Kit préstamo público", category_id: 14, equipment_type_id: 11, current_area_id: 20, status: "disponible", sub_location_id: 10 }),

  make(170, { plate_type: "internal", internal_plate: "SIGAP-0070", name: "Lector de libros", category_id: 14, equipment_type_id: 11, current_area_id: 34, status: "disponible", sub_location_id: 11 }),

  make(180, { plate_type: "internal", internal_plate: "SIGAP-0080", name: "Caja de herramientas", category_id: 13, equipment_type_id: 9, current_area_id: 35, status: "disponible", sub_location_id: 12 }),

  // Cascade seed: orphans in "Sin Área Asignada" (999), coming from A-14 (id 14, soft-deleted at boot).
  make(900, { plate_type: "internal", internal_plate: "SIGAP-0900", name: "Equipo A14 huérfano 1", category_id: 10, equipment_type_id: 1, current_area_id: 999, status: "disponible", original_area_id: 14 }),
  make(901, { plate_type: "internal", internal_plate: "SIGAP-0901", name: "Equipo A14 huérfano 2", category_id: 10, equipment_type_id: 1, current_area_id: 999, status: "disponible", original_area_id: 14 }),
  make(902, { plate_type: "internal", internal_plate: "SIGAP-0902", name: "Equipo A14 huérfano 3", category_id: 10, equipment_type_id: 1, current_area_id: 999, status: "disponible", original_area_id: 14 }),
  // Manually reassigned to A-08 (id 8) while A-14 was deleted — must NOT return on restore.
  make(903, { plate_type: "internal", internal_plate: "SIGAP-0903", name: "Equipo A14 reasignado", category_id: 10, equipment_type_id: 1, current_area_id: 8, status: "disponible", original_area_id: 14 }),

  // --- Cómputo crítico (aprobación obligatoria de traslado) ---
  make(600, {
    plate_type: "institutional",
    institutional_plate: "UCR-2024-00600",
    serial_number: "SN-HPE-DL380-001",
    name: "Servidor HPE ProLiant DL380",
    brand: "HPE",
    model: "ProLiant DL380 Gen11",
    category_id: 20,
    equipment_type_id: 20,
    current_area_id: 5,
    status: "disponible",
    acquisition_cost: 6500000,
    transfer_requires_approval: true,
  }),
  make(601, {
    plate_type: "institutional",
    institutional_plate: "UCR-2024-00601",
    serial_number: "SN-CSC-C9300-014",
    name: "Switch Cisco Catalyst 9300",
    brand: "Cisco",
    model: "Catalyst 9300-48P",
    category_id: 21,
    equipment_type_id: 21,
    current_area_id: 5,
    status: "disponible",
    acquisition_cost: 3200000,
    transfer_requires_approval: true,
  }),
  make(602, {
    plate_type: "institutional",
    institutional_plate: "UCR-2024-00602",
    serial_number: "SN-AXIS-P3265",
    name: "Cámara IP Axis P3265-LVE",
    brand: "Axis",
    model: "P3265-LVE",
    category_id: 22,
    equipment_type_id: 22,
    current_area_id: 4,
    status: "disponible",
    acquisition_cost: 480000,
    transfer_requires_approval: true,
  }),

  // --- Catálogo del solicitante (préstamos) — áreas 12 y 27, casos especiales 217/218 ---
  make(200, { plate_type: "institutional", institutional_plate: "UCR-2025-00200", name: "Cámara Canon EOS Rebel T7", brand: "Canon", model: "EOS Rebel T7", category_id: 11, equipment_type_id: 5, current_area_id: 12, status: "disponible", image_path: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80&auto=format&fit=crop" }),
  make(201, { plate_type: "internal", internal_plate: "INT-PRE-0001", name: "Cámara Pentax K-1000", brand: "Pentax", model: "K-1000", category_id: 11, equipment_type_id: 5, current_area_id: 12, status: "disponible", image_path: "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800&q=80&auto=format&fit=crop" }),
  make(202, { plate_type: "internal", internal_plate: "INT-PRE-0002", name: "Trípode Manfrotto 190X", brand: "Manfrotto", model: "190X", category_id: 11, equipment_type_id: 5, current_area_id: 12, status: "disponible", image_path: "https://images.unsplash.com/photo-1617575521317-d2974f3b56d2?w=800&q=80&auto=format&fit=crop" }),
  make(203, { plate_type: "institutional", institutional_plate: "UCR-2025-00203", name: "Proyector Epson PowerLite E20", brand: "Epson", model: "PowerLite E20", category_id: 11, equipment_type_id: 4, current_area_id: 12, status: "disponible", image_path: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80&auto=format&fit=crop" }),
  make(204, { plate_type: "institutional", institutional_plate: "UCR-2025-00204", name: "Micrófono Rode VideoMic GO II", brand: "Rode", model: "VideoMic GO II", category_id: 11, equipment_type_id: 6, current_area_id: 12, status: "disponible", image_path: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80&auto=format&fit=crop" }),
  make(205, { plate_type: "internal", internal_plate: "INT-PRE-0005", name: "Kit luces LED Neewer", brand: "Neewer", model: "Kit LED", category_id: 11, equipment_type_id: 5, current_area_id: 12, status: "disponible", image_path: null }),
  make(206, { plate_type: "institutional", institutional_plate: "UCR-2025-00206", name: "Cámara Sony ZV-E10", brand: "Sony", model: "ZV-E10", category_id: 11, equipment_type_id: 5, current_area_id: 12, status: "prestado", image_path: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80&auto=format&fit=crop" }),
  make(207, { plate_type: "institutional", institutional_plate: "UCR-2025-00207", name: "Grabadora Zoom H5", brand: "Zoom", model: "H5", category_id: 11, equipment_type_id: 6, current_area_id: 12, status: "prestado", image_path: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80&auto=format&fit=crop" }),
  make(208, { plate_type: "institutional", institutional_plate: "UCR-2025-00208", name: "Parlante JBL EON710", brand: "JBL", model: "EON710", category_id: 11, equipment_type_id: 6, current_area_id: 12, status: "mantenimiento", image_path: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80&auto=format&fit=crop" }),
  make(209, { plate_type: "bulk", name: "Baterías recargables AA", category_id: 14, equipment_type_id: 11, current_area_id: 12, status: "disponible", image_path: null, quantity_total: 24, quantity_available: 20 }),
  make(210, { plate_type: "institutional", institutional_plate: "UCR-2025-00210", name: "Tableta Wacom Intuos Pro", brand: "Wacom", model: "Intuos Pro", category_id: 10, equipment_type_id: 3, current_area_id: 27, status: "disponible", image_path: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80&auto=format&fit=crop" }),
  make(211, { plate_type: "internal", internal_plate: "INT-PRE-0011", name: "Tableta Wacom One", brand: "Wacom", model: "One", category_id: 10, equipment_type_id: 3, current_area_id: 27, status: "prestado", image_path: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&q=80&auto=format&fit=crop" }),
  make(212, { plate_type: "internal", internal_plate: "INT-PRE-0012", name: "Plotter Silhouette Cameo 5", brand: "Silhouette", model: "Cameo 5", category_id: 10, equipment_type_id: 2, current_area_id: 27, status: "disponible", image_path: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&q=80&auto=format&fit=crop" }),
  make(213, { plate_type: "internal", internal_plate: "INT-PRE-0013", name: "Guillotina de papel A3", category_id: 13, equipment_type_id: 9, current_area_id: 27, status: "disponible", image_path: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&q=80&auto=format&fit=crop" }),
  make(214, { plate_type: "bulk", name: "Regla de aluminio 60 cm", category_id: 13, equipment_type_id: 9, current_area_id: 27, status: "disponible", image_path: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&q=80&auto=format&fit=crop", quantity_total: 15, quantity_available: 12 }),
  make(215, { plate_type: "bulk", name: "Cutter de precisión X-Acto", brand: "X-Acto", category_id: 13, equipment_type_id: 9, current_area_id: 27, status: "disponible", image_path: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80&auto=format&fit=crop", quantity_total: 30, quantity_available: 26 }),
  make(216, { plate_type: "institutional", institutional_plate: "UCR-2025-00216", name: 'iPad Pro 11"', brand: "Apple", model: "iPad Pro 11", category_id: 10, equipment_type_id: 1, current_area_id: 27, status: "reparacion", image_path: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80&auto=format&fit=crop" }),
  make(217, { plate_type: "institutional", institutional_plate: "UCR-2025-00217", name: "Robot NAO", brand: "SoftBank Robotics", model: "NAO V6", category_id: 10, equipment_type_id: 2, current_area_id: 3, status: "disponible", image_path: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80&auto=format&fit=crop", is_loanable: true, is_publicly_visible: true, loan_approval_level: "double", allowed_loan_roles: ["professor"] }),
  make(218, { plate_type: "institutional", institutional_plate: "UCR-2025-00218", name: "Cámara 360 Insta360 X3", brand: "Insta360", model: "X3", category_id: 11, equipment_type_id: 5, current_area_id: 14, status: "disponible", image_path: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80&auto=format&fit=crop", is_loanable: true, is_publicly_visible: true, original_area_id: 14 }),
];
