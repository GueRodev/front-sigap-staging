# ADR-TRANSFERS-001 — Módulo de Traslados

**Estado:** Implementado (prototipo FE) · **Autor:** Ramon · **Sede:** PED-AL (UCR)
**Última actualización:** FASE 8 — regenerado con nombres reales, shapes finales y mapeo a código.

> Único flujo autorizado para **modificar `equipment.current_area_id`** y
> **`equipment.sub_location_id`** después del registro inicial del activo.
> Ningún otro módulo puede tocar esos campos.

---

## 1. Propósito y distinción con módulos vecinos

| Módulo         | Qué modifica                                             |
| -------------- | -------------------------------------------------------- |
| **Traslados**  | `equipment.current_area_id`, `equipment.sub_location_id` |
| Reasignación   | `equipment.assigned_to_user_id` (propietario)            |
| Préstamos      | `loans` (uso temporal, sin cambio de área)               |
| Estados        | `equipment.status` (mantenimiento, reparación…)          |

Traslado ⊥ cambio de propietario ⊥ cambio de estado.
**Un traslado nunca modifica `equipment.status`.**

---

## 2. Tres modalidades

| # | `TransferType`         | UI                     | Cuándo                                                                       | Estado inicial               |
| - | ---------------------- | ---------------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| 1 | `direct`               | "Trasladar"            | Usuario tiene origen y destino en su scope (o rol global) y no hay override  | `completed`                  |
| 2 | `request`              | "Solicitar traslado"   | Destino fuera de scope, override obligatorio, o Cómputo crítico              | `pending` → approved/rejected/cancelled |
| 3 | `sublocation_change`   | "Cambiar sublocación"  | Intra-área, entre sublocaciones (no cambia `current_area_id`)                | `completed`                  |

Constantes en `src/features/transfers/constants/transfer.constants.ts`
(`TRANSFER_TYPE_LABEL`, `TRANSFER_STATUS_LABEL`, `TRANSFER_STATUS_STYLE`, `TRANSFERABLE_STATUSES`).

---

## 3. Algoritmo de resolución

Implementado como función pura en
`src/features/transfers/hooks/resolveTransferModality.ts`
(`resolveTransferModality(equipment, originArea, destinationArea, activeUser) → { modality, reason }`).

```text
0. equipment.status ∉ {'disponible','asignado'}
   → not_allowed / invalid_status

1. originArea.id === destinationArea.id
   → sublocation_change  (si el usuario tiene el área en scope; si no, not_allowed)

2. destinationArea.is_protected === true
   → not_allowed / destination_protected

3. equipment.transfer_requires_approval === true
   → request / requires_approval

4. isComputoEquipment(equipment.category_id) === true
   4a. role ∈ {super_admin, general_assets_manager, it_coordinator, it_technician}
       → direct
   4b. otro rol
       → request / critical_computo_role

5. originArea.default_transfer_requires_approval === true
   y el usuario no está en scope de ambas
   → request / requires_approval

6. Scope del usuario sobre ambas áreas
   6a. origen ∈ scope && destino ∈ scope        → direct
   6b. origen ∉ scope                           → request / origin_out_of_scope
   6c. destino ∉ scope                          → request / destination_out_of_scope
```

`GLOBAL_TRANSFER_ROLES = {super_admin, general_assets_manager}` y
`IT_ROLES = {it_coordinator, it_technician}` viven junto a las constantes.
`isComputoEquipment` reside en `src/features/equipment/data/mockEquipment.ts`.

---

## 4. Actores por modalidad

- **Directo:** `area_manager` (equipo no-Cómputo, ambas áreas en scope) · `it_technician` / `it_coordinator` (Cómputo) · `general_assets_manager` (Cómputo + cualquier no-Cómputo) · `administrative_chief` / `super_admin` (todo no-Cómputo).
- **Solicitud:** cualquier `professor` / `administrative` (y funcionales), `area_manager` cuando destino está fuera de scope. Cómputo crítico → solo `it_coordinator` o `general_assets_manager`. **`student` excluido** (no accede al Panel Admin).
- **Cambio de sublocación:** `area_manager` (área en `user_areas`), IT (equipo Cómputo, cualquier subcategoría), globales.

Aprobación / rechazo: `APPROVER_ROLES = {super_admin, administrative_chief}`.

---

## 5. Flujos

### 5.1 Traslado directo — `createDirect` (`useTransfersStore`)

1. UI valida con `directTransferSchema` (Zod).
2. `applyEquipmentMove(equipment_id, { current_area_id, sub_location_id: null })`.
3. `INSERT transfers` con `type='direct'`, `status='completed'`, `executed_by_id`, `executed_at`.
4. `equipment.status` **no cambia**.

