import { Control } from "react-hook-form";

import FormSection from "@/components/shared/FormSection";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAreasStore } from "@/features/areas/hooks/useAreasStore";

import type { EquipmentFormValues } from "../../schemas/equipmentSchema";

interface SectionProps {
  control: Control<EquipmentFormValues>;
}

const UNASSIGNED = "__unassigned__";

/** Asignación individual y mantenimiento externo del activo. */
const AssignmentSection = ({ control }: SectionProps) => {
  const users = useAreasStore((s) => s.users);

  return (
    <FormSection
      title="Asignación y mantenimiento"
      description="Responsable individual del activo y referencia de mantenimiento externo."
    >
      <FormField
        control={control}
        name="assigned_to_user_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Asignado a</FormLabel>
            <Select
              value={field.value ? String(field.value) : UNASSIGNED}
              onValueChange={(value) =>
                field.onChange(value === UNASSIGNED ? null : Number(value))
              }
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sin responsable" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>Sin responsable</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription className="text-xs">
              Úselo para activos bajo custodia de una persona específica.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="maintenance_order_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Orden de mantenimiento</FormLabel>
            <FormControl>
              <Input
                maxLength={50}
                placeholder="OM-2024-0001"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormDescription className="text-xs">
              Referencia del taller o proveedor externo.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
};

export default AssignmentSection;
