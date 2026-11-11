# Acciones integradas dentro del card del Kanban

Hoy los botones "Iniciar", "Escanear", "Enviar" y "Revisar" se renderizan debajo del card del área (junto con el motivo de rechazo), lo que rompe la unidad visual de cada tarjeta en el tablero.

## Qué cambia

- Cada tarjeta de área pasa a ser un contenedor único que incluye, dentro del mismo borde:
  1. Encabezado (nombre del área, zona/edificio, badge de estado)
  2. Datos (responsable, ítems, discrepancias, contador de rechazos)
  3. Motivo de rechazo, cuando aplique
  4. Pie de acciones separado por una línea sutil, alineado a la derecha
- El pie de acciones solo aparece si el rol tiene una acción disponible; si no, la tarjeta se cierra sin espacio vacío.
- Responsive: los botones usan `flex-wrap` y en columnas angostas se estiran a ancho completo (apilados), en columnas anchas quedan en línea a la derecha.

## Detalle técnico

- `src/features/inventory/components/InventoryAreaCard.tsx`
  - Cambiar el elemento raíz de `<button>` a `<div>` (evita botones anidados inválidos). La zona clickeable de navegación pasa a ser un `<button>` interno que envuelve el encabezado y los datos, con `w-full text-left`.
  - Nuevas props opcionales: `actions?: ReactNode` y `footerNote?: ReactNode` (motivo de rechazo / nota de aprobada).
  - Render del pie: `{actions && <div className="mt-1 flex flex-wrap justify-end gap-1.5 border-t border-glass pt-2">{actions}</div>}`.
  - Mantener hover/glow y estilos glass actuales en el contenedor raíz.
- `src/features/inventory/pages/InventoryDetailPage.tsx`
  - Dejar de renderizar `contextualAction(a)`, el bloque de motivo de rechazo y la línea "Aprobada · área" fuera del card; pasarlos por las nuevas props.
  - `contextualAction` sigue igual (misma lógica de permisos y `stopPropagation`).

Sin cambios de lógica de negocio, permisos ni estado.
