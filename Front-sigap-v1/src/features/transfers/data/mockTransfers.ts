/**
 * Mock de traslados (SIGAP).
 *
 * Cubre los escenarios definidos en el plan (FASE 6):
 *  - 2 `direct` completados.
 *  - 2 `request` en curso (pending + approved).
 *  - 1 `request` rejected.
 *  - 2 `sublocation_change` completados.
 *  - 1 `request` temporal (is_temporary=true) con `return_date` próxima.
 *
 * IDs referenciados:
 *  - equipment_id  → `MOCK_EQUIPMENT` en `src/features/equipment/data/mockEquipment.ts`
 *  - *_area_id     → `MOCK_AREAS` en `src/features/areas/data/mockAreas.ts`
 *  - *_sublocation_id → `MOCK_SUBLOCATIONS` en `src/features/areas/data/mockAreas.ts`
 *  - *_by_id       → `MOCK_USERS` en `src/features/areas/data/mockUsers.ts`
 */

import type { Transfer } from '../types/transfer.types';

/**
 * Fábrica que rellena todos los campos anulables con `null` para mantener el
 * shape consistente y evitar repetir keys en cada registro.
 */
const makeTransfer = (
  overrides: Pick<
    Transfer,
    | 'id'
    | 'type'
    | 'status'
    | 'equipment_id'
    | 'origin_area_id'
    | 'destination_area_id'
    | 'requested_by_id'
    | 'created_at'
    | 'updated_at'
  > &
    Partial<Transfer>,
): Transfer => ({
  origin_sublocation_id: null,
  destination_sublocation_id: null,
  is_temporary: false,
  request_reason: null,
  expected_date: null,
  return_date: null,
  approved_by_id: null,
  approved_at: null,
  approval_notes: null,
  rejected_by_id: null,
  rejected_at: null,
  rejection_reason: null,
  executed_by_id: null,
  executed_at: null,
  cancelled_by_id: null,
  cancelled_at: null,
  ...overrides,
});

