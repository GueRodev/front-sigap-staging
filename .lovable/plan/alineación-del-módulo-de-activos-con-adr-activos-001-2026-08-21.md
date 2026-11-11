# Alineación del módulo de Activos con ADR-ACTIVOS-001

El CRUD actual de Activos se construyó antes de que el ADR estuviera terminado. El plan corrige primero lo que ya existe (renombres, campos faltantes, validaciones) y luego construye los submódulos que faltan desde cero. Levantamiento de Inventarios no se toca, salvo el renombre mecánico de un campo.

## Diagnóstico — brechas detectadas

**Nomenclatura**
- El código usa `tracking_level`; el ADR define `plate_type` (`institutional | internal | bulk`).
- Falta el estado `traslado` en `EquipmentStatus` (el ADR define 9, hay 8).

**Campos ausentes en `Equipment`**
- Adquisición: `acquisition_type` (requerido por el ADR).
- Clasificación: `original_category_id`.
- Ubicación: `previous_area_id`, `temporary_area_id`.
- Mantenimiento y garantía: `maintenance_order_number`, `warranty_notified_at`.
- Asignación: `assigned_to_user_id`.
- Archivos: `image_path`, `attachment_path`.
- Ciclo de vida: `deleted_at` (hoy existe `retired_at`, que el ADR no contempla).

**Patrón 6 mal implementado**
- `is_loanable` y `transfer_requires_approval` son booleanos no nulos. El ADR exige que sean nullable (`NULL` = hereda el default del área) y añade `is_publicly_visible`, `loan_approval_level`, `transfer_approval_level` y `allowed_loan_roles`.

**Validaciones incompletas**
- Solo se valida `institutional_plate`. Falta la matriz completa: `internal_plate` e `oaf_name` obligatorios según placa, cantidades solo para `bulk`, `acquisition_type` siempre requerido.

**Categorías**
- Los mocks usan subcategorías inventadas ("Cómputo — General") y una lista dura `CRITICAL_COMPUTO_CATEGORY_IDS`. Faltan `level`, `is_protected`, `order`, `description`, y las categorías protegidas del seeder (`Sin Categoría`, `General`, `Cómputo`).
- La página de Categorías es un placeholder vacío.

**Submódulos inexistentes**
- Cambios de Estado (historial, motivo obligatorio, metadata).
- Movimientos de Stock (entradas/salidas/ajustes con tipo de adquisición).

---

Este sprint cubre 4 submódulos (Incidencias tiene su propio ADR y se trabaja aparte):

1. Categorías y Tipos · 2. Equipos (CRUD principal) · 3. Cambios de Estado · 4. Movimientos de Stock

## Fases

Al terminar cada fase te pregunto si continuamos con la siguiente.

### Fase 1 — Renombres y constantes (bajo riesgo)
- `tracking_level` → `plate_type` y `TrackingLevel` → `PlateType` en todo el proyecto, incluidos los 4 archivos de Levantamiento (solo el rename, sin cambiar su lógica).
- Agregar el estado `traslado` con su etiqueta y estilo de badge.
- Nuevas constantes: `AcquisitionType` (compra, donación, transferencia, comodato, producción propia), `StockMovementType`, `EquipmentCondition`, y `STATUS_REQUIRES_REASON`.
- Dejar este comentario donde se lea o escriba `sub_location_id`:
  ```
  // TODO: Traslados resetea sub_location_id a NULL en cada traslado inter-área
  // (ver ADR-ACTIVOS-001 / ADR-TRANSFERS-001)
  ```

### Fase 2 — Completar el modelo `Equipment` y el Patrón 6
- Agregar todos los campos ausentes listados arriba; retirar `retired_at` a favor de `deleted_at`.
- Convertir los 5 campos override del Patrón 6 a nullable y agregar `allowed_loan_roles` (sin resolver/heredar: exclusivo del equipo, `NULL` = sin restricción de rol).
- Helpers de resolución efectiva, uno por campo override:
  - `resolveIsLoanable(equipment, area)`
  - `resolveIsPubliclyVisible(equipment, area)`
  - `resolveLoanApprovalLevel(equipment, area)`
  - `resolveTransferRequiresApproval(equipment, area)`
  - `resolveTransferApprovalLevel(equipment, area)`
