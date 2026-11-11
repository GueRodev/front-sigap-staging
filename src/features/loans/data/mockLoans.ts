import { addDays, subDays } from "date-fns";
import type { Loan } from "../types/loan.types";

const now = new Date();
const iso = (d: Date) => d.toISOString();

/** Préstamos en curso; fechas relativas a hoy para que nunca queden desactualizadas. */
export const MOCK_LOANS: Loan[] = [
  {
    id: 1,
    requester_id: "2",
    status: "en_curso",
    requested_from: iso(subDays(now, 3)),
    expected_return_at: iso(addDays(now, 2)),
    loan_approval_level: "loans_manager",
    chief_approval_status: "not_required",
    items: [{ equipment_id: 206, quantity: 1, line_status: "active" }],
  },
  {
    id: 2,
    requester_id: "2",
    status: "en_curso",
    requested_from: iso(subDays(now, 1)),
    expected_return_at: iso(addDays(now, 5)),
    loan_approval_level: "loans_manager",
    chief_approval_status: "not_required",
    items: [{ equipment_id: 207, quantity: 1, line_status: "active" }],
  },
  {
    id: 3,
    requester_id: "3",
    status: "en_curso",
    requested_from: iso(subDays(now, 2)),
    expected_return_at: iso(addDays(now, 1)),
    loan_approval_level: "loans_manager",
    chief_approval_status: "not_required",
    items: [{ equipment_id: 211, quantity: 1, line_status: "active" }],
  },
];
