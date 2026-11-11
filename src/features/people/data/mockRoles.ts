import type { Area, Permission, Role } from "../types/role.types";

export const mockRoles: Role[] = [
  { id: 1, name: "student", label: "Estudiante", roleType: "base", compatibleBaseRoles: ["student"] },
  { id: 2, name: "professor", label: "Profesor", roleType: "base", compatibleBaseRoles: ["professor"] },
  { id: 3, name: "administrative", label: "Administrativo", roleType: "base", compatibleBaseRoles: ["administrative"] },
  { id: 4, name: "inventory_manager", label: "Enc. Inventario", roleType: "functional", compatibleBaseRoles: ["administrative"] },
  { id: 5, name: "loans_manager", label: "Enc. Préstamos", roleType: "functional", compatibleBaseRoles: ["administrative"] },
  { id: 6, name: "area_manager", label: "Enc. de Área", roleType: "functional", compatibleBaseRoles: ["administrative", "professor"] },
  { id: 7, name: "reports_viewer", label: "Consulta Reportes", roleType: "functional", compatibleBaseRoles: ["administrative", "professor"] },
];

export const mockPermissions: Permission[] = [
  { id: 1, name: "register_it_equipment", label: "Registrar equipos TI" },
  { id: 2, name: "approve_loans", label: "Aprobar préstamos" },
  { id: 3, name: "manage_inventory", label: "Gestionar inventario" },
  { id: 4, name: "view_reports", label: "Ver reportes" },
];

export const mockAreas: Area[] = [
  { id: 1, name: "Laboratorio de Informática" },
  { id: 2, name: "Biblioteca PED-AL" },
  { id: 3, name: "Coordinación Académica" },
  { id: 4, name: "Administración" },
];