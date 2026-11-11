import { Control, useWatch } from "react-hook-form";

import FormSection from "@/components/shared/FormSection";
import {
  FormControl,
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

import { useCategoriesStore } from "../../hooks/useCategoriesStore";
import type { EquipmentFormValues } from "../../schemas/equipmentSchema";

interface SectionProps {
  control: Control<EquipmentFormValues>;
}

const ClassificationSection = ({ control }: SectionProps) => {
  const categoryId = useWatch({ control, name: "category_id" });
  const plateType = useWatch({ control, name: "plate_type" });
  const isBulk = plateType === "bulk";
  const categories = useCategoriesStore((s) => s.categories);
  const types = useCategoriesStore((s) => s.types);

  const subcategories = categories.filter((c) => c.level === 1 && !c.deleted_at);
  const activeTypes = types.filter((t) => !t.deleted_at);
  const filteredTypes = categoryId
    ? activeTypes.filter((type) => type.category_id === categoryId)
    : activeTypes;

  return (
    <FormSection
      title="Clasificación"
      description="Categoría, tipo y cantidades del activo."
    >
      <FormField
        control={control}
        name="category_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoría *</FormLabel>
            <Select
              value={field.value ? String(field.value) : ""}
              onValueChange={(value) => field.onChange(Number(value))}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {subcategories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="equipment_type_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo *</FormLabel>
            <Select
              value={field.value ? String(field.value) : ""}
              onValueChange={(value) => field.onChange(Number(value))}
              disabled={!categoryId}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={categoryId ? "Seleccione un tipo" : "Elija una categoría primero"}
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {filteredTypes.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {isBulk && (
        <>
          <FormField
            control={control}
            name="quantity_total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad total *</FormLabel>
                <FormControl>
                  <Input type="number" min={1} step={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="quantity_available"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad disponible *</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

    </FormSection>
  );
};

export default ClassificationSection;
