import { Boxes } from "lucide-react";

import {
  ACQUISITION_TYPE_LABELS,
  EQUIPMENT_CONDITION_LABELS,
  STOCK_MOVEMENT_TYPE_LABELS,
} from "../../constants/equipment.constants";
import type { EquipmentStockMovement } from "../../types/equipment.types";
import StockMovementTypeBadge from "./StockMovementTypeBadge";

interface StockMovementsTimelineProps {
  movements: EquipmentStockMovement[];
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDelta = (value: number) => (value > 0 ? `+${value}` : `${value}`);

const StockMovementsTimeline = ({ movements }: StockMovementsTimelineProps) => {
  if (movements.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-200 py-8 text-center">
        <Boxes className="h-5 w-5 text-slate-300" aria-hidden="true" />
        <p className="text-sm font-display font-semibold text-slate-400">
          Sin movimientos de stock registrados
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {movements.map((movement) => (
        <li
          key={movement.id}
          className="relative rounded-lg border border-slate-200 bg-card p-3 pl-4"
        >
          <span
            className="absolute left-0 top-3 h-[calc(100%-1.5rem)] w-1 rounded-full bg-[hsl(var(--sigap-sky)/0.5)]"
            aria-hidden="true"
          />
          <div className="flex flex-wrap items-center gap-2">
            <StockMovementTypeBadge type={movement.type} />
            <span className="text-sm font-display font-semibold text-muted-foreground">
              {STOCK_MOVEMENT_TYPE_LABELS[movement.type]} · {movement.quantity} u.
            </span>
            <span className="ml-auto text-xs font-display font-semibold text-slate-400">
              {formatDate(movement.created_at)}
            </span>
          </div>

          <p className="mt-2 text-xs font-display font-semibold tabular-nums text-slate-400">
            Disponible {formatDelta(movement.available_delta)} · Total{" "}
            {formatDelta(movement.total_delta)} → {movement.snapshot_quantity_available} /{" "}
            {movement.snapshot_quantity_total}
          </p>

          {movement.reason && (
            <p className="mt-2 text-sm text-muted-foreground">{movement.reason}</p>
          )}

          <dl className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
            {movement.acquisition_type && (
              <div className="flex gap-1">
                <dt className="font-semibold">Origen:</dt>
                <dd>{ACQUISITION_TYPE_LABELS[movement.acquisition_type]}</dd>
              </div>
            )}
            {movement.condition && (
              <div className="flex gap-1">
                <dt className="font-semibold">Condición:</dt>
                <dd>{EQUIPMENT_CONDITION_LABELS[movement.condition]}</dd>
              </div>
            )}
            {movement.reference && (
              <div className="flex gap-1">
                <dt className="font-semibold">Referencia:</dt>
                <dd>{movement.reference}</dd>
              </div>
            )}
            <div className="flex gap-1">
              <dt className="font-semibold">Registró:</dt>
              <dd>{movement.performed_by_name}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ol>
  );
};

export default StockMovementsTimeline;
