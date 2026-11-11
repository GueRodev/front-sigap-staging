import { create } from "zustand";

import type {
  Area,
  AreaEquipment,
  AreaSublocation,
  AreaUser,
  UserAreaAssignment,
} from "../types/area.types";
import { UNASSIGNED_AREA_ID } from "../constants/areaType.constants";
import { MOCK_AREAS, MOCK_SUBLOCATIONS, MOCK_USER_AREAS } from "../data/mockAreas";
import { getAllAreaEquipment } from "../data/mockAreaEquipment";
import { DEFAULT_MOCK_USER_ID, MOCK_AREA_USERS } from "../data/mockUsers";

interface AreasState {
  areas: Area[];
  users: AreaUser[];
  userAreas: UserAreaAssignment[];
  sublocations: AreaSublocation[];
  equipment: AreaEquipment[];
  currentMockUserId: number;

  setCurrentMockUser: (id: number) => void;

  addArea: (area: Area) => void;
  updateArea: (id: number, patch: Partial<Area>) => void;
  softDeleteArea: (id: number) => void;
  restoreArea: (id: number) => void;

  assignUser: (userId: number, areaId: number) => void;
  unassignUser: (userId: number, areaId: number) => void;

  addSublocation: (areaId: number, name: string) => void;
  removeSublocation: (id: number) => void;

  moveEquipmentToUnassigned: (fromAreaId: number) => void;
  restoreEquipmentToArea: (areaId: number) => void;
}

export const useAreasStore = create<AreasState>((set) => ({
  areas: MOCK_AREAS,
  users: MOCK_AREA_USERS,
  userAreas: MOCK_USER_AREAS,
  sublocations: MOCK_SUBLOCATIONS,
  equipment: getAllAreaEquipment(),
  currentMockUserId: DEFAULT_MOCK_USER_ID,

  setCurrentMockUser: (id) => set({ currentMockUserId: id }),

  addArea: (area) => set((s) => ({ areas: [...s.areas, area] })),

  updateArea: (id, patch) =>
    set((s) => ({
      areas: s.areas.map((a) =>
        a.id === id ? { ...a, ...patch, updated_at: new Date().toISOString() } : a,
      ),
    })),

  softDeleteArea: (id) =>
    set((s) => ({
      areas: s.areas.map((a) =>
        a.id === id ? { ...a, deletedAt: new Date().toISOString() } : a,
      ),
      // remove user assignments for this area
      userAreas: s.userAreas.filter((ua) => ua.area_id !== id),
    })),

  restoreArea: (id) =>
    set((s) => ({
      areas: s.areas.map((a) => (a.id === id ? { ...a, deletedAt: null } : a)),
    })),

  assignUser: (userId, areaId) =>
    set((s) =>
      s.userAreas.some((ua) => ua.user_id === userId && ua.area_id === areaId)
        ? s
        : { userAreas: [...s.userAreas, { user_id: userId, area_id: areaId }] },
    ),

  unassignUser: (userId, areaId) =>
    set((s) => ({
      userAreas: s.userAreas.filter(
        (ua) => !(ua.user_id === userId && ua.area_id === areaId),
      ),
    })),

  addSublocation: (areaId, name) =>
    set((s) => {
      const nextId = s.sublocations.reduce((m, x) => Math.max(m, x.id), 0) + 1;
      return { sublocations: [...s.sublocations, { id: nextId, area_id: areaId, name }] };
    }),

  removeSublocation: (id) =>
    set((s) => ({ sublocations: s.sublocations.filter((x) => x.id !== id) })),

  moveEquipmentToUnassigned: (fromAreaId) =>
    set((s) => ({
      equipment: s.equipment.map((e) =>
        e.current_area_id === fromAreaId
          ? {
              ...e,
              current_area_id: UNASSIGNED_AREA_ID,
              original_area_id: fromAreaId,
              sublocation: null,
            }
          : e,
      ),
    })),

  restoreEquipmentToArea: (areaId) =>
    set((s) => ({
      equipment: s.equipment.map((e) =>
        e.original_area_id === areaId && e.current_area_id === UNASSIGNED_AREA_ID
          ? { ...e, current_area_id: areaId, original_area_id: null }
          : e,
      ),
    })),
}));
