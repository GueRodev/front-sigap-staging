import { cn } from "@/lib/utils";

import { PLATE_TYPE_LABELS, PLATE_TYPE_STYLES } from "../constants/equipment.constants";
import type { PlateType } from "../types/equipment.types";

interface EquipmentTrackingBadgeProps {
  level: PlateType;
  className?: string;
}

const EquipmentTrackingBadge = ({ level, className }: EquipmentTrackingBadgeProps) => {
  const { dot, pill } = PLATE_TYPE_STYLES[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-display font-semibold",
        pill,
        className,
      )}
    >
      {PLATE_TYPE_LABELS[level]}
    </span>
  );
};

export default EquipmentTrackingBadge;
