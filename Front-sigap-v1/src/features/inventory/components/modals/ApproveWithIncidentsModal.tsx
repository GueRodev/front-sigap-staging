import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useCurrentMockUser } from "@/features/areas/hooks/useCurrentMockUser";

import { useInventoryItems } from "../../hooks/useInventoryItems";
import { useInventoryMutations } from "../../hooks/useInventoryMutations";
import type { InventoryArea } from "../../types/inventory.types";

interface ApproveWithIncidentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryArea: InventoryArea;
  areaName: string;
}

/**
 * Aprobación con hallazgos: el aprobador confirma que ya revisó cada
 * `locationMatch === false` (checklist), agrega nota opcional, y aprueba.
 * Los ítems que queden sin marcar generan incidencias `location_mismatch_unresolved`.
 */
const ApproveWithIncidentsModal = ({
  open,
  onOpenChange,
  inventoryArea,
  areaName,
}: ApproveWithIncidentsModalProps) => {
  const { user } = useCurrentMockUser();
  const { approveArea, reportIncident } = useInventoryMutations();
  const items = useInventoryItems(inventoryArea.id);
  const mismatches = items.filter((it) => it.locationMatch === false);

  const [acknowledged, setAcknowledged] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (open) setAcknowledged(new Set());
  }, [open]);

  const toggle = (id: number) =>
    setAcknowledged((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const unresolved = mismatches.filter((it) => !acknowledged.has(it.id));

  const handleApprove = () => {
    unresolved.forEach((it) => {
      reportIncident({
        inventoryItemId: it.id,
        equipmentId: it.equipmentId,
        incidentType: "location_mismatch_unresolved",
        severity: "media",
        description: `Ubicación no resuelta al aprobar ${areaName}: esperado ${it.snapshotArea}, encontrado ${it.actualArea ?? "N/D"}.`,
        reportedBy: Number(user.id),
      });
    });
    approveArea(inventoryArea.id, Number(user.id));
    toast.success("Área aprobada", {
      description:
        unresolved.length > 0
          ? `Se generaron ${unresolved.length} incidencia(s) por discrepancias no resueltas.`
          : areaName,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl animate-in fade-in slide-in-from-bottom-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Aprobar con hallazgos — {areaName}
          </DialogTitle>
          <DialogDescription>
            Marcá cada discrepancia que ya validaste en sitio. Las no marcadas se registrarán como incidencias abiertas.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[360px] rounded-md border border-border">
          <div className="divide-y divide-border">
            {mismatches.length === 0 && (
              <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                No hay discrepancias de ubicación en esta área.
              </div>
            )}
            {mismatches.map((it) => (
              <label
                key={it.id}
                className="flex cursor-pointer items-start gap-3 p-3 hover:bg-muted/40"
              >
                <Checkbox
                  checked={acknowledged.has(it.id)}
                  onCheckedChange={() => toggle(it.id)}
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{it.snapshotName}</p>
                  <p className="text-xs text-muted-foreground">
                    Placa: {it.snapshotInstitutionalPlate ?? it.snapshotInternalPlate ?? "—"}
                  </p>
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-300">
                    Esperado: área {it.snapshotArea} · Encontrado: {it.actualArea ?? "N/D"}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </ScrollArea>

        <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Discrepancias totales</span>
            <span className="font-medium">{mismatches.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Marcadas como resueltas</span>
            <span className="font-medium text-emerald-600">{acknowledged.size}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Generarán incidencia</span>
            <span className="font-medium text-amber-600">{unresolved.length}</span>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleApprove}>Aprobar área</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApproveWithIncidentsModal;
