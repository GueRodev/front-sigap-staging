import { AlertTriangle, MapPin, MoreVertical, Package, Pencil, ShieldAlert, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import SpotlightCard from "@/components/shared/SpotlightCard";
import { cn } from "@/lib/utils";

import { useAreaDerived } from "../hooks/useArea";
import { useCurrentMockUser } from "../hooks/useCurrentMockUser";
import type { Area } from "../types/area.types";
import AreaTypeBadge from "./AreaTypeBadge";
import AssignedUsersStack from "./AssignedUsersStack";

interface AreaCardProps {
  area: Area;
  onOpen: (area: Area) => void;
  onEdit: (area: Area) => void;
  onDelete: (area: Area) => void;
  onAssignManager: (area: Area) => void;
}

// Shared className for glass-friendly ghost buttons (readable text + visible hover).
const glassGhostBtn =
  "text-foreground/75 hover:bg-glass-action-hover hover:text-foreground focus-visible:ring-1 focus-visible:ring-primary/60";

const AreaCard = ({ area, onOpen, onEdit, onDelete, onAssignManager }: AreaCardProps) => {
  const { permissions } = useCurrentMockUser();
  const { managersOf, equipmentCountOf, sublocationCountOf } = useAreaDerived();
  const managers = managersOf(area.id);
  const equipCount = equipmentCountOf(area.id);
  const subCount = sublocationCountOf(area.id);

  const canManage = permissions.manage_areas && !area.is_protected;

  return (
    <SpotlightCard
      as="article"
      onClick={() => onOpen(area)}
      tone={area.is_protected ? "amber" : "sky"}
      intensity="regular"
      className={cn(
        "group flex cursor-pointer flex-col p-5",
        "hover:-translate-y-0.5 hover:shadow-glow-sky",
        area.is_protected &&
          "ring-1 ring-inset ring-amber-400/50 hover:shadow-[0_0_0_1px_hsl(38_92%_55%/0.5),0_10px_40px_-8px_hsl(38_92%_55%/0.5)]",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-base font-semibold text-foreground">
              {area.name}
            </h3>
            {area.is_protected && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ShieldAlert className="h-4 w-4 shrink-0 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>Área protegida del sistema</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-foreground/70">
            {area.zone ? `Zona ${area.zone}` : "Sin zona"}
            {area.building && ` · ${area.building}`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <AreaTypeBadge type={area.type} />
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className={cn("h-7 w-7", glassGhostBtn)}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => onEdit(area)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(area)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mt-4">
        {managers.length > 0 ? (
          <AssignedUsersStack users={managers} />
        ) : area.is_protected ? (
          <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            {equipCount > 0
              ? `${equipCount} equipo${equipCount === 1 ? "" : "s"} pendiente${equipCount === 1 ? "" : "s"} de reasignación`
              : "Sin equipos huérfanos"}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 rounded-md border border-white/15 bg-background/40 px-2.5 py-1.5 dark:border-white/10">
            <span className="text-xs text-foreground/75">Sin encargado asignado</span>
            {permissions.assign_user_areas && (
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-6 px-2 text-xs", glassGhostBtn)}
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignManager(area);
                }}
              >
                Asignar
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 dark:border-white/10">
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 px-2 text-xs font-medium", glassGhostBtn)}
          onClick={(e) => {
            e.stopPropagation();
            onOpen(area);
          }}
        >
          <Package className="mr-1.5 h-3.5 w-3.5" />
          Ver equipos ({equipCount})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 px-2 text-xs font-medium", glassGhostBtn)}
          onClick={(e) => {
            e.stopPropagation();
            onOpen(area);
          }}
        >
          <MapPin className="mr-1.5 h-3.5 w-3.5" />
          Sublocaciones ({subCount})
        </Button>
      </div>
    </SpotlightCard>
  );
};

export default AreaCard;
