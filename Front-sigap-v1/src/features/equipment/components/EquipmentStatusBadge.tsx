import { cn } from "@/lib/utils";

import { STATUS_LABELS, STATUS_STYLES } from "../constants/equipment.constants";
import type { EquipmentStatus } from "../types/equipment.types";

interface EquipmentStatusBadgeProps {
  status: EquipmentStatus;
  className?: string;
}

const EquipmentStatusBadge = ({ status, className }: EquipmentStatusBadgeProps) => {
  const { dot, pill } = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-display font-semibold",
        pill,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  );
};

export default EquipmentStatusBadge;
