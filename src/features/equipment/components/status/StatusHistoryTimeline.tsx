import { History } from "lucide-react";

import { STATUS_LABELS } from "../../constants/equipment.constants";
import type { EquipmentStatusChange } from "../../types/equipment.types";
import EquipmentStatusBadge from "../EquipmentStatusBadge";

interface StatusHistoryTimelineProps {
  changes: EquipmentStatusChange[];
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const StatusHistoryTimeline = ({ changes }: StatusHistoryTimelineProps) => {
  if (changes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-200 py-8 text-center">
        <History className="h-5 w-5 text-slate-300" aria-hidden="true" />
        <p className="text-sm font-display font-semibold text-slate-400">
          Sin cambios de estado registrados
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {changes.map((change) => (
        <li
          key={change.id}
          className="relative rounded-lg border border-slate-200 bg-card p-3 pl-4"
        >
          <span
            className="absolute left-0 top-3 h-[calc(100%-1.5rem)] w-1 rounded-full bg-[hsl(var(--sigap-sky)/0.5)]"
            aria-hidden="true"
          />
          <div className="flex flex-wrap items-center gap-2">
            <EquipmentStatusBadge status={change.from_status} />
            <span className="text-xs text-muted-foreground" aria-hidden="true">
              →
            </span>
            <EquipmentStatusBadge status={change.to_status} />
            <span className="ml-auto text-xs font-display font-semibold text-slate-400">
              {formatDate(change.created_at)}
            </span>
          </div>

          {change.reason && (
            <p className="mt-2 text-sm text-muted-foreground">{change.reason}</p>
          )}

          {change.metadata && (
            <dl className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
              {Object.entries(change.metadata).map(([key, value]) => (
                <div key={key} className="flex gap-1">
                  <dt className="font-display font-semibold text-slate-400">{key}:</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <p className="mt-2 text-xs font-display font-semibold text-slate-400">
            Por {change.changed_by_name} ·{" "}
            {STATUS_LABELS[change.to_status]}
          </p>
        </li>
      ))}
    </ol>
  );
};

export default StatusHistoryTimeline;
