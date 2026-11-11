import { cn } from "@/lib/utils";

import {
  CONDITION_LABELS,
  CONDITION_STYLES,
} from "../constants/inventory.constants";
import type { EquipmentCondition } from "../types/inventory.types";

interface ConditionBadgeProps {
  condition: EquipmentCondition;
  className?: string;
}

const ConditionBadge = ({ condition, className }: ConditionBadgeProps) => {
  const { dot, pill } = CONDITION_STYLES[condition];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-display font-semibold",
        pill,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} aria-hidden />
      {CONDITION_LABELS[condition]}
    </span>
  );
};

export default ConditionBadge;