### 5.2 Solicitud — `createRequest` + `approve` / `reject` / `cancel`

1. Solicitante crea registro `type='request'`, `status='pending'` con `request_reason`, `expected_date`, `is_temporary`, `return_date`.
2. `approve(transfer_id, approved_by_id, notes?)` ejecuta el movimiento en la misma operación (mismo efecto que `createDirect`) y setea `approved_at`, `executed_at`.
3. `reject(transfer_id, rejected_by_id, reason)` fija `rejection_reason` obligatoria.
4. `cancel(transfer_id, cancelled_by_id)` solo permitido si `status === 'pending'`.

### 5.3 Cambio de sublocación — `changeSublocation`

1. Valida con `sublocationChangeSchema` (`destination_sublocation_id !== origin_sublocation_id`).
2. `applyEquipmentMove(equipment_id, { sub_location_id: destination_sublocation_id })`.
3. `INSERT transfers` con `type='sublocation_change'`, `status='completed'`, `origin_area_id === destination_area_id`.

Todas las mutaciones sincronizan `_equipmentStore` (módulo Equipos) para reflejar el efecto globalmente.

---

## 6. Modelo de datos

Shape TypeScript real en `src/features/transfers/types/transfer.types.ts`:

```ts
type TransferType = 'direct' | 'request' | 'sublocation_change';
type TransferStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

interface Transfer {
  id: number;
  type: TransferType;
  status: TransferStatus;

  equipment_id: number;
  origin_area_id: number;
  destination_area_id: number;

  // Sólo aplican a sublocation_change; null en los demás tipos.
  origin_sublocation_id: number | null;
  destination_sublocation_id: number | null;

  is_temporary: boolean;

  requested_by_id: number;
  request_reason: string | null;       // Obligatorio en UI para type='request'
  expected_date: string | null;        // YYYY-MM-DD
  return_date: string | null;          // YYYY-MM-DD (sólo si is_temporary)

  approved_by_id: number | null;
  approved_at: string | null;          // ISO 8601
  approval_notes: string | null;

  rejected_by_id: number | null;
  rejected_at: string | null;
  rejection_reason: string | null;

  executed_by_id: number | null;
  executed_at: string | null;

  cancelled_by_id: number | null;
  cancelled_at: string | null;

  created_at: string;
  updated_at: string;
}
```

### 6.1 Equivalente SQL (backend Laravel)

