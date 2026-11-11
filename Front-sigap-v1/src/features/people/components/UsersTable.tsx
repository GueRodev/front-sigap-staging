import { Pencil, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import EmptyState from "@/components/shared/EmptyState";
import LoadingTable from "@/components/shared/LoadingTable";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { BaseRole, User } from "../types/user.types";
import BaseRoleBadge from "./BaseRoleBadge";
import UserStatusBadge from "./UserStatusBadge";

interface UsersTableProps {
  items: User[];
  isLoading?: boolean;
}

const fullName = (user: User) => [user.name, user.firstSurname, user.secondSurname].filter(Boolean).join(" ");
const getBaseRole = (user: User) => user.roles.find((role) => role.roleType === "base")?.name as BaseRole | undefined;
const formatDateTime = (value: string | null) => (value ? new Intl.DateTimeFormat("es-CR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—");

const UsersTable = ({ items, isLoading }: UsersTableProps) => {
  return (
    <div className="overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-[hsl(var(--sigap-sky)/0.18)] hover:bg-[hsl(var(--sigap-sky)/0.18)]">
            <TableHead className="text-sm font-display font-semibold text-sidebar">Persona</TableHead>
            <TableHead className="w-[170px] text-sm font-display font-semibold text-sidebar">Rol base</TableHead>
            <TableHead className="w-[140px] text-sm font-display font-semibold text-sidebar">Estado</TableHead>
            <TableHead className="w-[180px] text-sm font-display font-semibold text-sidebar">Último ingreso</TableHead>
            <TableHead className="w-[160px] text-sm font-display font-semibold text-sidebar">Áreas</TableHead>
            <TableHead className="w-[100px] text-right text-sm font-display font-semibold text-sidebar">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <LoadingTable rows={5} columns={6} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="p-0">
                <EmptyState icon={UserRound} title="Sin usuarios" description="No se encontraron personas con los filtros aplicados." className="m-4 border-0 bg-transparent" />
              </TableCell>
            </TableRow>
          ) : (
            items.map((user) => {
              const baseRole = getBaseRole(user);
              return (
                <TableRow key={user.id} className="border-border hover:bg-[hsl(var(--sigap-sky)/0.18)]">
                  <TableCell className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold text-foreground">{fullName(user)}</p>
                        <p className="text-xs font-medium text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">{baseRole ? <BaseRoleBadge role={baseRole} /> : "—"}</TableCell>
                  <TableCell className="py-5"><UserStatusBadge status={user.status} /></TableCell>
                  <TableCell className="py-5 text-sm font-semibold text-muted-foreground">{formatDateTime(user.lastLoginAt)}</TableCell>
                  <TableCell className="py-5 text-sm font-semibold text-muted-foreground">{user.assignedAreas.length || "—"}</TableCell>
                  <TableCell className="py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:ring-1 hover:ring-primary/30"
                      >
                        <Link to={`/admin/usuarios/${user.id}`} aria-label={`Editar ${fullName(user)}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
