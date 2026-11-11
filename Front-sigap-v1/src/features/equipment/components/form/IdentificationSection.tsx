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

import { PLATE_TYPE_OPTIONS } from "../../constants/equipment.constants";
import type { EquipmentFormValues } from "../../schemas/equipmentSchema";

interface SectionProps {
  control: Control<EquipmentFormValues>;
}

const IdentificationSection = ({ control }: SectionProps) => {
  const plateType = useWatch({ control, name: "plate_type" });
  const isInstitutional = plateType === "institutional";
  const isInternal = plateType === "internal";

  return (
    <FormSection
      title="Identificación"
      description="Tipo de placa y códigos únicos del activo."
    >
      <FormField
        control={control}
        name="plate_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de placa *</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {PLATE_TYPE_OPTIONS.map((option) => (
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
        name="institutional_plate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Placa institucional{isInstitutional ? " *" : ""}</FormLabel>
            <FormControl>
              <Input placeholder="UCR-2024-00001" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="internal_plate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Placa interna{isInternal ? " *" : ""}</FormLabel>
            <FormControl>
              <Input placeholder="INT-XXX-0000" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="oaf_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre OAF{isInstitutional ? " *" : ""}</FormLabel>
            <FormControl>
              <Input
                maxLength={255}
                placeholder="Nombre registrado en la OAF"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="serial_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de serie</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="barcode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código de barras</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
};

export default IdentificationSection;
