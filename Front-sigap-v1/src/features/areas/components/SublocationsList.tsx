import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

import type { AreaSublocation } from "../types/area.types";
import { useAreaMutations } from "../hooks/useAreaMutations";

interface SublocationsListProps {
  areaId: number;
  sublocations: AreaSublocation[];
  canManage: boolean;
}

const SublocationsList = ({ areaId, sublocations, canManage }: SublocationsListProps) => {
  const [name, setName] = useState("");
  const { addSublocation, removeSublocation } = useAreaMutations();

  const handleAdd = async () => {
    const value = name.trim();
    if (!value) return;
    await addSublocation(areaId, value);
    setName("");
    toast.success("Sublocación agregada");
  };

  return (
    <div className="space-y-3">
      {canManage && (
        <div className="flex items-center gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de sublocación"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleAdd();
              }
            }}
          />
          <Button size="sm" onClick={handleAdd} disabled={!name.trim()}>
            <Plus className="mr-1 h-4 w-4" />
            Agregar
          </Button>
        </div>
      )}

      {sublocations.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="Sin sublocaciones"
          description={canManage ? "Podés crear una arriba." : "Ningún encargado ha añadido sublocaciones."}
        />
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {sublocations.map((s) => (
            <li key={s.id} className="flex items-center justify-between px-3 py-2">
              <span className="text-sm text-foreground">{s.name}</span>
              {canManage && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={async () => {
                    await removeSublocation(s.id);
                    toast.success("Sublocación eliminada");
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SublocationsList;
