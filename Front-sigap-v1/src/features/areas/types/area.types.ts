/**
 * Domain types for the Areas feature.
 * Mirrors the intended `areas` / `user_areas` / `area_sublocations` schema.
 */

export type AreaType = "loan_public" | "laboratory" | "office" | "technical";

export type LoanApprovalLevel = "none" | "single" | "double";
export type TransferApprovalLevel = "none" | "single" | "double";

export type FunctionalRole =
  | "super_admin"
  | "general_assets_manager"
  | "administrative_chief"
  | "area_manager"
  | "it_coordinator"
  | "it_technician"
  | "professor"
  | "student";

export interface AreaUser {
  id: number;
  name: string;
  email: string;
  initials: string;
  functionalRole: FunctionalRole;
  /** Areas the user is assigned to as manager (used by area_manager). */
  managedAreaIds: number[];
}

export interface AreaSublocation {
  id: number;
  area_id: number;
  name: string;
}

export interface UserAreaAssignment {
  user_id: number;
  area_id: number;
}

export interface Area {
  id: number;
  name: string;
  type: AreaType;
  zone: string | null;
  building: string | null;
  description: string | null;

  is_protected: boolean;
  deletedAt: string | null;

  // Operational defaults
  default_is_loanable: boolean;
  default_is_publicly_visible: boolean;
  default_loan_approval_level: LoanApprovalLevel;
  default_transfer_requires_approval: boolean;
  default_transfer_approval_level: TransferApprovalLevel;

  created_at: string;
  updated_at: string;
}

/** Minimal equipment shape used only inside the areas feature. */
export interface AreaEquipment {
  id: number;
  plate: string;
  name: string;
  status: string;
  sublocation: string | null;
  current_area_id: number;
  /** Set when the equipment was moved here by a cascade from a soft-deleted area. */
  original_area_id: number | null;
}

export interface AreaListFilters {
  search?: string;
  types?: AreaType[];
  zone?: string;
  withoutManager?: boolean;
}

export type AreaView = "cards" | "zones" | "table";
