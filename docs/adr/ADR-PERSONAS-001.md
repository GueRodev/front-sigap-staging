# ADR-PERSONAS-001 — Gestión de Personas y Autorización Temporal

**Estado:** En revisión · **Autor:** Ramon · **Sede:** PED-AL (UCR)

## Propósito

Unificar en un módulo el **ciclo de vida completo del usuario** (whitelist, alta, activación, roles, cambio de rol base, anonimización, eliminación) y la **delegación temporal** de responsabilidades (incapacidades, vacaciones, suplencias). Es la **capa cero** de toda la autorización de SIGAP.

## Decisiones clave

- **Dos categorías de roles** gestionadas por Spatie (permisos se acumulan):
  - **Roles base** (uno obligatorio): `student`, `professor`, `administrative`.
  - **Roles funcionales** (acumulables, opcionales): `area_manager`, `loans_manager`, `general_assets_manager`, `administrative_chief`, `it_coordinator`, `it_technician`, `super_admin`.
- Compatibilidad rol funcional ↔ rol base enforceada vía `roles.compatible_base_roles` (JSONB) en 4 capas (UI, FormRequest, Action, trigger opcional).
- **Time-Bound Authorization** (Patrón 1): toda concesión temporal tiene `expires_at NOT NULL`; el Scheduler revoca sola.
- **Curated Delegation** (Patrón 2): Super Admin cura `delegable_grants` (qué puede delegar Jefatura); Jefatura solo delega dentro de ese catálogo.
- **Permission Suspension** (Patrón 3): al delegar `administrative_chief`, el permiso `manage_temporary_permissions` queda suspendido — corta la cadena de delegación.
- Sincronización semestral: alta individual manual es el flujo principal (CSV es post-MVP).

## Actores

| Actor | Responsabilidad |
|---|---|
| **Super Admin** | Control total. Cura `delegable_grants`. Único que ejecuta acciones sobre identidad permanente. |
| **Jefatura Administrativa** (`administrative_chief`) | Otorga permisos temporales dentro del catálogo curado. No gestiona whitelist ni ciclo de vida. |
| **Usuario gestionado** | Receptor pasivo. Recibe notificación por email en acciones que afectan su acceso. |

## Modelo de datos (mínimo)

- `allowed_users` — whitelist con `base_role NOT NULL` (definido al autorizar). Ver [AUTH-001](./ADR-AUTH-001.md).
- `users` — estado operacional. Ver AUTH-001.
- `roles`, `permissions`, `model_has_roles`, `model_has_permissions` — Spatie estándar, extendido con `role_type` y `compatible_base_roles`.
- `temporary_permissions` — ciclo de vida de cada delegación: `user_id`, `granted_by_id`, `delegable_grant_id`, `role_name`/`permission_name`, `reason`, `granted_at`, `expires_at NOT NULL`, `revoked_at`, `ended_by ENUM('expiration','manual_revocation')`.
- `delegable_grants` — catálogo curado: `grantor_role`, `role_name`/`permission_name`, `max_duration_days`, `requires_reason`, `allow_subdelegation`, `is_active`.
- `csv_imports`, `activity_log` — historial y auditoría.

## Principios de diseño

1. Super Admin decide siempre sobre identidad permanente — nada automático.
2. Una sola fuente de verdad por responsabilidad (estado en `users.estado`; autorización de registro en `allowed_users`; roles efectivos en Spatie).
3. Soft delete en `users`, nunca hard delete.
4. Anonimización solo en ejercicio de la Ley 8968.
5. Defense in Depth: UI → FormRequest → Action → trigger opcional.
6. Expiración automática vía Scheduler (Least Privilege en el tiempo).
7. `user_id` es clave operativa permanente; email es atributo.

## Reglas invariantes

- `allowed_users.base_role` nunca es NULL.
- `temporary_permissions.expires_at` nunca es NULL.
- Un rol funcional incompatible con el rol base del usuario no puede asignarse (validado en 4 capas).
- Cambiar el rol base dispara revisión automática de roles funcionales incompatibles.
- Editar el email de un usuario registrado requiere transacción atómica `users` + `allowed_users`.

## Dependencias

- **Depende de:** [AUTH-001](./ADR-AUTH-001.md).
- **Consumido por:** todos los módulos operativos — sin usuarios con roles conocidos, ningún permiso puede evaluarse.

## Ver también

- [AREAS-001](./ADR-AREAS-001.md) — `user_areas` es la asignación física de encargados.
- [TRANSFERS-001](./ADR-TRANSFERS-001.md) — consume roles funcionales para resolver scope de traslado.
