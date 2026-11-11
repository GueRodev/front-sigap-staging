import { cn } from "@/lib/utils";
import { AREA_TYPE_META } from "../constants/areaType.constants";
import type { AreaType } from "../types/area.types";

interface AreaTypeBadgeProps {
  type: AreaType;
  className?: string;
}

const AreaTypeBadge = ({ type, className }: AreaTypeBadgeProps) => {
  const meta = AREA_TYPE_META[type];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        meta.pillClass,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
};

export default AreaTypeBadge;
