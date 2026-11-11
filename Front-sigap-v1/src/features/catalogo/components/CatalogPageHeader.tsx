import type { LucideIcon } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";

interface CatalogPageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  count: number;
}

const CatalogPageHeader = ({ title, description, icon, count }: CatalogPageHeaderProps) => (
  <PageHeader
    title={title}
    description={description}
    icon={icon}
    actions={
      <span className="text-sm font-semibold text-muted-foreground">
        {count} {count === 1 ? "equipo" : "equipos"}
      </span>
    }
  />
);

export default CatalogPageHeader;
