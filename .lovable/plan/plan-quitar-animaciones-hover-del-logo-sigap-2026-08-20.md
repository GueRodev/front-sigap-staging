# Plan: Quitar animaciones hover del logo SIGAP

## Objetivo
Revertir únicamente las animaciones hover del logo, conservando el ajuste de tamaño actual (h-12, 168/44, símbolo centrado al colapsar). El logo queda estático y bien dimensionado, sin efectos al pasar el cursor.

## Contexto verificado
- `src/components/layout/AppLogo.tsx` (línea 24): el contenedor tiene `cursor-pointer`, `hover:shadow-glow-sky`, `hover:animate-[glow-pulse_1.8s_ease-in-out_infinite]` y `group`.
- `src/components/layout/AppLogo.tsx` (línea 32): la imagen tiene `group-hover:scale-[1.08]`.
- `src/index.css` (líneas 142-149): el keyframe `@keyframes glow-pulse` se agregó exclusivamente para el hover del logo y no se usa en ningún otro componente (confirmado con `rg`).
- El token `--shadow-glow-sky` (líneas 66 y 126) es un token de diseño general; se conserva.

## Cambios

### 1. `src/components/layout/AppLogo.tsx`
- En el contenedor `div` (línea 24): quitar `cursor-pointer`, `hover:shadow-glow-sky`, `hover:animate-[glow-pulse_1.8s_ease-in-out_infinite]` y `group`. Conservar `relative h-12 shrink-0 overflow-hidden rounded-lg transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]`.
- En la imagen `img` (línea 32): quitar `group-hover:scale-[1.08]`. Conservar el resto (`absolute left-0 top-1/2 max-w-none -translate-y-1/2 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]`).
- No tocar las constantes de tamaño ni el estilo inline de `width`.

### 2. `src/index.css`
- Eliminar el bloque `@keyframes glow-pulse` (líneas 142-149), ya que queda sin uso.

## Resultado
Logo estático con el dimensionamiento actual, sin glow ni scale al hover. La animación de colapso del sidebar se mantiene intacta (depende de `width` + `transition-all`, no de los efectos hover).
