import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { Navigate } from 'react-router-dom';

import EmptyState from '@/components/shared/EmptyState';
import PageHeader from '@/components/shared/PageHeader';

import { useAreasStore } from '@/features/areas/hooks/useAreasStore';
import { useCurrentMockUser } from '@/features/areas/hooks/useCurrentMockUser';
import { _equipmentStore } from '@/features/equipment/hooks/useEquipmentList';

import PendingTransferCard from '../components/PendingTransferCard';
import { APPROVER_ROLES } from '../constants/transfer.constants';
import { useTransfersStore } from '../hooks/useTransfersStore';

const PendingTransfersPage = () => {
  const { user } = useCurrentMockUser();
  const areas = useAreasStore((s) => s.areas);
  const users = useAreasStore((s) => s.users);
  const transfers = useTransfersStore((s) => s.transfers);
  const equipmentAll = _equipmentStore.getAll();

  const areaById = useMemo(() => new Map(areas.map((a) => [a.id, a])), [areas]);
  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const equipmentById = useMemo(
    () => new Map(equipmentAll.map((e) => [e.id, e])),
    [equipmentAll],
  );

  const pending = useMemo(
    () =>
      transfers
        .filter((t) => t.status === 'pending')
        .slice()
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [transfers],
  );

  if (!APPROVER_ROLES.has(user.functionalRole)) {
    return <Navigate to="/admin/traslados" replace />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitudes pendientes"
        description="Aprobá o rechazá las solicitudes de traslado creadas por otros usuarios."
        icon={Clock}
      />

      {pending.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Sin solicitudes pendientes"
          description="Cuando alguien cree una solicitud aparecerá aquí para su aprobación."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {pending.map((t) => (
            <PendingTransferCard
              key={t.id}
              transfer={t}
              equipment={equipmentById.get(t.equipment_id)}
              origin={areaById.get(t.origin_area_id)}
              destination={areaById.get(t.destination_area_id)}
              requester={userById.get(t.requested_by_id) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingTransfersPage;
