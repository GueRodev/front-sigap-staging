/**
 * Tipos del módulo de Traslados (SIGAP).
 * Espeja el shape de la tabla `transfers` descrito en
 * `docs/adr/ADR-TRANSFERS-001.md` (Modelo de datos).
 *
 * Un traslado NUNCA modifica `equipment.status`. Solo el módulo de Traslados
 * escribe `equipment.current_area_id` y `equipment.sub_location_id` una vez
 * completado el registro inicial (ver ADR-ACTIVOS-001, Reglas invariantes).
 */

export type TransferType = 'direct' | 'request' | 'sublocation_change';

export type TransferStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export interface Transfer {
  id: number;
  type: TransferType;
  status: TransferStatus;

  equipment_id: number;
  origin_area_id: number;
  destination_area_id: number;

  /** Solo aplica a `sublocation_change`. `null` en los demás tipos. */
  origin_sublocation_id: number | null;
  /** Solo aplica a `sublocation_change`. `null` en los demás tipos. */
  destination_sublocation_id: number | null;

  is_temporary: boolean;

  requested_by_id: number;
  request_reason: string | null;
  expected_date: string | null; // YYYY-MM-DD
  return_date: string | null;   // YYYY-MM-DD (solo si is_temporary)

  approved_by_id: number | null;
  approved_at: string | null;    // ISO 8601
  approval_notes: string | null;

  rejected_by_id: number | null;
  rejected_at: string | null;
  rejection_reason: string | null;

  executed_by_id: number | null;
  executed_at: string | null;

  cancelled_by_id: number | null;
  cancelled_at: string | null;

  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
