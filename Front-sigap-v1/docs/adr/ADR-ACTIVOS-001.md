# ADR-ACTIVOS-001 — Gestión de Activos

**Estado:** En revisión · **Autor:** Ramon · **Sede:** PED-AL (UCR)

## Propósito

Modelar todos los activos físicos de PED-AL — el **corazón operativo de SIGAP**. Traslados, Préstamos y Levantamiento no pueden funcionar sin `equipment` definido acá. Módulo de Fase 2 — Estructura Base.

## Alcance: 5 submódulos bajo un mismo dominio

| Submódulo | Responsabilidad |
|---|---|
| **Categorías y Tipos** | `equipment_categories` (padre → subcategoría) + `equipment_types`. Cascada Toys & Bricks. |
| **Equipos** | CRUD de `equipment`, `plate_type`, overrides del Patrón 6, specs (JSONB). |
| **Cambios de Estado** | Historial `equipment_status_changes` con motivo obligatorio. |
| **Movimientos de Stock** | `equipment_stock_movements` — entradas, salidas, ajustes. |
| **Incidencias** | Solo infraestructura de datos (`equipment_incidents`); gestión operativa en Fase 4. |

## Decisiones clave

- **`VARCHAR` + constantes Laravel** en toda la clasificación (nunca ENUM ni CHECK en BD). Agregar un estado o tipo es cambio de código, no migración.
- **Categoría "Cómputo" protegida por slug reservado** (`slug = 'computo'`). El sistema navega `category_id → parent_id → slug == 'computo'`, nunca por nombre libre.
- `equipment.category_id` apunta siempre a **subcategoría** (nivel 1). Padre se resuelve por `parent_id`.
- **Tres niveles de placa** (`plate_type`): `institutional` (UCR/OAF), `internal` (PED-AL), `bulk` (a granel, sin placa).
- **Patrón 6 — Modelo Híbrido con Override**: campos `is_loanable`, `is_publicly_visible`, `loan_approval_level`, `transfer_requires_approval`, `transfer_approval_level` son NULL-ables. NULL = hereda default del área; valor explícito = override.
- **`assigned_to_user_id`** (no `assigned_user_id`) por consistencia.
- **`sub_location_id` como FK** a `area_sublocations`, nunca texto libre.
- **Snapshot Inmutable** como patrón: cualquier módulo que refleje estado histórico copia campos a columnas `snapshot_*` — no reconstruye consultando en vivo.

## Actores

| Actor | Rol |
|---|---|
| **Super Admin** | Control total. |
| **Encargada General de Activos** (`general_assets_manager`) | Actor principal operativo. CRUD, estados, reasignación, vista global con financieros. |
| **Coordinador TI / Técnico TI** | Gestión exclusiva de specs técnicas. Visibilidad global sobre "Cómputo" (Mecanismo 3), independiente de `user_areas`. |
| **Jefatura Administrativa** | Visibilidad global incluyendo financieros. No gestiona el catálogo. |
| **Encargado de Área** | Solo lectura de equipos en sus áreas. Puede reportar incidencias `area_report`. |
| Resto | Lectura de su equipo asignado y catálogo público. |

## Modelo de datos (mínimo)

### `equipment_categories`

```sql
id, parent_id NULL FK self ON DELETE CASCADE,
level SMALLINT DEFAULT 0,   -- 0=padre, 1=subcategoría
name, slug UNIQUE, description,
is_protected BOOL DEFAULT FALSE,
deleted_at, timestamps,
UNIQUE(parent_id, name)
```

### `equipment_types`

```sql
id, category_id FK→categories(subcategoría),
name, description, deleted_at, timestamps,
UNIQUE(category_id, name)
```

### `equipment` (campos que otros módulos consumen)

