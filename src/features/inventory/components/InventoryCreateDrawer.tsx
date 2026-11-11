import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { useCurrentMockUser } from "@/features/areas/hooks/useCurrentMockUser";
import { useAreasStore } from "@/features/areas/hooks/useAreasStore";
import { UNASSIGNED_AREA_ID } from "@/features/areas/constants/areaType.constants";

import {
  inventoryAreasSchema,
  inventoryGeneralSchema,
  type InventoryGeneralValues,
} from "../schemas/inventory.schemas";
import { useInventoryAreas } from "../hooks/useInventoryAreas";
import { useInventoryMutations } from "../hooks/useInventoryMutations";
import { INVENTORY_SCOPE_OPTIONS } from "../constants/inventory.constants";

interface InventoryCreateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (inventoryId: number) => void;
}

interface Assignment {
  areaId: number;
  assignedTo: number | null;
  approverId: number | null;
}

const STEPS = [
  { key: "general", label: "Datos generales" },
  { key: "areas", label: "Áreas" },
  { key: "assignments", label: "Asignaciones" },
] as const;

const StepIndicator = ({ step }: { step: number }) => (
  <div className="flex items-center gap-2">
    {STEPS.map((s, i) => {
      const done = i < step;
      const active = i === step;
      return (
        <div key={s.key} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
              done && "border-sigap-sky bg-sigap-sky text-white",
              active && "border-sigap-sky bg-sigap-sky/10 text-sigap-blue",
              !done && !active && "border-border bg-muted text-muted-foreground",
            )}
          >
            {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </div>
          <span className={cn("hidden text-xs sm:block", active ? "font-medium" : "text-muted-foreground")}>
            {s.label}
          </span>
          {i < STEPS.length - 1 && <div className="h-px w-6 bg-border" />}
        </div>
      );
    })}
  </div>
);

const defaultGeneral: InventoryGeneralValues = {
  title: "",
  year: new Date().getFullYear(),
  scope: "area",
  description: "",
};

