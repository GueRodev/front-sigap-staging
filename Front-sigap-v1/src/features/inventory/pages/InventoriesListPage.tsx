import { useMemo, useState } from "react";
import { ClipboardList, Plus, ScanBarcode } from "lucide-react";
import { useNavigate } from "react-router-dom";

import EmptyState from "@/components/shared/EmptyState";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { useCurrentMockUser } from "@/features/areas/hooks/useCurrentMockUser";

import InventoryCard from "../components/InventoryCard";
import InventoryCreateDrawer from "../components/InventoryCreateDrawer";
import InventoryFilters from "../components/InventoryFilters";
import { INVENTORY_ROLE_PERMISSIONS } from "../constants/inventory.constants";
import { useInventoriesStore } from "../hooks/useInventoriesStore";
import { useInventories } from "../hooks/useInventories";
import type { Inventory, InventoryListFilters } from "../types/inventory.types";

const InventoriesListPage = () => {
  const navigate = useNavigate();
  const { user } = useCurrentMockUser();
  const perms = INVENTORY_ROLE_PERMISSIONS[user.functionalRole];

  const [filters, setFilters] = useState<InventoryListFilters>({});
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { inventories, total } = useInventories(filters);
  const allInventories = useInventoriesStore((s) => s.inventories);
  const yearOptions = useMemo(
    () => Array.from(new Set(allInventories.map((i) => i.year))).sort((a, b) => b - a),
    [allInventories],
  );

  const handleOpen = (inv: Inventory) => navigate(`/admin/activos/inventario/${inv.id}`);
  const patchFilters = (patch: Partial<InventoryListFilters>) =>
    setFilters((f) => ({ ...f, ...patch }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Levantamiento de Activos"
        description="Verificación física periódica de equipos por área."
        icon={ScanBarcode}
        actions={
          perms.crudInventory && (
            <Button
              onClick={() => setDrawerOpen(true)}
              className="font-semibold shadow-[0_0_8px_hsl(var(--sigap-sky)/0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_14px_hsl(var(--sigap-sky)/0.6),0_0_24px_hsl(var(--sigap-sky)/0.3)]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo levantamiento
            </Button>
          )
        }
      />

      <InventoryFilters filters={filters} onChange={patchFilters} yearOptions={yearOptions} />

      {inventories.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={total === 0 ? "Sin levantamientos" : "Sin resultados"}
          description={
            total === 0
              ? "Aún no se ha creado ningún levantamiento visible para tu rol."
              : "Ajustá los filtros para ver más resultados."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {inventories.map((inv) => (
            <InventoryCard key={inv.id} inventory={inv} onOpen={handleOpen} />
          ))}
        </div>
      )}

      <InventoryCreateDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onCreated={(id) => navigate(`/admin/activos/inventario/${id}`)}
      />
    </div>
  );
};

export default InventoriesListPage;
