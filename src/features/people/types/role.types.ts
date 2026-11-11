import type { BaseRole } from "./user.types";

export type RoleType = "base" | "functional";

export interface Role {
  id: number;
  name: string;
  label: string;
  roleType: RoleType;
  compatibleBaseRoles: BaseRole[];
}

export interface Permission {
  id: number;
  name: string;
  label: string;
}

export interface TemporaryPermission {
  id: number;
  permissionName: string;
  permissionLabel: string;
  grantedByName: string;
  expiresAt: string;
}

export interface Area {
  id: number;
  name: string;
}