const InventoryCreateDrawer = ({ open, onOpenChange, onCreated }: InventoryCreateDrawerProps) => {
  const { user } = useCurrentMockUser();
  const { createInventory, addAreaToInventory } = useInventoryMutations();
  const allAreas = useAreasStore((s) => s.areas);
  const allUsers = useAreasStore((s) => s.users);
  const { resolveAreaApproverCandidate } = useInventoryAreas(null);

  const [step, setStep] = useState(0);
  const [general, setGeneral] = useState<InventoryGeneralValues>(defaultGeneral);
  const [selectedAreaIds, setSelectedAreaIds] = useState<number[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    if (open) {
      setStep(0);
      setGeneral(defaultGeneral);
      setSelectedAreaIds([]);
      setAssignments([]);
    }
  }, [open]);

  const activeAreas = useMemo(
    () => allAreas.filter((a) => !a.deletedAt && a.id !== UNASSIGNED_AREA_ID),
    [allAreas],
  );

  const collaboratorOptions = useMemo(
    () => allUsers.filter((u) => u.functionalRole !== "student"),
    [allUsers],
  );

  // Auto-init assignments when arriving at step 3 or areas changed.
  useEffect(() => {
    if (step !== 2) return;
    setAssignments((prev) => {
      const map = new Map(prev.map((a) => [a.areaId, a]));
      return selectedAreaIds.map((areaId) => {
        const existing = map.get(areaId);
        if (existing) return existing;
        const cand = resolveAreaApproverCandidate(areaId);
        return {
          areaId,
          assignedTo: null,
          approverId: cand.kind === "single" ? cand.userId : null,
        };
      });
    });
  }, [step, selectedAreaIds, resolveAreaApproverCandidate]);

  const goNext = () => {
    if (step === 0) {
      const r = inventoryGeneralSchema.safeParse(general);
      if (!r.success) {
        toast.error(r.error.issues[0]?.message ?? "Revisá los datos");
        return;
      }
    }
    if (step === 1) {
      const r = inventoryAreasSchema.safeParse({ areaIds: selectedAreaIds });
      if (!r.success) {
        toast.error(r.error.issues[0]?.message ?? "Seleccioná al menos un área");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleCreate = () => {
    const missing = assignments.find((a) => !a.assignedTo || !a.approverId);
    if (missing) {
      toast.error("Cada área necesita colaborador y aprobador");
      return;
    }
    const inv = createInventory({
      title: general.title,
      year: general.year,
      scope: general.scope,
      description: general.description || null,
      createdById: user.id,
    });
    assignments.forEach((a) => {
      addAreaToInventory({
        inventoryId: inv.id,
        areaId: a.areaId,
        assignedTo: a.assignedTo,
        approverId: a.approverId,
      });
    });
    toast.success("Levantamiento creado", { description: inv.title });
    onOpenChange(false);
    onCreated?.(inv.id);
  };

  const toggleArea = (id: number) =>
    setSelectedAreaIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const updateAssignment = (areaId: number, patch: Partial<Assignment>) =>
    setAssignments((prev) => prev.map((a) => (a.areaId === areaId ? { ...a, ...patch } : a)));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle>Nuevo levantamiento</SheetTitle>
          <SheetDescription>Definí el alcance, seleccioná áreas y asigná responsables.</SheetDescription>
          <div className="pt-3">
            <StepIndicator step={step} />
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-5 px-6 py-5">
              {step === 0 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="inv-title">Título *</Label>
                    <Input
                      id="inv-title"
                      value={general.title}
                      onChange={(e) => setGeneral({ ...general, title: e.target.value })}
                      placeholder="Levantamiento anual 2026"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inv-year">Año *</Label>
                      <Input
                        id="inv-year"
                        type="number"
                        value={general.year}
                        onChange={(e) => setGeneral({ ...general, year: Number(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Alcance *</Label>
                      <Select
                        value={general.scope}
                        onValueChange={(v) => setGeneral({ ...general, scope: v as InventoryGeneralValues["scope"] })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {INVENTORY_SCOPE_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inv-desc">Descripción</Label>
                    <Textarea
                      id="inv-desc"
                      rows={4}
                      value={general.description}
                      onChange={(e) => setGeneral({ ...general, description: e.target.value })}
                      placeholder="Notas o contexto del levantamiento…"
                    />
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Seleccioná las áreas a incluir ({selectedAreaIds.length} elegidas)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAreaIds(activeAreas.map((a) => a.id))}
                      >
                        Todas
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedAreaIds([])}>
                        Ninguna
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {activeAreas.map((area) => {
                      const checked = selectedAreaIds.includes(area.id);
                      return (
                        <label
                          key={area.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                            checked
                              ? "border-sigap-sky bg-sigap-sky/10"
                              : "border-border hover:bg-muted/40",
                          )}
                        >
                          <Checkbox checked={checked} onCheckedChange={() => toggleArea(area.id)} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{area.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {area.zone ? `Zona ${area.zone}` : "Sin zona"}
                              {area.building ? ` · ${area.building}` : ""}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Asigná a un colaborador y a un aprobador por cada área.
                  </p>
                  {assignments.map((a) => {
                    const area = activeAreas.find((x) => x.id === a.areaId);
                    const cand = resolveAreaApproverCandidate(a.areaId);
                    return (
                      <div key={a.areaId} className="rounded-lg border border-border p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="font-medium">{area?.name ?? `Área #${a.areaId}`}</p>
                          {cand.kind === "none" && (
                            <span className="text-xs text-amber-700 dark:text-amber-300">
                              Sin encargado sugerido
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Colaborador (escanea)</Label>
                            <Select
                              value={a.assignedTo ? String(a.assignedTo) : ""}
                              onValueChange={(v) => updateAssignment(a.areaId, { assignedTo: Number(v) })}
                            >
                              <SelectTrigger><SelectValue placeholder="Elegir…" /></SelectTrigger>
                              <SelectContent>
                                {collaboratorOptions.map((u) => (
                                  <SelectItem key={u.id} value={String(u.id)}>
                                    {u.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Aprobador</Label>
                            {cand.kind === "multiple" ? (
                              <RadioGroup
                                value={a.approverId ? String(a.approverId) : ""}
                                onValueChange={(v) => updateAssignment(a.areaId, { approverId: Number(v) })}
                                className="grid gap-1.5"
                              >
                                {cand.userIds.map((uid) => {
                                  const u = allUsers.find((x) => x.id === uid);
                                  return (
                                    <label key={uid} className="flex items-center gap-2 text-sm">
                                      <RadioGroupItem value={String(uid)} />
                                      {u?.name ?? `Usuario ${uid}`}
                                    </label>
                                  );
                                })}
                              </RadioGroup>
                            ) : (
                              <Select
                                value={a.approverId ? String(a.approverId) : ""}
                                onValueChange={(v) => updateAssignment(a.areaId, { approverId: Number(v) })}
                              >
                                <SelectTrigger><SelectValue placeholder="Elegir…" /></SelectTrigger>
                                <SelectContent>
                                  {allUsers
                                    .filter((u) => u.functionalRole === "area_manager")
                                    .map((u) => (
                                      <SelectItem key={u.id} value={String(u.id)}>
                                        {u.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <SheetFooter className="border-t border-border bg-muted/30 px-6 py-3">
          <div className="flex w-full items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => (step === 0 ? onOpenChange(false) : setStep(step - 1))}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              {step === 0 ? "Cancelar" : "Atrás"}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={goNext} className="gap-1">
                Siguiente <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleCreate} className="gap-1">
                <Check className="h-4 w-4" /> Crear levantamiento
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default InventoryCreateDrawer;
