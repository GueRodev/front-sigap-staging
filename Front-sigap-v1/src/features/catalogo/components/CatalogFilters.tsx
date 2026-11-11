import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import FilterSelect from "@/components/shared/FilterSelect";
import SearchInput from "@/components/shared/SearchInput";
import type { CatalogOption } from "../types/catalog.types";

interface CatalogFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  parentCategoryId: number | null;
  onCategoryChange: (id: number | null) => void;
  areaId: number | null;
  onAreaChange: (id: number | null) => void;
  onlyAvailableNow: boolean;
  onOnlyAvailableChange: (v: boolean) => void;
  categoryOptions: CatalogOption[];
  areaOptions: CatalogOption[];
  hasActive: boolean;
  onReset: () => void;
}

const toOpts = (opts: CatalogOption[]) => opts.map((o) => ({ value: String(o.id), label: o.name }));
const toId = (v: string | undefined) => (v ? Number(v) : null);

const CatalogFilters = (p: CatalogFiltersProps) => (
  <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-[hsl(var(--sigap-sky)/0.18)] p-4 transition-shadow duration-200 hover:shadow-md lg:flex-row lg:items-center dark:border-border dark:[&_button]:text-foreground dark:[&_input]:text-foreground dark:[&_input::placeholder]:text-muted-foreground">
    <div className="flex-1">
      <SearchInput
        value={p.search}
        onChange={p.onSearchChange}
        placeholder="Buscar por nombre, marca, modelo o placa..."
      />
    </div>

    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap">
      <FilterSelect
        value={p.parentCategoryId !== null ? String(p.parentCategoryId) : undefined}
        onChange={(v) => p.onCategoryChange(toId(v))}
        options={toOpts(p.categoryOptions)}
        placeholder="Categoría"
        allLabel="Todas las categorías"
        className="w-full lg:w-[180px]"
      />
      <FilterSelect
        value={p.areaId !== null ? String(p.areaId) : undefined}
        onChange={(v) => p.onAreaChange(toId(v))}
        options={toOpts(p.areaOptions)}
        placeholder="Área"
        allLabel="Todas las áreas"
        className="w-full lg:w-[200px]"
      />
      <div className="flex items-center gap-2 rounded-md border border-input bg-white px-3 py-2 dark:bg-background">
        <Checkbox
          id="onlyAvailableNow"
          checked={p.onlyAvailableNow}
          onCheckedChange={(v) => p.onOnlyAvailableChange(v === true)}
        />
        <Label htmlFor="onlyAvailableNow" className="cursor-pointer text-sm font-semibold text-sidebar dark:text-foreground">
          Disponibles ahora
        </Label>
      </div>
    </div>

    {p.hasActive && (
      <Button
        variant="ghost"
        size="sm"
        onClick={p.onReset}
        className="self-start text-muted-foreground hover:text-foreground"
      >
        <X className="mr-1 h-3.5 w-3.5" />
        Limpiar
      </Button>
    )}
  </div>
);

export default CatalogFilters;
