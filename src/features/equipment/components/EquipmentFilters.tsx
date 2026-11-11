import { X } from "lucide-react";

import FilterSelect from "@/components/shared/FilterSelect";
import SearchInput from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";

import { STATUS_OPTIONS, PLATE_TYPE_OPTIONS } from "../constants/equipment.constants";
import { MOCK_AREAS } from "../data/mockEquipment";
import { useCategoriesStore } from "../hooks/useCategoriesStore";
import type {
  EquipmentListFilters,
  EquipmentStatus,
  PlateType,
} from "../types/equipment.types";

interface EquipmentFiltersProps {
  filters: EquipmentListFilters;
  onChange: (next: EquipmentListFilters) => void;
}

const EquipmentFilters = ({ filters, onChange }: EquipmentFiltersProps) => {
  const categories = useCategoriesStore((s) => s.categories);
  const subcategories = categories.filter((c) => c.level === 1 && !c.deleted_at);
  const hasActiveFilters =
    !!filters.search ||
    !!filters.status ||
    !!filters.plate_type ||
    !!filters.category_id ||
    !!filters.area_id;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-[hsl(var(--sigap-sky)/0.18)] p-4 transition-shadow duration-200 hover:shadow-md lg:flex-row lg:items-center">
      <div className="flex-1">
        <SearchInput
          value={filters.search ?? ""}
          onChange={(value) => onChange({ ...filters, search: value || undefined })}
          placeholder="Buscar por nombre, placa, serie, marca..."
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-wrap">
        <FilterSelect
          value={filters.status}
          onChange={(value) => onChange({ ...filters, status: value as EquipmentStatus | undefined })}
          options={STATUS_OPTIONS}
          placeholder="Estado"
          allLabel="Todos los estados"
          className="w-full lg:w-[180px]"
        />
        <FilterSelect
          value={filters.plate_type}
          onChange={(value) =>
            onChange({ ...filters, plate_type: value as PlateType | undefined })
          }
          options={PLATE_TYPE_OPTIONS}
          placeholder="Tipo de placa"
          allLabel="Todas las placas"
          className="w-full lg:w-[160px]"
        />
        <FilterSelect
          value={filters.category_id ? String(filters.category_id) : undefined}
          onChange={(value) =>
            onChange({ ...filters, category_id: value ? Number(value) : undefined })
          }
          options={subcategories.map((c) => ({ value: String(c.id), label: c.name }))}
          placeholder="Categoría"
          allLabel="Todas las categorías"
          className="w-full lg:w-[180px]"
        />
        <FilterSelect
          value={filters.area_id ? String(filters.area_id) : undefined}
          onChange={(value) => onChange({ ...filters, area_id: value ? Number(value) : undefined })}
          options={MOCK_AREAS.map((a) => ({ value: String(a.id), label: a.name }))}
          placeholder="Área"
          allLabel="Todas las áreas"
          className="w-full lg:w-[180px]"
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

export default EquipmentFilters;
