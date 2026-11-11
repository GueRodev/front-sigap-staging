import type { Area } from "@/features/areas/types/area.types";
import type { Equipment, EquipmentCategory } from "@/features/equipment/types/equipment.types";
import { resolveLoanApprovalLevel } from "@/features/equipment/utils/resolveEquipmentPolicy";
import { toLoanApprovalActor } from "@/features/loans/helpers/loanApprovalActor";
import { getActiveLoanForEquipment } from "@/features/loans/helpers/loanQueries";
import type { CatalogItem, CatalogStatus } from "../types/catalog.types";

/** Mapea un equipo visible a su modelo de vista (sin datos financieros). */
export const toCatalogItem = (
  eq: Equipment,
  area: Area,
  categoriesById: Map<number, EquipmentCategory>,
): CatalogItem => {
  const sub = categoriesById.get(eq.category_id);
  const parent = sub?.parent_id != null ? categoriesById.get(sub.parent_id) : sub;
  const status = eq.status as CatalogStatus;
  return {
    id: eq.id,
    name: eq.name,
    brand: eq.brand,
    model: eq.model,
    imageUrl: eq.image_path,
    parentCategoryId: parent?.id ?? null,
    parentCategoryName: parent?.name ?? "General",
    subcategoryName: sub?.name ?? "General",
    areaId: area.id,
    areaName: area.name,
    plateType: eq.plate_type,
    plateLabel: eq.institutional_plate ?? eq.internal_plate ?? null,
    quantityAvailable: eq.plate_type === "bulk" ? eq.quantity_available : null,
    status,
    approvalActor: toLoanApprovalActor(resolveLoanApprovalLevel(eq, area), area.type),
    expectedReturnAt:
      status === "prestado" ? getActiveLoanForEquipment(eq.id)?.expected_return_at ?? null : null,
  };
};
