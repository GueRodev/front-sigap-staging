import { z } from "zod";

export const allowedUserSchema = z.object({
  email: z
    .string({ required_error: "El email es requerido" })
    .trim()
    .email("Email inválido")
    .endsWith("@ucr.ac.cr", "Debe ser un email @ucr.ac.cr"),
  baseRole: z.enum(["student", "professor", "administrative"], {
    required_error: "Seleccione un rol base",
  }),
});

export type AllowedUserFormValues = z.infer<typeof allowedUserSchema>;