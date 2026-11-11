import { z } from 'zod';

export const directTransferSchema = z.object({
  equipment_id: z.number().int().positive(),
  origin_area_id: z.number().int().positive(),
  destination_area_id: z.number().int().positive(),
  reason: z
    .string()
    .trim()
    .min(6, 'Describí brevemente el motivo del traslado (mínimo 6 caracteres).')
    .max(500),
});
export type DirectTransferFormValues = z.infer<typeof directTransferSchema>;

export const requestTransferSchema = z
  .object({
    equipment_id: z.number().int().positive(),
    origin_area_id: z.number().int().positive(),
    destination_area_id: z.number().int().positive(),
    expected_date: z.string().min(1, 'Ingresá una fecha estimada.'),
    is_temporary: z.boolean().default(false),
    return_date: z.string().nullable().optional(),
    justification: z
      .string()
      .trim()
      .min(10, 'La justificación debe tener al menos 10 caracteres.')
      .max(1000),
  })
  .refine(
    (v) => !v.is_temporary || (v.return_date && v.return_date.length > 0),
    {
      path: ['return_date'],
      message: 'Los traslados temporales requieren una fecha de retorno.',
    },
  );
export type RequestTransferFormValues = z.infer<typeof requestTransferSchema>;

export const sublocationChangeSchema = z
  .object({
    equipment_id: z.number().int().positive(),
    area_id: z.number().int().positive(),
    origin_sublocation_id: z.number().int().nullable(),
    destination_sublocation_id: z.number().int({
      message: 'Seleccioná la sublocación destino.',
    }),
    reason: z.string().trim().max(300).optional().default(''),
  })
  .refine((v) => v.destination_sublocation_id !== v.origin_sublocation_id, {
    path: ['destination_sublocation_id'],
    message: 'La sublocación destino debe ser distinta a la actual.',
  });
export type SublocationChangeFormValues = z.infer<typeof sublocationChangeSchema>;

export const rejectRequestSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(6, 'Indicá el motivo del rechazo (mínimo 6 caracteres).')
    .max(500),
});
export type RejectRequestFormValues = z.infer<typeof rejectRequestSchema>;
