import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import type { Equipment } from '@/features/equipment/types/equipment.types';
import type { Area } from '@/features/areas/types/area.types';
import { useCurrentMockUser } from '@/features/areas/hooks/useCurrentMockUser';

import { requestTransferSchema, type RequestTransferFormValues } from '../../schemas/transfer.schemas';
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

const RequestTransferModal = ({ open, onOpenChange, equipment, origin, destination }: Props) => {
  const { user } = useCurrentMockUser();
  const createRequest = useTransfersStore((s) => s.createRequest);
  const [done, setDone] = useState(false);

  const form = useForm<RequestTransferFormValues>({
    resolver: zodResolver(requestTransferSchema),
    defaultValues: {
      equipment_id: equipment.id,
      origin_area_id: origin.id,
      destination_area_id: destination.id,
      expected_date: '',
      is_temporary: false,
      return_date: '',
      justification: '',
    },
  });

  const isTemporary = form.watch('is_temporary');

  const onSubmit = (values: RequestTransferFormValues) => {
    createRequest({
      equipment_id: values.equipment_id,
      origin_area_id: values.origin_area_id,
      destination_area_id: values.destination_area_id,
      requested_by_id: user.id,
      justification: values.justification,
      expected_date: values.expected_date,
      is_temporary: values.is_temporary,
      return_date: values.return_date || null,
    });
    toast.success('Solicitud enviada a Jefatura');
    setDone(true);
  };

  const close = () => {
    setDone(false);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Solicitud de traslado</DialogTitle>
          <DialogDescription>
            Se creará una solicitud que Jefatura deberá aprobar antes de ejecutarse.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <TransferConfirmation
            title="Solicitud enviada"
            description="La solicitud queda pendiente de aprobación por Jefatura."
            onClose={close}
          />
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TransferModalHeader equipment={equipment} origin={origin} destination={destination} />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="expected_date">Fecha estimada</Label>
                <Input id="expected_date" type="date" {...form.register('expected_date')} />
                {form.formState.errors.expected_date && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.expected_date.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="return_date">Fecha de retorno</Label>
                <Input
                  id="return_date"
                  type="date"
                  disabled={!isTemporary}
                  {...form.register('return_date')}
                />
                {form.formState.errors.return_date && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.return_date.message}
                  </p>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={isTemporary}
                onCheckedChange={(v) => form.setValue('is_temporary', Boolean(v))}
              />
              <span className="text-sidebar">Traslado temporal (requiere fecha de retorno)</span>
            </label>

            <div className="space-y-1.5">
              <Label htmlFor="justification">Justificación</Label>
              <Textarea
                id="justification"
                rows={4}
                placeholder="Explicá por qué se necesita este traslado…"
                {...form.register('justification')}
              />
              {form.formState.errors.justification && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.justification.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={close}>
                Cancelar
              </Button>
              <Button type="submit">Enviar solicitud</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RequestTransferModal;
