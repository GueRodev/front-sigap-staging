import { useEffect, useState } from "react";

import { mockWhitelist } from "../data/mockWhitelist";
import type {
  AllowedUser,
  AllowedUserListFilters,
  PeopleListPagination,
  PeopleListResult,
} from "../types/user.types";

let store: AllowedUser[] = [...mockWhitelist];
const listeners = new Set<() => void>();

export const _allowedUsersStore = {
  getAll: () => store,
  setAll: (next: AllowedUser[]) => {
    store = next;
    listeners.forEach((listener) => listener());
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

const matchesFilters = (item: AllowedUser, filters: AllowedUserListFilters) => {
  if (filters.baseRole && item.baseRole !== filters.baseRole) return false;
  if (filters.registrationStatus === "registered" && !item.registeredAt) return false;
  if (filters.registrationStatus === "pending" && item.registeredAt) return false;

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    const haystack = [item.email, item.addedByName].filter(Boolean).join(" ").toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  return true;
};

export const useAllowedUsersList = (
  filters: AllowedUserListFilters,
  pagination: PeopleListPagination,
): PeopleListResult<AllowedUser> => {
  // TODO: conectar API para consultar la whitelist de usuarios permitidos.
  const [, setVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = _allowedUsersStore.subscribe(() => setVersion((v) => v + 1));
    return () => unsubscribe();
  }, []);

  const all = _allowedUsersStore.getAll();
  const filtered = all.filter((item) => matchesFilters(item, filters));
  const total = filtered.length;
  const totalAll = all.length;
  const start = (pagination.page - 1) * pagination.pageSize;
  const items = filtered.slice(start, start + pagination.pageSize);

  return { items, total, totalAll, isLoading: false };
};