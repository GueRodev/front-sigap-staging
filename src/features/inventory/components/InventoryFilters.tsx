import { X } from "lucide-react";

import FilterSelect from "@/components/shared/FilterSelect";
import SearchInput from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";

import {
  INVENTORY_SCOPE_OPTIONS,
  INVENTORY_STATUS_OPTIONS,
} from "../constants/inventory.constants";
import type {
  InventoryListFilters,
  InventoryScope,
  InventoryStatus,
} from "../types/inventory.types";

interface InventoryFiltersProps {
  filters: InventoryListFilters;
  onChange: (patch: Partial<InventoryListFilters>) => void;
  yearOptions: number[];
}

const InventoryFilters = ({ filters, onChange, yearOptions }: InventoryFiltersProps) => {
  const hasActiveFilters =
    !!filters.search || !!filters.year || !!filters.status || !!filters.scope;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-[hsl(var(--sigap-sky)/0.18)] p-4 transition-shadow duration-200 hover:shadow-md lg:flex-row lg:items-center">
      <div className="flex-1">
        <SearchInput
          value={filters.search ?? ""}
          onChange={(value) => onChange({ search: value || undefined })}
          placeholder="Buscar por título o descripción…"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap">
        <FilterSelect
          value={filters.year ? String(filters.year) : undefined}
          onChange={(v) => onChange({ year: v ? Number(v) : undefined })}
          options={yearOptions.map((y) => ({ value: String(y), label: String(y) }))}
          allLabel="Todos los años"
          placeholder="Año"
          className="w-full lg:w-[160px]"
        />
        <FilterSelect
          value={filters.status}
          onChange={(v) => onChange({ status: v as InventoryStatus | undefined })}
          options={INVENTORY_STATUS_OPTIONS}
          allLabel="Todos los estados"
          placeholder="Estado"
          className="w-full lg:w-[180px]"
        />
        <FilterSelect
          value={filters.scope}
          onChange={(v) => onChange({ scope: v as InventoryScope | undefined })}
          options={INVENTORY_SCOPE_OPTIONS}
          allLabel="Todos los alcances"
          placeholder="Alcance"
          className="w-full lg:w-[200px]"
        />
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({})}
          className="self-start text-muted-foreground hover:text-foreground"
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Limpiar
        </Button>
      )}
    </div>
  );
};

export default InventoryFilters;
