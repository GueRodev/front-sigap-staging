import { useEffect, useState } from "react";

import { mockUsers } from "../data/mockUsers";
import type {
  PeopleListPagination,
  PeopleListResult,
  User,
  UserListFilters,
} from "../types/user.types";

let store: User[] = [...mockUsers];
const listeners = new Set<() => void>();

export const _usersStore = {
  getAll: () => store,
  setAll: (next: User[]) => {
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

const getBaseRole = (user: User) => user.roles.find((role) => role.roleType === "base")?.name;

const matchesFilters = (user: User, filters: UserListFilters) => {
  if (filters.status && user.status !== filters.status) return false;
  if (filters.baseRole && getBaseRole(user) !== filters.baseRole) return false;

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    const haystack = [
      user.name,
      user.firstSurname,
      user.secondSurname,
      user.nationalId,
      user.institutionalCode,
      user.email,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  return true;
};

export const useUsersList = (
  filters: UserListFilters,
  pagination: PeopleListPagination,
): PeopleListResult<User> => {
  // TODO: conectar API para consultar usuarios del sistema con filtros y paginación.
  const [, setVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = _usersStore.subscribe(() => setVersion((v) => v + 1));
    return () => unsubscribe();
  }, []);

  const all = _usersStore.getAll();
  const filtered = all.filter((item) => matchesFilters(item, filters));
  const total = filtered.length;
  const totalAll = all.length;
  const start = (pagination.page - 1) * pagination.pageSize;
  const items = filtered.slice(start, start + pagination.pageSize);

  return { items, total, totalAll, isLoading: false };
};

export const useUserById = (id: number | undefined) => {
  // TODO: conectar API para consultar detalle de usuario por ID.
  const [, setVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = _usersStore.subscribe(() => setVersion((v) => v + 1));
    return () => unsubscribe();
  }, []);

  return id ? _usersStore.getAll().find((user) => user.id === id) ?? null : null;
};