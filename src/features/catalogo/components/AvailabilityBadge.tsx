import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { CatalogStatus } from "../types/catalog.types";

interface AvailabilityBadgeProps {
  status: CatalogStatus;
  expectedReturnAt: string | null;
}

const AvailabilityBadge = ({ status, expectedReturnAt }: AvailabilityBadgeProps) => {
  if (status !== "prestado") return null;
  return (
    <span className="inline-flex items-center rounded-full border border-amber-300/60 bg-amber-400/85 px-2.5 py-0.5 text-[11px] font-semibold text-amber-950 backdrop-blur-sm">
      En préstamo
      {expectedReturnAt && ` · vuelve aprox. ${format(new Date(expectedReturnAt), "d MMM", { locale: es })}`}
    </span>
  );
};

export default AvailabilityBadge;
