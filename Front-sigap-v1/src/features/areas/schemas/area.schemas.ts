import { z } from "zod";

export const areaFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(120),
  type: z.enum(["loan_public", "laboratory", "office", "technical"]),
  zone: z.string().max(30).optional().or(z.literal("")),
  building: z.string().max(80).optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  default_is_loanable: z.boolean(),
  default_is_publicly_visible: z.boolean(),
  default_loan_approval_level: z.enum(["none", "single", "double"]),
  default_transfer_requires_approval: z.boolean(),
  default_transfer_approval_level: z.enum(["none", "single", "double"]),
});

export type AreaFormValues = z.infer<typeof areaFormSchema>;
