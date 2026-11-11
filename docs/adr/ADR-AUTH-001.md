# ADR-AUTH-001 — Autenticación SIGAP

**Estado:** Aprobado · **Autor:** Ramon · **Sede:** PED-AL (UCR)

## Propósito

Autenticar usuarios de PED-AL de forma **local y exclusiva**, sin depender del LDAP/SSO del Centro de Informática de la UCR (que expondría el sistema a toda la universidad).

## Decisiones clave

- **Auth 100% propia**, sin LDAP ni SSO.
- Stack: **Laravel Fortify** (headless) + **Spatie Permission** (RBAC) + bcrypt/argon2.
- **Whitelist obligatoria** en `allowed_users`: solo emails preautorizados con dominio `@ucr.ac.cr` pueden registrarse.
- Registro cierra el ciclo marcando `allowed_users.registered_at = now()`.
- Login consulta **únicamente** `users` (nunca `allowed_users`).
- **Soft delete en `users`**, hard delete en `allowed_users` al eliminar definitivamente.

## Actores

Todas las acciones del ciclo de vida son ejecutadas exclusivamente por el **Super Admin**.

## Modelo de datos (mínimo)

### `users` (fuente de verdad operacional)

```sql
id, nombre, primer_apellido, segundo_apellido,
identificacion UNIQUE, codigo_institucional UNIQUE NULL,
email UNIQUE, email_verified_at, password,
estado ENUM('activo','inactivo') DEFAULT 'activo',
last_login_at, deleted_at, timestamps
```

### `allowed_users` (whitelist)

```sql
id, email UNIQUE, added_by_id NULL FK→users.id,
registered_at NULL, timestamps
```

`added_by_id` solo puede ser `NULL` para el primer Super Admin (seeder).

## Tres estados de una persona

| Estado | `allowed_users` | `users.estado` | `deleted_at` | Login |
|---|---|---|---|---|
| Autorizada sin cuenta | existe, `registered_at=NULL` | — | — | No |
| Activa | existe, `registered_at` lleno | activo | NULL | Sí |
| Suspendida | existe | inactivo | NULL | No |
| Eliminada | hard-deleted | inactivo | now() | No |

## Tres acciones del Super Admin

- **Desactivar** — reversible (`estado = 'inactivo'`).
- **Eliminar** — definitivo (soft delete en `users` + hard delete en `allowed_users`).
- **Anonimizar** — caso Ley 8968 (reemplaza PII, mantiene `id` y FKs).

## Reglas invariantes

- El email es credencial de login **y** identificador de autorización — editarlo requiere transacción atómica sobre ambas tablas.
- `user_id` es la clave operativa permanente; el email es atributo, nunca FK en módulos operativos.
- Nunca hard delete en `users` — rompería historial de préstamos, traslados y auditorías.
- Sin triggers de sincronización `allowed_users` ↔ `users`; la lógica vive en Observers/Services.

## Dependencias

- **Consumido por:** todos los módulos (nadie opera sin un `users.id` válido).
- **No depende de nada** más que el seeder inicial del Super Admin.

## Ver también

- [PERSONAS-001](./ADR-PERSONAS-001.md) — extiende este módulo con roles, permisos temporales, sincronización semestral.
