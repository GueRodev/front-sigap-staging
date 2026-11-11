import { z } from "zod";

const optionalPhone = z
  .string()
  .trim()
  .max(20)
  .optional()
  .or(z.literal("").transform(() => undefined));

export const userSchema = z.object({
  name: z.string().trim().min(2, "Mínimo 2 caracteres").max(100),
  firstSurname: z.string().trim().min(2, "Mínimo 2 caracteres").max(100),
  secondSurname: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  institutionalCode: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  phone1: z.string().trim().min(8, "Mínimo 8 caracteres").max(20),
  phone2: optionalPhone,
});

export type UserFormValues = z.infer<typeof userSchema>;