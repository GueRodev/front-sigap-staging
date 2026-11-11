import { useEffect } from "react";
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
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

import { useEquipmentForm } from "../hooks/useEquipmentForm";
import { useEquipmentMutations } from "../hooks/useEquipmentMutations";
import { useEquipmentPermissions } from "../hooks/useEquipmentPermissions";
import type { EquipmentFormValues } from "../schemas/equipmentSchema";
import type { Equipment } from "../types/equipment.types";
import AcquisitionSection from "./form/AcquisitionSection";
import AssignmentSection from "./form/AssignmentSection";
import ClassificationSection from "./form/ClassificationSection";
import DescriptionSection from "./form/DescriptionSection";
import FinancialSection from "./form/FinancialSection";
import IdentificationSection from "./form/IdentificationSection";
import LocationStatusSection from "./form/LocationStatusSection";
import PolicyOverridesSection from "./form/PolicyOverridesSection";

interface EquipmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment?: Equipment | null;
}

const EquipmentFormDialog = ({ open, onOpenChange, equipment }: EquipmentFormDialogProps) => {
  const isEdit = !!equipment;
  const form = useEquipmentForm(equipment);
  const { createEquipment, updateEquipment, isPending } = useEquipmentMutations();
  const { permissions } = useEquipmentPermissions();
  const canViewFinancial = permissions.view_equipment_financial_fields;

  // Reset on close so reopening for "create" starts blank.
  useEffect(() => {
    if (!open && !isEdit) form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (values: EquipmentFormValues) => {
    try {
      if (isEdit && equipment) {
        await updateEquipment(equipment.id, values);
        toast.success("Activo actualizado correctamente");
      } else {
        await createEquipment(values);
        toast.success("Activo registrado correctamente");
      }
      onOpenChange(false);
    } catch {
      toast.error("Ocurrió un error al guardar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>{isEdit ? "Editar activo" : "Registrar nuevo activo"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualice la información del activo seleccionado."
              : "Complete los datos del nuevo activo institucional."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-h-[calc(90vh-9rem)] flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <IdentificationSection control={form.control} />
              <Separator />
              <DescriptionSection control={form.control} />
              <Separator />
              <ClassificationSection control={form.control} />
              <Separator />
              <LocationStatusSection control={form.control} />
              <Separator />
              <PolicyOverridesSection control={form.control} />
              <Separator />
              <AssignmentSection control={form.control} />
              <Separator />
              <AcquisitionSection control={form.control} canViewFinancial={canViewFinancial} />
              {canViewFinancial && (
                <>
                  <Separator />
                  <FinancialSection control={form.control} />
                </>
              )}
            </div>

            <DialogFooter className="border-t border-border bg-muted/30 px-6 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Registrar activo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentFormDialog;
