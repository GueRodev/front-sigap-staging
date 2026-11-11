import { STOCK_MOVEMENT_TYPE_LABELS } from "../../constants/equipment.constants";
import type { StockMovementType } from "../../types/equipment.types";

interface StockMovementTypeBadgeProps {
  type: StockMovementType;
}

/** Estilos por tipo de movimiento (tokens semánticos, sin hex crudos). */
const TYPE_STYLES: Record<StockMovementType, { dot: string; pill: string }> = {
  entrada: {
    dot: "bg-emerald-500",
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  salida: {
    dot: "bg-rose-500",
    pill: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
  },
  ajuste: {
    dot: "bg-amber-500",
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  prestamo: {
    dot: "bg-sigap-sky",
    pill: "bg-sigap-sky/10 text-sigap-blue dark:text-sigap-sky border-sigap-sky/20",
  },
  devolucion: {
    dot: "bg-sigap-blue",
    pill: "bg-sigap-blue/10 text-sigap-blue dark:text-sigap-sky border-sigap-blue/20",
  },
  reserva: {
    dot: "bg-violet-500",
    pill: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  },
  cancelacion_reserva: {
    dot: "bg-muted-foreground",
    pill: "bg-muted text-muted-foreground border-border",
  },
};

const StockMovementTypeBadge = ({ type }: StockMovementTypeBadgeProps) => {
  const style = TYPE_STYLES[type];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-display font-semibold ${style.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {STOCK_MOVEMENT_TYPE_LABELS[type]}
    </span>
  );
};

export default StockMovementTypeBadge;
