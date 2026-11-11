import type { CatalogItem } from "../types/catalog.types";
import EquipmentCatalogCard from "./EquipmentCatalogCard";

/** Retraso escalonado por tarjeta, con tope para listas largas. */
const STAGGER_STEP_S = 0.1;
const STAGGER_MAX_S = 1;

const CatalogGrid = ({ items }: { items: CatalogItem[] }) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {items.map((item, index) => (
      <div
        key={item.id}
        className="flex animate-fade-in flex-col [&>*]:flex-1"
        style={{ animationDelay: `${Math.min(index * STAGGER_STEP_S, STAGGER_MAX_S)}s` }}
      >
        <EquipmentCatalogCard item={item} />
      </div>
    ))}
  </div>
);

export default CatalogGrid;
