import { ArrowRight, Package } from 'lucide-react';

import EmptyState from '@/components/shared/EmptyState';
import LoadingTable from '@/components/shared/LoadingTable';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { Equipment } from '@/features/equipment/types/equipment.types';
import type { Area } from '@/features/areas/types/area.types';

import type { Transfer } from '../types/transfer.types';
import TransferStatusBadge from './TransferStatusBadge';
import TransferTypeBadge from './TransferTypeBadge';

interface Props {
  items: Transfer[];
  equipmentById: Map<number, Equipment>;
  areaById: Map<number, Area>;
  isLoading?: boolean;
}

const COLUMNS = 6;

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const TransfersTable = ({ items, equipmentById, areaById, isLoading }: Props) => (
  <div className="bg-card overflow-hidden">
    <Table className="[&_tr]:border-slate-300">
      <TableHeader>
        <TableRow className="bg-[hsl(var(--sigap-sky)/0.18)] hover:bg-[hsl(var(--sigap-sky)/0.18)]">
          <TableHead className="w-[60px] text-sm font-display text-sidebar font-semibold">Imagen</TableHead>
          <TableHead className="text-sm font-display text-sidebar font-semibold">Equipo</TableHead>
          <TableHead className="w-[120px] text-sm font-display text-sidebar font-semibold">Tipo</TableHead>
          <TableHead className="text-sm font-display text-sidebar font-semibold">Origen → Destino</TableHead>
          <TableHead className="w-[140px] text-sm font-display text-sidebar font-semibold">Estado</TableHead>
          <TableHead className="w-[140px] text-sm font-display text-sidebar font-semibold">Fecha</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <LoadingTable rows={5} columns={COLUMNS} />
        ) : items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={COLUMNS} className="p-0">
              <EmptyState
                icon={Package}
                title="Sin traslados"
                description="No se encontraron traslados con los filtros actuales."
                className="m-4 border-0 bg-transparent"
              />
            </TableCell>
          </TableRow>
        ) : (
          items.map((t) => {
            const eq = equipmentById.get(t.equipment_id);
            const origin = areaById.get(t.origin_area_id)?.name ?? '—';
            const destination = areaById.get(t.destination_area_id)?.name ?? '—';
            const plate =
              eq?.institutional_plate ?? eq?.internal_plate ?? (eq ? 'Sin placa' : '—');
            return (
              <TableRow key={t.id} className="border-slate-100 hover:bg-[hsl(var(--sigap-sky)/0.18)]">
                <TableCell className="py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50">
                    <Package className="h-4 w-4 text-sky-500" aria-hidden="true" />
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="font-display font-semibold text-muted-foreground">
                      {eq?.name ?? `Equipo #${t.equipment_id}`}
                    </span>
                    <span className="text-xs font-display font-semibold text-slate-400">{plate}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <TransferTypeBadge type={t.type} />
                </TableCell>
                <TableCell className="py-4 text-sm font-display font-semibold text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <span>{origin}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    <span>{destination}</span>
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <TransferStatusBadge status={t.status} />
                </TableCell>
                <TableCell className="py-4 text-sm font-display font-semibold text-muted-foreground tabular-nums">
                  {formatDate(t.created_at)}
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  </div>
);

export default TransfersTable;
