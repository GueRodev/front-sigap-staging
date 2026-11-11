import { Check, ChevronDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import FilterSelect from "@/components/shared/FilterSelect";
import SearchInput from "@/components/shared/SearchInput";
import { cn } from "@/lib/utils";

import { AREA_TYPE_OPTIONS } from "../constants/areaType.constants";
import { useZoneOptions } from "../hooks/useAreas";
import type { AreaListFilters, AreaType } from "../types/area.types";

interface AreaFiltersProps {
  filters: AreaListFilters;
  onChange: (next: AreaListFilters) => void;
  onReset: () => void;
  hasActive: boolean;
}

const AreaFilters = ({ filters, onChange, onReset, hasActive }: AreaFiltersProps) => {
  const zones = useZoneOptions();
  const selectedTypes = filters.types ?? [];

  const toggleType = (t: AreaType) => {
    const next = selectedTypes.includes(t)
      ? selectedTypes.filter((x) => x !== t)
      : [...selectedTypes, t];
    onChange({ ...filters, types: next.length ? next : undefined });
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-[hsl(var(--sigap-sky)/0.18)] p-4 transition-shadow duration-200 hover:shadow-md lg:flex-row lg:items-center">
      <div className="flex-1">
        <SearchInput
          value={filters.search ?? ""}
          onChange={(value) => onChange({ ...filters, search: value || undefined })}
          placeholder="Buscar área por nombre..."
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-10 justify-between font-semibold text-sidebar hover:bg-white",
                selectedTypes.length > 0 && "border-primary/40",
              )}
            >
              <span>
                Tipo
                {selectedTypes.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-xs text-primary">
                    {selectedTypes.length}
                  </span>
                )}
              </span>
              <ChevronDown className="h-4 w-4 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-2">
            <div className="space-y-1">
              {AREA_TYPE_OPTIONS.map((opt) => {
                const checked = selectedTypes.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <Checkbox checked={checked} onCheckedChange={() => toggleType(opt.value)} />
                    <span className="flex-1">{opt.label}</span>
                    {checked && <Check className="h-3.5 w-3.5 text-primary" />}
                  </label>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        <FilterSelect
          value={filters.zone}
          onChange={(value) => onChange({ ...filters, zone: value })}
          options={zones.map((z) => ({ value: z, label: `Zona ${z}` }))}
          placeholder="Zona"
          allLabel="Todas las zonas"
          className="w-full lg:w-[160px]"
        />

        <div className="flex items-center gap-2 rounded-md border border-input bg-white px-3">
          <Checkbox
            id="withoutManager"
            checked={!!filters.withoutManager}
            onCheckedChange={(v) =>
              onChange({ ...filters, withoutManager: v ? true : undefined })
            }
          />
          <Label htmlFor="withoutManager" className="cursor-pointer text-sm font-semibold text-sidebar">
            Sin encargado
          </Label>
        </div>
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

export default AreaFilters;
