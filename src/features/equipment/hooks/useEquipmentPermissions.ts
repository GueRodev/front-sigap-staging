import { useMemo } from "react";

import { useCurrentMockUser } from "@/features/areas/hooks/useCurrentMockUser";
import type { FunctionalRole } from "@/features/areas/types/area.types";

import { isComputoEquipment } from "../data/mockEquipment";
import {
  EQUIPMENT_ROLE_PERMISSIONS,
  type EquipmentPermissions,
} from "../constants/permissions.constants";
import type { Equipment } from "../types/equipment.types";

/**
 * Permisos efectivos del módulo de Activos para el usuario mock activo.
 * Ver `constants/permissions.constants.ts` para la nota de field-level authorization.
 */
export const useEquipmentPermissions = () => {
  const { user } = useCurrentMockUser();

  const permissions: EquipmentPermissions =
    EQUIPMENT_ROLE_PERMISSIONS[user.functionalRole as FunctionalRole];

  return useMemo(() => {
    /** Mecanismo 3 + alcance por área / asignación personal. */
    const canView = (equipment: Equipment): boolean => {
      if (permissions.computo_global_visibility && isComputoEquipment(equipment.category_id)) {
        return true;
      }
      if (permissions.scope === "all") return true;
      if (permissions.scope === "own_areas") {
        return user.managedAreaIds.includes(equipment.current_area_id);
      }
      return equipment.assigned_to_user_id === user.id;
    };

    /** Enmascara los campos financieros cuando el rol no puede verlos. */
    const sanitize = (equipment: Equipment): Equipment =>
      permissions.view_equipment_financial_fields
        ? equipment
        : {
            ...equipment,
            acquisition_cost: null,
            purchase_order_number: null,
            invoice_number: null,
          };

    return { user, permissions, canView, sanitize };
  }, [permissions, user]);
};
