import type { Equipment } from '@/features/equipment/types/equipment.types';
import type { Area } from '@/features/areas/types/area.types';

interface Props {
  equipment: Equipment;
  origin?: Area | null;
  destination?: Area | null;
}

/**
 * Encabezado compacto que se usa en los tres modales para dejar visibles
 * (readonly) el equipo y las áreas involucradas.
 */
const TransferModalHeader = ({ equipment, origin, destination }: Props) => {
  const plate = equipment.institutional_plate ?? equipment.internal_plate ?? 'Sin placa';
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm">
      <p className="font-display font-semibold text-sidebar">{equipment.name}</p>
      <p className="text-xs text-muted-foreground">{plate}</p>
      {(origin || destination) && (
        <p className="mt-2 text-xs text-muted-foreground">
          {origin && <span><strong>Origen:</strong> {origin.name}</span>}
          {origin && destination && <span className="mx-2">·</span>}
          {destination && <span><strong>Destino:</strong> {destination.name}</span>}
        </p>
      )}
    </div>
  );
};

export default TransferModalHeader;
