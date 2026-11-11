import { useMemo } from "react";

import type { InventoryAreaStatus } from "../types/inventory.types";
import { useInventoriesStore } from "./useInventoriesStore";

/**
 * Loads one inventory + its areas and derives progress signals used by
 * `InventoryDetailPage` (kanban) and the summary cards.
 */
export const useInventory = (inventoryId: number | null | undefined) => {
  const inventories = useInventoriesStore((s) => s.inventories);
  const inventoryAreas = useInventoriesStore((s) => s.inventoryAreas);

  const inventory = useMemo(
    () => (inventoryId == null ? undefined : inventories.find((i) => i.id === inventoryId)),
    [inventories, inventoryId],
  );
  const areas = useMemo(
    () =>
      inventoryId == null
        ? []
        : inventoryAreas.filter((a) => a.inventoryId === inventoryId),
    [inventoryAreas, inventoryId],
  );


  const progress = useMemo(() => {
    const byStatus: Record<InventoryAreaStatus, number> = {
      pendiente: 0,
      en_progreso: 0,
      lista_revision: 0,
      aprobada: 0,
      rechazada: 0,
    };
    for (const a of areas) byStatus[a.status] += 1;

    const totalItems = areas.reduce((n, a) => n + a.itemsCount, 0);
    const totalMismatches = areas.reduce((n, a) => n + a.mismatchesCount, 0);

    return {
      totalAreas: areas.length,
      approvedAreas: byStatus.aprobada,
      byStatus,
      totalItems,
      totalMismatches,
      percentComplete: areas.length
        ? Math.round((byStatus.aprobada / areas.length) * 100)
        : 0,
    };
  }, [areas]);

  return { inventory, areas, progress };
};
