# Plan: Unificar diseño del botón "Nuevo levantamiento"

## Objetivo
Aplicar al botón **"Nuevo levantamiento"** de `InventoriesListPage.tsx` el mismo diseño visual del botón **"Nuevo activo"** de `EquipmentRegistryPage.tsx`, para mantener consistencia visual sin inventar nuevos estilos.

## Cambio (único, determinístico)
Archivo: `src/features/inventory/pages/InventoriesListPage.tsx` (líneas 45-48)

Reemplazar el `<Button>` actual:
```jsx
<Button onClick={() => setDrawerOpen(true)} className="gap-2">
  <Plus className="h-4 w-4" />
  Nuevo levantamiento
</Button>
```

Por uno con el mismo estilo y estructura que el botón de "Nuevo activo":
```jsx
<Button
  onClick={() => setDrawerOpen(true)}
  className="font-semibold shadow-[0_0_8px_hsl(var(--sigap-sky)/0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_14px_hsl(var(--sigap-sky)/0.6),0_0_24px_hsl(var(--sigap-sky)/0.3)]"
>
  <Plus className="mr-2 h-4 w-4" />
  Nuevo levantamiento
</Button>
```

Detalles de consistencia:
- Misma clase de sombra glow (`shadow-[0_0_8px_...]`) y animación hover (`hover:scale-105 hover:shadow-[...]`).
- Mismo `font-semibold`.
- Icono `<Plus className="mr-2 h-4 w-4" />` (mismo margen `mr-2`).
- Se elimina `className="gap-2"` y se reemplaza por la estructura consistente.

## No se incluye
- No se modifican otros botones ni el drawer/funcionalidad.
- No se inventan nuevos estilos; se reutilizan exactamente los ya establecidos en "Nuevo activo".

## Verificación
- Comparar visualmente ambos botones en el preview (Registro de Activos vs Levantamiento de Activos) para confirmar consistencia.
