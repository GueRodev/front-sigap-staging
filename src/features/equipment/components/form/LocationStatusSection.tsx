import { Control, useWatch } from "react-hook-form";

import FormSection from "@/components/shared/FormSection";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAreaSublocations } from "@/features/areas/hooks/useAreaSublocations";

import { STATUS_OPTIONS } from "../../constants/equipment.constants";
import { MOCK_AREAS } from "../../data/mockEquipment";
import type { EquipmentFormValues } from "../../schemas/equipmentSchema";

interface SectionProps {
  control: Control<EquipmentFormValues>;
}

const SUBLOCATION_NONE = "__none__";

const LocationStatusSection = ({ control }: SectionProps) => {
  const currentAreaId = useWatch({ control, name: "current_area_id" });
  const sublocations = useAreaSublocations(
    typeof currentAreaId === "number" ? currentAreaId : null,
  );

  return (
    <FormSection title="Ubicación y estado" description="Dónde está y bajo qué estado se encuentra.">

      <FormField
        control={control}
        name="current_area_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Área actual *</FormLabel>
            <Select
              value={field.value ? String(field.value) : ""}
              onValueChange={(value) => field.onChange(Number(value))}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un área" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {MOCK_AREAS.map((area) => (
                  <SelectItem key={area.id} value={String(area.id)}>
                    {area.name}
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
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado *</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
        name="sub_location_id"
        render={({ field }) => {
          const hasArea = typeof currentAreaId === "number";
          const hasOptions = sublocations.length > 0;
          const disabled = !hasArea || !hasOptions;
          return (
            <FormItem>
              <FormLabel>Sub-ubicación</FormLabel>
              <Select
                value={field.value ? String(field.value) : SUBLOCATION_NONE}
                onValueChange={(value) =>
                  field.onChange(value === SUBLOCATION_NONE ? null : Number(value))
                }
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !hasArea
                          ? "Seleccione un área primero"
                          : !hasOptions
                            ? "El área no tiene sublocaciones"
                            : "Seleccione una sublocación"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={SUBLOCATION_NONE}>Sin sublocación</SelectItem>
                  {sublocations.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription className="text-xs">
                Sólo se define al registrar. Los cambios posteriores se gestionan desde
                el módulo de Traslados.
              </FormDescription>
              <FormMessage />
            </FormItem>
          );
        }}
      />

    </FormSection>
  );
};

export default LocationStatusSection;
