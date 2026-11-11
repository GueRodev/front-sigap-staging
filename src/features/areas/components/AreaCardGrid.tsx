import type { Area } from "../types/area.types";
import AreaCard from "./AreaCard";

interface AreaCardGridProps {
  items: Area[];
  onOpen: (area: Area) => void;
  onEdit: (area: Area) => void;
  onDelete: (area: Area) => void;
  onAssignManager: (area: Area) => void;
}

const AreaCardGrid = ({ items, onOpen, onEdit, onDelete, onAssignManager }: AreaCardGridProps) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {items.map((area) => (
      <AreaCard
        key={area.id}
        area={area}
        onOpen={onOpen}
        onEdit={onEdit}
        onDelete={onDelete}
        onAssignManager={onAssignManager}
      />
    ))}
  </div>
);

export default AreaCardGrid;
