import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Keyboard, Search, ScanLine, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import LoadingOverlay from "@/components/shared/LoadingOverlay";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useBarcodeScanner } from "../../hooks/useBarcodeScanner";
import {
  useEquipmentLookup,
  type EquipmentLookupResult,
} from "../../hooks/useEquipmentLookup";
import type { Equipment } from "@/features/equipment/types/equipment.types";
import type { InventoryItem } from "../../types/inventory.types";

export interface ScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Called after a successful lookup (kind === "found"). The parent is
   * responsible for calling `scanItem` mutation and closing the modal via
   * `onOpenChange(false)` on 200/409.
   */
  onScanSuccess: (equipment: Equipment) => { kind: "created" | "duplicate"; item: InventoryItem } | void;
  /**
   * Called when the user clicks "Reportar" on a 404 result.
   * Parent typically opens `ReportIncidentModal` prellenado.
   */
  onReportNotFound?: (rawTerm: string) => void;
}

type ScanTab = "camera" | "hid" | "manual" | "search";

const ScannerModal = ({
  open,
  onOpenChange,
  onScanSuccess,
  onReportNotFound,
}: ScannerModalProps) => {
  const [tab, setTab] = useState<ScanTab>("camera");
  const [isLoading, setIsLoading] = useState(false);
  const [lastNotFound, setLastNotFound] = useState<string | null>(null);
  const [manualValue, setManualValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [hidValue, setHidValue] = useState("");
  const hidInputRef = useRef<HTMLInputElement>(null);
  const lastProcessedRef = useRef<{ term: string; at: number } | null>(null);

  const { lookup } = useEquipmentLookup();

  const handleResult = useCallback(
    (rawTerm: string, result: EquipmentLookupResult) => {
      if (result.kind === "bulk") {
        toast.warning("Equipo bulk — no se cuenta como stock verificable", {
          description: result.equipment.name,
        });
        return;
      }
      if (result.kind === "not_found") {
        setLastNotFound(rawTerm);
        toast.error(`No se encontró "${rawTerm}"`, {
          description: "Podés registrarlo como incidencia.",
          action: onReportNotFound
            ? { label: "Reportar", onClick: () => onReportNotFound(rawTerm) }
            : undefined,
        });
        return;
      }
      // kind === "found"
      const outcome = onScanSuccess(result.equipment);
      if (outcome && outcome.kind === "duplicate") {
        const at = outcome.item.verifiedAt
          ? new Date(outcome.item.verifiedAt).toLocaleTimeString("es-CR")
          : "una vez";
        toast.warning("Ya escaneado en esta área", {
          description: `Registrado a las ${at}.`,
        });
        return;
      }
      toast.success(`✓ ${result.equipment.name}`, {
        description: result.equipment.institutional_plate ?? result.equipment.internal_plate ?? "Verificado",
      });
    },
    [onReportNotFound, onScanSuccess],
  );

  const processTerm = useCallback(
    async (rawTerm: string) => {
      const term = rawTerm.trim();
      if (!term) return;
      // Debounce identical decodes within 1.5s (camera fires repeatedly).
      const now = Date.now();
      const last = lastProcessedRef.current;
      if (last && last.term === term && now - last.at < 1500) return;
      lastProcessedRef.current = { term, at: now };

      setIsLoading(true);
      setLastNotFound(null);
      // Simulate short async gate for UX consistency with the plan's "B state".
      await new Promise((r) => setTimeout(r, 250));
      const result = lookup(term);
      handleResult(term, result);
      setIsLoading(false);
    },
    [handleResult, lookup],
  );

  const scanner = useBarcodeScanner({
    paused: !open || tab !== "camera" || isLoading,
    onDecoded: processTerm,
  });

  // HID: focus + capture Enter.
  useEffect(() => {
    if (open && tab === "hid") {
      hidInputRef.current?.focus();
    }
  }, [open, tab]);

  // Reset ephemeral state on close.
  useEffect(() => {
    if (!open) {
      setManualValue("");
      setSearchValue("");
      setHidValue("");
      setLastNotFound(null);
      lastProcessedRef.current = null;
    }
  }, [open]);

  const submitFromInput = (value: string, clear: () => void) => {
    if (!value.trim()) return;
    void processTerm(value);
    clear();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl animate-in fade-in slide-in-from-bottom-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-sigap-sky" />
            Escanear equipo
          </DialogTitle>
          <DialogDescription>
            Escaneá con la cámara, un lector físico, o buscá manualmente por placa o nombre.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as ScanTab)} className="mt-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="camera" className="gap-2">
              <Camera className="h-4 w-4" /> Cámara
            </TabsTrigger>
            <TabsTrigger value="hid" className="gap-2">
              <ScanLine className="h-4 w-4" /> Lector
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              <Keyboard className="h-4 w-4" /> Placa
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2">
              <Search className="h-4 w-4" /> Buscar
            </TabsTrigger>
          </TabsList>

          {/* --- Cámara --- */}
          <TabsContent value="camera" className="mt-4">
            <div
              key={scanner.key}
              className="relative aspect-video overflow-hidden rounded-lg border border-glass bg-sigap-dark/40"
            >
              {scanner.error ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                  <p className="text-sm text-muted-foreground">{scanner.error}</p>
                  <Button size="sm" variant="outline" onClick={scanner.retry} className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Reintentar
                  </Button>
                </div>
              ) : (
                <>
                  <video ref={scanner.ref} className="h-full w-full object-cover" />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-24 w-3/4 rounded-lg border-2 border-sigap-sky/70 shadow-[0_0_20px_rgba(91,181,224,0.4)]" />
                  </div>
                </>
              )}
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Apuntá el código de barra o QR dentro del recuadro.
            </p>
          </TabsContent>

          {/* --- Lector HID --- */}
          <TabsContent value="hid" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Conectá el lector USB y disparalo. La lectura se enviará automáticamente.
            </p>
            <Input
              ref={hidInputRef}
              autoFocus
              value={hidValue}
              onChange={(e) => setHidValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitFromInput(hidValue, () => setHidValue(""));
                }
              }}
              placeholder="Esperando lectura del scanner…"
              className="font-mono"
            />
          </TabsContent>

          {/* --- Placa manual --- */}
          <TabsContent value="manual" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Ingresá la placa institucional o interna.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitFromInput(manualValue, () => setManualValue(""));
              }}
              className="flex gap-2"
            >
              <Input
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                placeholder="Ej: UCR-001234"
                autoFocus
                className="font-mono"
              />
              <Button type="submit">Verificar</Button>
            </form>
          </TabsContent>

          {/* --- Búsqueda por nombre/serie --- */}
          <TabsContent value="search" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Buscá por nombre, serie o cualquier identificador.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitFromInput(searchValue, () => setSearchValue(""));
              }}
              className="flex gap-2"
            >
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Ej: Laptop Dell, SN12345…"
                autoFocus
              />
              <Button type="submit">Buscar</Button>
            </form>
          </TabsContent>
        </Tabs>

        {lastNotFound && onReportNotFound && (
          <div className="mt-3 flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                "{lastNotFound}" no está en el registro
              </p>
              <p className="text-xs text-muted-foreground">
                Podés reportarlo como equipo no registrado.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReportNotFound(lastNotFound)}
            >
              Reportar
            </Button>
          </div>
        )}

        <LoadingOverlay isLoading={isLoading} message="Buscando equipo…" />
      </DialogContent>
    </Dialog>
  );
};

export default ScannerModal;