```sql
CREATE TABLE transfers (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR NOT NULL,                 -- direct | request | sublocation_change
  status VARCHAR NOT NULL DEFAULT 'pending',
  equipment_id BIGINT NOT NULL REFERENCES equipment(id),
  origin_area_id BIGINT NOT NULL REFERENCES areas(id),
  destination_area_id BIGINT NOT NULL REFERENCES areas(id),
  origin_sublocation_id BIGINT NULL REFERENCES area_sublocations(id),
  destination_sublocation_id BIGINT NULL REFERENCES area_sublocations(id),
  is_temporary BOOLEAN NOT NULL DEFAULT FALSE,
  requested_by_id BIGINT NOT NULL REFERENCES users(id),
  request_reason TEXT NULL,
  expected_date DATE NULL,
  return_date DATE NULL,
  approved_by_id BIGINT NULL REFERENCES users(id),
  approved_at TIMESTAMPTZ NULL,
  approval_notes TEXT NULL,
  rejected_by_id BIGINT NULL REFERENCES users(id),
  rejected_at TIMESTAMPTZ NULL,
  rejection_reason TEXT NULL,
  executed_by_id BIGINT NULL REFERENCES users(id),
  executed_at TIMESTAMPTZ NULL,
  cancelled_by_id BIGINT NULL REFERENCES users(id),
  cancelled_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 6.2 Enums / Actions (Laravel)

```
App\Enums\Transfer\TransferType    → direct | request | sublocation_change
App\Enums\Transfer\TransferStatus  → pending | approved | rejected | completed | cancelled
```

Actions: `ExecuteDirectTransferAction`, `CreateTransferRequestAction`,
`ApproveTransferRequestAction`, `RejectTransferRequestAction`,
`CancelTransferRequestAction`, `ChangeSublocationAction`.
Todas delegan a `App\Services\TransferService` con `DB::transaction()`.

---

## 7. Validación (frontend)

Schemas Zod en `src/features/transfers/schemas/transfer.schemas.ts`:

- `directTransferSchema` — `equipment_id`, `origin_area_id`, `destination_area_id`, `reason` (6–500).
- `requestTransferSchema` — añade `expected_date`, `is_temporary`, `return_date` (obligatorio si `is_temporary`), `justification` (10–1000).
- `sublocationChangeSchema` — `equipment_id`, `area_id`, `origin_sublocation_id`, `destination_sublocation_id` (≠ origen), `reason` opcional.
- `rejectRequestSchema` — `reason` (6–500).

---

## 8. Permisos Spatie (backend)

- `transfer_equipment_direct` — ejecuta Directo (según Paso 4/6 y scope).
- `request_critical_computo_transfer` — solicita Cómputo crítico (`it_coordinator`, `general_assets_manager`).
- `request_transfer` — solicita traslado no-Cómputo fuera de scope.
- `approve_transfer_request` — aprueba/rechaza (`administrative_chief`, `super_admin`).
- `execute_transfer_unrestricted` — bypass total no-Cómputo.
- `view_all_transfers` — historial completo.
- `change_equipment_sublocation` — Modalidad 3.

---

## 9. Reglas invariantes (Defense in Depth)

- **`equipment.current_area_id` y `equipment.sub_location_id` sólo los escribe este módulo** tras el registro inicial del activo.
- Traslado nunca modifica `equipment.status`.
- Todo traslado (incluido Directo) genera fila en `transfers` — nunca escrituras "silenciosas".
- Al cambiar `current_area_id`:
  - reset `sub_location_id = NULL`,
  - limpiar `original_area_id = NULL` si el equipo salía de "Sin Área Asignada".
- Área con `is_protected = TRUE` **nunca** aparece como destino en el selector.
- Sólo equipos en `disponible` o `asignado` son transferibles.
- `area_manager` **nunca** ejecuta ni solicita traslados de Cómputo.
- `it_technician` **nunca** solicita Cómputo crítico.
- `student` **nunca** solicita (no accede al Panel Admin).

---

## 10. Estructura del feature (frontend)

```text
src/features/transfers/
├── constants/transfer.constants.ts     Labels, estilos, sets de roles, resoluciones
├── data/mockTransfers.ts               8 registros representativos
├── hooks/
│   ├── resolveTransferModality.ts      Algoritmo puro (Pasos 0–6)
│   ├── useTransfersStore.ts            Zustand + sync con _equipmentStore
│   └── useTransfers.ts                 Filtros + búsqueda + orden
├── schemas/transfer.schemas.ts         Zod (direct/request/sublocation/reject)
├── types/transfer.types.ts             Shape del registro
├── components/
│   ├── TransferStatusBadge.tsx         TransferTypeBadge.tsx
│   ├── TransferFilters.tsx             TransfersTable.tsx
│   ├── NewTransferPanel.tsx            DnD + fallback táctil
│   ├── QuickTransferButton.tsx         Acción rápida desde Registro de Activos
│   ├── PendingTransferCard.tsx         Card de bandeja de aprobaciones
│   ├── TransferModalHeader.tsx         TransferConfirmation.tsx
│   └── modals/
│       ├── DirectTransferModal.tsx
│       ├── RequestTransferModal.tsx
│       └── SublocationChangeModal.tsx
└── pages/
    ├── TransfersPage.tsx               Ruta /admin/traslados
    └── PendingTransfersPage.tsx        Ruta /admin/traslados/pendientes
```

Wiring: `src/features/admin/pages/AdminTransfersPage.tsx` y las rutas
correspondientes en `src/App.tsx`.

---

## 11. Índices recomendados (backend)

- `(equipment_id, created_at DESC)` — historial por equipo.
- `(status, created_at DESC) WHERE status = 'pending'` — bandeja de Jefatura.
- `(requested_by_id, status, created_at DESC)` — mis solicitudes.
- `(return_date) WHERE is_temporary AND status = 'completed'` — retornos próximos.

---

## 12. Dependencias

- **Depende de:** [PERSONAS-001](./ADR-PERSONAS-001.md) (roles, permisos temporales),
  [AREAS-001](./ADR-AREAS-001.md) (áreas, sublocaciones, `user_areas`, área protegida),
  [ACTIVOS-001](./ADR-ACTIVOS-001.md) (equipment, categoría "Cómputo" por slug, `EquipmentStatus`).
- **Consumido por:** Levantamiento (snapshot histórico), Préstamos (bloqueo si `status='prestado'`), Notificaciones, Activity Log.

---

## 13. Pendientes diferibles

- Comportamiento durante un levantamiento activo (se resolverá en LEVANTAMIENTO-001).
- Alertas para `return_date` de traslados temporales (Job/Scheduler, post-MVP).
- Persistencia real (por ahora Zustand + mocks; el store apunta a las Actions/Service Laravel descritos arriba).
