import { useMemo, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { Equipment } from '@/features/equipment/types/equipment.types';
import { useAreasStore } from '@/features/areas/hooks/useAreasStore';
import { useCurrentMockUser } from '@/features/areas/hooks/useCurrentMockUser';

import { TRANSFERABLE_STATUSES, BLOCK_REASON_LABEL } from '../constants/transfer.constants';
import { resolveTransferModality } from '../hooks/resolveTransferModality';
import DirectTransferModal from './modals/DirectTransferModal';
import RequestTransferModal from './modals/RequestTransferModal';
import SublocationChangeModal from './modals/SublocationChangeModal';

interface Props {
  equipment: Equipment;
}

type Modality = 'direct' | 'request' | 'sublocation' | null;

/**
 * Botón de acción rápida para el Registro de Activos.
 * Abre un mini-selector de destino, resuelve la modalidad con el algoritmo del
 * ADR y despacha el modal correspondiente.
 */
const QuickTransferButton = ({ equipment }: Props) => {
  const { user } = useCurrentMockUser();
  const areas = useAreasStore((s) => s.areas);
  const [pickOpen, setPickOpen] = useState(false);
  const [destinationId, setDestinationId] = useState<number | null>(null);
  const [active, setActive] = useState<{ modality: Modality; destinationAreaId: number } | null>(null);

  const disabled = !TRANSFERABLE_STATUSES.has(equipment.status);
  const origin = useMemo(
    () => areas.find((a) => a.id === equipment.current_area_id) ?? null,
    [areas, equipment.current_area_id],
  );
  const destination = useMemo(
    () => (active ? areas.find((a) => a.id === active.destinationAreaId) ?? null : null),
    [areas, active],
  );

  const destinationOptions = areas.filter((a) => !a.deletedAt && !a.is_protected);

  const handleContinue = () => {
    if (!origin || destinationId == null) return;
    const dest = areas.find((a) => a.id === destinationId);
    if (!dest) return;
    const resolution = resolveTransferModality(equipment, origin, dest, user);
    if (resolution.modality === 'not_allowed') {
      toast.error(BLOCK_REASON_LABEL[resolution.reason ?? 'invalid_status']);
      return;
    }
    setPickOpen(false);
    setActive({ modality: resolution.modality, destinationAreaId: dest.id });
  };

  const closeActive = () => setActive(null);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:bg-sigap-sky/10 hover:text-sigap-blue hover:ring-1 hover:ring-sigap-sky/30 disabled:opacity-40"
        onClick={() => setPickOpen(true)}
        disabled={disabled}
        aria-label={`Trasladar ${equipment.name}`}
        title={disabled ? 'Estado no permite traslados' : 'Trasladar'}
      >
        <ArrowLeftRight className="h-4 w-4" />
      </Button>

      <Dialog
        open={pickOpen}
        onOpenChange={(o) => {
          setPickOpen(o);
          if (!o) setDestinationId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trasladar equipo</DialogTitle>
            <DialogDescription>
              Elegí el área destino — se abrirá el flujo que corresponda según tu rol.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm">
              <p className="font-display font-semibold text-sidebar">{equipment.name}</p>
              <p className="text-xs text-muted-foreground">
                Origen: {origin?.name ?? '—'}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Área destino</Label>
              <Select
                value={destinationId ? String(destinationId) : undefined}
                onValueChange={(v) => setDestinationId(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar área destino" />
                </SelectTrigger>
                <SelectContent>
                  {destinationOptions.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Podés elegir la misma área para hacer un cambio de sublocación.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setPickOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleContinue} disabled={destinationId == null}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {active?.modality === 'direct' && origin && destination && (
        <DirectTransferModal
          open
          onOpenChange={(o) => !o && closeActive()}
          equipment={equipment}
          origin={origin}
          destination={destination}
        />
      )}
      {active?.modality === 'request' && origin && destination && (
        <RequestTransferModal
          open
          onOpenChange={(o) => !o && closeActive()}
          equipment={equipment}
          origin={origin}
          destination={destination}
        />
      )}
      {active?.modality === 'sublocation' && origin && (
        <SublocationChangeModal
          open
          onOpenChange={(o) => !o && closeActive()}
          equipment={equipment}
          area={origin}
        />
      )}
    </>
  );
};

export default QuickTransferButton;
