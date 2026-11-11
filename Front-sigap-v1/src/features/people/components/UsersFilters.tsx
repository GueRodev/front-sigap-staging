import { RotateCcw } from "lucide-react";

import SearchInput from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { BASE_ROLE_OPTIONS, USER_STATUS_OPTIONS } from "../constants/people.constants";
import type { UserListFilters } from "../types/user.types";

interface UsersFiltersProps {
  filters: UserListFilters;
  onFiltersChange: (filters: UserListFilters) => void;
}

const UsersFilters = ({ filters, onFiltersChange }: UsersFiltersProps) => {
  const hasFilters = Boolean(filters.search || filters.baseRole || filters.status);

  return (
    <Card className="border-slate-200 bg-[hsl(var(--sigap-sky)/0.18)] shadow-sm">
      <CardContent className="p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_190px_190px_auto] md:items-center">
          <SearchInput
            value={filters.search ?? ""}
            onChange={(search) => onFiltersChange({ ...filters, search: search || undefined })}
            placeholder="Buscar por nombre, cédula, código o email..."
          />

          <Select
            value={filters.baseRole ?? "all"}
            onValueChange={(value) => onFiltersChange({ ...filters, baseRole: value === "all" ? undefined : (value as UserListFilters["baseRole"]) })}
          >
            <SelectTrigger className="bg-background font-semibold text-sidebar">
              <SelectValue placeholder="Todos los roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              {BASE_ROLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status ?? "all"}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value === "all" ? undefined : (value as UserListFilters["status"]) })}
          >
            <SelectTrigger className="bg-background font-semibold text-sidebar">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {USER_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            className="border-slate-300 bg-background font-semibold text-sidebar hover:bg-primary/10 hover:text-primary"
            onClick={() => onFiltersChange({})}
            disabled={!hasFilters}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersFilters;