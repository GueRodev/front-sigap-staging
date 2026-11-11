import { AlertTriangle, CheckCircle2 } from "lucide-react";

import EmptyState from "@/components/shared/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { InventoryItem } from "../types/inventory.types";
import ConditionBadge from "./ConditionBadge";

interface InventoryItemsTableProps {
  items: InventoryItem[];
}

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("es-CR", { dateStyle: "short", timeStyle: "short" }) : "—";

const InventoryItemsTable = ({ items }: InventoryItemsTableProps) => {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Sin ítems verificados"
        description="Escanea equipos para comenzar el levantamiento de esta área."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-glass bg-white/60 backdrop-blur dark:bg-white/5">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Placa</TableHead>
            <TableHead>Equipo</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Condición</TableHead>
            <TableHead>Verificado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((it) => (
            <TableRow key={it.id}>
              <TableCell className="font-mono text-xs">
                {it.snapshotInstitutionalPlate ?? it.snapshotInternalPlate ?? "—"}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{it.snapshotName}</span>
                  {(it.snapshotBrand || it.snapshotModel) && (
                    <span className="text-xs text-foreground/60">
                      {[it.snapshotBrand, it.snapshotModel].filter(Boolean).join(" ")}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs",
                    it.locationMatch
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-amber-700 dark:text-amber-300",
                  )}
                >
                  {it.locationMatch ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                  {it.locationMatch ? "Correcta" : `Esperada ≠ ${it.actualArea ?? "?"}`}
                </span>
              </TableCell>
              <TableCell>
                {it.condition ? <ConditionBadge condition={it.condition} /> : <span className="text-xs text-foreground/50">—</span>}
              </TableCell>
              <TableCell className="text-xs text-foreground/70">
                {formatDate(it.verifiedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InventoryItemsTable;
