import { useMemo, useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DataTablePagination from "@/components/shared/DataTablePagination";
import EmptyState from "@/components/shared/EmptyState";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_PAGE_SIZE } from "@/config/app.config";

import AreaCardGrid from "../components/AreaCardGrid";
import AreaDetailDrawer from "../components/AreaDetailDrawer";
import AreaFilters from "../components/AreaFilters";
import AreaFormDrawer from "../components/AreaFormDrawer";
import AreaGroupedByZone from "../components/AreaGroupedByZone";
import AreaTable from "../components/AreaTable";
import DeletedAreasPanel from "../components/DeletedAreasPanel";
import ViewToggle from "../components/ViewToggle";
import { useAreaFilters } from "../hooks/useAreaFilters";
import { useAreaMutations } from "../hooks/useAreaMutations";
import { useAreas, useDeletedAreas } from "../hooks/useAreas";
import { useAreasStore } from "../hooks/useAreasStore";
import { useCurrentMockUser } from "../hooks/useCurrentMockUser";
import type { Area, AreaView } from "../types/area.types";

const AreasPage = () => {
  const { filters, setFilters, reset, hasActive } = useAreaFilters();
  const { items, totalAll } = useAreas(filters);
  const deletedCount = useDeletedAreas().length;
  const equipment = useAreasStore((s) => s.equipment);
  const { permissions } = useCurrentMockUser();
  const { deleteArea, isPending: isDeleting } = useAreaMutations();

  const [view, setView] = useState<AreaView>("cards");
  const [openId, setOpenId] = useState<number | null>(null);
  const [formArea, setFormArea] = useState<Area | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Area | null>(null);
  const [deletedPanel, setDeletedPanel] = useState(false);

  // Pagination for table view
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const equipmentInDeletingArea = deleting
    ? equipment.filter((e) => e.current_area_id === deleting.id).length
    : 0;

  const handleNew = () => {
    setFormArea(null);
    setFormOpen(true);
  };

  const handleEdit = (area: Area) => {
    setFormArea(area);
    setFormOpen(true);
  };

  const handleAssignManager = (area: Area) => {
    setOpenId(area.id);
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    const name = deleting.name;
    await deleteArea(deleting.id);
    toast.success(`"${name}" eliminada`);
    setDeleting(null);
    if (openId === deleting.id) setOpenId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Áreas"
        description="Áreas físicas y operativas de la sede, sus encargados y sublocaciones."
        icon={MapPin}
        actions={
          permissions.manage_areas && (
            <Button
              onClick={handleNew}
              className="font-semibold shadow-[0_0_8px_hsl(var(--sigap-sky)/0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_14px_hsl(var(--sigap-sky)/0.6),0_0_24px_hsl(var(--sigap-sky)/0.3)]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva área
            </Button>
          )
        }
      />

      <AreaFilters filters={filters} onChange={setFilters} onReset={reset} hasActive={hasActive} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{items.length}</span> área{items.length === 1 ? "" : "s"}
          <span className="text-muted-foreground/70"> de {totalAll}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-slate-300"
            onClick={() => setDeletedPanel(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Áreas eliminadas
            {deletedCount > 0 && (
              <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                {deletedCount}
              </span>
            )}
          </Button>
          <ViewToggle value={view} onChange={setView} />
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No se encontraron áreas"
          description={hasActive ? "Probá limpiar los filtros." : "Aún no hay áreas registradas."}
        />
      ) : view === "cards" ? (
        <AreaCardGrid
          items={items}
          onOpen={(a) => setOpenId(a.id)}
          onEdit={handleEdit}
          onDelete={setDeleting}
          onAssignManager={handleAssignManager}
        />
      ) : view === "zones" ? (
        <AreaGroupedByZone
          items={items}
          onOpen={(a) => setOpenId(a.id)}
          onEdit={handleEdit}
          onDelete={setDeleting}
          onAssignManager={handleAssignManager}
        />
      ) : (
        <Card className="border-slate-300 shadow-sm">
          <CardContent className="p-0">
            <AreaTable
              items={paginated}
              onOpen={(a) => setOpenId(a.id)}
              onEdit={handleEdit}
              onDelete={setDeleting}
            />
            <div className="border-t border-slate-300 px-4">
              <DataTablePagination
                page={page}
                pageSize={pageSize}
                total={items.length}
                onPageChange={setPage}
                onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                itemLabel="áreas"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <AreaDetailDrawer
        areaId={openId}
        onOpenChange={(o) => !o && setOpenId(null)}
        onEdit={handleEdit}
        onDelete={setDeleting}
      />

      <AreaFormDrawer open={formOpen} onOpenChange={setFormOpen} area={formArea} />

      <DeletedAreasPanel open={deletedPanel} onOpenChange={setDeletedPanel} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="¿Eliminar esta área?"
        description={
          deleting ? (
            equipmentInDeletingArea > 0 ? (
              <span>
                Esta área tiene <strong>{equipmentInDeletingArea} equipo(s)</strong> asignados.
                Al eliminarla, los equipos se moverán automáticamente a{" "}
                <strong>"Sin Área Asignada"</strong> y quedarán marcados para reasignación.
                Esta acción es reversible: podés restaurar el área más tarde y los equipos
                volverán a ella.
              </span>
            ) : (
              <span>
                Se eliminará <strong>{deleting.name}</strong>. Podrás restaurarla desde
                "Áreas eliminadas".
              </span>
            )
          ) : undefined
        }
        confirmLabel="Eliminar"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default AreasPage;
