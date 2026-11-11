import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';

import type { Equipment } from '@/features/equipment/types/equipment.types';
import type { Area } from '@/features/areas/types/area.types';
import { useCurrentMockUser } from '@/features/areas/hooks/useCurrentMockUser';

import { directTransferSchema, type DirectTransferFormValues } from '../../schemas/transfer.schemas';
import { useTransfersStore } from '../../hooks/useTransfersStore';
import TransferModalHeader from '../TransferModalHeader';
import TransferConfirmation from '../TransferConfirmation';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment;
  origin: Area;
  destination: Area;
}

const DirectTransferModal = ({ open, onOpenChange, equipment, origin, destination }: Props) => {
  const { user } = useCurrentMockUser();
  const createDirect = useTransfersStore((s) => s.createDirect);
  const [done, setDone] = useState(false);

  const form = useForm<DirectTransferFormValues>({
    resolver: zodResolver(directTransferSchema),
    defaultValues: {
      equipment_id: equipment.id,
      origin_area_id: origin.id,
      destination_area_id: destination.id,
      reason: '',
    },
  });

  const onSubmit = (values: DirectTransferFormValues) => {
    createDirect({
      equipment_id: values.equipment_id,
      origin_area_id: values.origin_area_id,
      destination_area_id: values.destination_area_id,
      reason: values.reason,
      executed_by_id: user.id,
    });
    toast.success('Traslado ejecutado');
    setDone(true);
  };

  const close = () => {
    setDone(false);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Traslado directo</DialogTitle>
          <DialogDescription>
            El equipo se moverá de inmediato al área destino y se registrará el traslado.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <TransferConfirmation
            title="Traslado registrado"
            description={`${equipment.name} está ahora en ${destination.name}.`}
            onClose={close}
          />
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TransferModalHeader equipment={equipment} origin={origin} destination={destination} />
            <div className="space-y-1.5">
              <Label htmlFor="direct-reason">Motivo</Label>
              <Textarea
                id="direct-reason"
                rows={3}
                placeholder="Motivo del traslado…"
                {...form.register('reason')}
              />
              {form.formState.errors.reason && (
                <p className="text-xs text-destructive">{form.formState.errors.reason.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={close}>
                Cancelar
              </Button>
              <Button type="submit">Ejecutar traslado</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DirectTransferModal;
