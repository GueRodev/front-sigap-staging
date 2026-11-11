import { Boxes, History, Package, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import QuickTransferButton from "@/features/transfers/components/QuickTransferButton";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import { MOCK_AREAS, MOCK_CATEGORIES } from "../data/mockEquipment";
import { useEquipmentMutations } from "../hooks/useEquipmentMutations";
import { useEquipmentPermissions } from "../hooks/useEquipmentPermissions";
import type { Equipment } from "../types/equipment.types";
import EquipmentStatusBadge from "./EquipmentStatusBadge";
import EquipmentTrackingBadge from "./EquipmentTrackingBadge";
import StatusChangeDialog from "./status/StatusChangeDialog";
import StockMovementDialog from "./stock/StockMovementDialog";
import { useAreaPolicyDefaults } from "../hooks/useAreaPolicyDefaults";
import { resolveIsLoanable } from "../utils/resolveEquipmentPolicy";

interface EquipmentTableRowProps {
  equipment: Equipment;
  onEdit: (equipment: Equipment) => void;
  onDelete: (equipment: Equipment) => void;
}

const EquipmentTableRow = ({ equipment, onEdit, onDelete }: EquipmentTableRowProps) => {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const { toggleLoanable } = useEquipmentMutations();
  const { permissions } = useEquipmentPermissions();
  const canManage = permissions.manage_equipment;
  const areaDefaults = useAreaPolicyDefaults(equipment.current_area_id);
  const isLoanable = resolveIsLoanable(equipment, areaDefaults);
  const inheritsLoanable = equipment.is_loanable === null;

  const plate =
    equipment.institutional_plate ??
    equipment.internal_plate ??
    (equipment.plate_type === "bulk" ? "—" : "Sin placa");

  const category = MOCK_CATEGORIES.find((c) => c.id === equipment.category_id)?.name ?? "—";
  const area = MOCK_AREAS.find((a) => a.id === equipment.current_area_id)?.name ?? "—";

  return (
    <TableRow className="border-slate-100 hover:bg-[hsl(var(--sigap-sky)/0.18)]">
      <TableCell className="py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50">
          <Package className="h-5 w-5 text-sky-500" aria-hidden="true" />
        </div>
      </TableCell>
      <TableCell className="py-5 font-display font-semibold text-muted-foreground text-sm">{plate}</TableCell>
      <TableCell className="py-5">
        <div className="flex flex-col">
          <span className="font-display font-semibold text-muted-foreground">{equipment.name}</span>
          {(equipment.brand || equipment.model) && (
            <span className="text-xs font-display font-semibold text-slate-400">
              {[equipment.brand, equipment.model].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="py-5">
        <EquipmentTrackingBadge level={equipment.plate_type} />
      </TableCell>
      <TableCell className="py-5 font-display font-sans font-semibold text-[sidebar-primary-foreground] text-muted-foreground">{category}</TableCell>
      <TableCell className="py-5 text-sm font-display font-semibold text-muted-foreground">{area}</TableCell>
      <TableCell className="py-5">
        <button
          type="button"
          onClick={() => setStatusDialogOpen(true)}
          className="rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Cambiar estado de ${equipment.name}`}
        >
          <EquipmentStatusBadge status={equipment.status} />
        </button>
      </TableCell>
      <TableCell className="py-5 text-center">
        <div className="flex flex-col items-center justify-center gap-1">
          <Switch
            checked={isLoanable}
            onCheckedChange={(checked) => toggleLoanable(equipment.id, checked)}
            className="data-[state=checked]:bg-sidebar"
            aria-label={`${isLoanable ? "Deshabilitar" : "Habilitar"} préstamo de ${equipment.name}`}
          />
          {inheritsLoanable && (
            <span
              className="text-[10px] font-display font-semibold uppercase tracking-wide text-slate-400"
              title="Hereda la política de préstamo del área actual"
            >
              Heredado
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="py-5 text-center text-sm font-display font-semibold tabular-nums text-slate-400">
        {equipment.quantity_available}
        <span className="font-semibold text-slate-300"> / {equipment.quantity_total}</span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <QuickTransferButton equipment={equipment} />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:bg-sky-500/10 hover:text-sky-600 hover:ring-1 hover:ring-sky-500/30"
            onClick={() => setStatusDialogOpen(true)}
            aria-label={`Cambiar estado de ${equipment.name}`}
          >
            <History className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 hover:ring-1 hover:ring-emerald-500/30"
            onClick={() => setStockDialogOpen(true)}
            aria-label={`Movimientos de stock de ${equipment.name}`}
          >
            <Boxes className="h-4 w-4" />
          </Button>
          {canManage && (
            <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:ring-1 hover:ring-primary/30"
              onClick={() => onEdit(equipment)}
              aria-label={`Editar ${equipment.name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive hover:ring-1 hover:ring-destructive/30"
              onClick={() => onDelete(equipment)}
              aria-label={`Eliminar ${equipment.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            </>
          )}
        </div>
        <StatusChangeDialog
          equipment={equipment}
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
        />
        <StockMovementDialog
          equipment={equipment}
          open={stockDialogOpen}
          onOpenChange={setStockDialogOpen}
        />
      </TableCell>
    </TableRow>
  );
};

export default EquipmentTableRow;
