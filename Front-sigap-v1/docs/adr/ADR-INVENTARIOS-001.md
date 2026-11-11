# ADR-INVENTARIOS-001 — Módulo de Levantamiento de Activos

**Estado:** Aceptado (prototipo)
**Fecha:** 2026-07-22
**Autor:** Equipo SIGAP
**Reemplaza:** —
**Relacionado:** ADR-ACTIVOS-001, ADR-AREAS-001, ADR-PERSONAS-001, ADR-TRANSFERS-001

---

## 1. Contexto

El **Levantamiento de Activos** es la verificación física periódica del inventario
institucional. Un levantamiento se compone de una o más **áreas** revisadas por
un colaborador (`inventory_areas.assigned_to`) y aprobadas por un responsable
(`inventory_areas.approver_id`). Cada equipo verificado queda persistido como
un **snapshot inmutable** (`inventory_items`) que congela metadatos clave del
equipo al momento del escaneo — esto permite reconstruir históricos aun si el
equipo se edita, transfiere o se da de baja posteriormente.

El módulo debe convivir con el resto de SIGAP sin acoplarse a la capa de
persistencia real: se implementa como feature-slice puro en el frontend con
estado in-memory (Zustand), replicando fielmente las reglas de negocio y las
restricciones que el backend Laravel + Spatie impondrá más adelante.

## 2. Alcance

Cubre:
- Creación y planificación de levantamientos (título, año, alcance, áreas y asignaciones).
- Ejecución progresiva del escaneo (cámara, lector HID, placa manual, búsqueda por texto).
- Flujo de aprobación por área (`pendiente → en_progreso → lista_revision → aprobada | rechazada`).
- Reporte de incidencias (faltantes, daños severos, discrepancias sin resolver, equipos no registrados).
- Cierre explícito del levantamiento por el rol `administrative_chief`.

No cubre (fuera de alcance de esta fase):
- Persistencia real en Supabase / Laravel.
- Integración con el módulo transversal `equipment_incidents` (ADR pendiente).
- Reportes ejecutivos comparativos entre levantamientos (Fase futura).

## 3. Decisiones

### 3.1 Estructura FSD

Se ubica el módulo bajo `src/features/inventory/` siguiendo el patrón de
`transfers/` y `areas/`. La carpeta expone:

```text
src/features/inventory/
├── components/
│   ├── modals/
│   │   ├── ApproveWithIncidentsModal.tsx
│   │   ├── RejectAreaModal.tsx
│   │   ├── ReportIncidentModal.tsx
│   │   ├── ScannerModal.tsx
│   │   └── SubmitForReviewModal.tsx
│   ├── AreaReviewDecisionPanel.tsx
│   ├── ConditionBadge.tsx
│   ├── InventoryAreaCard.tsx
│   ├── InventoryAreaStatusBadge.tsx
│   ├── InventoryCard.tsx
│   ├── InventoryCreateDrawer.tsx
│   ├── InventoryFilters.tsx
│   ├── InventoryItemsTable.tsx
│   └── InventoryStatusBadge.tsx
├── constants/inventory.constants.ts
├── data/
│   ├── mockIncidents.ts
│   └── mockInventories.ts
├── hooks/
│   ├── useBarcodeScanner.ts
│   ├── useEquipmentLookup.ts
│   ├── useInventories.ts
│   ├── useInventoriesStore.ts       ← única fuente de verdad
│   ├── useInventory.ts
│   ├── useInventoryAreas.ts
│   ├── useInventoryItems.ts
│   └── useInventoryMutations.ts     ← façade de mutaciones
├── pages/
│   ├── InventoriesListPage.tsx
│   ├── InventoryDetailPage.tsx
│   ├── InventoryAreaReviewPage.tsx
│   └── InventorySessionPage.tsx
├── schemas/inventory.schemas.ts     ← Zod (wizard + modales)
└── types/inventory.types.ts
```

### 3.2 Modelo de datos

Los tipos TS reflejan 1:1 el esquema previsto:

- `Inventory` — cabecera con `status` (`planificado | en_progreso | en_revision | completado | cancelado`), `scope` (`all | area`) y `summaryStats` derivable.
- `InventoryArea` — línea por área con `status`, `assigned_to`, `approver_id`, contadores derivados (`itemsCount`, `mismatchesCount`, `rejectionCount`) y trazas de flujo (`submittedBy/At`, `approvedBy/At`, `rejectedBy/At`, `rejectionReason`).
- `InventoryItem` — **snapshot inmutable** con `snapshot_*` (nombre, placas, serie, marca, modelo, área, estado), `verified`, `condition`, `condition_notes`, `location_match` y `actual_area` para diagnóstico.
- `InventoryIncident` — placeholder local que migrará a la tabla transversal `equipment_incidents`.

### 3.3 Máquina de estados

```text
Inventory:   planificado ─▶ en_progreso ─▶ en_revision ─▶ completado
                                                     ╰──▶ cancelado

InventoryArea:  pendiente ─▶ en_progreso ─▶ lista_revision ─▶ aprobada
                                                          ╰─▶ rechazada ─▶ en_progreso (reintento)
```

Reglas invariantes garantizadas por `useInventoriesStore`:

