import { useMemo, useState } from "react";
import { ClipboardList, Plus, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DataTablePagination from "@/components/shared/DataTablePagination";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DEFAULT_PAGE_SIZE } from "@/config/app.config";

import EquipmentFilters from "../components/EquipmentFilters";
import EquipmentFormDialog from "../components/EquipmentFormDialog";
import EquipmentTable from "../components/EquipmentTable";
import { useEquipmentList } from "../hooks/useEquipmentList";
import { useEquipmentMutations } from "../hooks/useEquipmentMutations";
import { useEquipmentPermissions } from "../hooks/useEquipmentPermissions";
import type { Equipment, EquipmentListFilters } from "../types/equipment.types";

const EquipmentRegistryPage = () => {
  const [filters, setFilters] = useState<EquipmentListFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);

  const [deleting, setDeleting] = useState<Equipment | null>(null);
  const { removeEquipment, isPending: isRemoving } = useEquipmentMutations();
  const { permissions } = useEquipmentPermissions();
  const canManage = permissions.manage_equipment;

  const pagination = useMemo(() => ({ page, pageSize }), [page, pageSize]);
  const { items, total, totalAll, isLoading } = useEquipmentList(filters, pagination);

  const handleFiltersChange = (next: EquipmentListFilters) => {
    setFilters(next);
    setPage(1);
  };

  const handleNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (equipment: Equipment) => {
    setEditing(equipment);
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    await removeEquipment(deleting.id);
    toast.success(`"${deleting.name}" fue eliminado`);
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registro de Activos"
        description="Gestión y consulta del inventario institucional."
        icon={ClipboardList}
        actions={
          canManage ? (
          <Button
            onClick={handleNew}
            className="font-semibold shadow-[0_0_8px_hsl(var(--sigap-sky)/0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_14px_hsl(var(--sigap-sky)/0.6),0_0_24px_hsl(var(--sigap-sky)/0.3)]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo activo
          </Button>
          ) : null
        }
      />

      <EquipmentFilters filters={filters} onChange={handleFiltersChange} />

      <Card className="border-slate-300 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 rounded-t-lg border-b border-slate-300 bg-white py-4">
          <h2 className="font-display text-lg font-semibold text-sidebar">
            Activos <span className="text-muted-foreground font-normal">({totalAll})</span>
          </h2>
          <Button variant="outline" className="font-semibold border-slate-300">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Columnas
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <EquipmentTable
            items={items}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={setDeleting}
          />

          <div className="border-t border-slate-300 px-4">
            <DataTablePagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              itemLabel="activos"
            />
          </div>
        </CardContent>
      </Card>

      <EquipmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        equipment={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="¿Eliminar este activo?"
        description={
          deleting ? (
            <span>
              Se eliminará <strong>{deleting.name}</strong>. Esta acción no se puede deshacer.
            </span>
          ) : undefined
        }
        confirmLabel="Eliminar"
        variant="destructive"
        isLoading={isRemoving}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default EquipmentRegistryPage;
