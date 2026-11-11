import { Control } from "react-hook-form";

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

import type { EquipmentFormValues } from "../../schemas/equipmentSchema";

interface SectionProps {
  control: Control<EquipmentFormValues>;
}

const FinancialSection = ({ control }: SectionProps) => {
  return (
    <FormSection title="Información financiera" description="Costo y moneda del activo.">
      <FormField
        control={control}
        name="acquisition_cost"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Costo de adquisición</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
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
        name="currency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Moneda</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione moneda" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="CRC">CRC — Colón costarricense</SelectItem>
                <SelectItem value="USD">USD — Dólar estadounidense</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
};

export default FinancialSection;
