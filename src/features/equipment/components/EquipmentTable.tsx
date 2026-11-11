import { PackageOpen } from "lucide-react";

import EmptyState from "@/components/shared/EmptyState";
import LoadingTable from "@/components/shared/LoadingTable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Equipment } from "../types/equipment.types";
import EquipmentTableRow from "./EquipmentTableRow";

interface EquipmentTableProps {
  items: Equipment[];
  isLoading?: boolean;
  onEdit: (equipment: Equipment) => void;
  onDelete: (equipment: Equipment) => void;
}

const COLUMNS = 10;

const EquipmentTable = ({ items, isLoading, onEdit, onDelete }: EquipmentTableProps) => {
  return (
    <div className="bg-card overflow-hidden">
      <Table className="[&_tr]:border-slate-300">
        <TableHeader>
          <TableRow className="bg-[hsl(var(--sigap-sky)/0.18)] hover:bg-[hsl(var(--sigap-sky)/0.18)]">
            <TableHead className="w-[80px] text-sm font-display text-sidebar font-semibold">Imagen</TableHead>
            <TableHead className="w-[160px] text-sm font-display text-sidebar font-semibold">Placa</TableHead>
            <TableHead className="text-sm font-display text-sidebar font-semibold">Nombre</TableHead>
            <TableHead className="w-[130px] text-sm font-display text-sidebar font-semibold">Tipo de Placa</TableHead>
            <TableHead className="w-[140px] text-sm font-display text-sidebar font-semibold">Categoría</TableHead>
            <TableHead className="w-[180px] text-sm font-display text-sidebar font-semibold">Área actual</TableHead>
            <TableHead className="w-[150px] text-sm font-display text-sidebar font-semibold">Estado</TableHead>
            <TableHead className="w-[100px] text-center text-sm font-display text-sidebar font-semibold">Prestable</TableHead>
            <TableHead className="w-[110px] text-center text-sm font-display text-sidebar font-semibold">Disp. / Total</TableHead>
            <TableHead className="w-[110px] text-right text-sm font-display text-sidebar font-semibold">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <LoadingTable rows={5} columns={COLUMNS} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMNS} className="p-0">
                <EmptyState
                  icon={PackageOpen}
                  title="Sin resultados"
                  description="No se encontraron activos que coincidan con los filtros."
                  className="m-4 border-0 bg-transparent"
                />
              </TableCell>
            </TableRow>
          ) : (
            items.map((equipment) => (
              <EquipmentTableRow
                key={equipment.id}
                equipment={equipment}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EquipmentTable;
