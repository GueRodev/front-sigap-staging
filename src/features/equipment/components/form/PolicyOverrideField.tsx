import { Control, FieldPath } from "react-hook-form";

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

import type { EquipmentFormValues } from "../../schemas/equipmentSchema";

const INHERIT = "__inherit__";

type OverrideName = Extract<
  FieldPath<EquipmentFormValues>,
  | "is_loanable"
  | "is_publicly_visible"
  | "loan_approval_level"
  | "transfer_requires_approval"
  | "transfer_approval_level"
>;

interface PolicyOverrideFieldProps {
  control: Control<EquipmentFormValues>;
  name: OverrideName;
  label: string;
  /** Opciones del override (sin contar "Heredado"). */
  options: { value: string; label: string }[];
  /** Etiqueta del valor que se hereda del área actual, si se conoce. */
  inheritedLabel: string | null;
  /** Convierte el valor del `Select` al valor del formulario. */
  parse: (raw: string) => boolean | string;
}

/**
 * Campo ternario del Patrón 6: Heredado / <opciones>.
 * `null` en el formulario significa "hereda el default del área actual".
 */
const PolicyOverrideField = ({
  control,
  name,
  label,
  options,
  inheritedLabel,
  parse,
}: PolicyOverrideFieldProps) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <Select
          value={field.value === null || field.value === undefined ? INHERIT : String(field.value)}
          onValueChange={(raw) => field.onChange(raw === INHERIT ? null : parse(raw))}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value={INHERIT}>
              Heredado{inheritedLabel ? ` — ${inheritedLabel}` : ""}
            </SelectItem>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormDescription className="text-xs">
          {field.value === null || field.value === undefined
            ? inheritedLabel
              ? `Usa la política del área: ${inheritedLabel}.`
              : "Usa la política del área actual."
            : "Override individual: ignora la política del área."}
        </FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
);

export default PolicyOverrideField;
