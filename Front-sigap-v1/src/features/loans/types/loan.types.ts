/** Tipos mínimos del dominio de Préstamos (alineados a ADR-PRESTAMOS-001). */
export type LoanStatus =
  | "pendiente"
  | "preparando"
  | "listo"
  | "en_curso"
  | "devuelto"
  | "devuelto_con_incidencias"
  | "vencido"
  | "rechazado"
  | "cancelado";

export type LoanApprovalActor = "loans_manager" | "administrative_chief";

export type LoanItemStatus = "active" | "rejected_at_approval" | "returned";

export type ChiefApprovalStatus = "pending" | "approved" | "not_required";

export interface LoanItem {
  equipment_id: number;
  quantity: number;
  line_status: LoanItemStatus;
}

export interface Loan {
  id: number;
  requester_id: string;
  status: LoanStatus;
  requested_from: string;
  expected_return_at: string;
  loan_approval_level: LoanApprovalActor;
  chief_approval_status: ChiefApprovalStatus;
  items: LoanItem[];
}

/** Ítem del pedido (carrito) del solicitante. No guarda fechas. */
export interface LoanCartItem {
  equipmentId: number;
  quantity: number;
  approvalActor: LoanApprovalActor;
}
