# ADRs SIGAP — Resúmenes ejecutivos

Este directorio contiene **resúmenes ejecutivos** (1-2 páginas) de las decisiones arquitectónicas (ADR) de SIGAP. Son la referencia de contexto rápido para cualquier sesión de trabajo sobre el sistema — especialmente cuando la conversación empieza en frío y hay que ubicarse en el módulo antes de tocar código.

> **Fuente de verdad:** los ADR originales completos viven fuera del repo (documentos de 200-1000 líneas). Estos archivos son resúmenes destilados, no copias. Ante conflicto, prevalece el ADR original.

## Índice

| ADR | Módulo | Estado | Resumen |
|---|---|---|---|
| AUTH-001 | Autenticación | Aprobado | Auth local (Laravel Fortify + Spatie), sin LDAP. Whitelist obligatoria. |
| PERSONAS-001 | Gestión de Personas + Autorización Temporal | En revisión | Ciclo de vida de usuarios, roles base/funcionales, delegación curada con expiración automática. |
| AREAS-001 | Gestión de Áreas | En revisión | Modelo plano de áreas + sublocaciones. Cascada Toys & Bricks a "Sin Área Asignada". |
| ACTIVOS-001 | Gestión de Activos | En revisión | `equipment` + 5 submódulos. Patrón 6 (override sobre defaults de área). Categoría "Cómputo" protegida por slug. |
| TRANSFERS-001 | Traslados | En construcción | Único módulo que muta `equipment.current_area_id`. 3 modalidades: directo, solicitud, cambio de sublocación. |
| INVENTARIOS-001 | Levantamiento de Activos | Aceptado (prototipo) | Verificación física por área con snapshot inmutable, dedupe (409), aprobación por área y cierre explícito. |

## Dependencias entre módulos

```text
                     ┌─────────────────┐
                     │   AUTH-001      │  (login, whitelist read-only)
                     └────────┬────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │  PERSONAS-001   │  (users, roles, permisos temporales)
                     └────────┬────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │   AREAS-001     │  (areas, user_areas, sublocations)
                     └────────┬────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │  ACTIVOS-001    │  (equipment, categorías, tipos)
                     └────────┬────────┘
                              │
              ┌───────────────┼──────────────────┐
              ▼               ▼                  ▼
        TRANSFERS-001   PRESTAMOS-001    INVENTARIOS-001
                                              (aceptado)
```

Regla de oro: un ADR nunca modifica campos que "pertenecen" a otro. Ej: solo TRANSFERS-001 escribe `equipment.current_area_id`; solo PERSONAS-001 escribe `users.estado`.

## Convenciones

- Nombres de tablas y campos: **inglés** (`equipment`, `current_area_id`, `user_areas`).
- Labels y textos de negocio citados: **español** ("Sin Área Asignada", "Cerrar Sesión").
- Cada resumen mantiene la misma estructura: propósito, decisiones clave, actores, modelo de datos mínimo, dependencias, reglas invariantes, enlaces cruzados.
