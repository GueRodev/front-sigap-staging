import { useMemo } from "react";

import { useCurrentMockUser } from "@/features/areas/hooks/useCurrentMockUser";
import { useAreasStore } from "@/features/areas/hooks/useAreasStore";

import type {
  Inventory,
  InventoryListFilters,
} from "../types/inventory.types";
import { useInventoriesStore } from "./useInventoriesStore";

/**
 * Returns the inventories the current mock user can see, plus role-aware
 * derived flags. Follows the visibility matrix documented in the plan:
 * - super_admin / administrative_chief / GAM → all
 * - area_manager → inventories where he owns any area OR is an approver
 * - anyone else (professor, IT, student) → only where he is `assignedTo`
 */
export const useInventories = (filters: InventoryListFilters = {}) => {
  const inventories = useInventoriesStore((s) => s.inventories);
  const inventoryAreas = useInventoriesStore((s) => s.inventoryAreas);
  const userAreas = useAreasStore((s) => s.userAreas);
  const { user } = useCurrentMockUser();

  const visible = useMemo<Inventory[]>(() => {
    const role = user.functionalRole;
    if (
      role === "super_admin" ||
      role === "administrative_chief" ||
      role === "general_assets_manager"
    ) {
      return inventories;
    }

    const areasForUser = new Set(
      userAreas.filter((ua) => ua.user_id === user.id).map((ua) => ua.area_id),
    );

    return inventories.filter((inv) => {
      const rows = inventoryAreas.filter((a) => a.inventoryId === inv.id);
      if (role === "area_manager") {
        return rows.some(
          (r) =>
            r.approverId === user.id ||
            (r.areaId !== null && areasForUser.has(r.areaId)),
        );
      }
      return rows.some((r) => r.assignedTo === user.id);
    });
  }, [inventories, inventoryAreas, user, userAreas]);

  const filtered = useMemo(() => {
    const term = filters.search?.trim().toLowerCase();
    return visible.filter((inv) => {
      if (filters.year && inv.year !== filters.year) return false;
      if (filters.status && inv.status !== filters.status) return false;
      if (filters.scope && inv.scope !== filters.scope) return false;
      if (term) {
        const haystack = `${inv.title} ${inv.description ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [visible, filters.search, filters.year, filters.status, filters.scope]);

  return { inventories: filtered, total: visible.length };
};
