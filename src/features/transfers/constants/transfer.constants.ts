import type {
  Transfer,
  TransferStatus,
  TransferType,
} from '../types/transfer.types';

/** Modalidad resuelta por el algoritmo (ADR-TRANSFERS-001, Pasos 0-5). */
export type TransferModality = 'direct' | 'request' | 'sublocation' | 'not_allowed';

/**
 * Motivo por el cual una modalidad no es "directa" — se usa para pintar los
 * dropzones y explicar el bloqueo al usuario.
 */
export type TransferBlockReason =
  | 'invalid_status'
  | 'same_area_no_permission'
  | 'requires_approval'
  | 'critical_computo_role'
  | 'destination_out_of_scope'
  | 'origin_out_of_scope'
  | 'destination_protected';

export interface TransferResolution {
  modality: TransferModality;
  reason: TransferBlockReason | null;
}

export const TRANSFER_TYPE_LABEL: Record<TransferType, string> = {
  direct: 'Directo',
  request: 'Solicitud',
  sublocation_change: 'Sublocación',
};

export const TRANSFER_TYPE_PILL: Record<TransferType, string> = {
  direct: 'bg-sigap-sky/15 text-sigap-blue dark:text-sigap-sky border-sigap-sky/30',
  request: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  sublocation_change:
    'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30',
};

export const TRANSFER_STATUS_LABEL: Record<TransferStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export const TRANSFER_STATUS_STYLE: Record<TransferStatus, { dot: string; pill: string }> = {
  pending: {
    dot: 'bg-amber-500',
    pill: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  },
  approved: {
    dot: 'bg-sigap-sky',
    pill: 'bg-sigap-sky/15 text-sigap-blue dark:text-sigap-sky border-sigap-sky/20',
  },
  completed: {
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  },
  rejected: {
    dot: 'bg-destructive',
    pill: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  cancelled: {
    dot: 'bg-slate-400',
    pill: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20',
  },
};

/** Estados de equipo que permiten cualquier tipo de traslado. */
export const TRANSFERABLE_STATUSES = new Set(['disponible', 'asignado']);

/** Días de anticipación con los que se avisa un retorno temporal. */
export const RETURN_ALERT_WINDOW_DAYS = 7;

/** Roles cuya especialidad les permite gestionar equipos de Cómputo crítico. */
export const IT_ROLES = new Set(['it_coordinator', 'it_technician']);

/** Roles con alcance global sobre traslados (sin restricción de scope). */
export const GLOBAL_TRANSFER_ROLES = new Set([
  'super_admin',
  'general_assets_manager',
]);

/** Roles habilitados para aprobar / rechazar solicitudes. */
export const APPROVER_ROLES = new Set([
  'super_admin',
  'administrative_chief',
]);

/** Etiqueta corta de una razón de bloqueo (para tooltips / mensajes). */
export const BLOCK_REASON_LABEL: Record<TransferBlockReason, string> = {
  invalid_status: 'Estado del equipo no permite traslados',
  same_area_no_permission: 'No podés gestionar sublocaciones de esta área',
  requires_approval: 'Requiere aprobación de jefatura',
  critical_computo_role: 'Solo el equipo de TI puede mover activos críticos de Cómputo',
  destination_out_of_scope: 'Área destino fuera de tu ámbito — se creará solicitud',
  origin_out_of_scope: 'Área origen fuera de tu ámbito — se creará solicitud',
  destination_protected: 'No se puede trasladar hacia esta área',
};

export const TRANSFER_TYPE_FILTER_OPTIONS: { value: TransferType; label: string }[] = (
  Object.keys(TRANSFER_TYPE_LABEL) as TransferType[]
).map((v) => ({ value: v, label: TRANSFER_TYPE_LABEL[v] }));

export const TRANSFER_STATUS_FILTER_OPTIONS: {
  value: TransferStatus;
  label: string;
}[] = (Object.keys(TRANSFER_STATUS_LABEL) as TransferStatus[]).map((v) => ({
  value: v,
  label: TRANSFER_STATUS_LABEL[v],
}));

/** Detecta si un traslado temporal está cerca de su fecha de retorno. */
export const isReturnDueSoon = (transfer: Transfer, todayIso = new Date().toISOString()): boolean => {
  if (!transfer.is_temporary || !transfer.return_date) return false;
  if (transfer.status !== 'approved' && transfer.status !== 'completed') return false;
  const today = new Date(todayIso);
  const target = new Date(transfer.return_date);
  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= RETURN_ALERT_WINDOW_DAYS;
};
