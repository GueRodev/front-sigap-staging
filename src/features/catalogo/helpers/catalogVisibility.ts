import type { Area } from "@/features/areas/types/area.types";
import type { Equipment } from "@/features/equipment/types/equipment.types";
import {
  resolveIsLoanable,
  resolveIsPubliclyVisible,
} from "@/features/equipment/utils/resolveEquipmentPolicy";

const CATALOG_STATUSES: ReadonlyArray<Equipment["status"]> = ["disponible", "prestado"];

export const isNotDeleted = (eq: Equipment): boolean => eq.deleted_at === null;
export const isAreaActive = (area: Area | undefined | null): area is Area =>
  !!area && area.deletedAt === null;
export const hasCatalogStatus = (eq: Equipment): boolean => CATALOG_STATUSES.includes(eq.status);
export const isLoanableIn = (eq: Equipment, area: Area): boolean => resolveIsLoanable(eq, area);
export const isPublicIn = (eq: Equipment, area: Area): boolean => resolveIsPubliclyVisible(eq, area);
export const isAllowedForRole = (eq: Equipment, userRole: string): boolean =>
  eq.allowed_loan_roles === null || (eq.allowed_loan_roles as string[]).includes(userRole);

/** Las 6 reglas del catálogo. Si falla alguna, el equipo no existe para el usuario. */
export const isVisibleInCatalog = (
  eq: Equipment,
  area: Area | undefined | null,
  userRole: string,
): boolean =>
  isNotDeleted(eq) &&
  isAreaActive(area) &&
  hasCatalogStatus(eq) &&
  isLoanableIn(eq, area) &&
  isPublicIn(eq, area) &&
  isAllowedForRole(eq, userRole);
