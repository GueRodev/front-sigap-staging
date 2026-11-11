import { useMemo, useState } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useCurrentMockUser } from "@/features/areas/hooks/useCurrentMockUser";

import {
  STATUS_LABELS,
  STATUS_OPTIONS,
  STATUS_REQUIRES_REASON,
} from "../../constants/equipment.constants";
import { useStatusHistoryStore } from "../../hooks/useStatusHistoryStore";
import type { Equipment, EquipmentStatus } from "../../types/equipment.types";
import EquipmentStatusBadge from "../EquipmentStatusBadge";
import StatusHistoryTimeline from "./StatusHistoryTimeline";

interface StatusChangeDialogProps {
  equipment: Equipment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Campos de metadata según la transición (ADR-ACTIVOS-001). */
const METADATA_FIELDS: Partial<Record<EquipmentStatus, { key: string; label: string }[]>> = {
  desechado: [
    { key: "Acta de baja", label: "Número de acta de baja" },
    { key: "Autorizado por", label: "Autorizado por" },
  ],
  donado: [
    { key: "Institución receptora", label: "Institución receptora" },
    { key: "Acta de donación", label: "Número de acta de donación" },
  ],
  reparacion: [{ key: "Orden de servicio", label: "Orden de servicio" }],
  mantenimiento: [{ key: "Orden de mantenimiento", label: "Orden de mantenimiento" }],
  extraviado: [{ key: "Reporte", label: "Número de reporte" }],
};

const StatusChangeDialog = ({ equipment, open, onOpenChange }: StatusChangeDialogProps) => {
  const { user } = useCurrentMockUser();
  const registerStatusChange = useStatusHistoryStore((s) => s.registerStatusChange);
  const changes = useStatusHistoryStore((s) => s.changes);

  const [toStatus, setToStatus] = useState<EquipmentStatus | "">("");
  const [reason, setReason] = useState("");
  const [metadata, setMetadata] = useState<Record<string, string>>({});

  const history = useMemo(
    () => changes.filter((c) => c.equipment_id === equipment.id),
    [changes, equipment.id],
  );

  const metadataFields = toStatus ? METADATA_FIELDS[toStatus] ?? [] : [];
  const reasonRequired = toStatus ? STATUS_REQUIRES_REASON.has(toStatus) : false;

  const reset = () => {
    setToStatus("");
    setReason("");
    setMetadata({});
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = () => {
    if (!toStatus) return;
    if (reasonRequired && !reason.trim()) {
      toast({
        title: "Motivo obligatorio",
        description: `El cambio a "${STATUS_LABELS[toStatus]}" requiere un motivo.`,
        variant: "destructive",
      });
      return;
    }

    const cleanMetadata = Object.fromEntries(
      Object.entries(metadata).filter(([, value]) => value.trim().length > 0),
    );

    const record = registerStatusChange({
      equipment_id: equipment.id,
      to_status: toStatus,
      reason,
      metadata: cleanMetadata,
      changed_by_user_id: user?.id ?? null,
      changed_by_name: user?.name ?? "Usuario",
    });

    if (!record) {
      toast({
        title: "Sin cambios",
        description: "El activo ya se encuentra en ese estado.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Estado actualizado",
      description: `${equipment.name}: ${STATUS_LABELS[record.from_status]} → ${STATUS_LABELS[record.to_status]}.`,
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Cambio de estado</DialogTitle>
          <DialogDescription>
            {equipment.name} · estado actual{" "}
            <span className="inline-flex align-middle">
              <EquipmentStatusBadge status={equipment.status} />
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status-change-to">Nuevo estado</Label>
            <Select
              value={toStatus}
              onValueChange={(value) => {
                setToStatus(value as EquipmentStatus);
                setMetadata({});
              }}
            >
              <SelectTrigger id="status-change-to">
                <SelectValue placeholder="Seleccione un estado" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.filter((option) => option.value !== equipment.status).map(
                  (option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-change-reason">
              Motivo {reasonRequired && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id="status-change-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={
                reasonRequired
                  ? "Obligatorio para esta transición"
                  : "Opcional para esta transición"
              }
              rows={3}
            />
          </div>

          {metadataFields.length > 0 && (
            <div className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
              {metadataFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={`meta-${field.key}`}>{field.label}</Label>
                  <Input
                    id={`meta-${field.key}`}
                    value={metadata[field.key] ?? ""}
                    onChange={(event) =>
                      setMetadata((prev) => ({ ...prev, [field.key]: event.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cerrar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!toStatus}
            className="font-semibold shadow-[0_0_8px_hsl(var(--sigap-sky)/0.4)]"
          >
            Registrar cambio
          </Button>
        </DialogFooter>

        <Separator />

        <section className="space-y-3">
          <h3 className="font-display text-sm font-semibold text-muted-foreground">
            Historial de estados
          </h3>
          <StatusHistoryTimeline changes={history} />
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default StatusChangeDialog;
