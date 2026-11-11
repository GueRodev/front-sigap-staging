import { cn } from "@/lib/utils";

import {
  INVENTORY_AREA_STATUS_LABELS,
  INVENTORY_AREA_STATUS_STYLES,
} from "../constants/inventory.constants";
import type { InventoryAreaStatus } from "../types/inventory.types";

interface InventoryAreaStatusBadgeProps {
  status: InventoryAreaStatus;
  className?: string;
}

const InventoryAreaStatusBadge = ({ status, className }: InventoryAreaStatusBadgeProps) => {
  const { dot, pill } = INVENTORY_AREA_STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-display font-semibold",
        pill,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} aria-hidden />
      {INVENTORY_AREA_STATUS_LABELS[status]}
    </span>
  );
};

export default InventoryAreaStatusBadge;
