import { X } from 'lucide-react';

import FilterSelect from '@/components/shared/FilterSelect';
import SearchInput from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';

import type { Area } from '@/features/areas/types/area.types';
import {
  TRANSFER_STATUS_FILTER_OPTIONS,
  TRANSFER_TYPE_FILTER_OPTIONS,
} from '../constants/transfer.constants';
import type { TransferListFilters } from '../hooks/useTransfers';

interface Props {
  filters: TransferListFilters;
  onChange: (filters: TransferListFilters) => void;
  onReset: () => void;
  hasActive: boolean;
  areas: Area[];
}

const TransferFilters = ({ filters, onChange, onReset, hasActive, areas }: Props) => {
  const patch = (partial: Partial<TransferListFilters>) =>
    onChange({ ...filters, ...partial });

  const areaOptions = areas
    .filter((a) => !a.deletedAt)
    .map((a) => ({ value: String(a.id), label: a.name }));

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-[hsl(var(--sigap-sky)/0.18)] p-4 transition-shadow duration-200 hover:shadow-md lg:flex-row lg:items-center">
      <div className="flex-1">
        <SearchInput
          value={filters.search ?? ''}
          onChange={(v) => patch({ search: v || undefined })}
          placeholder="Buscar por equipo o justificación…"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap">
        <FilterSelect
          value={filters.type}
          onChange={(v) => patch({ type: (v as TransferListFilters['type']) })}
          options={TRANSFER_TYPE_FILTER_OPTIONS}
          placeholder="Tipo"
          allLabel="Todos los tipos"
          className="w-full lg:w-[160px]"
        />
        <FilterSelect
          value={filters.status}
          onChange={(v) => patch({ status: (v as TransferListFilters['status']) })}
          options={TRANSFER_STATUS_FILTER_OPTIONS}
          placeholder="Estado"
          allLabel="Todos los estados"
          className="w-full lg:w-[180px]"
        />
        <FilterSelect
          value={filters.area_id ? String(filters.area_id) : undefined}
          onChange={(v) => patch({ area_id: v ? Number(v) : undefined })}
          options={areaOptions}
          placeholder="Área"
          allLabel="Todas las áreas"
          className="w-full lg:w-[180px]"
        />
      </div>

      {hasActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="self-start text-muted-foreground hover:text-foreground"
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Limpiar
        </Button>
      )}
    </div>
  );
};

export default TransferFilters;
