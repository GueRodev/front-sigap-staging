import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { EquipmentCategory } from "../../types/equipment.types";
import { useCategoriesStore } from "../../hooks/useCategoriesStore";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Categoría padre cuando se crea una subcategoría. `null` = categoría raíz. */
  parent?: EquipmentCategory | null;
  /** Categoría existente en modo edición. */
  category?: EquipmentCategory | null;
}

const CategoryFormDialog = ({ open, onOpenChange, parent = null, category = null }: CategoryFormDialogProps) => {
  const createCategory = useCategoriesStore((s) => s.createCategory);
  const updateCategory = useCategoriesStore((s) => s.updateCategory);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
  }, [open, category]);

  const isEdit = Boolean(category);
  const title = isEdit
    ? "Editar categoría"
    : parent
      ? `Nueva subcategoría en ${parent.name}`
      : "Nueva categoría padre";

  const handleSubmit = () => {
    const value = name.trim();
    if (!value) return;

    if (isEdit && category) {
      updateCategory(category.id, { name: value, description: description.trim() || null });
      toast.success("Categoría actualizada");
    } else {
      createCategory({
        name: value,
        parent_id: parent?.id ?? null,
        description: description.trim() || null,
      });
      toast.success(parent ? "Subcategoría creada" : "Categoría creada");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Los equipos se asignan siempre a una subcategoría (nivel 1).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Nombre *</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Equipo de cómputo"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-description">Descripción</Label>
            <Textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Opcional"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            {isEdit ? "Guardar cambios" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryFormDialog;
