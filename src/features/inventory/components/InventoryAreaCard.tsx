import type { ReactNode } from "react";
import { AlertTriangle, MapPin, User } from "lucide-react";

import { useAreasStore } from "@/features/areas/hooks/useAreasStore";
import { cn } from "@/lib/utils";

import type { InventoryArea } from "../types/inventory.types";
import InventoryAreaStatusBadge from "./InventoryAreaStatusBadge";

interface InventoryAreaCardProps {
  area: InventoryArea;
  onClick?: (area: InventoryArea) => void;
  actions?: ReactNode;
  footerNote?: ReactNode;
  className?: string;
}

const InventoryAreaCard = ({
  area,
  onClick,
  actions,
  footerNote,
  className,
}: InventoryAreaCardProps) => {
  const sourceArea = useAreasStore((s) => s.areas.find((a) => a.id === area.areaId));
  const users = useAreasStore((s) => s.users);

  const assignee = users.find((u) => u.id === area.assignedTo);

  return (
    <div
      className={cn(
        "group flex w-full flex-col rounded-lg border border-glass bg-white/70 p-3 text-left shadow-sm backdrop-blur transition-all",
        "hover:-translate-y-0.5 hover:border-sigap-sky/40 hover:shadow-glow-sky",
        "dark:bg-white/5",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onClick?.(area)}
        className="flex w-full flex-col gap-2 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-foreground">
              {sourceArea?.name ?? `Área #${area.areaId}`}
            </p>
            {sourceArea?.zone && (
              <p className="flex items-center gap-1 text-[11px] text-foreground/60">
                <MapPin className="h-3 w-3" />
                Zona {sourceArea.zone}
                {sourceArea.building && ` · ${sourceArea.building}`}
              </p>
            )}
          </div>
          <InventoryAreaStatusBadge status={area.status} />
        </div>

        <div className="flex items-center justify-between text-[11px] text-foreground/70">
          <span className="flex items-center gap-1 truncate">
            <User className="h-3 w-3 shrink-0" />
            {assignee?.name ?? "Sin asignar"}
          </span>
          <span className="font-display font-semibold text-foreground">
            {area.itemsCount} ítems
          </span>
        </div>

        {area.mismatchesCount > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-3 w-3" />
            {area.mismatchesCount} discrepancia{area.mismatchesCount === 1 ? "" : "s"}
          </div>
        )}

        {area.rejectionCount > 0 && (
          <div className="text-[11px] text-destructive">
            Rechazada {area.rejectionCount}×
          </div>
        )}
      </button>

      {footerNote && <div className="mt-2">{footerNote}</div>}

      {actions && (
        <div className="mt-2 flex flex-wrap justify-end gap-1.5 border-t border-glass pt-2 [&>*]:min-w-0 [&_button]:max-sm:w-full">
          {actions}
        </div>
      )}
    </div>
  );
};

export default InventoryAreaCard;
