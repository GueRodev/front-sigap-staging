import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import FormSection from "@/components/shared/FormSection";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  AREA_TYPE_OPTIONS,
  LOAN_APPROVAL_OPTIONS,
  TRANSFER_APPROVAL_OPTIONS,
} from "../constants/areaType.constants";
import { useAreaMutations } from "../hooks/useAreaMutations";
import { useZoneOptions } from "../hooks/useAreas";
import { areaFormSchema, type AreaFormValues } from "../schemas/area.schemas";
import type { Area } from "../types/area.types";

interface AreaFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area?: Area | null;
}

const defaultValues: AreaFormValues = {
  name: "",
  type: "office",
  zone: "",
  building: "",
  description: "",
  default_is_loanable: false,
  default_is_publicly_visible: false,
  default_loan_approval_level: "none",
  default_transfer_requires_approval: true,
  default_transfer_approval_level: "single",
};

const AreaFormDrawer = ({ open, onOpenChange, area }: AreaFormDrawerProps) => {
  const isEdit = !!area;
  const zones = useZoneOptions();
  const { createArea, updateArea, isPending } = useAreaMutations();

  const form = useForm<AreaFormValues>({
    resolver: zodResolver(areaFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(
        area
          ? {
              name: area.name,
              type: area.type,
              zone: area.zone ?? "",
              building: area.building ?? "",
              description: area.description ?? "",
              default_is_loanable: area.default_is_loanable,
              default_is_publicly_visible: area.default_is_publicly_visible,
              default_loan_approval_level: area.default_loan_approval_level,
              default_transfer_requires_approval: area.default_transfer_requires_approval,
              default_transfer_approval_level: area.default_transfer_approval_level,
            }
          : defaultValues,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, area]);

  const onSubmit = async (values: AreaFormValues) => {
    try {
      if (isEdit && area) {
        await updateArea(area.id, values);
        toast.success("Área actualizada");
      } else {
        await createArea(values);
        toast.success("Área creada");
      }
      onOpenChange(false);
    } catch {
      toast.error("Ocurrió un error al guardar");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle>{isEdit ? "Editar área" : "Nueva área"}</SheetTitle>
          <SheetDescription>
            {isEdit ? "Actualizá los datos y defaults de esta área." : "Definí un área operativa y sus defaults."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <FormSection title="Identificación">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input placeholder="A-16, Biblioteca, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AREA_TYPE_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zona</FormLabel>
                      <FormControl>
                        <>
                          <Input list="area-zones" placeholder="A, B, C…" {...field} />
                          <datalist id="area-zones">
                            {zones.map((z) => <option key={z} value={z} />)}
                          </datalist>
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="building"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Edificio</FormLabel>
                      <FormControl>
                        <Input placeholder="Edificio Norte, Anexo…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              <FormSection
                title="Defaults operacionales"
                description="Se aplican a los equipos ubicados en esta área salvo que se sobrescriban."
                columns={1}
              >
                <FormField
                  control={form.control}
                  name="default_is_loanable"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
                      <div>
                        <FormLabel className="text-sm">Prestable por defecto</FormLabel>
                        <p className="text-xs text-muted-foreground">Los equipos nuevos serán prestables.</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="default_is_publicly_visible"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
                      <div>
                        <FormLabel className="text-sm">Visible al público</FormLabel>
                        <p className="text-xs text-muted-foreground">Aparece en el catálogo público.</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="default_loan_approval_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aprobación de préstamo</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {LOAN_APPROVAL_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="default_transfer_requires_approval"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
                      <div>
                        <FormLabel className="text-sm">Traslado requiere aprobación</FormLabel>
                        <p className="text-xs text-muted-foreground">Los traslados desde/hacia esta área requieren aprobación.</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="default_transfer_approval_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel de aprobación de traslado</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {TRANSFER_APPROVAL_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              <FormSection title="Descripción" columns={1}>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Notas o descripción del área..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>
            </div>

            <SheetFooter className="border-t border-border bg-muted/30 px-6 py-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear área"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default AreaFormDrawer;
