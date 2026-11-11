import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, ClipboardCheck } from "lucide-react";

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
  submitForReviewSchema,
  type SubmitForReviewValues,
} from "../../schemas/inventory.schemas";
import type { InventoryArea } from "../../types/inventory.types";

interface SubmitForReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryArea: InventoryArea;
  areaName: string;
}

const SubmitForReviewModal = ({
  open,
  onOpenChange,
  inventoryArea,
  areaName,
}: SubmitForReviewModalProps) => {
  const { user } = useCurrentMockUser();
  const { submitAreaForReview } = useInventoryMutations();

  const form = useForm<SubmitForReviewValues>({
    resolver: zodResolver(submitForReviewSchema),
    defaultValues: { note: "" },
  });

  useEffect(() => {
    if (open) form.reset({ note: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const canSubmit = inventoryArea.itemsCount > 0;

  const onSubmit = () => {
    submitAreaForReview(inventoryArea.id, Number(user.id));
    toast.success("Área enviada a revisión", { description: areaName });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg animate-in fade-in slide-in-from-bottom-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-sigap-sky" />
            Enviar a revisión
          </DialogTitle>
          <DialogDescription>
            El aprobador validará los equipos verificados en <strong>{areaName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Verificados
            </div>
            <p className="mt-1 text-2xl font-semibold">{inventoryArea.itemsCount}</p>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Discrepancias
            </div>
            <p className="mt-1 text-2xl font-semibold">{inventoryArea.mismatchesCount}</p>
          </div>
        </div>

        {!canSubmit && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <p>Debés verificar al menos un equipo antes de enviar a revisión.</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nota (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Comentarios para el aprobador…"
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
              <Button type="submit" disabled={!canSubmit}>
                Enviar a revisión
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitForReviewModal;
