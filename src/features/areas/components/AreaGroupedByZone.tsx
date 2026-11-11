import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

import type { Area } from "../types/area.types";
import { UNASSIGNED_AREA_ID } from "../constants/areaType.constants";
import AreaCard from "./AreaCard";

interface AreaGroupedByZoneProps {
  items: Area[];
  onOpen: (area: Area) => void;
  onEdit: (area: Area) => void;
  onDelete: (area: Area) => void;
  onAssignManager: (area: Area) => void;
}

const AreaGroupedByZone = ({
  items,
  onOpen,
  onEdit,
  onDelete,
  onAssignManager,
}: AreaGroupedByZoneProps) => {
  const groups = useMemo(() => {
    const map = new Map<string, Area[]>();
    items.forEach((a) => {
      if (a.id === UNASSIGNED_AREA_ID) return;
      const key = a.zone ?? "Sin zona";
      const list = map.get(key) ?? [];
      list.push(a);
      map.set(key, list);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  const protectedArea = items.find((a) => a.id === UNASSIGNED_AREA_ID);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-6">
      {protectedArea && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            Área protegida del sistema
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AreaCard
              area={protectedArea}
              onOpen={onOpen}
              onEdit={onEdit}
              onDelete={onDelete}
              onAssignManager={onAssignManager}
            />
          </div>
        </div>
      )}

      {groups.map(([zone, list]) => {
        const isCollapsed = collapsed[zone];
        return (
          <section key={zone}>
            <button
              type="button"
              onClick={() => setCollapsed((s) => ({ ...s, [zone]: !s[zone] }))}
              className="sticky top-14 z-10 -mx-1 mb-3 flex w-full items-center justify-between rounded-md border border-border bg-card/95 px-3 py-2 backdrop-blur"
            >
              <span className="text-sm font-semibold text-foreground">
                Zona {zone}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({list.length})
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  isCollapsed && "-rotate-90",
                )}
              />
            </button>
            {!isCollapsed && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list.map((area) => (
                  <AreaCard
                    key={area.id}
                    area={area}
                    onOpen={onOpen}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAssignManager={onAssignManager}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default AreaGroupedByZone;