1. **Dedupe (409):** `addInventoryItem` NO permite `(inventoryId, equipmentId)` duplicado; retorna `{ kind: 'duplicate', item }`.
2. **Snapshot inmutable:** los campos `snapshot_*` se congelan al crear el ítem.
3. **`locationMatch` derivado:** se calcula comparando `MOCK_EQUIPMENT.current_area_id` con el `areaId` del `inventoryArea`; nunca se acepta del cliente.
4. **Auto-transición de área:** al primer ítem escaneado `pendiente → en_progreso` con `startedAt = now()`.
5. **Auto-conteo:** `itemsCount` y `mismatchesCount` se recalculan al insertar; `rejectionCount` incrementa al pasar `status = 'rechazada'`.
6. **Cierre no automático:** aprobar la última área **no** cierra el levantamiento; el cierre es acción explícita del rol `administrative_chief`.

### 3.4 Permisos por rol funcional

Se centralizan en `INVENTORY_ROLE_PERMISSIONS` (`constants/inventory.constants.ts`):

| Rol funcional          | crud | scan            | approveArea | finalize |
|------------------------|:----:|:---------------:|:-----------:|:--------:|
| `super_admin`          | ✅   | `all`           | ✅          | ✅       |
| `administrative_chief` | ✅   | `all`           | ✅          | ✅       |
| `gam`                  | ✅   | `all`           | ❌          | ❌       |
| `area_manager`         | ❌   | `assigned_only` | ✅          | ❌       |
| `it_coordinator`       | ❌   | `assigned_only` | ❌          | ❌       |
| `it_technician`        | ❌   | `assigned_only` | ❌          | ❌       |
| `professor`            | ❌   | `assigned_only` | ❌          | ❌       |
| `student`              | ❌   | ❌               | ❌          | ❌       |

`student` está excluido explícitamente para prevenir escalamiento de privilegios
desde el catálogo público.

### 3.5 Resolución de aprobador por área

`useInventoryAreas.resolveAreaApproverCandidate(areaId)` retorna:

- `{ kind: 'single', userId }` → autoseleccionado en el wizard (Paso 3).
- `{ kind: 'multiple', userIds }` → RadioGroup obligatorio.
- `{ kind: 'none' }` → banner "Sin encargado sugerido" + Select libre de `area_manager`.

La resolución usa la relación `MOCK_USER_AREAS` (fuente única del módulo Áreas).

### 3.6 Escaneo de equipos

`useEquipmentLookup` busca por:

1. `barcode`
2. `qr_code`
3. `institutional_plate`
4. `internal_plate`
5. `serial_number`
6. `name` (LIKE)

Cuando el término coincide con >1 equipo retorna `{ kind: 'bulk', matches }`
para forzar desambiguación manual en `ScannerModal`.

`ScannerModal` expone 4 modos: **cámara** (`react-zxing`), **HID** (input focus
oculto que captura ráfagas del lector físico), **placa manual** y **búsqueda
libre**. El modal es agnóstico de la mutación: recibe `onScanSuccess(equipment)`
y `onReportNotFound(term)`.

### 3.7 Rutas

```text
/admin/activos/inventario                              → InventoriesListPage
/admin/activos/inventario/:id                          → InventoryDetailPage  (kanban 5 col)
/admin/activos/inventario/:id/session?area=:areaId     → InventorySessionPage (escaneo)
/admin/activos/inventario/:id/areas/:areaId/review     → InventoryAreaReviewPage
```

Todas cuelgan de `/admin` protegido por `ProtectedRoute allowedRole="super_admin"`.
El sidebar apunta al índice desde el ítem existente **Activos → Inventario**;
no requiere cambios en `navigationConfig.ts`.

### 3.8 Dependencias externas

Se aceptan tres nuevas dependencias, evaluadas contra alternativas nativas:

| Paquete         | Propósito                              | Justificación                                     |
|-----------------|----------------------------------------|---------------------------------------------------|
| `react-zxing`   | Escaneo de cámara (barcode/QR)         | Wrapper mantenido de ZXing; MIT; sin backend.     |
| `react-barcode` | Render visual del código escaneado     | Feedback UX en el modal de escaneo.               |
| `react-to-print`| Exportar reporte del área              | Impresión determinística sin `window.print` raw.  |

## 4. Consecuencias

**Positivas**
- Feature 100 % aislada; migrar el store a React Query + endpoints Laravel requiere solo tocar `useInventoriesStore` y `useInventoryMutations`.
- Reglas críticas (dedupe, snapshot, `locationMatch`, cierre explícito) viven en un único punto.
- Permisos declarativos por rol facilitan auditoría y coincidencia con Spatie.
- El sub-item del sidebar reutiliza la navegación existente sin nuevas rutas de nivel superior.

**Negativas / deuda**
- `InventoryIncident` es local; migrar a `equipment_incidents` requerirá un mapper cuando exista el ADR transversal.
- El wizard mantiene estado local (no persistente): recargar la página en el paso 3 pierde el borrador. Aceptable en prototipo.
- El escáner de cámara requiere HTTPS en producción (limitación de `getUserMedia`); documentado para despliegue.

## 5. Alternativas descartadas

- **Reusar `useTransfersStore`**: la máquina de estados es distinta (7 estados vs. 5, sin cadena de aprobación multinivel). Se rechaza para no acoplar dominios.
- **`html5-qrcode` en lugar de `react-zxing`**: bundle mayor (~250 kB) y API imperativa; peor DX en React.
- **Cierre automático al aprobar última área**: rechazado — el `administrative_chief` debe validar reportes y firmar el cierre.

## 6. Referencias

- ADR-ACTIVOS-001 — modelo canónico de `equipment`, `sub_locations` y `equipment_status`.
- ADR-AREAS-001 — `areas`, `MOCK_USER_AREAS` y roles funcionales.
- ADR-PERSONAS-001 — catálogo de `functional_role` (incluye `student`).
- Plan de implementación: `.lovable/plan.md`, Fases 0–5.
