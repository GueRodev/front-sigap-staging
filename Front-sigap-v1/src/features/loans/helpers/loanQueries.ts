import { MOCK_LOANS } from "../data/mockLoans";
import type { Loan, LoanStatus } from "../types/loan.types";

const ONGOING: LoanStatus[] = ["en_curso", "vencido"];
const ACTIVE: LoanStatus[] = ["pendiente", "preparando", "listo", "en_curso", "vencido"];

/** Préstamo en curso o vencido que contiene el equipo (línea activa), o null. */
export const getActiveLoanForEquipment = (
  equipmentId: number,
  loans: Loan[] = MOCK_LOANS,
): Loan | null =>
  loans.find(
    (l) =>
      ONGOING.includes(l.status) &&
      l.items.some((i) => i.equipment_id === equipmentId && i.line_status === "active"),
  ) ?? null;

/** Cantidad de préstamos activos (pendiente → vencido) del usuario. */
export const countActiveLoansForUser = (userId: string, loans: Loan[] = MOCK_LOANS): number =>
  loans.filter((l) => l.requester_id === userId && ACTIVE.includes(l.status)).length;
