import { useMemo, useState } from "react";
import { Pencil, Plus, ShieldAlert, Trash2, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { FUNCTIONAL_ROLE_LABEL, LOAN_APPROVAL_OPTIONS, TRANSFER_APPROVAL_OPTIONS } from "../constants/areaType.constants";
import { useArea } from "../hooks/useArea";
import { useAreaMutations } from "../hooks/useAreaMutations";
import { useAreasStore } from "../hooks/useAreasStore";
import { useCurrentMockUser } from "../hooks/useCurrentMockUser";
import type { Area } from "../types/area.types";
import AreaTypeBadge from "./AreaTypeBadge";
import SublocationsList from "./SublocationsList";

interface AreaDetailDrawerProps {
  areaId: number | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (area: Area) => void;
  onDelete: (area: Area) => void;
}

const yesNo = (v: boolean) => (v ? "Sí" : "No");
const loanLabel = (v: string) =>
  LOAN_APPROVAL_OPTIONS.find((o) => o.value === v)?.label ?? v;
const transferLabel = (v: string) =>
  TRANSFER_APPROVAL_OPTIONS.find((o) => o.value === v)?.label ?? v;

const AreaDetailDrawer = ({ areaId, onOpenChange, onEdit, onDelete }: AreaDetailDrawerProps) => {
  const detail = useArea(areaId);
  const users = useAreasStore((s) => s.users);
  const { permissions, canManageSublocationsOf } = useCurrentMockUser();
  const { assignManager, removeManager } = useAreaMutations();

  const [pendingRemoveUserId, setPendingRemoveUserId] = useState<number | null>(null);
  const [assignUserId, setAssignUserId] = useState<string>("");

  const availableToAssign = useMemo(() => {
    if (!detail) return [];
    const assignedIds = new Set(detail.managers.map((m) => m.id));
    return users.filter((u) => !assignedIds.has(u.id));
  }, [users, detail]);

  if (!detail) return null;
  const { area, managers, sublocations, equipment } = detail;
  const canManageArea = permissions.manage_areas && !area.is_protected;
  const canManageSublocs = canManageSublocationsOf(area.id) && !area.is_protected;
  const removingUser = users.find((u) => u.id === pendingRemoveUserId) ?? null;

  return (
    <Sheet open={!!areaId} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="space-y-3 border-b border-border px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate font-display text-lg font-semibold text-foreground">
                  {area.name}
                </h2>
                <AreaTypeBadge type={area.type} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {area.zone ? `Zona ${area.zone}` : "Sin zona"}
                {area.building && ` · ${area.building}`}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {area.is_protected ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="gap-1 border-amber-400 text-amber-700 dark:text-amber-400">
                        <ShieldAlert className="h-3 w-3" />
                        Protegida
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      Destino automático de equipos cuya área fue eliminada. No se puede editar ni borrar.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                canManageArea && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => onEdit(area)}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(area)}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Eliminar
                    </Button>
                  </>
                )
              )}
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="info" className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4 grid w-auto grid-cols-4">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="managers">Encargados</TabsTrigger>
            <TabsTrigger value="sublocations">Sublocaciones</TabsTrigger>
            <TabsTrigger value="equipment">Equipos</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <TabsContent value="info" className="mt-0 space-y-4">
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Prestable por defecto</dt>
                  <dd className="text-sm text-foreground">{yesNo(area.default_is_loanable)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Visible al público</dt>
                  <dd className="text-sm text-foreground">{yesNo(area.default_is_publicly_visible)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Aprobación de préstamo</dt>
                  <dd className="text-sm text-foreground">{loanLabel(area.default_loan_approval_level)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Traslado requiere aprobación</dt>
                  <dd className="text-sm text-foreground">{yesNo(area.default_transfer_requires_approval)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Nivel de aprobación de traslado</dt>
                  <dd className="text-sm text-foreground">{transferLabel(area.default_transfer_approval_level)}</dd>
                </div>
              </dl>
              {area.description && (
                <div className="rounded-md border border-border bg-muted/30 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Descripción</p>
                  <p className="mt-1 text-sm text-foreground">{area.description}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="managers" className="mt-0 space-y-3">
              {permissions.assign_user_areas && !area.is_protected && availableToAssign.length > 0 && (
                <div className="flex items-center gap-2">
                  <Select value={assignUserId} onValueChange={setAssignUserId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar usuario a asignar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableToAssign.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.name} · {FUNCTIONAL_ROLE_LABEL[u.functionalRole]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    disabled={!assignUserId}
                    onClick={async () => {
                      await assignManager(Number(assignUserId), area.id);
                      toast.success("Encargado asignado");
                      setAssignUserId("");
                    }}
                  >
                    <UserPlus className="mr-1.5 h-4 w-4" />
                    Asignar
                  </Button>
                </div>
              )}

              {managers.length === 0 ? (
                <EmptyState icon={Users} title="Sin encargados" description="Ningún usuario está asignado a esta área." />
              ) : (
                <ul className="space-y-2">
                  {managers.map((u) => (
                    <li
                      key={u.id}
                      className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-sigap-sky/20 text-xs font-semibold text-sigap-dark dark:text-sigap-sky">
                          {u.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{u.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {FUNCTIONAL_ROLE_LABEL[u.functionalRole]} · {u.email}
                        </p>
                      </div>
                      {permissions.assign_user_areas && !area.is_protected && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setPendingRemoveUserId(u.id)}
                        >
                          <X className="mr-1 h-3.5 w-3.5" />
                          Quitar
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="sublocations" className="mt-0">
              <SublocationsList
                areaId={area.id}
                sublocations={sublocations}
                canManage={canManageSublocs}
              />
              {!canManageSublocs && sublocations.length === 0 && !area.is_protected && (
                <p className="mt-3 text-xs text-muted-foreground">
                  No tenés permisos para gestionar sublocaciones aquí.
                </p>
              )}
            </TabsContent>

            <TabsContent value="equipment" className="mt-0">
              {equipment.length === 0 ? (
                <EmptyState icon={Plus} title="Sin equipos" description="No hay equipos en esta área." />
              ) : (
                <div className="overflow-hidden rounded-md border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-xs text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Placa</th>
                        <th className="px-3 py-2 text-left font-medium">Nombre</th>
                        <th className="px-3 py-2 text-left font-medium">Estado</th>
                        <th className="px-3 py-2 text-left font-medium">Sublocación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {equipment.map((e) => (
                        <tr key={e.id}>
                          <td className="px-3 py-2 font-mono text-xs">{e.plate}</td>
                          <td className="px-3 py-2">{e.name}</td>
                          <td className="px-3 py-2 text-muted-foreground">{e.status}</td>
                          <td className="px-3 py-2 text-muted-foreground">{e.sublocation ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <ConfirmDialog
          open={!!pendingRemoveUserId}
          onOpenChange={(o) => !o && setPendingRemoveUserId(null)}
          title="¿Quitar encargado?"
          description={
            removingUser ? (
              <span>
                <strong>{removingUser.name}</strong> ya no será encargado de esta área.
              </span>
            ) : undefined
          }
          confirmLabel="Quitar"
          variant="destructive"
          onConfirm={async () => {
            if (pendingRemoveUserId != null) {
              await removeManager(pendingRemoveUserId, area.id);
              toast.success("Encargado removido");
              setPendingRemoveUserId(null);
            }
          }}
        />
      </SheetContent>
    </Sheet>
  );
};

export default AreaDetailDrawer;
