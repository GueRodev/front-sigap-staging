import { useCallback } from "react";

import { MOCK_EQUIPMENT } from "@/features/equipment/data/mockEquipment";
import type { Equipment } from "@/features/equipment/types/equipment.types";

export type EquipmentLookupResult =
  | { kind: "found"; equipment: Equipment }
  | { kind: "bulk"; equipment: Equipment }
  | { kind: "not_found" };

/**
 * Lookup by any identifier used in the scanner UX. Bulk equipment
 * (`plate_type === 'bulk'`) is never counted as verifiable stock, but we
 * still surface the hit so the UI can show a targeted warning toast.
 */
export const useEquipmentLookup = () => {
  const lookup = useCallback((rawTerm: string): EquipmentLookupResult => {
    const term = rawTerm.trim().toLowerCase();
    if (!term) return { kind: "not_found" };

    const match = MOCK_EQUIPMENT.find((eq) => {
      const candidates = [
        eq.barcode,
        eq.qr_code_value,
        eq.institutional_plate,
        eq.internal_plate,
        eq.serial_number,
        eq.name,
      ]
        .filter((v): v is string => Boolean(v))
        .map((v) => v.toLowerCase());
      return candidates.some((c) => c === term || c.includes(term));
    });

    if (!match) return { kind: "not_found" };
    if (match.plate_type === "bulk") return { kind: "bulk", equipment: match };
    return { kind: "found", equipment: match };
  }, []);

  return { lookup };
};
