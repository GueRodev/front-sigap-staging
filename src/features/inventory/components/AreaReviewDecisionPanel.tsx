import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useCurrentMockUser } from "@/features/areas/hooks/useCurrentMockUser";

import { useInventoryMutations } from "../hooks/useInventoryMutations";
import { INVENTORY_ROLE_PERMISSIONS } from "../constants/inventory.constants";
import type { InventoryArea } from "../types/inventory.types";
import ApproveWithIncidentsModal from "./modals/ApproveWithIncidentsModal";
import RejectAreaModal from "./modals/RejectAreaModal";

interface AreaReviewDecisionPanelProps {
  inventoryArea: InventoryArea;
  areaName: string;
}

/**
 * Sticky panel used on `InventoryAreaReviewPage`. Gates actions by role +
 * approver identity, and drives the 3 review sub-flows.
 */
const AreaReviewDecisionPanel = ({
  inventoryArea,
  areaName,
}: AreaReviewDecisionPanelProps) => {
  const { user } = useCurrentMockUser();
  const { approveArea } = useInventoryMutations();

  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [approveWithIncidentsOpen, setApproveWithIncidentsOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const perms = INVENTORY_ROLE_PERMISSIONS[user.functionalRole];
  const isApprover =
    inventoryArea.approverId === Number(user.id) || perms.approveAreaInventory;
  const canReview =
    perms.approveAreaInventory &&
    isApprover &&
    inventoryArea.status === "lista_revision";

  if (!canReview) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        Este panel se activa cuando el área está en estado <strong>Lista para revisión</strong> y sos el aprobador designado.
      </div>
    );
  }

  const hasMismatches = inventoryArea.mismatchesCount > 0;

  const handleApproveClean = () => {
    approveArea(inventoryArea.id, Number(user.id));
    toast.success("Área aprobada", { description: areaName });
    setConfirmApproveOpen(false);
  };

  return (
    <>
      <div className="sticky bottom-4 z-10 rounded-xl border border-glass bg-white/80 p-4 shadow-lg backdrop-blur-md dark:bg-sigap-dark/80">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Decisión de revisión</p>
            <p className="text-xs text-muted-foreground">
              {inventoryArea.itemsCount} equipos · {inventoryArea.mismatchesCount} discrepancias
            </p>
          </div>
          {hasMismatches && (
            <div className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5" />
              Requiere revisión detallada
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              hasMismatches
                ? setApproveWithIncidentsOpen(true)
                : setConfirmApproveOpen(true)
            }
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {hasMismatches ? "Aprobar con hallazgos" : "Aprobar área"}
          </Button>
          <Button variant="destructive" onClick={() => setRejectOpen(true)} className="gap-2">
            <XCircle className="h-4 w-4" />
            Rechazar
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmApproveOpen}
        onOpenChange={setConfirmApproveOpen}
        title={`Aprobar ${areaName}`}
        description="Todos los equipos verificados coinciden con su ubicación esperada. ¿Confirmás la aprobación?"
        confirmLabel="Aprobar"
        onConfirm={handleApproveClean}
      />

      <ApproveWithIncidentsModal
        open={approveWithIncidentsOpen}
        onOpenChange={setApproveWithIncidentsOpen}
        inventoryArea={inventoryArea}
        areaName={areaName}
      />

      <RejectAreaModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        inventoryArea={inventoryArea}
        areaName={areaName}
      />
    </>
  );
};

export default AreaReviewDecisionPanel;
