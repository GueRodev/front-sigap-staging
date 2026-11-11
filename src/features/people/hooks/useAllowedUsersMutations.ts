import { useState } from "react";

import type { AllowedUserFormValues } from "../schemas/allowedUserSchema";
import type { BaseRole } from "../types/user.types";
import { _allowedUsersStore } from "./useAllowedUsersList";

const nowIso = () => new Date().toISOString();

export const useAllowedUsersMutations = () => {
  const [isPending, setIsPending] = useState(false);

  const addAllowedUser = async (values: AllowedUserFormValues) => {
    // TODO: conectar API para crear usuarios permitidos en backend.
    setIsPending(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    const all = _allowedUsersStore.getAll();
    const nextId = all.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const created = {
      id: nextId,
      email: values.email,
      baseRole: values.baseRole,
      addedById: 1,
      addedByName: "Admin SIGAP",
      registeredAt: null,
      createdAt: nowIso(),
    };
    _allowedUsersStore.setAll([created, ...all]);
    setIsPending(false);
    return created;
  };

  const changeAllowedUserBaseRole = async (id: number, baseRole: BaseRole) => {
    // TODO: conectar API para actualizar rol base en whitelist.
    setIsPending(true);
    await new Promise((resolve) => setTimeout(resolve, 150));
    _allowedUsersStore.setAll(
      _allowedUsersStore.getAll().map((item) => (item.id === id ? { ...item, baseRole } : item)),
    );
    setIsPending(false);
  };

  const removeAllowedUser = async (id: number) => {
    // TODO: conectar API para eliminar usuarios permitidos.
    setIsPending(true);
    await new Promise((resolve) => setTimeout(resolve, 150));
    _allowedUsersStore.setAll(_allowedUsersStore.getAll().filter((item) => item.id !== id));
    setIsPending(false);
  };

  return { addAllowedUser, changeAllowedUserBaseRole, removeAllowedUser, isPending };
};