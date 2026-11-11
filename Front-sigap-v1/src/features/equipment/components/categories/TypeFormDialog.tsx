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

import type { EquipmentCategory, EquipmentType } from "../../types/equipment.types";
import { useCategoriesStore } from "../../hooks/useCategoriesStore";

interface TypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Subcategoría (nivel 1) dueña del tipo. */
  category: EquipmentCategory | null;
  type?: EquipmentType | null;
}

const TypeFormDialog = ({ open, onOpenChange, category, type = null }: TypeFormDialogProps) => {
  const createType = useCategoriesStore((s) => s.createType);
  const updateType = useCategoriesStore((s) => s.updateType);

  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(type?.name ?? "");
  }, [open, type]);

  const handleSubmit = () => {
    const value = name.trim();
    if (!value || !category) return;

    if (type) {
      updateType(type.id, { name: value });
      toast.success("Tipo actualizado");
    } else {
      createType({ name: value, category_id: category.id });
      toast.success("Tipo creado");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{type ? "Editar tipo" : "Nuevo tipo"}</DialogTitle>
          <DialogDescription>
            {category ? `Pertenece a ${category.name}.` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="type-name">Nombre *</Label>
          <Input
            id="type-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Laptop"
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            {type ? "Guardar cambios" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TypeFormDialog;
