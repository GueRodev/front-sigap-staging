import { useMemo, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import type { Equipment } from '@/features/equipment/types/equipment.types';
import type { Area } from '@/features/areas/types/area.types';
import { useAreasStore } from '@/features/areas/hooks/useAreasStore';
import { useCurrentMockUser } from '@/features/areas/hooks/useCurrentMockUser';

import {
  sublocationChangeSchema,
  type SublocationChangeFormValues,
} from '../../schemas/transfer.schemas';
import { useTransfersStore } from '../../hooks/useTransfersStore';
import TransferModalHeader from '../TransferModalHeader';
import TransferConfirmation from '../TransferConfirmation';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment;
  area: Area;
}

const SublocationChangeModal = ({ open, onOpenChange, equipment, area }: Props) => {
  const { user } = useCurrentMockUser();
  const changeSublocation = useTransfersStore((s) => s.changeSublocation);
  const allSublocations = useAreasStore((s) => s.sublocations);
  const [done, setDone] = useState(false);

  const options = useMemo(
    () => allSublocations.filter((sl) => sl.area_id === area.id),
    [allSublocations, area.id],
  );

  const currentSublocationName =
    allSublocations.find((sl) => sl.id === equipment.sub_location_id)?.name ??
    'Sin asignar';

  const form = useForm<SublocationChangeFormValues>({
    resolver: zodResolver(sublocationChangeSchema),
    defaultValues: {
      equipment_id: equipment.id,
      area_id: area.id,
      origin_sublocation_id: equipment.sub_location_id,
      destination_sublocation_id: undefined as unknown as number,
      reason: '',
    },
  });

  const onSubmit = (values: SublocationChangeFormValues) => {
    changeSublocation({
      equipment_id: values.equipment_id,
      area_id: values.area_id,
      origin_sublocation_id: values.origin_sublocation_id,
      destination_sublocation_id: values.destination_sublocation_id,
      reason: values.reason,
      executed_by_id: user.id,
    });
    toast.success('Sublocación actualizada');
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
          <DialogTitle>Cambio de sublocación</DialogTitle>
          <DialogDescription>
            El equipo permanece en <strong>{area.name}</strong> — sólo cambia su ubicación interna.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <TransferConfirmation
            title="Sublocación actualizada"
            description={`${equipment.name} fue reubicado dentro de ${area.name}.`}
            onClose={close}
          />
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TransferModalHeader equipment={equipment} origin={area} destination={area} />

            <div className="space-y-1.5">
              <Label>Sublocación actual</Label>
              <Input value={currentSublocationName} readOnly disabled />
            </div>

            <div className="space-y-1.5">
              <Label>Nueva sublocación</Label>
              <Select
                onValueChange={(v) =>
                  form.setValue('destination_sublocation_id', Number(v), { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      options.length ? 'Seleccionar sublocación' : 'Sin sublocaciones definidas'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {options.map((sl) => (
                    <SelectItem key={sl.id} value={String(sl.id)}>
                      {sl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.destination_sublocation_id && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.destination_sublocation_id.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sl-reason">Motivo (opcional)</Label>
              <Textarea id="sl-reason" rows={2} {...form.register('reason')} />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={close}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!options.length}>
                Actualizar sublocación
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SublocationChangeModal;
