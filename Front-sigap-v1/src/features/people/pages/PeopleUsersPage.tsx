import { useState } from "react";
import { UsersRound } from "lucide-react";

import DataTablePagination from "@/components/shared/DataTablePagination";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

import UsersFilters from "../components/UsersFilters";
import UsersTable from "../components/UsersTable";
import { useUsersList } from "../hooks/useUsersList";
import type { UserListFilters } from "../types/user.types";

const PeopleUsersPage = () => {
  const [filters, setFilters] = useState<UserListFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const list = useUsersList(filters, { page, pageSize });

  const updateFilters = (next: UserListFilters) => {
    setFilters(next);
    setPage(1);
  };

  const activeCount = list.items.filter((user) => user.status === "active").length;
  const inactiveCount = list.items.filter((user) => user.status === "inactive").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios registrados"
        description="Consulta perfiles, roles, áreas asignadas y estado operativo de las personas registradas."
        icon={UsersRound}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total registrados</p>
            <p className="mt-2 font-display text-2xl font-bold text-sidebar">{list.totalAll}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Activos filtrados</p>
            <p className="mt-2 font-display text-2xl font-bold text-emerald-700">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Inactivos filtrados</p>
            <p className="mt-2 font-display text-2xl font-bold text-amber-700">{inactiveCount}</p>
          </CardContent>
        </Card>
      </div>

      <UsersFilters filters={filters} onFiltersChange={updateFilters} />

      <Card className="overflow-hidden border-slate-200">
        <UsersTable items={list.items} isLoading={list.isLoading} />
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
    </div>
  );
};

export default PeopleUsersPage;
