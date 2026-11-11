import type { AreaType, LoanApprovalLevel } from "@/features/areas/types/area.types";
import type { LoanApprovalActor } from "../types/loan.types";

/** Traduce el nivel de aprobación resuelto (Patrón 6) al actor que aprueba el préstamo. */
export const toLoanApprovalActor = (
  level: LoanApprovalLevel,
  areaType: AreaType,
): LoanApprovalActor => {
  if (level === "double") return "administrative_chief";
  if (level === "single") return "loans_manager";
  return areaType === "loan_public" ? "loans_manager" : "administrative_chief";
};
