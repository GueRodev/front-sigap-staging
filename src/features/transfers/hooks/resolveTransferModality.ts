/**
 * `resolveTransferModality` — función pura que aplica los Pasos 0–5 del
 * ADR-TRANSFERS-001 para determinar qué tipo de traslado corresponde según:
 *   - el equipo (status, categoría, override `transfer_requires_approval`)
 *   - las áreas de origen y destino (protección, `default_transfer_requires_approval`)
 *   - el rol funcional del usuario activo y su scope de áreas
 *
 * Se usa tanto para pintar los dropzones al arrastrar como para la acción
 * rápida del Registro de Activos. No hace ninguna mutación.
 */

import type { Area as EquipmentArea, Equipment } from '@/features/equipment/types/equipment.types';
import { isComputoEquipment } from '@/features/equipment/data/mockEquipment';
import type { Area, AreaUser, FunctionalRole } from '@/features/areas/types/area.types';

import {
  GLOBAL_TRANSFER_ROLES,
  IT_ROLES,
  TRANSFERABLE_STATUSES,
  type TransferResolution,
} from '../constants/transfer.constants';

/**
 * Área ligera aceptada por la función (para no forzar el shape completo).
 * Cualquier estructura con estos tres campos sirve.
 */
export type ResolverArea = Pick<Area, 'id' | 'is_protected' | 'default_transfer_requires_approval'>;

/** Alias público exportado. */
export type ResolverEquipment = Pick<
  Equipment,
  'status' | 'category_id' | 'transfer_requires_approval'
>;

export type ResolverUser = Pick<AreaUser, 'id' | 'functionalRole' | 'managedAreaIds'>;

const inScope = (user: ResolverUser, areaId: number): boolean => {
  if (GLOBAL_TRANSFER_ROLES.has(user.functionalRole)) return true;
  return user.managedAreaIds.includes(areaId);
};

export const resolveTransferModality = (
  equipment: ResolverEquipment,
  originArea: ResolverArea,
  destinationArea: ResolverArea,
  activeUser: ResolverUser,
): TransferResolution => {
  // Paso previo — el estado del equipo debe permitir traslados.
  if (!TRANSFERABLE_STATUSES.has(equipment.status)) {
    return { modality: 'not_allowed', reason: 'invalid_status' };
  }

  // Paso 1 — intra-área ⇒ cambio de sublocación.
  if (originArea.id === destinationArea.id) {
    if (!inScope(activeUser, originArea.id)) {
      return { modality: 'not_allowed', reason: 'same_area_no_permission' };
    }
    return { modality: 'sublocation', reason: null };
  }

  // No se puede trasladar hacia un área protegida (Sin Área Asignada, etc.).
  if (destinationArea.is_protected) {
    return { modality: 'not_allowed', reason: 'destination_protected' };
  }

  const role = activeUser.functionalRole as FunctionalRole;
  const isComputo = isComputoEquipment(equipment.category_id);

  // Paso 2 — Patrón 6: override explícito del equipo. `null` ⇒ hereda el
  // default del área origen, que se evalúa en el Paso 4.
  if (equipment.transfer_requires_approval === true) {
    return { modality: 'request', reason: 'requires_approval' };
  }

  // Paso 3 — Cómputo: sólo IT (o roles globales) pueden operar directamente.
  if (isComputo) {
    const canHandleComputo =
      GLOBAL_TRANSFER_ROLES.has(role) || IT_ROLES.has(role);
    if (!canHandleComputo) {
      return { modality: 'request', reason: 'critical_computo_role' };
    }
    // IT tiene alcance global sobre Cómputo — traslado directo.
    return { modality: 'direct', reason: null };
  }

  // Paso 4 — política del área origen.
  if (originArea.default_transfer_requires_approval && !GLOBAL_TRANSFER_ROLES.has(role)) {
    // Aun con override false por equipo, si el área origen exige aprobación
    // y el usuario no tiene bypass global ⇒ solicitud.
    if (!inScope(activeUser, originArea.id) || !inScope(activeUser, destinationArea.id)) {
      return { modality: 'request', reason: 'requires_approval' };
    }
    // area_manager con ambas en su scope aún puede hacerlo directo si su rol
    // no está expresamente limitado — mantenemos comportamiento simple aquí.
  }

  // Paso 5 — scope del usuario sobre ambas áreas.
  const originIn = inScope(activeUser, originArea.id);
  const destinationIn = inScope(activeUser, destinationArea.id);

  if (originIn && destinationIn) {
    return { modality: 'direct', reason: null };
  }
  if (!originIn) {
    return { modality: 'request', reason: 'origin_out_of_scope' };
  }
  return { modality: 'request', reason: 'destination_out_of_scope' };
};
