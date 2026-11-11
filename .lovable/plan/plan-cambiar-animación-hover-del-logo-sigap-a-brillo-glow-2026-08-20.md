# Plan: Cambiar animación hover del logo SIGAP a Brillo/Glow

## Objetivo
Reemplazar el `hover:scale-105` actual por un efecto de brillo/glow en el logo del sidebar, según preferencia del usuario.

## Cambios
Modificar únicamente `src/components/layout/AppLogo.tsx`:

1. Quitar `hover:scale-105` del div interior.
2. Agregar `hover:brightness-110` para aumentar sutilmente el brillo.
3. Agregar `hover:shadow-glow-sky` (token de sombra azul ya definido en el proyecto: `--shadow-glow-sky`) para un suave resplandor azul al pasar el cursor.
4. Mantener `cursor-pointer` y el `transition-all duration-500` existente para que el efecto sea fluido y consistente con las transiciones del sidebar.

No se agregan dependencias ni cambios en otros archivos.

## Archivo afectado
- `src/components/layout/AppLogo.tsx` (cambio de 2 clases en el div interior)
