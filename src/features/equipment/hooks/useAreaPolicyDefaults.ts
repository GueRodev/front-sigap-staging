import { useMemo } from "react";

import { useAreasStore } from "@/features/areas/hooks/useAreasStore";

import type { PolicyArea } from "../utils/resolveEquipmentPolicy";

/**
 * Devuelve los defaults del Patrón 6 del área indicada (o `null` si el área
 * no existe en el store). Se usa para mostrar el valor heredado en el
 * formulario de Activos.
 */
export const useAreaPolicyDefaults = (areaId: number | null | undefined): PolicyArea | null => {
  const areas = useAreasStore((s) => s.areas);

  return useMemo(() => {
    if (areaId == null) return null;
    const area = areas.find((a) => a.id === areaId);
    if (!area) return null;
    return {
      default_is_loanable: area.default_is_loanable,
      default_is_publicly_visible: area.default_is_publicly_visible,
      default_loan_approval_level: area.default_loan_approval_level,
      default_transfer_requires_approval: area.default_transfer_requires_approval,
      default_transfer_approval_level: area.default_transfer_approval_level,
    };
  }, [areas, areaId]);
};
