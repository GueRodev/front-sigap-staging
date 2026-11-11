import { MapPin, ShieldCheck } from "lucide-react";
import SpotlightCard from "@/components/shared/SpotlightCard";
import type { CatalogItem } from "../types/catalog.types";
import AddToOrderButton from "./AddToOrderButton";
import AvailabilityBadge from "./AvailabilityBadge";
import EquipmentImage from "./EquipmentImage";
import FavoriteToggle from "./FavoriteToggle";

const EquipmentCatalogCard = ({ item }: { item: CatalogItem }) => {
  const brandModel = [item.brand, item.model].filter(Boolean).join(" · ");

  return (
    <SpotlightCard
      as="article"
      tone="sky"
      intensity="regular"
      spotlightSize={320}
      className="group relative z-0 flex flex-col p-0 transition-all duration-300 ease-out hover:z-10 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow-sky"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[inherit]">
        <EquipmentImage
          src={item.imageUrl}
          alt={item.name}
          parentCategoryName={item.parentCategoryName}
          className="transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        <div className="absolute left-3 top-3">
          <AvailabilityBadge status={item.status} expectedReturnAt={item.expectedReturnAt} />
        </div>
        <div className="absolute right-3 top-3">
          <FavoriteToggle equipmentId={item.id} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold text-foreground">{item.name}</h3>
          {brandModel && <p className="truncate text-xs text-foreground/70">{brandModel}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {item.subcategoryName}
          </span>
          {item.approvalActor === "administrative_chief" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <ShieldCheck className="h-3 w-3" />
              Aprobación de Jefatura
            </span>
          )}
        </div>

        <p className="flex items-center gap-1 text-xs text-foreground/70">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{item.areaName}</span>
        </p>

        {item.plateType === "bulk" ? (
          <p className="text-xs font-semibold text-foreground/70">{item.quantityAvailable} disponibles</p>
        ) : (
          item.plateLabel && <p className="font-mono text-[11px] text-foreground/60">{item.plateLabel}</p>
        )}

        <div className="mt-auto border-t border-white/10 pt-3">
          <AddToOrderButton item={item} />
        </div>
      </div>
    </SpotlightCard>
  );
};

export default EquipmentCatalogCard;
