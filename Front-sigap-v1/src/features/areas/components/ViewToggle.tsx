import { LayoutGrid, Layers, Table as TableIcon } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { AreaView } from "../types/area.types";

interface ViewToggleProps {
  value: AreaView;
  onChange: (v: AreaView) => void;
}

const ViewToggle = ({ value, onChange }: ViewToggleProps) => (
  <ToggleGroup
    type="single"
    value={value}
    onValueChange={(v) => v && onChange(v as AreaView)}
    className="rounded-md border border-border bg-card p-0.5"
  >
    <ToggleGroupItem value="cards" aria-label="Tarjetas" className="h-10 w-10 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
      <LayoutGrid className="!h-5 !w-5" strokeWidth={2.25} />
    </ToggleGroupItem>
    <ToggleGroupItem value="zones" aria-label="Agrupado por zona" className="h-10 w-10 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
      <Layers className="!h-5 !w-5" strokeWidth={2.25} />
    </ToggleGroupItem>
    <ToggleGroupItem value="table" aria-label="Tabla" className="h-10 w-10 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
      <TableIcon className="!h-5 !w-5" strokeWidth={2.25} />
    </ToggleGroupItem>
  </ToggleGroup>
);

export default ViewToggle;
