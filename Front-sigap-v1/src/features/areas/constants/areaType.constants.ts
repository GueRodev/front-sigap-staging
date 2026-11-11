import { Building2, FlaskConical, HandCoins, Wrench, type LucideIcon } from "lucide-react";

import type { AreaType, FunctionalRole, LoanApprovalLevel, TransferApprovalLevel } from "../types/area.types";

export interface AreaTypeMeta {
  label: string;
  icon: LucideIcon;
  /** Left color-strip class using semantic tokens. */
  stripClass: string;
  /** Badge pill classes (bg + text + border). */
  pillClass: string;
  /** Icon tint class. */
  iconClass: string;
}

export const AREA_TYPE_META: Record<AreaType, AreaTypeMeta> = {
  loan_public: {
    label: "Préstamo Público",
    icon: HandCoins,
    stripClass: "bg-primary",
    pillClass: "bg-primary/10 text-primary border-primary/20",
    iconClass: "text-primary",
  },
  laboratory: {
    label: "Laboratorio",
    icon: FlaskConical,
    stripClass: "bg-sigap-sky",
    pillClass: "bg-sigap-sky/15 text-sigap-blue dark:text-sigap-sky border-sigap-sky/30",
    iconClass: "text-sigap-blue dark:text-sigap-sky",
  },
  office: {
    label: "Oficina",
    icon: Building2,
    stripClass: "bg-sigap-sky",
    pillClass: "bg-sigap-sky/15 text-sigap-blue dark:text-sigap-sky border-sigap-sky/30",
    iconClass: "text-sigap-blue dark:text-sigap-sky",
  },
  technical: {
    label: "Técnica",
    icon: Wrench,
    stripClass: "bg-secondary",
    pillClass: "bg-secondary/10 text-secondary border-secondary/20",
    iconClass: "text-secondary",
  },
};

export const AREA_TYPE_OPTIONS: { value: AreaType; label: string }[] = (
  Object.keys(AREA_TYPE_META) as AreaType[]
).map((value) => ({ value, label: AREA_TYPE_META[value].label }));

export const LOAN_APPROVAL_OPTIONS: { value: LoanApprovalLevel; label: string }[] = [
  { value: "none", label: "Sin aprobación" },
  { value: "single", label: "Aprobación simple" },
  { value: "double", label: "Doble aprobación" },
];

export const TRANSFER_APPROVAL_OPTIONS: { value: TransferApprovalLevel; label: string }[] = [
  { value: "none", label: "Sin aprobación" },
  { value: "single", label: "Aprobación simple" },
  { value: "double", label: "Doble aprobación" },
];

export const FUNCTIONAL_ROLE_LABEL: Record<FunctionalRole, string> = {
  super_admin: "Super Admin",
  general_assets_manager: "Enc. General de Activos",
  administrative_chief: "Jefatura Administrativa",
  area_manager: "Encargado de Área",
  it_coordinator: "Coordinador de TI",
  it_technician: "Técnico de TI",
  professor: "Profesor",
  student: "Estudiante",
};

/** Permissions derived per role. */
export interface Permissions {
  manage_areas: boolean;
  assign_user_areas: boolean;
  manage_area_sublocations: boolean;
  /** If true, sublocations can only be managed on the user's own areas. */
  sublocations_scope: "all" | "own" | "none";
}

export const ROLE_PERMISSIONS: Record<FunctionalRole, Permissions> = {
  super_admin: {
    manage_areas: true,
    assign_user_areas: true,
    manage_area_sublocations: true,
    sublocations_scope: "all",
  },
  general_assets_manager: {
    manage_areas: true,
    assign_user_areas: true,
    manage_area_sublocations: true,
    sublocations_scope: "all",
  },
  administrative_chief: {
    manage_areas: false,
    assign_user_areas: true,
    manage_area_sublocations: true,
    sublocations_scope: "all",
  },
  area_manager: {
    manage_areas: false,
    assign_user_areas: false,
    manage_area_sublocations: true,
    sublocations_scope: "own",
  },
  it_coordinator: {
    manage_areas: false,
    assign_user_areas: false,
    manage_area_sublocations: false,
    sublocations_scope: "none",
  },
  it_technician: {
    manage_areas: false,
    assign_user_areas: false,
    manage_area_sublocations: false,
    sublocations_scope: "none",
  },
  professor: {
    manage_areas: false,
    assign_user_areas: false,
    manage_area_sublocations: false,
    sublocations_scope: "none",
  },
  student: {
    manage_areas: false,
    assign_user_areas: false,
    manage_area_sublocations: false,
    sublocations_scope: "none",
  },
};

/** ID of the protected "Sin Área Asignada" area — must match the seed in mockAreas. */
export const UNASSIGNED_AREA_ID = 999;
