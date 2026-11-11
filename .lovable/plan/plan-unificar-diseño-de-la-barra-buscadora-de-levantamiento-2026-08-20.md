# Plan: Unificar diseño de la barra buscadora de Levantamiento de Activos

## Objetivo
Aplicar a `InventoryFilters.tsx` el mismo diseño visual y estructura de la barra buscadora de `EquipmentFilters.tsx` (Registro de Activos), reutilizando los estilos ya establecidos.

## Cambios — archivo `src/features/inventory/components/InventoryFilters.tsx`

### 1. Importar `X` de lucide-react y `Button`
Agregar el botón "Limpiar" igual al de equipment, por lo que se importan `X` y `Button`.

### 2. Contenedor (línea 22)
Reemplazar:
```jsx
<div className="flex flex-col gap-3 rounded-lg border border-glass bg-[hsl(var(--sigap-sky)/0.18)] p-3 backdrop-blur md:flex-row md:items-center">
```
Por (igual a Equipment):
```jsx
<div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-[hsl(var(--sigap-sky)/0.18)] p-4 transition-shadow duration-200 hover:shadow-md lg:flex-row lg:items-center">
```
- `border-slate-200` en vez de `border-glass`
- `p-4` en vez de `p-3`
- `transition-shadow duration-200 hover:shadow-md` en vez de `backdrop-blur`
- breakpoint `lg` en vez de `md`

### 3. Grilla de selects (línea 30)
Reemplazar:
```jsx
<div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:w-auto md:grid-cols-3">
```
Por:
```jsx
<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap">
```
Y cambiar cada `FilterSelect`:
- Año: `className="min-w-[140px]"` → `className="w-full lg:w-[160px]"`
- Estado: `className="min-w-[160px]"` → `className="w-full lg:w-[180px]"`
- Alcance: `className="min-w-[200px]"` → `className="w-full lg:w-[200px]"`

### 4. Botón "Limpiar"
Agregar `hasActiveFilters`:
```jsx
const hasActiveFilters = !!filters.search || !!filters.year || !!filters.status || !!filters.scope;
```
Y al final del contenedor (antes de cerrar el div), igual que en equipment:
```jsx
{hasActiveFilters && (
  <Button
    variant="ghost"
    size="sm"
    onClick={() => onChange({})}
    className="self-start text-muted-foreground hover:text-foreground"
  >
    <X className="mr-1 h-3.5 w-3.5" />
    Limpiar
  </Button>
)}
```

## No se incluye
- No se cambian las opciones/placeholder de los selects (salvo mantenerlos).
- No se inventan estilos nuevos; se reutilizan los de EquipmentFilters.
- El `onChange` sigue usando el patrón `patch` actual (`onChange({ ... })` ya limpia todo porque la página usa `setFilters`).

## Verificación
- Comparar visualmente ambas barras en el preview (Registro de Activos vs Levantamiento de Activos): mismo borde, padding, hover shadow, layout responsive y botón Limpiar.
