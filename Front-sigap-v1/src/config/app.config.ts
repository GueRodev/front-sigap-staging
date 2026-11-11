/**
 * Global app configuration.
 * Centralize defaults here so they can be tuned in one place.
 */

export const DEFAULT_CURRENCY = "CRC";

export const DEFAULT_PAGE_SIZE = 10;

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];
