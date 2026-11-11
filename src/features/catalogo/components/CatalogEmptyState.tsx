import { SearchX, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CatalogEmptyStateProps {
  icon?: LucideIcon;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const CatalogEmptyState = ({
  icon: Icon = SearchX,
  message = "No hay equipos que coincidan con tu búsqueda",
  actionLabel = "Limpiar filtros",
  onAction,
}: CatalogEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-16 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Icon className="h-6 w-6" />
    </div>
    <p className="text-sm font-medium text-muted-foreground">{message}</p>
    {onAction && (
      <Button variant="outline" size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export default CatalogEmptyState;