```sql
id, plate, plate_type VARCHAR,
category_id FK→categories(subcategoría nivel 1),
type_id FK→equipment_types NULL,
current_area_id FK→areas NOT NULL,
sub_location_id FK→area_sublocations NULL,
original_area_id FK→areas NULL,        -- cascada de AREAS-001
original_category_id FK→categories NULL, -- cascada de categorías
assigned_to_user_id FK→users NULL,
status VARCHAR,                         -- EquipmentStatus
-- Overrides del Patrón 6 (NULL = hereda del área)
is_loanable BOOL NULL,
is_publicly_visible BOOL NULL,
loan_approval_level VARCHAR NULL,
transfer_requires_approval BOOL NULL,
transfer_approval_level VARCHAR NULL,
allowed_loan_roles JSONB NULL,          -- exclusivo del equipo, sin default en área
specs JSONB, ...
```

### Categorías protegidas del seeder

| Categoría | Nivel | Propósito |
|---|---|---|
| `Sin Categoría` | 0 | Destino de equipos huérfanos |
| `General` | 1 | Subcategoría real destino (equipment.category_id siempre a nivel 1) |
| `Cómputo` | 0 | Slug reservado para Mecanismo 3 IT y reglas de traslado |

### `EquipmentStatus` (transferibles vs bloqueantes)

- **Transferibles:** `disponible`, `asignado`.
- **Bloqueantes de traslado / préstamo:** `prestado`, `reparacion`, `mantenimiento`, `desechado`, `extraviado`, `donado`.

## Reglas invariantes

- Todo `equipment` tiene `current_area_id NOT NULL`.
- `sub_location_id.area_id` == `current_area_id` (contrato con AREAS y TRANSFERS).
- `sub_location_id` solo se escribe directamente en este módulo durante el **registro inicial** del equipo. Cualquier cambio posterior es exclusivo del módulo de Traslados (Modalidad 3 — Cambio de Sublocación, `ChangeSublocationAction`), que además lo resetea a `NULL` en cada traslado inter-área.
- `equipment.current_area_id` **solo lo escribe TRANSFERS-001** — ningún otro módulo.
- La categoría "Cómputo" se resuelve por slug, jamás por nombre.
- Snapshots inmutables: los módulos históricos (levantamientos, auditorías) copian datos, no consultan en vivo.

## Cadena de responsabilidad (resuelta sin columnas dedicadas)

- Usuario individual: `equipment.assigned_to_user_id`.
- Encargados del área: `SELECT user_id FROM user_areas WHERE area_id = equipment.current_area_id`.
- Gestión global: rol `general_assets_manager`.
- Aprobación de excepciones: rol `administrative_chief`.

## Dependencias

- **Depende de:** [PERSONAS-001](./ADR-PERSONAS-001.md), [AREAS-001](./ADR-AREAS-001.md).
- **Consumido por:** [TRANSFERS-001](./ADR-TRANSFERS-001.md), Préstamos, Levantamiento, Incidencias (Fase 4).

## Fuera de alcance

Login, roles, `user_areas`, modificación de `current_area_id`, préstamos, levantamiento, resolución operativa de incidencias — cada uno en su ADR.

---

## Estado de implementación (prototipo React)

Módulo implementado en `src/features/equipment/` siguiendo FSD. Backend Laravel pendiente: los stores en memoria conservan el mismo shape de entrada/salida que tendrán los endpoints.

### Mapa de submódulos → código

| Submódulo | Código |
|---|---|
| **1. Categorías y Tipos** | `hooks/useCategoriesStore.ts`, `useCategoryTree.ts`, `constants/category.constants.ts`, `components/categories/*`, `pages/CategoriesPage.tsx` |
| **2. Equipos** | `types/equipment.types.ts`, `hooks/useEquipmentForm.ts`, `useEquipmentMutations.ts`, `useEquipmentList.ts`, `components/form/*`, `components/EquipmentTable*.tsx` |
| **3. Cambios de Estado** | `hooks/useStatusHistoryStore.ts`, `components/status/StatusChangeDialog.tsx`, `StatusHistoryTimeline.tsx` |
| **4. Movimientos de Stock** | `hooks/useStockMovementsStore.ts`, `components/stock/*` |
| **5. Incidencias** | Fuera del sprint — solo tipos previstos, sin UI. |

### Nomenclatura ya normalizada

