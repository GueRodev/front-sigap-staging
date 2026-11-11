import { cn } from "@/lib/utils";

import {
  INVENTORY_STATUS_LABELS,
  INVENTORY_STATUS_STYLES,
} from "../constants/inventory.constants";
import type { InventoryStatus } from "../types/inventory.types";

interface InventoryStatusBadgeProps {
  status: InventoryStatus;
  className?: string;
}

const InventoryStatusBadge = ({ status, className }: InventoryStatusBadgeProps) => {
  const { dot, pill } = INVENTORY_STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-display font-semibold",
        pill,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} aria-hidden />
      {INVENTORY_STATUS_LABELS[status]}
    </span>
  );
};

export default InventoryStatusBadge;
