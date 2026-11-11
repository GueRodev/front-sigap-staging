import { useMemo } from "react";

import type { FunctionalRole } from "../types/area.types";
import { ROLE_PERMISSIONS } from "../constants/areaType.constants";
import { useAreasStore } from "./useAreasStore";

export const useCurrentMockUser = () => {
  const users = useAreasStore((s) => s.users);
  const currentId = useAreasStore((s) => s.currentMockUserId);
  const setCurrent = useAreasStore((s) => s.setCurrentMockUser);

  const user = useMemo(
    () => users.find((u) => u.id === currentId) ?? users[0],
    [users, currentId],
  );

  const permissions = ROLE_PERMISSIONS[user.functionalRole as FunctionalRole];

  /** True if the user can manage sublocations of the given area (scoped for area_manager). */
  const canManageSublocationsOf = (areaId: number) => {
    if (permissions.sublocations_scope === "all") return true;
    if (permissions.sublocations_scope === "own")
      return user.managedAreaIds.includes(areaId);
    return false;
  };

  return { user, permissions, setCurrentMockUser: setCurrent, canManageSublocationsOf };
};
