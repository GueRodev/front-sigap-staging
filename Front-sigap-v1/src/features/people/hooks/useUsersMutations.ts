import { useState } from "react";

import { mockRoles } from "../data/mockRoles";
import type { UserFormValues } from "../schemas/userSchema";
import type { BaseRole, User } from "../types/user.types";
import { _usersStore } from "./useUsersList";

const getBaseRole = (baseRole: BaseRole) => mockRoles.find((role) => role.name === baseRole && role.roleType === "base");

export const useUsersMutations = () => {
  const [isPending, setIsPending] = useState(false);

  const updateProfile = async (id: number, values: UserFormValues) => {
    // TODO: conectar API para actualizar datos de perfil del usuario.
    setIsPending(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    let updated: User | undefined;
    _usersStore.setAll(
      _usersStore.getAll().map((user) => {
        if (user.id !== id) return user;
        updated = { ...user, ...values, secondSurname: values.secondSurname ?? null, institutionalCode: values.institutionalCode ?? null, phone2: values.phone2 ?? null };
        return updated;
      }),
    );
    setIsPending(false);
    return updated;
  };

  const changeBaseRole = async (id: number, baseRole: BaseRole) => {
    // TODO: conectar API para cambiar rol base y recalcular compatibilidad de roles funcionales.
    setIsPending(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    const base = getBaseRole(baseRole);
    _usersStore.setAll(
      _usersStore.getAll().map((user) => {
        if (user.id !== id || !base) return user;
        const functionalRoles = user.roles.filter(
          (role) => role.roleType === "functional" && role.compatibleBaseRoles.includes(baseRole),
        );
        return { ...user, roles: [base, ...functionalRoles] };
      }),
    );
    setIsPending(false);
  };

  const assignFunctionalRole = async (id: number, roleId: number) => {
    // TODO: conectar API para asignar roles funcionales.
    setIsPending(true);
    await new Promise((resolve) => setTimeout(resolve, 180));
    const role = mockRoles.find((item) => item.id === roleId);
    _usersStore.setAll(
      _usersStore.getAll().map((user) => {
        if (user.id !== id || !role || user.roles.some((item) => item.id === role.id)) return user;
        return { ...user, roles: [...user.roles, role] };
      }),
    );
    setIsPending(false);
  };

  const removeFunctionalRole = async (id: number, roleId: number) => {
    // TODO: conectar API para remover roles funcionales.
    setIsPending(true);
    await new Promise((resolve) => setTimeout(resolve, 150));
    _usersStore.setAll(
      _usersStore.getAll().map((user) =>
        user.id === id ? { ...user, roles: user.roles.filter((role) => role.id !== roleId || role.roleType === "base") } : user,
      ),
    );
    setIsPending(false);
  };

  const deleteUser = async (id: number) => {
    // TODO: conectar API para desactivar o eliminar usuario según política institucional.
    setIsPending(true);
    await new Promise((resolve) => setTimeout(resolve, 180));
    _usersStore.setAll(_usersStore.getAll().map((user) => (user.id === id ? { ...user, status: "inactive" } : user)));
    setIsPending(false);
  };

  const setUserStatus = async (id: number, status: "active" | "inactive") => {
    // TODO: conectar API para activar/desactivar usuario.
    setIsPending(true);
    await new Promise((resolve) => setTimeout(resolve, 150));
    _usersStore.setAll(_usersStore.getAll().map((user) => (user.id === id ? { ...user, status } : user)));
    setIsPending(false);
  };

  const anonymizeUser = async (id: number) => {
    // TODO: conectar API para anonimizar datos personales del usuario.
    setIsPending(true);
    await new Promise((resolve) => setTimeout(resolve, 220));
    _usersStore.setAll(
      _usersStore.getAll().map((user) =>
        user.id === id
          ? {
              ...user,
              name: "Usuario",
              firstSurname: "Anonimizado",
              secondSurname: null,
              nationalId: "—",
              institutionalCode: null,
              phone1: "—",
              phone2: null,
              email: `anon-${user.id}@ucr.ac.cr`,
              status: "inactive",
            }
          : user,
      ),
    );
    setIsPending(false);
  };

  return {
    updateProfile,
    changeBaseRole,
    assignFunctionalRole,
    removeFunctionalRole,
    deleteUser,
    setUserStatus,
    anonymizeUser,
    isPending,
  };
};