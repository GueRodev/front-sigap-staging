/**
 * Patrón 6 — Resolución de overrides individuales (ADR-ACTIVOS-001).
 *
 * Cada campo override del equipo es nullable:
 *   - valor explícito (`true` / `false` / nivel) ⇒ gana sobre el área.
 *   - `null` ⇒ hereda el default del área actual.
 *
 * `allowed_loan_roles` NO tiene helper: es exclusivo del equipo y no se hereda
 * (`null` = sin restricción de rol).
 */

import type {
  Area,
  LoanApprovalLevel,
  TransferApprovalLevel,
} from "@/features/areas/types/area.types";
import type { Equipment } from "../types/equipment.types";

/** Área mínima aceptada por los helpers (sólo los defaults del Patrón 6). */
export type PolicyArea = Pick<
  Area,
  | "default_is_loanable"
  | "default_is_publicly_visible"
  | "default_loan_approval_level"
  | "default_transfer_requires_approval"
  | "default_transfer_approval_level"
>;

type PolicyEquipment = Pick<
  Equipment,
  | "is_loanable"
  | "is_publicly_visible"
  | "loan_approval_level"
  | "transfer_requires_approval"
  | "transfer_approval_level"
>;

/** Fallbacks conservadores cuando el área no está disponible en el contexto. */
const FALLBACK: Required<PolicyArea> = {
  default_is_loanable: false,
  default_is_publicly_visible: false,
  default_loan_approval_level: "single",
  default_transfer_requires_approval: true,
  default_transfer_approval_level: "single",
};

const inherit = <T>(override: T | null, areaDefault: T): T =>
  override === null || override === undefined ? areaDefault : override;

export const resolveIsLoanable = (
  equipment: Pick<PolicyEquipment, "is_loanable">,
  area?: PolicyArea | null,
): boolean =>
  inherit(equipment.is_loanable, area?.default_is_loanable ?? FALLBACK.default_is_loanable);

export const resolveIsPubliclyVisible = (
  equipment: Pick<PolicyEquipment, "is_publicly_visible">,
  area?: PolicyArea | null,
): boolean =>
  inherit(
    equipment.is_publicly_visible,
    area?.default_is_publicly_visible ?? FALLBACK.default_is_publicly_visible,
  );

export const resolveLoanApprovalLevel = (
  equipment: Pick<PolicyEquipment, "loan_approval_level">,
  area?: PolicyArea | null,
): LoanApprovalLevel =>
  inherit(
    equipment.loan_approval_level,
    area?.default_loan_approval_level ?? FALLBACK.default_loan_approval_level,
  );

export const resolveTransferRequiresApproval = (
  equipment: Pick<PolicyEquipment, "transfer_requires_approval">,
  area?: PolicyArea | null,
): boolean =>
  inherit(
    equipment.transfer_requires_approval,
    area?.default_transfer_requires_approval ?? FALLBACK.default_transfer_requires_approval,
  );

export const resolveTransferApprovalLevel = (
  equipment: Pick<PolicyEquipment, "transfer_approval_level">,
  area?: PolicyArea | null,
): TransferApprovalLevel =>
  inherit(
    equipment.transfer_approval_level,
    area?.default_transfer_approval_level ?? FALLBACK.default_transfer_approval_level,
  );

/** `true` si el equipo define al menos un override explícito (no hereda todo). */
export const hasPolicyOverrides = (equipment: PolicyEquipment): boolean =>
  equipment.is_loanable !== null ||
  equipment.is_publicly_visible !== null ||
  equipment.loan_approval_level !== null ||
  equipment.transfer_requires_approval !== null ||
  equipment.transfer_approval_level !== null;