export const MOCK_TRANSFERS: Transfer[] = [
  // 1) DIRECTO completado — Ramón (area_manager de 5, 14, 22) mueve un cable
  //    desde Bodega (5) a otra área bajo su scope.
  makeTransfer({
    id: 1,
    type: 'direct',
    status: 'completed',
    equipment_id: 4, // Cable HDMI 2.0
    origin_area_id: 5,
    destination_area_id: 22,
    requested_by_id: 4, // Ramón Solano
    executed_by_id: 4,
    executed_at: '2026-06-18T09:12:00Z',
    request_reason: 'Reposición de cable en aula D-03 para clase de audiovisuales.',
    created_at: '2026-06-18T09:12:00Z',
    updated_at: '2026-06-18T09:12:00Z',
  }),

  // 2) DIRECTO completado — Jorge (area_manager de 1 y 8) reubica una laptop
  //    dentro de su scope.
  makeTransfer({
    id: 2,
    type: 'direct',
    status: 'completed',
    equipment_id: 1, // Laptop Dell Latitude 5440
    origin_area_id: 1,
    destination_area_id: 8,
    requested_by_id: 6, // Jorge Herrera
    executed_by_id: 6,
    executed_at: '2026-06-22T14:40:00Z',
    request_reason: 'Reasignación temporal para soporte en A-15.',
    created_at: '2026-06-22T14:40:00Z',
    updated_at: '2026-06-22T14:40:00Z',
  }),

  // 3) SOLICITUD pendiente — Sofía (area_manager de 2) pide una silla que está
  //    en Oficinas Administrativas (6, fuera de su scope).
  makeTransfer({
    id: 3,
    type: 'request',
    status: 'pending',
    equipment_id: 6, // Silla ergonómica Herman Miller
    origin_area_id: 6,
    destination_area_id: 2,
    requested_by_id: 7, // Sofía Cambronero
    request_reason:
      'Se necesita una silla ergonómica adicional para el laboratorio Sur durante el semestre.',
    expected_date: '2026-07-15',
    created_at: '2026-07-03T10:05:00Z',
    updated_at: '2026-07-03T10:05:00Z',
  }),

  // 4) SOLICITUD aprobada — Coordinadora IT (12) solicitó un Servidor rack
  //    crítico (transfer_requires_approval=true). Aprobada por Jefatura (3).
  makeTransfer({
    id: 4,
    type: 'request',
    status: 'approved',
    equipment_id: 20, // Servidor rack (crítico de Cómputo)
    origin_area_id: 1,
    destination_area_id: 5,
    requested_by_id: 12, // Mariana Solís (it_coordinator)
    request_reason:
      'Reubicación del servidor a Bodega Central mientras se reacondiciona el rack del Laboratorio Norte.',
    expected_date: '2026-07-05',
    approved_by_id: 3, // Laura Mora (administrative_chief)
    approved_at: '2026-07-02T16:20:00Z',
    approval_notes: 'Aprobado. Coordinar con Sebastián el corte de energía.',
    created_at: '2026-07-01T11:00:00Z',
    updated_at: '2026-07-02T16:20:00Z',
  }),

  // 5) SOLICITUD rechazada — Se pidió sacar la Cámara Canon (institucional
  //    con transfer_requires_approval=true) hacia un área no autorizada.
  makeTransfer({
    id: 5,
    type: 'request',
    status: 'rejected',
    equipment_id: 5, // Cámara Canon EOS R50
    origin_area_id: 4,
    destination_area_id: 2,
    requested_by_id: 5, // María Pérez (professor)
    request_reason:
      'Requiero la cámara para una práctica de campo con estudiantes.',
    expected_date: '2026-07-10',
    rejected_by_id: 3, // Laura Mora
    rejected_at: '2026-07-04T08:45:00Z',
    rejection_reason:
      'Equipo institucional de alto valor: debe permanecer en Sala de Conferencias y solicitarse mediante préstamo formal.',
    created_at: '2026-07-03T17:30:00Z',
    updated_at: '2026-07-04T08:45:00Z',
  }),

  // 6) CAMBIO DE SUBLOCACIÓN completado — Jorge reorganiza dentro del área 1
  //    (Estante A → Estante B).
  makeTransfer({
    id: 6,
    type: 'sublocation_change',
    status: 'completed',
    equipment_id: 3, // Monitor LG UltraWide 29"
    origin_area_id: 1,
    destination_area_id: 1,
    origin_sublocation_id: 1, // Estante A
    destination_sublocation_id: 2, // Estante B
    requested_by_id: 6, // Jorge Herrera
    executed_by_id: 6,
    executed_at: '2026-06-28T15:00:00Z',
    request_reason: 'Reorganización del estante para liberar espacio de servidores.',
    created_at: '2026-06-28T15:00:00Z',
    updated_at: '2026-06-28T15:00:00Z',
  }),

  // 7) CAMBIO DE SUBLOCACIÓN completado — Carlos ubica un ítem en A-03.
  makeTransfer({
    id: 7,
    type: 'sublocation_change',
    status: 'completed',
    equipment_id: 8, // Desktop HP EliteDesk 800 (originalmente area 6, ilustrativo)
    origin_area_id: 3,
    destination_area_id: 3,
    origin_sublocation_id: null,
    destination_sublocation_id: 3, // Mesa 1
    requested_by_id: 2, // Carlos Rojas (general_assets_manager)
    executed_by_id: 2,
    executed_at: '2026-07-01T09:30:00Z',
    request_reason: 'Ubicación inicial del equipo tras reasignación al aula 201.',
    created_at: '2026-07-01T09:30:00Z',
    updated_at: '2026-07-01T09:30:00Z',
  }),

  // 8) SOLICITUD TEMPORAL aprobada — Micrófono Shure prestado a otra área
  //    con return_date próxima (~5 días desde la fecha simulada).
  makeTransfer({
    id: 8,
    type: 'request',
    status: 'approved',
    equipment_id: 9, // Micrófono Shure SM58
    origin_area_id: 4,
    destination_area_id: 2,
    requested_by_id: 7, // Sofía Cambronero
    is_temporary: true,
    request_reason:
      'Uso temporal en jornada de investigación del Laboratorio Sur.',
    expected_date: '2026-07-08',
    return_date: '2026-07-14',
    approved_by_id: 3, // Laura Mora
    approved_at: '2026-07-05T12:00:00Z',
    approval_notes: 'Aprobado. Devolver antes de la fecha indicada.',
    created_at: '2026-07-04T18:20:00Z',
    updated_at: '2026-07-05T12:00:00Z',
  }),
];
