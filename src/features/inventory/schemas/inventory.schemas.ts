import { z } from "zod";

/** Wizard — Step 1: general data. */
export const inventoryGeneralSchema = z.object({
  title: z.string().min(3, "El título es requerido").max(160),
  year: z
    .number({ invalid_type_error: "Año inválido" })
    .int()
    .min(2020, "Año fuera de rango")
    .max(2100, "Año fuera de rango"),
  scope: z.enum(["all", "area"]),
  description: z.string().max(500).optional().or(z.literal("")),
});
export type InventoryGeneralValues = z.infer<typeof inventoryGeneralSchema>;

/** Wizard — Step 2: at least one area. */
export const inventoryAreasSchema = z.object({
  areaIds: z.array(z.number().int().positive()).min(1, "Selecciona al menos un área"),
});
export type InventoryAreasValues = z.infer<typeof inventoryAreasSchema>;

/** Wizard — Step 3: assignments per area (collaborator + approver). */
export const inventoryAssignmentSchema = z.object({
  areaId: z.number().int().positive(),
  assignedTo: z
    .number({ invalid_type_error: "Selecciona un colaborador" })
    .int()
    .positive(),
  approverId: z
    .number({ invalid_type_error: "Selecciona un aprobador" })
    .int()
    .positive(),
});
export const inventoryAssignmentsSchema = z.object({
  assignments: z.array(inventoryAssignmentSchema).min(1),
});
export type InventoryAssignmentValues = z.infer<typeof inventoryAssignmentSchema>;
export type InventoryAssignmentsValues = z.infer<typeof inventoryAssignmentsSchema>;

/** Report incident modal. */
export const inventoryIncidentSchema = z.object({
  incidentType: z.enum([
    "missing_equipment",
    "severe_damage",
    "location_mismatch_unresolved",
    "unregistered_equipment",
    "other",
  ]),
  equipmentId: z.number().int().positive().nullable().optional(),
  severity: z.enum(["baja", "media", "alta", "critica"]),
  description: z.string().min(10, "Describe la incidencia (mín. 10 caracteres)").max(500),
});
export type InventoryIncidentValues = z.infer<typeof inventoryIncidentSchema>;

/** Reject area modal — reason is mandatory. */
export const rejectAreaSchema = z.object({
  reason: z.string().min(10, "El motivo es obligatorio").max(500),
});
export type RejectAreaValues = z.infer<typeof rejectAreaSchema>;

/** Submit area for review — optional note. */
export const submitForReviewSchema = z.object({
  note: z.string().max(500).optional().or(z.literal("")),
});
export type SubmitForReviewValues = z.infer<typeof submitForReviewSchema>;
