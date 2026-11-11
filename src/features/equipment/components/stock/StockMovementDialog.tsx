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
  ACQUISITION_TYPE_OPTIONS,
  EQUIPMENT_CONDITION_OPTIONS,
  STOCK_MOVEMENT_TYPE_LABELS,
  STOCK_MOVEMENT_TYPE_OPTIONS,
} from "../../constants/equipment.constants";
import {
  useStockMovementsStore,
  type StockMovementError,
} from "../../hooks/useStockMovementsStore";
import type {
  AcquisitionType,
  Equipment,
  EquipmentCondition,
  StockMovementType,
} from "../../types/equipment.types";
import StockMovementsTimeline from "./StockMovementsTimeline";

interface StockMovementDialogProps {
  equipment: Equipment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ERROR_MESSAGES: Record<StockMovementError, string> = {
  equipment_not_found: "El activo ya no existe.",
  invalid_quantity: "La cantidad debe ser un número entero mayor que cero.",
  insufficient_available: "No hay suficientes unidades disponibles para este movimiento.",
  insufficient_total: "El movimiento dejaría el total de existencias en negativo.",
};

const StockMovementDialog = ({ equipment, open, onOpenChange }: StockMovementDialogProps) => {
  const { user } = useCurrentMockUser();
  const registerMovement = useStockMovementsStore((s) => s.registerMovement);
  const movements = useStockMovementsStore((s) => s.movements);

  const [type, setType] = useState<StockMovementType | "">("");
  const [quantity, setQuantity] = useState("1");
  const [adjustmentSign, setAdjustmentSign] = useState<"1" | "-1">("1");
  const [acquisitionType, setAcquisitionType] = useState<AcquisitionType | "">("");
  const [condition, setCondition] = useState<EquipmentCondition | "">("");
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");

  const history = useMemo(
    () => movements.filter((m) => m.equipment_id === equipment.id),
    [movements, equipment.id],
  );

  const reset = () => {
    setType("");
    setQuantity("1");
    setAdjustmentSign("1");
    setAcquisitionType("");
    setCondition("");
    setReason("");
    setReference("");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = () => {
    if (!type) return;

    const result = registerMovement({
      equipment_id: equipment.id,
      type,
      quantity: Number(quantity),
      adjustment_sign: adjustmentSign === "-1" ? -1 : 1,
      acquisition_type: acquisitionType || null,
      condition: condition || null,
      reason,
      reference,
      performed_by_user_id: user?.id ?? null,
      performed_by_name: user?.name ?? "Usuario",
    });

    if (result.ok === false) {
      toast({
        title: "Movimiento no registrado",
        description: ERROR_MESSAGES[result.error],
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Movimiento registrado",
      description: `${STOCK_MOVEMENT_TYPE_LABELS[result.movement.type]} de ${result.movement.quantity} u. · disponible ${result.movement.snapshot_quantity_available} / ${result.movement.snapshot_quantity_total}.`,
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Movimientos de stock</DialogTitle>
          <DialogDescription>
            {equipment.name} · existencias actuales{" "}
            <span className="font-semibold tabular-nums">
              {equipment.quantity_available} / {equipment.quantity_total}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stock-movement-type">Tipo de movimiento</Label>
              <Select value={type} onValueChange={(value) => setType(value as StockMovementType)}>
                <SelectTrigger id="stock-movement-type">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {STOCK_MOVEMENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-movement-quantity">Cantidad</Label>
              <Input
                id="stock-movement-quantity"
                type="number"
                min={1}
                step={1}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </div>
          </div>

          {type === "ajuste" && (
            <div className="space-y-2">
              <Label htmlFor="stock-movement-sign">Sentido del ajuste</Label>
              <Select
                value={adjustmentSign}
                onValueChange={(value) => setAdjustmentSign(value as "1" | "-1")}
              >
                <SelectTrigger id="stock-movement-sign">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Sumar existencias</SelectItem>
                  <SelectItem value="-1">Restar existencias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {type === "entrada" && (
            <div className="space-y-2">
              <Label htmlFor="stock-movement-acquisition">Origen de la entrada</Label>
              <Select
                value={acquisitionType}
                onValueChange={(value) => setAcquisitionType(value as AcquisitionType)}
              >
                <SelectTrigger id="stock-movement-acquisition">
                  <SelectValue placeholder="Seleccione un origen" />
                </SelectTrigger>
                <SelectContent>
                  {ACQUISITION_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stock-movement-condition">Condición</Label>
              <Select
                value={condition}
                onValueChange={(value) => setCondition(value as EquipmentCondition)}
              >
                <SelectTrigger id="stock-movement-condition">
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_CONDITION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-movement-reference">Referencia</Label>
              <Input
                id="stock-movement-reference"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="Factura, orden, acta…"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock-movement-reason">Motivo</Label>
            <Textarea
              id="stock-movement-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Detalle opcional del movimiento"
              rows={3}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-display font-semibold text-muted-foreground">
              Historial de movimientos
            </p>
            <StockMovementsTimeline movements={history} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={handleSubmit} disabled={!type}>
            Registrar movimiento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StockMovementDialog;
