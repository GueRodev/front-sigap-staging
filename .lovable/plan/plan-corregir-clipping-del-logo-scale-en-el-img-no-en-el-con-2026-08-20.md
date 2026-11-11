# Plan: Corregir clipping del logo — scale en el img, no en el contenedor

## Problema
El `hover:scale-[1.08]` está en el `div` contenedor (que tiene `overflow-hidden rounded-lg`). Al escalar el contenedor, el contenido se desborda contra los bordes redondeados y se ve rectangular/cortado.

## Solución
Mover el scale del contenedor al `img` interior. El contenedor mantiene tamaño fijo, esquinas redondeadas, y el glow pulsante. El `img` hace el zoom dentro (efecto "ken-burns" sutil). Esto **no afecta** la animación de colapso del sidebar porque esa transición se controla via `width` en el contenedor y el img, independiente del `transform`.

### Cambios en `src/components/layout/AppLogo.tsx`

1. **Contenedor div**: 
   - Quitar `hover:scale-[1.08]`.
   - Agregar clase `group` para habilitar `group-hover` en el hijo.
   - Mantener `hover:shadow-glow-sky hover:animate-[glow-pulse_1.8s_ease-in-out_infinite]`.

2. **Img**:
   - Quitar el `transform` del `style` inline (era `translate(0px, -50%)`, donde `COLLAPSED_OFFSET_X` siempre es 0). El `-translate-y-1/2` ya está como clase Tailwind y se mantiene.
   - Agregar `group-hover:scale-[1.08]` para que el logo crezca cuando se hace hover en el contenedor padre.
   - Tailwind compone `-translate-y-1/2` + `group-hover:scale-[1.08]` vía sus variables CSS sin conflicto.
   - El `width` se mantiene como style inline (controla el colapso).

Resultado: el contenedor no cambia de tamaño, mantiene esquinas redondeadas; el logo "zoom" sutilmente dentro; el glow azul pulsa en el contenedor. El colapso del sidebar funciona igual que antes.

## Archivo afectado
- `src/components/layout/AppLogo.tsx`
