# Plan: Animación hover scale en el logo SIGAP del sidebar

## Objetivo
Agregar una pequeña animación de hover (scale) al logo de SIGAP en el sidebar para que se sienta más interactivo.

## Cambios
Modificar únicamente `src/components/layout/AppLogo.tsx`:

1. Agregar `hover:scale-105` al `div` contenedor interior (el que tiene `rounded-lg`), para que el logo crezca sutilmente al pasar el cursor.
2. Agregar `cursor-pointer` para dar feedback de interactividad.
3. Mantener el `transition-all duration-500` existente para que la animación sea fluida y consistente con las transiciones del sidebar (500ms, cubic-bezier).

No se agregan dependencias ni cambios en otros archivos. La animación es puramente CSS/Tailwind.

## Archivo afectado
- `src/components/layout/AppLogo.tsx` (2 clases nuevas en el div interior)
