import { cn } from '@/lib/utils';

import {
  TRANSFER_STATUS_LABEL,
  TRANSFER_STATUS_STYLE,
} from '../constants/transfer.constants';
import type { TransferStatus } from '../types/transfer.types';

interface Props {
  status: TransferStatus;
  className?: string;
}

const TransferStatusBadge = ({ status, className }: Props) => {
  const style = TRANSFER_STATUS_STYLE[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        style.pill,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} aria-hidden="true" />
      {TRANSFER_STATUS_LABEL[status]}
    </span>
  );
};

export default TransferStatusBadge;
