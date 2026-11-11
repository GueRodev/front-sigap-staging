import type { Area, Permission, Role, TemporaryPermission } from "./role.types";

export type BaseRole = "student" | "professor" | "administrative";
export type UserStatus = "active" | "inactive";

export interface AllowedUser {
  id: number;
  email: string;
  baseRole: BaseRole;
  addedById: number | null;
  addedByName: string | null;
  registeredAt: string | null;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  firstSurname: string;
  secondSurname: string | null;
  nationalId: string;
  institutionalCode: string | null;
  phone1: string;
  phone2: string | null;
  email: string;
  emailVerifiedAt: string | null;
  status: UserStatus;
  lastLoginAt: string | null;
  deletedAt: string | null;
  roles: Role[];
  directPermissions: Permission[];
  temporaryPermissions: TemporaryPermission[];
  assignedAreas: Area[];
}

export interface UserListFilters {
  search?: string;
  status?: UserStatus;
  baseRole?: BaseRole;
}

export interface AllowedUserListFilters {
  search?: string;
  baseRole?: BaseRole;
  registrationStatus?: "registered" | "pending";
}

export interface PeopleListPagination {
  page: number;
  pageSize: number;
}

export interface PeopleListResult<T> {
  items: T[];
  total: number;
  totalAll: number;
  isLoading: boolean;
}