- `tracking_level` → **`plate_type`** (`institutional` \| `internal` \| `bulk`) en todo el módulo.
- `sub_location` (texto) → **`sub_location_id`** (FK a `area_sublocations`).
- `retired_at` → **`deleted_at`** (soft delete).
- `assigned_user_id` → **`assigned_to_user_id`**.
- `EquipmentStatus` incluye `traslado` además de los estados del ADR.

### Patrón 6 — Modelo Híbrido con Override

Los cinco campos NULL-ables (`is_loanable`, `is_publicly_visible`, `loan_approval_level`, `transfer_requires_approval`, `transfer_approval_level`) se resuelven con los helpers de `utils/resolveEquipmentPolicy.ts`, que comparan el valor del equipo contra el default del área (`hooks/useAreaPolicyDefaults.ts`). `allowed_loan_roles` es exclusivo del equipo: nunca se hereda.

La UI muestra la etiqueta **HEREDADO** cuando el valor efectivo proviene del área (`components/form/PolicyOverrideField.tsx`, `EquipmentTableRow.tsx`).

### Categorías: cascada y restauración

- Jerarquía de 2 niveles; `equipment.category_id` siempre apunta a nivel 1.
- Borrado suave de una subcategoría → los equipos se reasignan a **General** (`GENERAL_CATEGORY_ID`) guardando `original_category_id`.
- Restauración: un equipo vuelve a su categoría original solo si (a) conserva `original_category_id` apuntando a la categoría restaurada **y** (b) sigue en `General`. Si se recategorizó manualmente, no se toca.
- `Cómputo`, `Sin Categoría` y `General` son protegidas (`PROTECTED_CATEGORY_IDS`) y se resuelven por slug, nunca por nombre.

### Cambios de estado y stock (registros inmutables)

- `EquipmentStatusChange`: motivo obligatorio en las transiciones de `STATUS_REQUIRES_REASON`; `metadata` para acta de baja, institución receptora u orden de servicio.
- `EquipmentStockMovement`: 7 tipos (`entrada`, `salida`, `ajuste`, `prestamo`, `devolucion`, `reserva`, `cancelacion_reserva`) con `snapshot_quantity_total` / `snapshot_quantity_available`. El store valida que `quantity_available` nunca quede negativo ni supere el total.

### Permisos y visibilidad (Fase 7)

Matriz en `constants/permissions.constants.ts`, aplicada por `hooks/useEquipmentPermissions.ts`:

| Rol | Financieros | Specs (ver/editar) | CRUD | Alcance | Mecanismo 3 |
|---|---|---|---|---|---|
| `super_admin` | Sí | Sí / Sí | Sí | all | Sí |
| `general_assets_manager` | Sí | Sí / No | Sí | all | Sí |
| `administrative_chief` | Sí | Sí / No | No | all | Sí |
| `it_coordinator` | No | Sí / Sí | No | own_areas | Sí |
| `it_technician` | No | Sí / Sí | No | own_areas | Sí |
| `area_manager` | No | Sí / No | No | own_areas | No |
| `professor` / `student` | No | No / No | No | assigned | No |

- **Mecanismo 3**: visibilidad global sobre todo lo que cuelgue de la categoría con slug `computo`, resuelta subiendo por `parent_id` (`isComputoEquipment`), independientemente de `user_areas`.
- **Field-level authorization**: en el prototipo el enmascarado de `FINANCIAL_FIELDS` ocurre en `useEquipmentList` (`sanitize`). En producción debe vivir en la serialización del modelo `Equipment` (trait `HasFieldLevelAuthorization`) para cubrir también exports y PDFs.

### Contratos que otros módulos deben respetar

- `equipment.current_area_id` y los cambios posteriores de `sub_location_id` los escribe **solo** TRANSFERS-001; el módulo de Activos solo fija `sub_location_id` en el registro inicial.
- Todo traslado inter-área resetea `sub_location_id` a `NULL`.
- Un traslado nunca modifica `equipment.status`.

### Pendiente

- Submódulo de Incidencias (Fase 4 del roadmap general).
- Persistencia real: reemplazar los stores en memoria por endpoints Laravel manteniendo firmas de hooks.
