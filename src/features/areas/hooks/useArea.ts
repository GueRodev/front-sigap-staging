import { useMemo } from "react";

import { useAreasStore } from "./useAreasStore";

/** Single-area lookup helper, with related derived data. */
export const useArea = (id: number | null) => {
  const areas = useAreasStore((s) => s.areas);
  const userAreas = useAreasStore((s) => s.userAreas);
  const users = useAreasStore((s) => s.users);
  const sublocations = useAreasStore((s) => s.sublocations);
  const equipment = useAreasStore((s) => s.equipment);

  return useMemo(() => {
    if (id == null) return null;
    const area = areas.find((a) => a.id === id) ?? null;
    if (!area) return null;

    const managerIds = userAreas.filter((ua) => ua.area_id === id).map((ua) => ua.user_id);
    const managers = users.filter((u) => managerIds.includes(u.id));
    const areaSublocations = sublocations.filter((s) => s.area_id === id);
    const areaEquipment = equipment.filter((e) => e.current_area_id === id);

    return { area, managers, sublocations: areaSublocations, equipment: areaEquipment };
  }, [id, areas, userAreas, users, sublocations, equipment]);
};

/** Manager stack + equipment count helpers for cards/table rows. */
export const useAreaDerived = () => {
  const userAreas = useAreasStore((s) => s.userAreas);
  const users = useAreasStore((s) => s.users);
  const sublocations = useAreasStore((s) => s.sublocations);
  const equipment = useAreasStore((s) => s.equipment);

  return useMemo(() => {
    const managersByArea = new Map<number, typeof users>();
    userAreas.forEach((ua) => {
      const u = users.find((x) => x.id === ua.user_id);
      if (!u) return;
      const list = managersByArea.get(ua.area_id) ?? [];
      list.push(u);
      managersByArea.set(ua.area_id, list);
    });

    const equipmentCountByArea = new Map<number, number>();
    equipment.forEach((e) => {
      equipmentCountByArea.set(
        e.current_area_id,
        (equipmentCountByArea.get(e.current_area_id) ?? 0) + 1,
      );
    });

    const sublocationCountByArea = new Map<number, number>();
    sublocations.forEach((s) => {
      sublocationCountByArea.set(s.area_id, (sublocationCountByArea.get(s.area_id) ?? 0) + 1);
    });

    return {
      managersOf: (areaId: number) => managersByArea.get(areaId) ?? [],
      equipmentCountOf: (areaId: number) => equipmentCountByArea.get(areaId) ?? 0,
      sublocationCountOf: (areaId: number) => sublocationCountByArea.get(areaId) ?? 0,
    };
  }, [userAreas, users, sublocations, equipment]);
};
