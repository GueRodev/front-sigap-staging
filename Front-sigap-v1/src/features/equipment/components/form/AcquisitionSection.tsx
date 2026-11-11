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

import { ACQUISITION_TYPE_OPTIONS } from "../../constants/equipment.constants";
import type { EquipmentFormValues } from "../../schemas/equipmentSchema";

interface SectionProps {
  control: Control<EquipmentFormValues>;
  /** Fase 7 — respaldos documentales solo para roles con acceso financiero. */
  canViewFinancial?: boolean;
}

const AcquisitionSection = ({ control, canViewFinancial = true }: SectionProps) => (
  <FormSection
    title="Adquisición"
    description="Cómo ingresó el activo a la institución y sus respaldos documentales."
  >
    <FormField
      control={control}
      name="acquisition_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tipo de adquisición *</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {ACQUISITION_TYPE_OPTIONS.map((option) => (
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

    {canViewFinancial && (
      <>
      <FormField
        control={control}
        name="purchase_order_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Orden de compra</FormLabel>
            <FormControl>
              <Input maxLength={50} {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="invoice_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>N.º de factura</FormLabel>
            <FormControl>
              <Input maxLength={50} {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      </>
    )}

    <FormField
      control={control}
      name="acquired_at"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Fecha de adquisición</FormLabel>
          <FormControl>
            <Input type="date" {...field} value={field.value ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={control}
      name="received_at"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Fecha de recepción</FormLabel>
          <FormControl>
            <Input type="date" {...field} value={field.value ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={control}
      name="warranty_expires_at"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Vence garantía</FormLabel>
          <FormControl>
            <Input type="date" {...field} value={field.value ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </FormSection>
);

export default AcquisitionSection;
