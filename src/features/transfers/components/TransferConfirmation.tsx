import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface Props {
  title: string;
  description: string;
  onClose: () => void;
  closeLabel?: string;
}

const TransferConfirmation = ({ title, description, onClose, closeLabel = 'Volver al listado' }: Props) => (
  <div className="flex flex-col items-center gap-4 py-6 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
      <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
    </div>
    <div className="space-y-1">
      <h3 className="font-display text-lg font-semibold text-sidebar">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <Button onClick={onClose} className="mt-2">
      {closeLabel}
    </Button>
  </div>
);

export default TransferConfirmation;
