import { useState } from "react";
import { AlertTriangle, ArrowLeft, ClipboardCheck, ScanBarcode } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import EmptyState from "@/components/shared/EmptyState";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";

import { useAreasStore } from "@/features/areas/hooks/useAreasStore";
import { useCurrentMockUser } from "@/features/areas/hooks/useCurrentMockUser";

import InventoryAreaStatusBadge from "../components/InventoryAreaStatusBadge";
import InventoryItemsTable from "../components/InventoryItemsTable";
import ReportIncidentModal from "../components/modals/ReportIncidentModal";
import ScannerModal from "../components/modals/ScannerModal";
import SubmitForReviewModal from "../components/modals/SubmitForReviewModal";
import { INVENTORY_ROLE_PERMISSIONS } from "../constants/inventory.constants";
import { useInventoriesStore } from "../hooks/useInventoriesStore";
import { useInventoryItems } from "../hooks/useInventoryItems";
import { useInventoryMutations } from "../hooks/useInventoryMutations";

const InventorySessionPage = () => {
  const { id } = useParams<{ id: string }>();
  const [search] = useSearchParams();
  const inventoryId = id ? Number(id) : null;
  const inventoryAreaId = search.get("area") ? Number(search.get("area")) : null;
  const navigate = useNavigate();
  const { user } = useCurrentMockUser();
  const perms = INVENTORY_ROLE_PERMISSIONS[user.functionalRole];

  const inventoryArea = useInventoriesStore((s) =>
    s.inventoryAreas.find((a) => a.id === inventoryAreaId),
  );
  const sourceArea = useAreasStore((s) =>
    s.areas.find((a) => a.id === inventoryArea?.areaId),
  );
  const items = useInventoryItems(inventoryAreaId);
  const { scanItem } = useInventoryMutations();

  const [scannerOpen, setScannerOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [incidentPrefill, setIncidentPrefill] = useState<string | null>(null);
  const [incidentOpen, setIncidentOpen] = useState(false);

  if (!inventoryArea || !inventoryId) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <EmptyState title="Área no encontrada" description="Verificá el enlace de la sesión." />
      </div>
    );
  }

  const canScan =
    perms.executeInventoryScan &&
    (perms.scanScope === "all" || inventoryArea.assignedTo === user.id);
  const areaName = sourceArea?.name ?? `Área #${inventoryArea.areaId}`;
  const closed =
    inventoryArea.status === "lista_revision" ||
    inventoryArea.status === "aprobada";

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(`/admin/activos/inventario/${inventoryId}`)}
        className="-ml-2 gap-2"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al levantamiento
      </Button>

      <PageHeader
        title={`Escaneo — ${areaName}`}
        description={`${inventoryArea.itemsCount} equipos verificados · ${inventoryArea.mismatchesCount} discrepancias`}
        actions={<InventoryAreaStatusBadge status={inventoryArea.status} />}
      />

      {!canScan && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          No tenés permisos para escanear en esta área.
        </div>
      )}

      {closed && (
        <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          Esta área ya fue enviada a revisión o aprobada; el escaneo está bloqueado.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="lg"
          className="h-14 gap-2 px-6 text-base"
          disabled={!canScan || closed}
          onClick={() => setScannerOpen(true)}
        >
          <ScanBarcode className="h-5 w-5" />
          Escanear equipo
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            setIncidentPrefill(null);
            setIncidentOpen(true);
          }}
        >
          <AlertTriangle className="h-4 w-4" /> Reportar incidencia
        </Button>
        {inventoryArea.itemsCount > 0 && !closed && (
          <Button variant="secondary" className="gap-2" onClick={() => setSubmitOpen(true)}>
            <ClipboardCheck className="h-4 w-4" /> Enviar a revisión
          </Button>
        )}
      </div>

      <InventoryItemsTable items={items} />

      <ScannerModal
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScanSuccess={(equipment) =>
          scanItem({
            inventoryId,
            inventoryAreaId: inventoryArea.id,
            equipmentId: equipment.id,
            verifiedBy: user.id,
          })
        }
        onReportNotFound={(term) => {
          setScannerOpen(false);
          setIncidentPrefill(term);
          setIncidentOpen(true);
        }}
      />

      <ReportIncidentModal
        open={incidentOpen}
        onOpenChange={setIncidentOpen}
        prefillTerm={incidentPrefill}
      />

      <SubmitForReviewModal
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        inventoryArea={inventoryArea}
        areaName={areaName}
      />
    </div>
  );
};

export default InventorySessionPage;
