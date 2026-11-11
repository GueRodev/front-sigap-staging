import type { BaseRole, UserStatus } from "../types/user.types";

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
};

export const BASE_ROLE_LABELS: Record<BaseRole, string> = {
  student: "Estudiante",
  professor: "Profesor",
  administrative: "Administrativo",
};

export const USER_STATUS_STYLES: Record<UserStatus, { dot: string; pill: string }> = {
  active: {
    dot: "bg-emerald-500",
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  inactive: {
    dot: "bg-amber-500",
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
};

export const BASE_ROLE_STYLES: Record<BaseRole, { dot: string; pill: string }> = {
  student: {
    dot: "bg-muted-foreground",
    pill: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
  professor: {
    dot: "bg-sigap-dark",
    pill: "bg-sigap-dark/10 text-sigap-dark dark:text-sigap-sky border-sigap-dark/20",
  },
  administrative: {
    dot: "bg-primary",
    pill: "bg-primary/10 text-primary border-primary/20",
  },
};

export const USER_STATUS_OPTIONS = (Object.keys(USER_STATUS_LABELS) as UserStatus[]).map((value) => ({
  value,
  label: USER_STATUS_LABELS[value],
}));

export const BASE_ROLE_OPTIONS = (Object.keys(BASE_ROLE_LABELS) as BaseRole[]).map((value) => ({
  value,
  label: BASE_ROLE_LABELS[value],
}));

export const REGISTRATION_STATUS_OPTIONS = [
  { value: "registered", label: "Registrados" },
  { value: "pending", label: "Pendientes" },
];