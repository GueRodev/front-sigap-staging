import { Control, useWatch } from "react-hook-form";

import FormSection from "@/components/shared/FormSection";

import { useAreaPolicyDefaults } from "../../hooks/useAreaPolicyDefaults";
import type { EquipmentFormValues } from "../../schemas/equipmentSchema";
import PolicyOverrideField from "./PolicyOverrideField";

interface SectionProps {
  control: Control<EquipmentFormValues>;
}

const BOOLEAN_OPTIONS = [
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

const LEVEL_OPTIONS = [
  { value: "none", label: "Sin aprobación" },
  { value: "single", label: "Aprobación simple" },
  { value: "double", label: "Aprobación doble" },
];

const yesNo = (value: boolean) => (value ? "Sí" : "No");
const levelLabel = (value: string) =>
  LEVEL_OPTIONS.find((o) => o.value === value)?.label ?? value;

const parseBoolean = (raw: string) => raw === "true";
const parseLevel = (raw: string) => raw;

/**
 * Patrón 6 — overrides individuales del activo.
 * Cada campo es ternario: Heredado (null) / valor explícito.
 */
const PolicyOverridesSection = ({ control }: SectionProps) => {
  const currentAreaId = useWatch({ control, name: "current_area_id" });
  const defaults = useAreaPolicyDefaults(
    typeof currentAreaId === "number" ? currentAreaId : null,
  );

  return (
    <FormSection
      title="Políticas del activo (overrides)"
      description="Por defecto cada activo hereda la política de su área. Defina un override solo cuando este activo deba comportarse distinto."
    >
      <PolicyOverrideField
        control={control}
        name="is_loanable"
        label="Prestable"
        options={BOOLEAN_OPTIONS}
        inheritedLabel={defaults ? yesNo(defaults.default_is_loanable) : null}
        parse={parseBoolean}
      />

      <PolicyOverrideField
        control={control}
        name="is_publicly_visible"
        label="Visible públicamente"
        options={BOOLEAN_OPTIONS}
        inheritedLabel={defaults ? yesNo(defaults.default_is_publicly_visible) : null}
        parse={parseBoolean}
      />

      <PolicyOverrideField
        control={control}
        name="loan_approval_level"
        label="Nivel de aprobación de préstamo"
        options={LEVEL_OPTIONS}
        inheritedLabel={defaults ? levelLabel(defaults.default_loan_approval_level) : null}
        parse={parseLevel}
      />

      <PolicyOverrideField
        control={control}
        name="transfer_requires_approval"
        label="Traslado requiere aprobación"
        options={BOOLEAN_OPTIONS}
        inheritedLabel={
          defaults ? yesNo(defaults.default_transfer_requires_approval) : null
        }
        parse={parseBoolean}
      />

      <PolicyOverrideField
        control={control}
        name="transfer_approval_level"
        label="Nivel de aprobación de traslado"
        options={LEVEL_OPTIONS}
        inheritedLabel={defaults ? levelLabel(defaults.default_transfer_approval_level) : null}
        parse={parseLevel}
      />
    </FormSection>
  );
};

export default PolicyOverridesSection;
