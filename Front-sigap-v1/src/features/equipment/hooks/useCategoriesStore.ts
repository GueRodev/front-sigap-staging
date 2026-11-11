import { create } from "zustand";

import type { EquipmentCategory, EquipmentType } from "../types/equipment.types";
import {
  GENERAL_CATEGORY_ID,
  isProtectedCategoryId,
  slugify,
} from "../constants/category.constants";
import { MOCK_CATEGORIES, MOCK_EQUIPMENT_TYPES } from "../data/mockEquipment";
import { _equipmentStore } from "./useEquipmentList";

/**
 * Submódulo Categorías y Tipos (ADR-ACTIVOS-001) — store mock en memoria.
 *
 * Cascada Toys & Bricks:
 * - Al soft-deletear una subcategoría se soft-deletean sus tipos y sus equipos
 *   se reasignan a `General`, guardando `original_category_id`.
 * - Al restaurar se revierte SOLO lo que nadie reasignó manualmente:
 *   `original_category_id === subcategoria.id` **y** `category_id === General`.
 * - Las categorías protegidas del seeder no se pueden eliminar.
 */

const nowIso = () => new Date().toISOString();

interface CategoriesState {
  categories: EquipmentCategory[];
  types: EquipmentType[];

  createCategory: (input: {
    name: string;
    parent_id: number | null;
    description?: string | null;
  }) => void;
  updateCategory: (id: number, patch: Partial<Pick<EquipmentCategory, "name" | "description" | "order">>) => void;
  softDeleteCategory: (id: number) => void;
  restoreCategory: (id: number) => void;

  createType: (input: { name: string; category_id: number; description?: string | null }) => void;
  updateType: (id: number, patch: Partial<Pick<EquipmentType, "name" | "description">>) => void;
  softDeleteType: (id: number) => void;
  restoreType: (id: number) => void;
}

/** Reasigna a `General` los equipos de las subcategorías dadas. */
const cascadeEquipmentToGeneral = (categoryIds: number[]) => {
  if (categoryIds.length === 0) return;
  _equipmentStore.setAll(
    _equipmentStore.getAll().map((e) =>
      categoryIds.includes(e.category_id)
        ? {
            ...e,
            original_category_id: e.category_id,
            category_id: GENERAL_CATEGORY_ID,
            updated_at: nowIso(),
          }
        : e,
    ),
  );
};

/**
 * Devuelve los equipos a su subcategoría original.
 * Misma regla usada para `original_area_id` en Áreas: sólo vuelve el equipo que
 * nadie reasignó manualmente mientras estuvo huérfano.
 */
const restoreEquipmentToCategory = (categoryId: number) => {
  _equipmentStore.setAll(
    _equipmentStore.getAll().map((e) =>
      e.original_category_id === categoryId && e.category_id === GENERAL_CATEGORY_ID
        ? { ...e, category_id: categoryId, original_category_id: null, updated_at: nowIso() }
        : e,
    ),
  );
};

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [...MOCK_CATEGORIES],
  types: [...MOCK_EQUIPMENT_TYPES],

  createCategory: ({ name, parent_id, description = null }) =>
    set((s) => {
      const nextId = s.categories.reduce((m, c) => Math.max(m, c.id), 0) + 1;
      const level: 0 | 1 = parent_id == null ? 0 : 1;
      const siblings = s.categories.filter((c) => c.parent_id === parent_id);
      return {
        categories: [
          ...s.categories,
          {
            id: nextId,
            name,
            parent_id,
            level,
            slug: slugify(name),
            description,
            is_protected: false,
            order: siblings.length + 1,
            deleted_at: null,
          },
        ],
      };
    }),

  updateCategory: (id, patch) =>
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === id
          ? { ...c, ...patch, slug: patch.name ? slugify(patch.name) : c.slug }
          : c,
      ),
    })),

  softDeleteCategory: (id) => {
    const { categories } = get();
    const target = categories.find((c) => c.id === id);
    if (!target || isProtectedCategoryId(id)) return;

    // Una categoría padre arrastra a todas sus subcategorías.
    const affected =
      target.level === 0
        ? [target, ...categories.filter((c) => c.parent_id === id && !c.deleted_at)]
        : [target];
    const affectedIds = affected.map((c) => c.id);
    const subcategoryIds = affected.filter((c) => c.level === 1).map((c) => c.id);
    const stamp = nowIso();

    set((s) => ({
      categories: s.categories.map((c) =>
        affectedIds.includes(c.id) ? { ...c, deleted_at: stamp } : c,
      ),
      types: s.types.map((t) =>
        subcategoryIds.includes(t.category_id) && !t.deleted_at ? { ...t, deleted_at: stamp } : t,
      ),
    }));

    cascadeEquipmentToGeneral(subcategoryIds);
  },

  restoreCategory: (id) => {
    const { categories } = get();
    const target = categories.find((c) => c.id === id);
    if (!target) return;

    const affected =
      target.level === 0
        ? [target, ...categories.filter((c) => c.parent_id === id && c.deleted_at === target.deleted_at)]
        : [target];
    const affectedIds = affected.map((c) => c.id);
    const subcategoryIds = affected.filter((c) => c.level === 1).map((c) => c.id);

    set((s) => ({
      categories: s.categories.map((c) =>
        affectedIds.includes(c.id) ? { ...c, deleted_at: null } : c,
      ),
      types: s.types.map((t) =>
        subcategoryIds.includes(t.category_id) ? { ...t, deleted_at: null } : t,
      ),
    }));

    subcategoryIds.forEach(restoreEquipmentToCategory);
  },

  createType: ({ name, category_id, description = null }) =>
    set((s) => {
      const nextId = s.types.reduce((m, t) => Math.max(m, t.id), 0) + 1;
      return {
        types: [...s.types, { id: nextId, name, category_id, description, deleted_at: null }],
      };
    }),

  updateType: (id, patch) =>
    set((s) => ({ types: s.types.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

  softDeleteType: (id) =>
    set((s) => ({
      types: s.types.map((t) => (t.id === id ? { ...t, deleted_at: nowIso() } : t)),
    })),

  restoreType: (id) =>
    set((s) => ({ types: s.types.map((t) => (t.id === id ? { ...t, deleted_at: null } : t)) })),
}));
