import { useState } from "react";
import { ChevronRight, FolderTree, Lock, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import type { EquipmentCategory, EquipmentType } from "../../types/equipment.types";
import type { CategoryNode } from "../../hooks/useCategoryTree";
import { useCategoriesStore } from "../../hooks/useCategoriesStore";
import CategoryFormDialog from "./CategoryFormDialog";
import TypeFormDialog from "./TypeFormDialog";

interface CategoryTreeProps {
  tree: CategoryNode[];
}

const CategoryTree = ({ tree }: CategoryTreeProps) => {
  const softDeleteCategory = useCategoriesStore((s) => s.softDeleteCategory);
  const softDeleteType = useCategoriesStore((s) => s.softDeleteType);

  const [categoryDialog, setCategoryDialog] = useState<{
    open: boolean;
    parent: EquipmentCategory | null;
    category: EquipmentCategory | null;
  }>({ open: false, parent: null, category: null });

  const [typeDialog, setTypeDialog] = useState<{
    open: boolean;
    category: EquipmentCategory | null;
    type: EquipmentType | null;
  }>({ open: false, category: null, type: null });

  const [pendingDelete, setPendingDelete] = useState<CategoryNode | null>(null);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    softDeleteCategory(pendingDelete.id);
    toast.success(`"${pendingDelete.name}" eliminada`, {
      description:
        pendingDelete.equipmentCount > 0
          ? `${pendingDelete.equipmentCount} equipo(s) reasignados a General.`
          : "Sin equipos afectados.",
    });
    setPendingDelete(null);
  };

  return (
    <div className="space-y-3">
      {tree.map((parent) => (
        <Collapsible
          key={parent.id}
          defaultOpen
          className="rounded-lg border border-slate-200 bg-card"
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <CollapsibleTrigger className="group flex flex-1 items-center gap-2 text-left">
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
              <FolderTree className="h-4 w-4 shrink-0 text-primary" />
              <span className="font-medium text-foreground">{parent.name}</span>
              {parent.is_protected && (
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <Lock className="h-3 w-3" /> Protegida
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {parent.children.length} subcategoría(s) · {parent.equipmentCount} equipo(s)
              </span>
            </CollapsibleTrigger>

            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs hover:bg-primary/10 hover:text-primary"
                onClick={() => setCategoryDialog({ open: true, parent, category: null })}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Subcategoría
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                onClick={() => setCategoryDialog({ open: true, parent: null, category: parent })}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 hover:bg-destructive/10 hover:text-destructive",
                  parent.is_protected && "pointer-events-none opacity-30",
                )}
                disabled={parent.is_protected}
                onClick={() => setPendingDelete(parent)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <CollapsibleContent>
            <div className="space-y-2 border-t border-slate-200 px-4 py-3">
              {parent.children.length === 0 && (
                <p className="text-xs text-muted-foreground">Sin subcategorías.</p>
              )}

              {parent.children.map((child) => (
                <div key={child.id} className="rounded-md border border-slate-200 bg-muted/30 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{child.name}</span>
                      {child.is_protected && (
                        <Badge variant="secondary" className="gap-1 text-[10px]">
                          <Lock className="h-3 w-3" /> Protegida
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {child.equipmentCount} equipo(s)
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs hover:bg-primary/10 hover:text-primary"
                        onClick={() => setTypeDialog({ open: true, category: child, type: null })}
                      >
                        <Plus className="mr-1 h-3 w-3" /> Tipo
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                        onClick={() => setCategoryDialog({ open: true, parent: null, category: child })}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                        disabled={child.is_protected}
                        onClick={() => setPendingDelete(child)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {child.types.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {child.types.map((type) => (
                        <li
                          key={type.id}
                          className="group flex items-center gap-1 rounded-full border border-slate-200 bg-background px-2 py-0.5 text-xs text-foreground"
                        >
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          {type.name}
                          <button
                            type="button"
                            className="ml-0.5 text-muted-foreground transition-colors hover:text-primary"
                            onClick={() => setTypeDialog({ open: true, category: child, type })}
                            aria-label={`Editar ${type.name}`}
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            className="text-muted-foreground transition-colors hover:text-destructive"
                            onClick={() => {
                              softDeleteType(type.id);
                              toast.success(`Tipo "${type.name}" eliminado`);
                            }}
                            aria-label={`Eliminar ${type.name}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}

      <CategoryFormDialog
        open={categoryDialog.open}
        onOpenChange={(open) => setCategoryDialog((s) => ({ ...s, open }))}
        parent={categoryDialog.parent}
        category={categoryDialog.category}
      />

      <TypeFormDialog
        open={typeDialog.open}
        onOpenChange={(open) => setTypeDialog((s) => ({ ...s, open }))}
        category={typeDialog.category}
        type={typeDialog.type}
      />

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar "{pendingDelete?.name}"</AlertDialogTitle>
            <AlertDialogDescription>
              Sus tipos se eliminarán y {pendingDelete?.equipmentCount ?? 0} equipo(s) pasarán a la
              subcategoría <strong>General</strong>. Podés restaurarla después: sólo volverán los
              equipos que nadie haya reasignado manualmente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryTree;
