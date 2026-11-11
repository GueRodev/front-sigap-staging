import type { PlateType } from "@/features/equipment/types/equipment.types";
import type { LoanApprovalActor } from "@/features/loans/types/loan.types";

export type CatalogStatus = "disponible" | "prestado";

/** Modelo de vista del catálogo: nunca incluye datos financieros. */
export interface CatalogItem {
  id: number;
  name: string;
  brand: string | null;
  model: string | null;
  imageUrl: string | null;
  parentCategoryId: number | null;
  parentCategoryName: string;
  subcategoryName: string;
  areaId: number;
  areaName: string;
  plateType: PlateType;
  plateLabel: string | null;
  quantityAvailable: number | null;
  status: CatalogStatus;
  approvalActor: LoanApprovalActor;
  expectedReturnAt: string | null;
}

export interface CatalogOption {
  id: number;
  name: string;
}
