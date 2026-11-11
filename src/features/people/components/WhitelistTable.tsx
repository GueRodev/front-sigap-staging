import { Pencil, ShieldCheck, Trash2, UserRoundCheck } from "lucide-react";

import EmptyState from "@/components/shared/EmptyState";
import LoadingTable from "@/components/shared/LoadingTable";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { AllowedUser } from "../types/user.types";
import BaseRoleBadge from "./BaseRoleBadge";

interface WhitelistTableProps {
  items: AllowedUser[];
  isLoading?: boolean;
  onChangeRole: (item: AllowedUser) => void;
  onDelete: (item: AllowedUser) => void;
}

const formatDate = (value: string | null) => (value ? new Intl.DateTimeFormat("es-CR").format(new Date(value)) : "Pendiente");

const WhitelistTable = ({ items, isLoading, onChangeRole, onDelete }: WhitelistTableProps) => {
  return (
    <div className="overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-[hsl(var(--sigap-sky)/0.18)] hover:bg-[hsl(var(--sigap-sky)/0.18)]">
            <TableHead className="text-sm font-display font-semibold text-sidebar">Email institucional</TableHead>
            <TableHead className="w-[170px] text-sm font-display font-semibold text-sidebar">Rol base</TableHead>
            <TableHead className="w-[150px] text-sm font-display font-semibold text-sidebar">Registro</TableHead>
            <TableHead className="w-[170px] text-sm font-display font-semibold text-sidebar">Agregado por</TableHead>
            <TableHead className="w-[110px] text-right text-sm font-display font-semibold text-sidebar">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <LoadingTable rows={5} columns={5} />
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="p-0">
                <EmptyState icon={ShieldCheck} title="Sin usuarios permitidos" description="No hay correos que coincidan con los filtros." className="m-4 border-0 bg-transparent" />
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id} className="border-border hover:bg-[hsl(var(--sigap-sky)/0.18)]">
                <TableCell className="py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <UserRoundCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold text-foreground">{item.email}</p>
                      <p className="text-xs text-muted-foreground">Agregado {formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-5"><BaseRoleBadge role={item.baseRole} /></TableCell>
                <TableCell className="py-5 text-sm font-semibold text-muted-foreground">{formatDate(item.registeredAt)}</TableCell>
                <TableCell className="py-5 text-sm font-semibold text-muted-foreground">{item.addedByName ?? "—"}</TableCell>
                <TableCell className="py-5 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:ring-1 hover:ring-primary/30" onClick={() => onChangeRole(item)} aria-label={`Cambiar rol de ${item.email}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive hover:ring-1 hover:ring-destructive/30" onClick={() => onDelete(item)} aria-label={`Eliminar ${item.email}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default WhitelistTable;