- Actualizar mocks para cubrir los tres casos: override explícito, herencia y `bulk`.

### Fase 3 — Formulario y tabla de Activos
- Validación condicional por `plate_type` según la matriz del ADR (placa institucional/interna, `oaf_name`, cantidades solo en bulk).
- Nueva sección de Adquisición (`acquisition_type`, orden de compra, factura, fechas).
- Sección de Overrides (Patrón 6) con estado ternario: Heredado / Sí / No, mostrando el valor heredado del área — debe funcionar con los 5 campos override (`is_loanable`, `is_publicly_visible`, `loan_approval_level`, `transfer_requires_approval`, `transfer_approval_level`), no solo con uno.
- Campos de asignación individual y de mantenimiento externo.

### Fase 4 — Submódulo 1: Categorías y Tipos (nuevo)
- Reestructurar los mocks a la jerarquía del ADR con `level`, `slug`, `is_protected` y las tres categorías protegidas (`Sin Categoría`, `General`, `Cómputo`).
- Página de Categorías completa: árbol de 2 niveles, CRUD de subcategorías y de tipos.
- Cascada Toys & Bricks: al eliminar una subcategoría se soft-deletean sus tipos y los equipos se reasignan a `General` guardando `original_category_id`; al restaurar se revierte solo lo que nadie reasignó manualmente.
- Regla de restauración (explícita en el mock del store): un equipo vuelve a su subcategoría original solo si `original_category_id = subcategoria.id` **y además** `category_id` sigue siendo `General` (nadie lo reasignó manualmente mientras estuvo huérfano). Misma regla ya usada para `original_area_id` en Áreas.
- Bloqueo de eliminación sobre categorías protegidas.

### Fase 5 — Submódulo 3: Cambios de Estado (nuevo)
- Tipo `EquipmentStatusChange` y store mock del historial.
- Modal de cambio de estado con motivo obligatorio en las transiciones críticas y `metadata` opcional (acta de baja, institución receptora).
- Panel de historial en el detalle del activo.

### Fase 6 — Submódulo 4: Movimientos de Stock (nuevo)
- Tipo `EquipmentStockMovement` y store mock, aplicable a los tres `plate_type`.
- Registro de entrada/salida/ajuste con `acquisition_type` por movimiento y cálculo de `stock_before` / `stock_after`.
- Tabla de kardex en el detalle del activo y sincronización con `quantity_available`.

### Fase 7 — Permisos y visibilidad
- Campos financieros (`acquisition_cost`, orden de compra, factura) ocultos salvo roles con `view_equipment_financial_fields`.
- `technical_specs` editable solo por roles IT; lectura para `area_manager`.
- Mecanismo 3: los roles IT ven todo lo que cuelgue de la categoría con slug `computo`, resuelto navegando `parent_id` (se elimina la lista dura de IDs críticos).
- Se reutiliza el selector de rol mock ya existente para probar cada vista.

> **Nota de implementación (field-level authorization):** en el prototipo se filtra en el store por simplicidad (mock, sin backend). En producción, el ocultamiento se aplica en la serialización del modelo `Equipment` vía el trait `HasFieldLevelAuthorization`, no en el componente React — esto garantiza que también cubra exports y PDFs, no solo la UI.

### Fase 8 — Documentación
- Regenerar `docs/adr/ADR-ACTIVOS-001.md` con el modelo final y los cuatro submódulos de este sprint (Categorías y Tipos, Equipos, Cambios de Estado, Movimientos de Stock) y las reglas de propiedad de columnas.
- Incidencias (submódulo 5) tiene su propio ADR y se trabaja en sesión aparte; no se menciona en este plan.

---

## Notas técnicas

- Todo sigue siendo prototipo con mocks en memoria (mismo patrón de store que `useEquipmentList` / Zustand en Traslados); no se toca base de datos.
- Los stores nuevos de estado y stock viven en `src/features/equipment/`, siguiendo FSD.
- Se respetan los contratos entre módulos: Activos nunca escribe `current_area_id` (Traslados), nunca escribe `original_area_id` (Áreas) y solo escribe `sub_location_id` en el registro inicial.
- El renombre de la Fase 1 es el único cambio que toca archivos de Levantamiento.
