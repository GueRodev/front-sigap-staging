# Cerrar el borde superior de la tabla de Traslados

## Problema
La tarjeta que contiene la tabla de Traslados tiene borde y esquinas redondeadas, pero el encabezado azul de la tabla es lo primero dentro de la tarjeta y se pinta por encima de esas esquinas. Como resultado, el borde superior se ve "abierto" en las esquinas.

En Registro de Activos esto no ocurre porque ahí la tarjeta empieza con un encabezado (título + botón "Columnas"), así que la tabla nunca toca el borde superior.

## Cambio propuesto
En `src/features/transfers/pages/TransfersPage.tsx`, añadir `overflow-hidden` a la `Card` que envuelve la tabla, de modo que el fondo del encabezado se recorte a las esquinas redondeadas y el borde superior cierre completo.

Sin cambios de lógica, datos ni de otras tablas.
