import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Lock,
  Play,
  ScanBarcode,
} from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { useAreasStore } from "@/features/areas/hooks/useAreasStore";
import { useCurrentMockUser } from "@/features/areas/hooks/useCurrentMockUser";

import InventoryAreaCard from "../components/InventoryAreaCard";
import InventoryStatusBadge from "../components/InventoryStatusBadge";
import SubmitForReviewModal from "../components/modals/SubmitForReviewModal";
import {
  INVENTORY_AREA_STATUS_LABELS,
  INVENTORY_ROLE_PERMISSIONS,
  KANBAN_COLUMN_ORDER,
} from "../constants/inventory.constants";
import { useInventoriesStore } from "../hooks/useInventoriesStore";
import { useInventory } from "../hooks/useInventory";
import { useInventoryMutations } from "../hooks/useInventoryMutations";
import type { InventoryArea, InventoryAreaStatus } from "../types/inventory.types";

const InventoryDetailPage = () => {
  const params = useParams<{ id: string }>();
  const inventoryId = params.id ? Number(params.id) : null;
  const navigate = useNavigate();
  const { user } = useCurrentMockUser();
  const perms = INVENTORY_ROLE_PERMISSIONS[user.functionalRole];
  const { inventory, areas, progress } = useInventory(inventoryId);
  const { startArea, closeInventory } = useInventoryMutations();
  const sourceAreas = useAreasStore((s) => s.areas);
  const allIncidents = useInventoriesStore((s) => s.incidents);
  const allInventoryItems = useInventoriesStore((s) => s.inventoryItems);
  const incidents = useMemo(
    () =>
      allIncidents.filter((i) => {
        const relatedItem = i.inventoryItemId
          ? allInventoryItems.find((it) => it.id === i.inventoryItemId)
          : null;
        return relatedItem?.inventoryId === inventoryId;
      }),
    [allIncidents, allInventoryItems, inventoryId],
  );


  const [submitAreaTarget, setSubmitAreaTarget] = useState<InventoryArea | null>(null);
  const [closeOpen, setCloseOpen] = useState(false);

  const grouped = useMemo(() => {
    const map: Record<InventoryAreaStatus, InventoryArea[]> = {
      pendiente: [],
      en_progreso: [],
      lista_revision: [],
      aprobada: [],
      rechazada: [],
    };
    for (const a of areas) map[a.status].push(a);
    return map;
  }, [areas]);

  if (!inventory) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/admin/activos/inventario")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <EmptyState title="Levantamiento no encontrado" />
      </div>
    );
  }

  const canClose =
    perms.finalizeInventory &&
    progress.totalAreas > 0 &&
    progress.approvedAreas === progress.totalAreas &&
    inventory.status !== "completado" &&
    inventory.status !== "cancelado";

  const isAssignedTo = (a: InventoryArea) => a.assignedTo === user.id;
  const isApproverOf = (a: InventoryArea) => a.approverId === user.id;

  const contextualAction = (a: InventoryArea) => {
    switch (a.status) {
      case "pendiente":
        if (perms.executeInventoryScan && (perms.scanScope === "all" || isAssignedTo(a))) {
          return (
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={(e) => {
                e.stopPropagation();
                startArea(a.id);
                navigate(`/admin/activos/inventario/${inventory.id}/session?area=${a.id}`);
              }}
            >
              <Play className="h-3.5 w-3.5" /> Iniciar
            </Button>
          );
        }
        return null;
      case "en_progreso":
      case "rechazada":
        if (perms.executeInventoryScan && (perms.scanScope === "all" || isAssignedTo(a))) {
          return (
            <div className="flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/activos/inventario/${inventory.id}/session?area=${a.id}`);
                }}
              >
                <ScanBarcode className="h-3.5 w-3.5" /> Escanear
              </Button>
              {a.itemsCount > 0 && (
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSubmitAreaTarget(a);
                  }}
                >
                  <ClipboardCheck className="h-3.5 w-3.5" /> Enviar
                </Button>
              )}
            </div>
          );
        }
        return null;
      case "lista_revision":
        if (perms.approveAreaInventory && (isApproverOf(a) || perms.scanScope === "all")) {
          return (
            <Button
              size="sm"
              className="gap-1"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/activos/inventario/${inventory.id}/areas/${a.id}/review`);
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Revisar
            </Button>
          );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/admin/activos/inventario")} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Button>

      <PageHeader
        title={inventory.title}
        description={inventory.description ?? `Levantamiento ${inventory.year}`}
        actions={
          <div className="flex items-center gap-3">
            <InventoryStatusBadge status={inventory.status} />
            {canClose && (
              <Button onClick={() => setCloseOpen(true)} className="gap-2">
                <Lock className="h-4 w-4" /> Cerrar levantamiento
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-glass bg-white/60 p-4 backdrop-blur dark:bg-white/5 sm:col-span-2">
          <p className="text-xs text-muted-foreground">Progreso</p>
          <p className="mt-1 font-display text-2xl font-semibold">
            {progress.approvedAreas}/{progress.totalAreas} áreas aprobadas
          </p>
          <Progress value={progress.percentComplete} className="mt-2 h-1.5" />
        </div>
        <div className="rounded-lg border border-glass bg-white/60 p-4 backdrop-blur dark:bg-white/5">
          <p className="text-xs text-muted-foreground">Ítems verificados</p>
          <p className="mt-1 font-display text-2xl font-semibold">{progress.totalItems}</p>
        </div>
        <div className="rounded-lg border border-glass bg-white/60 p-4 backdrop-blur dark:bg-white/5">
          <p className="text-xs text-muted-foreground">Discrepancias</p>
          <p
            className={cn(
              "mt-1 font-display text-2xl font-semibold",
              progress.totalMismatches > 0 && "text-amber-600 dark:text-amber-400",
            )}
          >
            {progress.totalMismatches}
          </p>
        </div>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {KANBAN_COLUMN_ORDER.map((status) => (
          <div
            key={status}
            className="flex min-h-[200px] flex-col gap-2 rounded-lg border border-glass bg-muted/20 p-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{INVENTORY_AREA_STATUS_LABELS[status]}</h3>
              <span className="text-xs text-muted-foreground">{grouped[status].length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {grouped[status].length === 0 ? (
                <p className="text-xs italic text-muted-foreground">Vacío</p>
              ) : (
                grouped[status].map((a) => {
                  const areaName = sourceAreas.find((x) => x.id === a.areaId)?.name ?? `Área #${a.areaId}`;
                  return (
                    <InventoryAreaCard
                      key={a.id}
                      area={a}
                      onClick={() =>
                        navigate(`/admin/activos/inventario/${inventory.id}/areas/${a.id}/review`)
                      }
                      actions={contextualAction(a)}
                      footerNote={
                        a.status === "rechazada" && a.rejectionReason ? (
                          <div className="rounded-md bg-destructive/10 px-2 py-1 text-[11px] text-destructive">
                            <span className="font-semibold">Motivo:</span> {a.rejectionReason}
                          </div>
                        ) : a.status === "aprobada" ? (
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                            Aprobada · {areaName}
                          </p>
                        ) : null
                      }
                    />
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Incidents */}
      {incidents.length > 0 && (
        <div className="rounded-lg border border-glass bg-white/60 p-4 backdrop-blur dark:bg-white/5">
          <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Incidencias reportadas ({incidents.length})
          </h3>
          <ul className="space-y-2">
            {incidents.map((i) => (
              <li key={i.id} className="rounded-md border border-border bg-muted/20 p-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{i.incidentType.replace(/_/g, " ")}</span>
                  <span className="text-muted-foreground">
                    {new Date(i.createdAt).toLocaleDateString("es-CR")} · {i.severity}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">{i.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {submitAreaTarget && (
        <SubmitForReviewModal
          open={!!submitAreaTarget}
          onOpenChange={(o) => !o && setSubmitAreaTarget(null)}
          inventoryArea={submitAreaTarget}
          areaName={sourceAreas.find((x) => x.id === submitAreaTarget.areaId)?.name ?? "Área"}
        />
      )}

      <ConfirmDialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        title="Cerrar levantamiento"
        description="El levantamiento se marcará como Completado. Esta acción no se puede deshacer."
        confirmLabel="Cerrar"
        onConfirm={() => {
          closeInventory(inventory.id, user.id);
          toast.success("Levantamiento cerrado");
          setCloseOpen(false);
        }}
      />
    </div>
  );
};

export default InventoryDetailPage;
