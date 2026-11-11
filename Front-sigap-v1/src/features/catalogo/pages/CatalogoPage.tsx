import { Package } from "lucide-react";
import CatalogEmptyState from "../components/CatalogEmptyState";
import CatalogFilters from "../components/CatalogFilters";
import CatalogGrid from "../components/CatalogGrid";
import CatalogPageHeader from "../components/CatalogPageHeader";
import { useCatalogFilters } from "../hooks/useCatalogFilters";
import { useCatalogItems } from "../hooks/useCatalogItems";

const CatalogoPage = () => {
  const items = useCatalogItems();
  const f = useCatalogFilters(items);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <CatalogPageHeader
          title="Catálogo de Equipos"
          description="Explorá y armá tu pedido de préstamo"
          icon={Package}
          count={f.total}
        />
      </div>
      <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <CatalogFilters
          search={f.search}
          onSearchChange={f.setSearch}
          parentCategoryId={f.parentCategoryId}
          onCategoryChange={f.setParentCategoryId}
          areaId={f.areaId}
          onAreaChange={f.setAreaId}
          onlyAvailableNow={f.onlyAvailableNow}
          onOnlyAvailableChange={f.setOnlyAvailableNow}
          categoryOptions={f.categoryOptions}
          areaOptions={f.areaOptions}
          hasActive={f.hasActiveFilters}
          onReset={f.reset}
        />
      </div>
      {f.filtered.length === 0 ? (
        <div className="animate-fade-in">
          <CatalogEmptyState onAction={f.reset} />
        </div>
      ) : (
        <CatalogGrid items={f.filtered} />
      )}
    </div>
  );
};

export default CatalogoPage;
