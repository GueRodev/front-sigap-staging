import { useMemo, useState } from "react";
import { ArrowLeft, Filter } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import EmptyState from "@/components/shared/EmptyState";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import { useAreasStore } from "@/features/areas/hooks/useAreasStore";

import AreaReviewDecisionPanel from "../components/AreaReviewDecisionPanel";
import InventoryAreaStatusBadge from "../components/InventoryAreaStatusBadge";
import InventoryItemsTable from "../components/InventoryItemsTable";
import { useInventoriesStore } from "../hooks/useInventoriesStore";
import { useInventoryItems } from "../hooks/useInventoryItems";

const InventoryAreaReviewPage = () => {
  const { id, areaId } = useParams<{ id: string; areaId: string }>();
  const inventoryId = id ? Number(id) : null;
  const inventoryAreaId = areaId ? Number(areaId) : null;
  const navigate = useNavigate();

  const inventoryArea = useInventoriesStore((s) =>
    s.inventoryAreas.find((a) => a.id === inventoryAreaId),
  );
  const sourceArea = useAreasStore((s) =>
    s.areas.find((a) => a.id === inventoryArea?.areaId),
  );
  const items = useInventoryItems(inventoryAreaId);

  const [onlyMismatches, setOnlyMismatches] = useState(false);

  const filtered = useMemo(
    () => (onlyMismatches ? items.filter((i) => !i.locationMatch) : items),
    [items, onlyMismatches],
  );

  if (!inventoryArea) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <EmptyState title="Área no encontrada" />
      </div>
    );
  }

  const areaName = sourceArea?.name ?? `Área #${inventoryArea.areaId}`;

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
        title={`Revisión — ${areaName}`}
        description={`${inventoryArea.itemsCount} equipos verificados · ${inventoryArea.mismatchesCount} discrepancias`}
        actions={<InventoryAreaStatusBadge status={inventoryArea.status} />}
      />

      <div className="flex items-center justify-between rounded-lg border border-glass bg-white/60 px-4 py-2 backdrop-blur dark:bg-white/5">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" /> Filtros
        </span>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          Solo discrepancias
          <Switch checked={onlyMismatches} onCheckedChange={setOnlyMismatches} />
        </label>
      </div>

      <InventoryItemsTable items={filtered} />

      <AreaReviewDecisionPanel inventoryArea={inventoryArea} areaName={areaName} />
    </div>
  );
};

export default InventoryAreaReviewPage;
