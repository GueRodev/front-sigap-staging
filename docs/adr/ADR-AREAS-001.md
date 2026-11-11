# ADR-AREAS-001 — Gestión de Áreas

**Estado:** En revisión · **Autor:** Ramon · **Sede:** PED-AL (UCR)

## Propósito

Modelar las áreas físicas y operativas de PED-AL (laboratorios, oficinas, bodegas, técnicas, préstamo público) como base para: (1) autorización ABAC vía `user_areas`, (2) defaults del **Patrón 6** heredados por cada equipo con `COALESCE`, y (3) ubicación física obligatoria de todo `equipment.current_area_id`.

## Decisiones clave

- **Modelo plano**, sin jerarquía recursiva. Se descartó la jerarquía Zona → Edificio → Piso → Departamento → Oficina → Cubículo.
- `zone` y `building` son **campos descriptivos** planos (texto libre), no FKs ni jerarquía.
- `area_sublocations` como catálogo dedicado (1 área → N sublocaciones) — descriptivas, no afectan autorización ni Patrón 6.
- Un área tiene N encargados vía `user_areas` (many-to-many). `areas` **no** tiene columna `manager_user_id`.
- **`type` como `VARCHAR` + constantes Laravel** (`AreaType::LOAN_PUBLIC | LABORATORY | OFFICE | TECHNICAL`), nunca ENUM de PostgreSQL — extensible sin migración.
- **Sin columna `status`**: el ciclo de vida se resuelve con `deleted_at`.
- **Cascada Toys & Bricks** al eliminar un área con equipos: los equipos se mueven a "Sin Área Asignada" preservando `original_area_id` para restauración reversible.

## Actores

| Actor | Rol en este módulo |
|---|---|
| **Super Admin** | CRUD completo (áreas, tipos, `user_areas`). |
| **Encargada General de Activos** (`general_assets_manager`) | Visibilidad y gestión global. Tiene `manage_areas`. |
| **Jefatura Administrativa** (`administrative_chief`) | Visibilidad global. |
| **Encargado de Área** (`area_manager`) | Solo CRUD de sublocaciones de sus áreas. No gestiona atributos estructurales. |
| Resto de roles | Solo lectura desde módulos que consumen áreas. |

## Modelo de datos

### `areas`

```sql
id, name, type VARCHAR,
zone VARCHAR(10) NULL,           -- "B" texto libre
building VARCHAR(100) NULL,      -- "B1 - Piso 1" texto libre
default_is_loanable BOOL,
default_is_publicly_visible BOOL,
default_loan_approval_level VARCHAR NULL,
default_transfer_requires_approval BOOL,
default_transfer_approval_level VARCHAR NULL,
is_protected BOOL DEFAULT FALSE,  -- TRUE solo para "Sin Área Asignada"
description TEXT NULL,
timestamps, deleted_at
```

### `area_sublocations`

```sql
id, area_id FK→areas, name, timestamps, deleted_at
UNIQUE(area_id, name)
```

### `user_areas` (pivot)

```sql
id, user_id FK→users, area_id FK→areas, timestamps
```

### Área protegida seeded: "Sin Área Asignada"

`is_protected=TRUE`, `default_is_loanable=FALSE`, `default_is_publicly_visible=FALSE`, `deleted_at` siempre NULL. Es el **destino de fallback** de la cascada de eliminación. Nunca es destino válido en el selector de traslados.

## Defaults del Patrón 6 por tipo de área

| Tipo | `default_transfer_requires_approval` | `default_transfer_approval_level` |
|---|---|---|
| `loan_public` | false | NULL |
| `laboratory` | true | `administrative_chief` |
| `office` | false | NULL |
| `technical` | true | `administrative_chief` |

## Cascada de eliminación (Toys & Bricks)

Al eliminar un área con equipos activos, en una **transacción atómica**:

1. Bloquear si `is_protected = TRUE`.
2. Si no hay equipos: `areas.deleted_at = NOW()` y fin.
3. Si hay equipos, tras confirmación:
   - `equipment.original_area_id = area.id`
   - `equipment.current_area_id = 'Sin Área Asignada'.id`
   - `equipment.sub_location_id = NULL`
   - `area_sublocations.deleted_at = NOW()` (todas las de esta área)
   - `DELETE FROM user_areas WHERE area_id = area.id`
   - `areas.deleted_at = NOW()`
   - Notificar a los ex-encargados.

Restauración: reversa exacta — devuelve los equipos usando `original_area_id`, restaura sublocaciones, no restaura `user_areas` (se recrean a mano).

## Reglas invariantes

- Ningún equipo puede quedar sin `current_area_id` (`NOT NULL`).
- `sub_location_id.area_id` debe coincidir siempre con `current_area_id` (contrato con TRANSFERS y ACTIVOS: cualquier cambio de área resetea `sub_location_id = NULL`).
- El área protegida no aparece nunca como destino en el selector de traslados.
- Solo `super_admin` o `general_assets_manager` tienen `manage_areas` — ningún otro rol (incluido `area_manager`) puede eliminar áreas.

## Cambio de sublocación

Un equipo que se mueve entre sublocaciones dentro de la misma área **sí genera registro** en `transfers` con `type = 'sublocation_change'`. No modifica `area_id`, no requiere aprobación. Detalle en [TRANSFERS-001](./ADR-TRANSFERS-001.md).

## Dependencias

- **Depende de:** [PERSONAS-001](./ADR-PERSONAS-001.md) (usuarios y roles para `user_areas` y `manage_areas`).
- **Consumido por:** [ACTIVOS-001](./ADR-ACTIVOS-001.md), [TRANSFERS-001](./ADR-TRANSFERS-001.md), Préstamos, Levantamiento.
- **Bloqueante** para todos los módulos operativos (Fase 2 — Estructura Base).
