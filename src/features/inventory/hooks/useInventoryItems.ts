import { useMemo } from "react";

import { useInventoriesStore } from "./useInventoriesStore";

/** Items of one inventoryArea, freshest first. */
export const useInventoryItems = (inventoryAreaId: number | null | undefined) => {
  const inventoryItems = useInventoriesStore((s) => s.inventoryItems);

  return useMemo(
    () =>
      (inventoryAreaId == null
        ? []
        : inventoryItems.filter((it) => it.inventoryAreaId === inventoryAreaId)
      ).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    [inventoryItems, inventoryAreaId],
  );

};
