import { useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";

import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DataTablePagination from "@/components/shared/DataTablePagination";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

import AddAllowedUserDialog from "../components/AddAllowedUserDialog";
import ChangeAllowedRoleDialog from "../components/ChangeAllowedRoleDialog";
import WhitelistFilters from "../components/WhitelistFilters";
import WhitelistTable from "../components/WhitelistTable";
import { useAllowedUsersList } from "../hooks/useAllowedUsersList";
import { useAllowedUsersMutations } from "../hooks/useAllowedUsersMutations";
import type { AllowedUser, AllowedUserListFilters } from "../types/user.types";

const PeopleWhitelistPage = () => {
  const [filters, setFilters] = useState<AllowedUserListFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [addOpen, setAddOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<AllowedUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AllowedUser | null>(null);

  const list = useAllowedUsersList(filters, { page, pageSize });
  const { addAllowedUser, changeAllowedUserBaseRole, removeAllowedUser, isPending } = useAllowedUsersMutations();

  const updateFilters = (next: AllowedUserListFilters) => {
    setFilters(next);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lista permitida"
        description="Controla qué correos institucionales pueden registrarse y con qué rol base inicial."
        icon={ShieldCheck}
        actions={
          <Button className="bg-sidebar text-sidebar-foreground hover:bg-sidebar/90" onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar usuario
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total permitido</p>
            <p className="mt-2 font-display text-2xl font-bold text-sidebar">{list.totalAll}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Registrados</p>
            <p className="mt-2 font-display text-2xl font-bold text-emerald-700">{list.items.filter((item) => item.registeredAt).length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pendientes</p>
            <p className="mt-2 font-display text-2xl font-bold text-amber-700">{list.items.filter((item) => !item.registeredAt).length}</p>
          </CardContent>
        </Card>
      </div>

      <WhitelistFilters filters={filters} onFiltersChange={updateFilters} />

      <Card className="overflow-hidden border-slate-200">
        <WhitelistTable items={list.items} isLoading={list.isLoading} onChangeRole={setRoleTarget} onDelete={setDeleteTarget} />
        <div className="border-t border-border px-4">
          <DataTablePagination
            page={page}
            pageSize={pageSize}
            total={list.total}
            onPageChange={setPage}
            onPageSizeChange={(next) => {
              setPageSize(next);
              setPage(1);
            }}
            itemLabel="usuarios"
          />
        </div>
      </Card>

      <AddAllowedUserDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        isLoading={isPending}
        onSubmit={async (values) => {
          await addAllowedUser(values);
          toast({ title: "Usuario permitido agregado", description: "El correo ya puede iniciar el proceso de registro." });
        }}
      />

      <ChangeAllowedRoleDialog
        item={roleTarget}
        open={Boolean(roleTarget)}
        onOpenChange={(open) => !open && setRoleTarget(null)}
        isLoading={isPending}
        onSubmit={async (id, baseRole) => {
          await changeAllowedUserBaseRole(id, baseRole);
          toast({ title: "Rol base actualizado", description: "La lista permitida fue actualizada correctamente." });
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar usuario permitido"
        description={`¿Deseas eliminar ${deleteTarget?.email ?? "este correo"} de la lista permitida?`}
        confirmLabel="Eliminar"
        variant="destructive"
        isLoading={isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await removeAllowedUser(deleteTarget.id);
          setDeleteTarget(null);
          toast({ title: "Usuario eliminado", description: "El correo fue removido de la lista permitida." });
        }}
      />
    </div>
  );
};

export default PeopleWhitelistPage;