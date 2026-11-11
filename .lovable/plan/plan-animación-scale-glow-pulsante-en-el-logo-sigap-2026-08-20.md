# Plan: Animación Scale + Glow pulsante en el logo SIGAP

## Objetivo
Reemplazar la animación actual (pulse de opacidad) por una animación dinámica de escala con destello azul pulsante al hacer hover.

## Cambios
Modificar únicamente `src/components/layout/AppLogo.tsx`:

1. Quitar `hover:animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]` del div interior.
2. Agregar una clase personalizada con keyframes custom inline:
   - `hover:scale-108` para crecimiento dinámico (8%).
   - `hover:shadow-glow-sky` (ya presente) para el resplandor azul base.
   - Animación pulsante del glow: `hover:animate-[glow-pulse_1.8s_ease-in-out_infinite]`.
3. Definir el keyframe `glow-pulse` en `src/index.css` dentro de `@layer utilities` o como keyframe global:
   ```css
   @keyframes glow-pulse {
     0%, 100% { box-shadow: 0 0 0 1px hsl(var(--sigap-sky) / 0.35), 0 10px 40px -8px hsl(var(--sigap-sky) / 0.45); }
     50% { box-shadow: 0 0 0 1px hsl(var(--sigap-sky) / 0.5), 0 14px 50px -6px hsl(var(--sigap-sky) / 0.7); }
   }
   ```
4. Agregar `scale-108` al config de Tailwind (`tailwind.config.ts` → `scale`) o usar `hover:scale-[1.08]` con valor arbitrario.
5. Mantener `cursor-pointer` y el `transition-all duration-500` existente.

## Archivos afectados
- `src/components/layout/AppLogo.tsx` (cambio de clases en el div interior)
- `src/index.css` (nuevo keyframe `glow-pulse`)
- `tailwind.config.ts` (opcional: agregar `108` a escala, o usar valor arbitrario)
