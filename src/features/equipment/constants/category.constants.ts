/**
 * Constantes del submódulo Categorías y Tipos (ADR-ACTIVOS-001).
 * Las categorías protegidas provienen del seeder y no se pueden eliminar.
 */

/** Categoría padre (nivel 0) destino de la cascada Toys & Bricks. */
export const UNCATEGORIZED_CATEGORY_ID = 90;

/**
 * Subcategoría (nivel 1) real a la que se reasignan los equipos huérfanos.
 * `equipment.category_id` siempre apunta a nivel 1.
 */
export const GENERAL_CATEGORY_ID = 91;

/** Slug reservado — Mecanismo 3 (visibilidad global de TI). */
export const COMPUTO_SLUG = "computo";

/** IDs que nunca se pueden eliminar ni mover. */
export const PROTECTED_CATEGORY_IDS: readonly number[] = [
  1, // Cómputo
  UNCATEGORIZED_CATEGORY_ID,
  GENERAL_CATEGORY_ID,
];

export const isProtectedCategoryId = (id: number) => PROTECTED_CATEGORY_IDS.includes(id);

/** Genera un slug estable a partir del nombre. */
export const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
