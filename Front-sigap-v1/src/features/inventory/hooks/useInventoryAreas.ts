import { useMemo } from "react";

import { useAreasStore } from "@/features/areas/hooks/useAreasStore";

import { useInventoriesStore } from "./useInventoriesStore";

/**
 * CRUD-oriented view over the areas of one inventory + helper to suggest an
 * approver for a given area based on `MOCK_USER_AREAS`.
 *
 * `resolveAreaApproverCandidate` returns:
 *  - `{ kind: 'single', userId }`   → exactly one area_manager is assigned
 *  - `{ kind: 'multiple', userIds }` → GAM must pick manually
 *  - `{ kind: 'none' }`              → no manager assigned to the area
 */
export type ApproverCandidate =
  | { kind: "single"; userId: number }
  | { kind: "multiple"; userIds: number[] }
  | { kind: "none" };

export const useInventoryAreas = (inventoryId: number | null | undefined) => {
  const inventoryAreas = useInventoriesStore((s) => s.inventoryAreas);
  const areas = useMemo(
    () =>
      inventoryId == null
        ? []
        : inventoryAreas.filter((a) => a.inventoryId === inventoryId),
    [inventoryAreas, inventoryId],
  );


  const userAreas = useAreasStore((s) => s.userAreas);
  const users = useAreasStore((s) => s.users);

  const resolveAreaApproverCandidate = useMemo(
    () =>
      (areaId: number): ApproverCandidate => {
        const managerIds = userAreas
          .filter((ua) => ua.area_id === areaId)
          .map((ua) => ua.user_id)
          .filter((uid) => {
            const u = users.find((x) => x.id === uid);
            return u?.functionalRole === "area_manager";
          });

        if (managerIds.length === 0) return { kind: "none" };
        if (managerIds.length === 1) return { kind: "single", userId: managerIds[0] };
        return { kind: "multiple", userIds: managerIds };
      },
    [userAreas, users],
  );

  return { areas, resolveAreaApproverCandidate };
};
