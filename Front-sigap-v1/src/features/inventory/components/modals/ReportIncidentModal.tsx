import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useCurrentMockUser } from "@/features/areas/hooks/useCurrentMockUser";

import { useInventoryMutations } from "../../hooks/useInventoryMutations";
import {
  inventoryIncidentSchema,
  type InventoryIncidentValues,
} from "../../schemas/inventory.schemas";
import type { InventoryIncident } from "../../types/inventory.types";

const INCIDENT_TYPE_OPTIONS: Array<{
  value: InventoryIncident["incidentType"];
  label: string;
  description: string;
}> = [
  { value: "missing_equipment", label: "Equipo faltante", description: "No se encontró físicamente." },
  { value: "severe_damage", label: "Daño severo", description: "Requiere baja o reparación mayor." },
  { value: "location_mismatch_unresolved", label: "Ubicación incorrecta", description: "Aparece en otra área sin traslado registrado." },
  { value: "unregistered_equipment", label: "Equipo no registrado", description: "Sin placa o no existe en el sistema." },
  { value: "other", label: "Otro", description: "Describilo en la nota." },
];

const SEVERITY_OPTIONS: Array<{ value: InventoryIncident["severity"]; label: string }> = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

interface ReportIncidentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prefilled from a 404 scan; used as description hint. */
  prefillTerm?: string | null;
  /** Prefilled equipment when known (e.g. bulk warning). */
  prefillEquipmentId?: number | null;
  /** Optional link to an existing inventory item. */
  inventoryItemId?: number | null;
}

const ReportIncidentModal = ({
  open,
  onOpenChange,
  prefillTerm,
  prefillEquipmentId,
  inventoryItemId,
}: ReportIncidentModalProps) => {
  const { user } = useCurrentMockUser();
  const { reportIncident } = useInventoryMutations();

  const form = useForm<InventoryIncidentValues>({
    resolver: zodResolver(inventoryIncidentSchema),
    defaultValues: {
      incidentType: prefillTerm ? "unregistered_equipment" : "missing_equipment",
      equipmentId: prefillEquipmentId ?? null,
      severity: "media",
      description: prefillTerm ? `Escaneo no reconocido: "${prefillTerm}". ` : "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        incidentType: prefillTerm ? "unregistered_equipment" : "missing_equipment",
        equipmentId: prefillEquipmentId ?? null,
        severity: "media",
        description: prefillTerm ? `Escaneo no reconocido: "${prefillTerm}". ` : "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prefillTerm, prefillEquipmentId]);

  const onSubmit = (values: InventoryIncidentValues) => {
    reportIncident({
      inventoryItemId: inventoryItemId ?? null,
      equipmentId: values.equipmentId ?? null,
      incidentType: values.incidentType,
      severity: values.severity,
      description: values.description,
      reportedBy: Number(user.id),
    });
    toast.success("Incidencia registrada");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg animate-in fade-in slide-in-from-bottom-4">
        <DialogHeader>
          <DialogTitle>Reportar incidencia</DialogTitle>
          <DialogDescription>
            Registrá el hallazgo para que sea revisado por administración.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="incidentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de incidencia</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid gap-2"
                    >
                      {INCIDENT_TYPE_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 hover:bg-muted/40"
                        >
                          <RadioGroupItem value={opt.value} className="mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">{opt.label}</p>
                            <p className="text-xs text-muted-foreground">{opt.description}</p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severidad</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SEVERITY_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Detallá qué ocurrió, ubicación observada, y cualquier evidencia relevante."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Reportar incidencia</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportIncidentModal;
