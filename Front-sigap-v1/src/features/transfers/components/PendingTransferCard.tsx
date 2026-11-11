import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

import type { Transfer } from '../types/transfer.types';
import { useTransfersStore } from '../hooks/useTransfersStore';
import TransferStatusBadge from './TransferStatusBadge';

interface Props {
  transfer: Transfer;
  equipment?: Equipment;
  origin?: Area;
  destination?: Area;
  requester?: { name: string; email: string } | null;
}

const PendingTransferCard = ({ transfer, equipment, origin, destination, requester }: Props) => {
  const { user } = useCurrentMockUser();
  const approve = useTransfersStore((s) => s.approve);
  const reject = useTransfersStore((s) => s.reject);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);

  const handleApprove = () => {
    approve({ transfer_id: transfer.id, approved_by_id: user.id, notes: null });
    toast.success('Solicitud aprobada — el traslado se ejecutó.');
  };

  const submitReject = () => {
    if (reason.trim().length < 6) {
      setReasonError('El motivo debe tener al menos 6 caracteres.');
      return;
    }
    reject({ transfer_id: transfer.id, rejected_by_id: user.id, reason: reason.trim() });
    toast.success('Solicitud rechazada.');
    setRejectOpen(false);
    setReason('');
    setReasonError(null);
  };

  const plate = equipment?.institutional_plate ?? equipment?.internal_plate ?? '—';

  return (
    <Card className="border-slate-200">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-sm font-semibold text-sidebar">
              {equipment?.name ?? `Equipo #${transfer.equipment_id}`}
            </p>
            <p className="text-xs text-muted-foreground">{plate}</p>
          </div>
          <TransferStatusBadge status={transfer.status} />
        </div>

        <div className="grid grid-cols-1 gap-2 rounded-md bg-slate-50/70 p-3 text-xs sm:grid-cols-2">
          <p>
            <span className="font-semibold text-sidebar">Origen:</span>{' '}
            {origin?.name ?? '—'}
          </p>
          <p>
            <span className="font-semibold text-sidebar">Destino:</span>{' '}
            {destination?.name ?? '—'}
          </p>
          <p>
            <span className="font-semibold text-sidebar">Solicitante:</span>{' '}
            {requester?.name ?? `Usuario #${transfer.requested_by_id}`}
          </p>
          <p>
            <span className="font-semibold text-sidebar">Fecha estimada:</span>{' '}
            {transfer.expected_date ?? '—'}
            {transfer.is_temporary && transfer.return_date && (
              <>
                {' · '}
                <span className="font-semibold text-sidebar">Retorno:</span>{' '}
                {transfer.return_date}
              </>
            )}
          </p>
        </div>

        {transfer.request_reason && (
          <blockquote className="border-l-2 border-sigap-sky pl-3 text-sm italic text-muted-foreground">
            "{transfer.request_reason}"
          </blockquote>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRejectOpen(true)}
            className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <XCircle className="h-4 w-4" />
            Rechazar
          </Button>
          <Button size="sm" onClick={handleApprove} className="gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            Aprobar
          </Button>
        </div>
      </CardContent>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar solicitud</DialogTitle>
            <DialogDescription>
              Indicá al solicitante por qué se rechaza esta solicitud de traslado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason">Motivo del rechazo</Label>
            <Textarea
              id="reject-reason"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError) setReasonError(null);
              }}
            />
            {reasonError && <p className="text-xs text-destructive">{reasonError}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={submitReject}>
              Rechazar solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PendingTransferCard;
