import { useMemo, useState } from 'react';
import { ArrowLeftRight, Clock, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import DataTablePagination from '@/components/shared/DataTablePagination';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DEFAULT_PAGE_SIZE } from '@/config/app.config';

import { useAreasStore } from '@/features/areas/hooks/useAreasStore';
import { useCurrentMockUser } from '@/features/areas/hooks/useCurrentMockUser';
import { _equipmentStore } from '@/features/equipment/hooks/useEquipmentList';
import type { Equipment } from '@/features/equipment/types/equipment.types';
import type { Area } from '@/features/areas/types/area.types';

import { APPROVER_ROLES, isReturnDueSoon } from '../constants/transfer.constants';
import { useTransferFilters, useTransfers } from '../hooks/useTransfers';
import type { TransferResolution } from '../constants/transfer.constants';
import NewTransferPanel from '../components/NewTransferPanel';
import TransferFilters from '../components/TransferFilters';
import TransfersTable from '../components/TransfersTable';
import DirectTransferModal from '../components/modals/DirectTransferModal';
import RequestTransferModal from '../components/modals/RequestTransferModal';
import SublocationChangeModal from '../components/modals/SublocationChangeModal';
import { useTransfersStore } from '../hooks/useTransfersStore';

interface ActiveTransferContext {
  equipment: Equipment;
  origin: Area;
  destination: Area;
  resolution: TransferResolution;
}

const TransfersPage = () => {
  const { user } = useCurrentMockUser();
  const areas = useAreasStore((s) => s.areas);
  const transfersAll = useTransfersStore((s) => s.transfers);
  const equipmentAll = _equipmentStore.getAll();

  const equipmentById = useMemo(() => new Map(equipmentAll.map((e) => [e.id, e])), [equipmentAll]);
  const areaById = useMemo(() => new Map(areas.map((a) => [a.id, a])), [areas]);
  const equipmentIndex = useMemo(() => {
    const m = new Map<number, string>();
    for (const e of equipmentAll) {
      m.set(
        e.id,
        [e.name, e.institutional_plate, e.internal_plate].filter(Boolean).join(' '),
      );
    }
    return m;
  }, [equipmentAll]);

  const { filters, setFilters, reset, hasActive } = useTransferFilters();
  const { items } = useTransfers(filters, equipmentIndex);

  const [showPanel, setShowPanel] = useState(false);
  const [active, setActive] = useState<ActiveTransferContext | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const pendingCount = useMemo(
    () => transfersAll.filter((t) => t.status === 'pending').length,
    [transfersAll],
  );
  const returnsDueSoon = useMemo(
    () => transfersAll.filter((t) => isReturnDueSoon(t)).length,
    [transfersAll],
  );

  const canApprove = APPROVER_ROLES.has(user.functionalRole);

  const handleResolved = (
    equipment: Equipment,
    originAreaId: number,
    destinationAreaId: number,
    resolution: TransferResolution,
  ) => {
    const origin = areaById.get(originAreaId);
    const destination = areaById.get(destinationAreaId);
    if (!origin || !destination) return;
    if (resolution.modality === 'not_allowed') {
      // No abrimos modal — mostrar razón vía toast rápido.
      return;
    }
    setActive({ equipment, origin, destination, resolution });
  };

  const closeActive = () => setActive(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Traslados"
        description="Movimientos de equipos entre áreas y sublocaciones."
        icon={ArrowLeftRight}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {canApprove && (
              <Button asChild variant="outline" className="gap-1.5">
                <Link to="/admin/traslados/pendientes">
                  <Clock className="h-4 w-4" />
                  Pendientes
                  {pendingCount > 0 && (
                    <span className="ml-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              </Button>
            )}
            <Button
              onClick={() => setShowPanel((v) => !v)}
              className="font-semibold shadow-[0_0_8px_hsl(var(--sigap-sky)/0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_14px_hsl(var(--sigap-sky)/0.6),0_0_24px_hsl(var(--sigap-sky)/0.3)]"
            >
              <Plus className="mr-2 h-4 w-4" />
              {showPanel ? 'Cerrar panel' : 'Nuevo traslado'}
            </Button>
          </div>
        }
      />

      {returnsDueSoon > 0 && (
        <Card className="border-amber-300/60 bg-amber-50/70 shadow-none">
          <CardContent className="flex items-center gap-3 p-3 text-sm text-amber-900">
            <Clock className="h-5 w-5 shrink-0 text-amber-600" />
            Hay <strong>{returnsDueSoon}</strong> traslado(s) temporal(es) con fecha de retorno
            dentro de los próximos 7 días.
          </CardContent>
        </Card>
      )}

      {showPanel && <NewTransferPanel onResolved={handleResolved} />}

      <TransferFilters
        filters={filters}
        onChange={setFilters}
        onReset={reset}
        hasActive={hasActive}
        areas={areas}
      />

      <Card className="border-slate-300 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <TransfersTable items={paginated} equipmentById={equipmentById} areaById={areaById} />
          <div className="border-t border-slate-300 px-4">
            <DataTablePagination
              page={page}
              pageSize={pageSize}
              total={items.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              itemLabel="traslados"
            />
          </div>
        </CardContent>
      </Card>

      {active?.resolution.modality === 'direct' && (
        <DirectTransferModal
          open
          onOpenChange={(o) => !o && closeActive()}
          equipment={active.equipment}
          origin={active.origin}
          destination={active.destination}
        />
      )}
      {active?.resolution.modality === 'request' && (
        <RequestTransferModal
          open
          onOpenChange={(o) => !o && closeActive()}
          equipment={active.equipment}
          origin={active.origin}
          destination={active.destination}
        />
      )}
      {active?.resolution.modality === 'sublocation' && (
        <SublocationChangeModal
          open
          onOpenChange={(o) => !o && closeActive()}
          equipment={active.equipment}
          area={active.origin}
        />
      )}
    </div>
  );
};

export default TransfersPage;
