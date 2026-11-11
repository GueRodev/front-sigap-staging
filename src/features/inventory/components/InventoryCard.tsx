import { CalendarDays, ClipboardList, MapPin, TrendingUp } from "lucide-react";

import SpotlightCard from "@/components/shared/SpotlightCard";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { INVENTORY_SCOPE_LABELS } from "../constants/inventory.constants";
import { useInventory } from "../hooks/useInventory";
import type { Inventory } from "../types/inventory.types";
import InventoryStatusBadge from "./InventoryStatusBadge";

interface InventoryCardProps {
  inventory: Inventory;
  onOpen: (inventory: Inventory) => void;
}

const InventoryCard = ({ inventory, onOpen }: InventoryCardProps) => {
  const { progress } = useInventory(inventory.id);

  return (
    <SpotlightCard
      as="article"
      onClick={() => onOpen(inventory)}
      tone="sky"
      intensity="regular"
      className={cn(
        "group flex cursor-pointer flex-col p-5",
        "hover:-translate-y-0.5 hover:shadow-glow-sky",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-semibold text-foreground">
            {inventory.title}
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-foreground/70">
            <CalendarDays className="h-3.5 w-3.5" />
            {inventory.year} · {INVENTORY_SCOPE_LABELS[inventory.scope]}
          </p>
        </div>
        <InventoryStatusBadge status={inventory.status} />
      </div>

      {inventory.description && (
        <p className="mt-3 line-clamp-2 text-xs text-foreground/70">
          {inventory.description}
        </p>
      )}

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-foreground/80">
          <span>Progreso</span>
          <span>{progress.percentComplete}%</span>
        </div>
        <Progress value={progress.percentComplete} className="h-1.5" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-xs">
        <div className="flex flex-col">
          <span className="flex items-center gap-1 text-foreground/60">
            <MapPin className="h-3 w-3" />
            Áreas
          </span>
          <span className="font-display font-semibold text-foreground">
            {progress.approvedAreas}/{progress.totalAreas}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="flex items-center gap-1 text-foreground/60">
            <ClipboardList className="h-3 w-3" />
            Ítems
          </span>
          <span className="font-display font-semibold text-foreground">
            {progress.totalItems}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="flex items-center gap-1 text-foreground/60">
            <TrendingUp className="h-3 w-3" />
            Discrep.
          </span>
          <span
            className={cn(
              "font-display font-semibold",
              progress.totalMismatches > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground",
            )}
          >
            {progress.totalMismatches}
          </span>
        </div>
      </div>
    </SpotlightCard>
  );
};

export default InventoryCard;
