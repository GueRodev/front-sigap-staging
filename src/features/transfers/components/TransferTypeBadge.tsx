import { ArrowRightLeft, MoveHorizontal, Send } from 'lucide-react';

import { cn } from '@/lib/utils';

import {
  TRANSFER_TYPE_LABEL,
  TRANSFER_TYPE_PILL,
} from '../constants/transfer.constants';
import type { TransferType } from '../types/transfer.types';

const ICON = {
  direct: ArrowRightLeft,
  request: Send,
  sublocation_change: MoveHorizontal,
} as const;

interface Props {
  type: TransferType;
  className?: string;
}

const TransferTypeBadge = ({ type, className }: Props) => {
  const Icon = ICON[type];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        TRANSFER_TYPE_PILL[type],
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {TRANSFER_TYPE_LABEL[type]}
    </span>
  );
};

export default TransferTypeBadge;
