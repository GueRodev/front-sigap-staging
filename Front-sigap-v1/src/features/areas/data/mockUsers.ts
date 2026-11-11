import type { AreaUser } from "../types/area.types";

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const make = (
  id: number,
  name: string,
  functionalRole: AreaUser["functionalRole"],
  managedAreaIds: number[] = [],
): AreaUser => ({
  id,
  name,
  email: `${name.toLowerCase().replace(/\s+/g, ".").normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@ucr.ac.cr`,
  initials: initials(name),
  functionalRole,
  managedAreaIds,
});

/**
 * ~10 mock users. The first 5 populate the role selector so demo users
 * can switch personas and see how permissions gate the UI.
 */
export const MOCK_AREA_USERS: AreaUser[] = [
  make(1, "Ana Vargas", "super_admin"),
  make(2, "Carlos Rojas", "general_assets_manager"),
  make(3, "Laura Mora", "administrative_chief"),
  make(4, "Ramón Solano", "area_manager", [5, 14, 22]),
  make(5, "María Pérez", "professor"),
  make(6, "Jorge Herrera", "area_manager", [1, 8]),
  make(7, "Sofía Cambronero", "area_manager", [2]),
  make(8, "Diego Alfaro", "administrative_chief"),
  make(9, "Paula Chinchilla", "area_manager", [12, 27]),
  make(10, "Luis Fonseca", "general_assets_manager"),
  make(11, "Sebastián Quirós", "it_technician"),
  make(12, "Mariana Solís", "it_coordinator"),
];

export const DEFAULT_MOCK_USER_ID = 1;
