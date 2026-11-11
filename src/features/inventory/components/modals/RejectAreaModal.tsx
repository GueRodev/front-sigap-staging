import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";

import { useCurrentMockUser } from "@/features/areas/hooks/useCurrentMockUser";

import { useInventoryMutations } from "../../hooks/useInventoryMutations";
import {
  rejectAreaSchema,
  type RejectAreaValues,
} from "../../schemas/inventory.schemas";
import type { InventoryArea } from "../../types/inventory.types";

interface RejectAreaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryArea: InventoryArea;
  areaName: string;
}

const RejectAreaModal = ({
  open,
  onOpenChange,
  inventoryArea,
  areaName,
}: RejectAreaModalProps) => {
  const { user } = useCurrentMockUser();
  const { rejectArea } = useInventoryMutations();

  const form = useForm<RejectAreaValues>({
    resolver: zodResolver(rejectAreaSchema),
    defaultValues: { reason: "" },
  });

  useEffect(() => {
    if (open) form.reset({ reason: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = (values: RejectAreaValues) => {
    rejectArea(inventoryArea.id, Number(user.id), values.reason);
    toast.error("Área rechazada", { description: areaName });
    onOpenChange(false);
  };

  const nextRejectionCount = inventoryArea.rejectionCount + 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg animate-in fade-in slide-in-from-bottom-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Rechazar revisión de área
          </DialogTitle>
          <DialogDescription>
            El colaborador de <strong>{areaName}</strong> deberá corregir los hallazgos y volver a enviar.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-300">
          Este será el rechazo <strong>#{nextRejectionCount}</strong> para esta área.
          {nextRejectionCount >= 3 && " Se recomienda escalar a la jefatura administrativa."}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo del rechazo *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Explicá qué debe corregirse (mín. 10 caracteres)…"
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
              <Button type="submit" variant="destructive">
                Rechazar área
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RejectAreaModal;
