import { useState } from "react";

import type { AreaListFilters } from "../types/area.types";

const EMPTY: AreaListFilters = {};

export const useAreaFilters = (initial: AreaListFilters = EMPTY) => {
  const [filters, setFilters] = useState<AreaListFilters>(initial);

  const reset = () => setFilters(EMPTY);
  const patch = (partial: Partial<AreaListFilters>) =>
    setFilters((prev) => ({ ...prev, ...partial }));

  const hasActive =
    !!filters.search ||
    !!filters.zone ||
    !!filters.withoutManager ||
    !!(filters.types && filters.types.length);

  return { filters, setFilters, patch, reset, hasActive };
};
