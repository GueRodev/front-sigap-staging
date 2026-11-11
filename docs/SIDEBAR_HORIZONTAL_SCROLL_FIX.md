# Fix: Scroll horizontal momentáneo al expandir el sidebar

## 1. Resumen del bug

**Síntoma:** flash momentáneo (~milisegundos) de scrollbar horizontal al expandir el sidebar de `3rem` → `16rem`.

Visualmente se observa como un pequeño icono ⟷ apareciendo en la esquina del sidebar durante la animación de 500ms al pasar de estado colapsado a expandido. El scroll desaparece automáticamente cuando termina la transición, pero el flash es visible y poco profesional.

**Rutas afectadas:** `/admin`, `/admin/activos` y cualquier ruta que use `AdminLayout`.

---

## 2. Causa raíz

El componente `SidebarContent` de **shadcn/ui** usa `overflow-auto` por defecto, lo que habilita scroll en **ambos ejes** automáticamente cuando el contenido excede el contenedor.

Durante la transición de ancho de 500ms del sidebar:

1. El contenedor anima su ancho de `3rem` (48px) a `16rem` (256px).
2. Los hijos (labels de menú, perfil de usuario, botones del footer) se renderizan inmediatamente a su **ancho natural** (texto completo).
3. Durante los primeros milisegundos, el ancho del contenido es mayor que el ancho actual del contenedor.
4. `overflow-auto` detecta el desbordamiento horizontal y dispara la barra de scroll en el eje X.
5. Cuando la transición termina, el contenido cabe y la barra desaparece.

Aunque el componente `<Sidebar>` externo ya tenía `overflow-x-hidden`, el flash seguía apareciendo porque el contenedor que **realmente scrollea** es `SidebarContent`, no el shell externo.

---

## 3. Solución aplicada (4 capas defensivas)

### Capa 1 — `SidebarContent` (shadcn/ui base)

**Archivo:** `src/components/ui/sidebar.tsx`

```tsx
// ❌ Antes
className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden"

// ✅ Después
className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden group-data-[collapsible=icon]:overflow-hidden"
```

Mantiene el scroll vertical del menú cuando hace falta, pero **bloquea por completo el eje X**.

---

### Capa 2 — Panel visual interno del sidebar

**Archivo:** `src/components/ui/sidebar.tsx`

Agregar `overflow-hidden` al `<div data-sidebar="sidebar">` interno (el panel visual real, no el shell fijo).

```tsx
// ✅ Después
<div
  data-sidebar="sidebar"
  className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow overflow-hidden"
>
```

Evita que cualquier hijo pinte fuera del ancho actual mientras el panel animado todavía se está expandiendo. Refuerza el clipping tanto en el shell como en el contenido interno.

---

### Capa 3 — Footer del admin sidebar

**Archivo:** `src/features/admin/components/AdminSidebar.tsx`

Aplicar restricciones horizontales al área inferior completa, no solo al bloque de perfil:

```tsx
// ✅ Footer con clipping y min-w-0
<SidebarFooter className={`border-t border-sidebar-border px-2 py-4 overflow-hidden min-w-0 ${TRANSITION}`}>
```

Y en los botones inferiores ("Configuración" y "Cerrar Sesión"), estructura de ancho controlado:

- Wrapper: `w-full min-w-0`
- Texto: `flex-1 min-w-0` + `truncate`
- Iconos: `shrink-0`

Esto evita que el footer sea el elemento que todavía empuje el ancho durante la transición.

---

### Capa 4 — Layout principal del admin

**Archivo:** `src/features/admin/layouts/AdminLayout.tsx`

```tsx
// ❌ Antes
<div className="flex flex-1 flex-col">

// ✅ Después
<div className="flex min-w-0 flex-1 flex-col">
```

`min-w-0` en el hijo `flex-1` evita que el layout principal se ensanche por efectos colaterales del flexbox cuando el sidebar cambia de tamaño.

---

## 4. Reglas preventivas

Para no reintroducir este bug ni variantes en otros componentes:

1. **Nunca usar `overflow-auto`** en un contenedor cuyo ancho cambia animadamente.
   Siempre usar `overflow-y-auto overflow-x-hidden` (o el eje específico que se necesite).

2. **Hijos flex con texto** deben usar `min-w-0` + `truncate` para permitir contracción.
   Sin `min-w-0`, los hijos flex respetan su ancho intrínseco e ignoran el ancho del padre.

3. **Layouts flex anidados:** agregar `min-w-0` al hijo `flex-1` para que respete el ancho del padre durante transiciones.

4. **Clipping en doble capa:** aplicar `overflow-hidden` tanto en el shell como en el panel visual interno cuando hay animación de ancho.

5. **Iconos en filas con texto truncable:** usar siempre `shrink-0` en los iconos para que el texto sea el que se contraiga, no el icono.

---

## 5. Verificación

Para confirmar que el fix funciona correctamente:

1. Abrir `/admin` y `/admin/activos`.
2. Colapsar/expandir el sidebar varias veces (botón de toggle).
3. Confirmar:
   - ✅ No aparece flash de scroll horizontal durante la animación de 500ms.
   - ✅ El scroll vertical del menú sigue funcionando si el contenido excede el alto.
   - ✅ Los textos del footer y perfil se truncan limpiamente con `…` durante la animación.
   - ✅ La animación sigue siendo suave (500ms `cubic-bezier(0.4, 0, 0.2, 1)`).
   - ✅ El comportamiento en móvil no cambia.

---

## 6. Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/components/ui/sidebar.tsx` | `SidebarContent`: `overflow-auto` → `overflow-y-auto overflow-x-hidden` |
| `src/components/ui/sidebar.tsx` | Panel `data-sidebar="sidebar"`: agregado `overflow-hidden` |
| `src/features/admin/components/AdminSidebar.tsx` | `SidebarFooter`: agregado `overflow-hidden min-w-0` + estructura truncable |
| `src/features/admin/layouts/AdminLayout.tsx` | Contenedor derecho: agregado `min-w-0` |

---

## Referencias

- Documento relacionado: [`SIDEBAR_ANIMATION.md`](./SIDEBAR_ANIMATION.md) — animación general del sidebar.
- Componente base: [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/sidebar).
