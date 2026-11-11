import { RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { UNASSIGNED_AREA_ID } from "../constants/areaType.constants";
import { useDeletedAreas } from "../hooks/useAreas";
import { useAreaMutations } from "../hooks/useAreaMutations";
import { useAreasStore } from "../hooks/useAreasStore";
import AreaTypeBadge from "./AreaTypeBadge";

interface DeletedAreasPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeletedAreasPanel = ({ open, onOpenChange }: DeletedAreasPanelProps) => {
  const deleted = useDeletedAreas();
  const equipment = useAreasStore((s) => s.equipment);
  const { restoreArea, isPending } = useAreaMutations();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle>Áreas eliminadas</SheetTitle>
          <SheetDescription>
            Restaurar un área devuelve los equipos que aún estén en "Sin Área Asignada" y no hayan sido reasignados manualmente.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {deleted.length === 0 ? (
            <EmptyState
              icon={Trash2}
              title="No hay áreas eliminadas"
              description="Las áreas que elimines aparecerán aquí y podrás restaurarlas."
            />
          ) : (
            <ul className="space-y-2">
              {deleted.map((area) => {
                const pending = equipment.filter(
                  (e) => e.original_area_id === area.id && e.current_area_id === UNASSIGNED_AREA_ID,
                ).length;
                return (
                  <li
                    key={area.id}
                    className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-foreground">{area.name}</span>
                        <AreaTypeBadge type={area.type} />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {pending} equipo{pending === 1 ? "" : "s"} pendiente{pending === 1 ? "" : "s"} de retornar
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={async () => {
                        await restoreArea(area.id);
                        toast.success(`"${area.name}" restaurada`);
                      }}
                    >
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                      Restaurar
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DeletedAreasPanel;
