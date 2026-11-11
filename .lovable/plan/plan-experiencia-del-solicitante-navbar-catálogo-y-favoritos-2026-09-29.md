# Plan: Experiencia del Solicitante (Navbar, Catálogo y Favoritos)

Cambios aditivos y localizados. No se toca `/admin`, sidebar, Áreas ni Levantamiento (salvo renombrar 2 áreas). Sin colores/fuentes nuevas. Se confirmará cada fase antes de continuar.

## Fase 0 — Verificaciones previas (completada)
- `App.css` no se importa en ningún lugar → sin cambios.
- Ids finales confirmados (id = posición + 1 en `mockAreas.ts`):
  - id 12 = B-12, `loan_public`, activa → "Préstamos Audiovisuales"
  - id 27 = D-08, `loan_public`, activa → "Préstamos Talleres DG"
  - id 3 = A-03, `laboratory`, activa → Robot NAO (217)
  - id 14 = C-03, eliminada (`SEEDED_DELETED_AREA_ID`; el comentario "A-14" del código es incorrecto) → Cámara 360 (218)
- Tipos disponibles: 10 → Laptop(1)/Desktop(2)/Monitor(3); 11 → Proyector(4)/Cámara(5)/Micrófono(6); 13 → Alicate(9)/Taladro(10); 14 → Cable HDMI(11). Equipos sin tipo exacto (trípode, parlante, luces, tabletas, plotter, guillotina, regla, cutter, baterías) usarán el tipo más cercano de su subcategoría; no se agregan tipos nuevos.
- Nota: `mockEquipment.ts` tiene su propia lista local de áreas con otros nombres; el catálogo tomará las áreas solo de `useAreasStore`.

## Fase 1 — Autenticación y rutas
- `authStore.ts`: `UserRole = "super_admin" | "student" | "professor" | "administrative"`; renombrar `estudiante` → `student` (authStore, App.tsx, `lib/mcp/tools/system-info.ts`); agregar Carlos Jiménez (professor, id "3") y María González (administrative, id "4").
- `ProtectedRoute`: nueva prop opcional `allowedRoles`, conservando `allowedRole`.
- `LoginForm`: student/professor/administrative → `/catalogo`; super_admin sin cambio.
- `App.tsx`: grupo con `SolicitanteLayout` para `/catalogo`, `/favoritos`, `/mis-prestamos`, `/mis-equipos` (solo professor/administrative), `/pedido`. Placeholders con `PlaceholderPage` existente (estilo del de Préstamos).

## Fase 2 — Layout y Navbar del solicitante
- `config/solicitanteNav.config.ts` con links, íconos, `allowedRoles` y `badge`.
- `SolicitanteNavbar.tsx`: tokens del sidebar (`bg-sidebar`, etc.), `AppLogo`, links filtrados por rol desde config, pill activa con línea `sigap-sky`, badges ámbar ocultos en 0, botón "Mi Pedido" con badge, campana y menú de usuario copiando `AppHeader` (con `LoadingOverlay`, sin `MockRoleSelector`). Mobile: `Sheet` con hamburguesa.
- `SolicitanteLayout.tsx`: navbar + `<main>` con `<Outlet />`.

## Fase 3 — Datos mock y dominio de Préstamos
- Renombrar áreas 12 y 27 ("Préstamos Audiovisuales", "Préstamos Talleres DG").
- Agregar equipos 200–218 al final de `MOCK_EQUIPMENT` con `make`, placas `UCR-2025-00xxx` / `INT-PRE-00xx`, imágenes Unsplash, casos especiales 217 (Robot NAO, solo professor, aprobación doble) y 218 (área eliminada).
- `features/loans/`: `types/loan.types.ts`, `data/mockLoans.ts` (3 préstamos en curso con fechas relativas via date-fns), helpers `getActiveLoanForEquipment`, `countActiveLoansForUser`, `toLoanApprovalActor`.
- `stores/useLoanCartStore.ts` puro (solo estado y acciones por usuario; no navega ni muestra toasts). El toast "Agregado a tu pedido" con acción "Ver pedido" vive en un hook `useAddToOrder` (usa `useNavigate`) consumido por `AddToOrderButton`.

## Fase 4 — Lógica del catálogo
- `catalogo/types/catalog.types.ts` (`CatalogItem` sin datos financieros).
- `helpers/catalogVisibility.ts` (6 reglas puras) y `helpers/toCatalogItem.ts`.
- `hooks/useCatalogItems.ts` (suscripción a `_equipmentStore` con patrón de `useEquipmentList`, áreas, categorías y usuario) y `hooks/useCatalogFilters.ts` (búsqueda, categoría, área, "Disponibles ahora", `reset`).
- `stores/useFavoritesStore.ts` (Record por usuario, toggle/isFavorite/countFor).

## Fase 5 — UI del catálogo y Favoritos
- `CatalogPageHeader` (copia encabezado de Levantamiento), `CatalogFilters` (copia clases de `AreaFilters` + pill "Disponibles ahora").
- `EquipmentCatalogCard` con `SpotlightCard` (receta de `AreaCard`), `EquipmentImage` con fallback por categoría padre en dos casos: `image_path` null y error de carga (`onError`), `AvailabilityBadge`, `FavoriteToggle`, `AddToOrderButton` (glassGhostBtn copiado), chip "Aprobación de Jefatura".
- `CatalogGrid`, `CatalogEmptyState`; `CatalogoPage` y `FavoritosPage` como orquestadores livianos.

## Fase 6 — Verificación
- Recorrido con Playwright iniciando sesión como los 3 solicitantes: links visibles por rol, badge "Mis Préstamos" = 2 para María Estudiante, Robot NAO solo para Carlos, nunca 208/216/218 ni asignados, 206/207/211 con badge de préstamo, 140–142 visibles.
- Modo claro/oscuro y mobile; confirmar que `/admin` funciona igual.

## Detalles técnicos
- TypeScript estricto sin `any`; selectores Zustand sin `.filter()` inline (evita el bucle de renders ya visto) — filtrar con `useMemo`.
- No se modifican: `SpotlightCard`, `AreaCard`, `InventoryCard`, `resolveEquipmentPolicy`, tipos de áreas/equipos, lógica de `useAreasStore`.
