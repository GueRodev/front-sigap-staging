import { Archive, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import EmptyState from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { EquipmentCategory } from "../../types/equipment.types";
import { useCategoriesStore } from "../../hooks/useCategoriesStore";

interface DeletedCategoriesPanelProps {
  deleted: EquipmentCategory[];
}

const DeletedCategoriesPanel = ({ deleted }: DeletedCategoriesPanelProps) => {
  const restoreCategory = useCategoriesStore((s) => s.restoreCategory);

  if (deleted.length === 0) {
    return (
      <EmptyState
        icon={Archive}
        title="Sin categorías eliminadas"
        description="Las categorías que elimines aparecerán acá para poder restaurarlas."
      />
    );
  }

  return (
    <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-card">
      {deleted.map((category) => (
        <li key={category.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">{category.name}</span>
              <Badge variant="outline" className="text-[10px]">
                {category.level === 0 ? "Categoría" : "Subcategoría"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Eliminada el {new Date(category.deleted_at!).toLocaleString("es-CR")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              restoreCategory(category.id);
              toast.success(`"${category.name}" restaurada`, {
                description: "Sólo vuelven los equipos que nadie reasignó manualmente.",
              });
            }}
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Restaurar
          </Button>
        </li>
      ))}
    </ul>
  );
};

export default DeletedCategoriesPanel;
