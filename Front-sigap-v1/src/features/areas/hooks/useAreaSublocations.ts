import { useMemo } from "react";

import { useAreasStore } from "./useAreasStore";

export const useAreaSublocations = (areaId: number | null) => {
  const sublocations = useAreasStore((s) => s.sublocations);
  return useMemo(
    () => (areaId == null ? [] : sublocations.filter((s) => s.area_id === areaId)),
    [sublocations, areaId],
  );
};
