import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useAreaDerived } from "../hooks/useArea";
import { useCurrentMockUser } from "../hooks/useCurrentMockUser";
import type { Area } from "../types/area.types";
import AreaTypeBadge from "./AreaTypeBadge";
import AssignedUsersStack from "./AssignedUsersStack";

interface AreaTableProps {
  items: Area[];
  onOpen: (area: Area) => void;
  onEdit: (area: Area) => void;
  onDelete: (area: Area) => void;
}

const AreaTable = ({ items, onOpen, onEdit, onDelete }: AreaTableProps) => {
  const { permissions } = useCurrentMockUser();
  const { managersOf, equipmentCountOf } = useAreaDerived();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Zona</TableHead>
          <TableHead>Edificio</TableHead>
          <TableHead>Encargado(s)</TableHead>
          <TableHead className="text-right">Equipos</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((area) => {
          const managers = managersOf(area.id);
          const canManage = permissions.manage_areas && !area.is_protected;
          return (
            <TableRow
              key={area.id}
              className="cursor-pointer"
              onClick={() => onOpen(area)}
            >
              <TableCell className="font-medium">{area.name}</TableCell>
              <TableCell><AreaTypeBadge type={area.type} /></TableCell>
              <TableCell>{area.zone ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{area.building ?? "—"}</TableCell>
              <TableCell>
                {managers.length > 0 ? (
                  <AssignedUsersStack users={managers} size="sm" />
                ) : (
                  <span className="text-xs text-muted-foreground">Sin encargado</span>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">{equipmentCountOf(area.id)}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(area)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(area)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default AreaTable;
