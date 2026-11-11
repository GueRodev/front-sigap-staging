import { z } from "zod";

const plateTypes = ["institutional", "internal", "bulk"] as const;

const statuses = [
  "disponible",
  "asignado",
  "prestado",
  "reparacion",
  "mantenimiento",
  "desechado",
  "extraviado",
  "donado",
  "traslado",
] as const;

const acquisitionTypes = [
  "compra",
  "donacion",
  "transferencia",
  "comodato",
  "produccion_propia",
] as const;

const approvalLevels = ["none", "single", "double"] as const;

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal("").transform(() => undefined));

export const equipmentSchema = z
  .object({
    // Identification
    plate_type: z.enum(plateTypes, { required_error: "Seleccione un tipo de placa" }),
    institutional_plate: optionalString(50),
    internal_plate: optionalString(50),
    oaf_name: optionalString(255),
    barcode: optionalString(100),
    serial_number: optionalString(100),

    // Description
    name: z
      .string({ required_error: "El nombre es requerido" })
      .trim()
      .min(2, "Mínimo 2 caracteres")
      .max(255, "Máximo 255 caracteres"),
    brand: optionalString(100),
    model: optionalString(150),
    color: optionalString(50),
    description: optionalString(2000),

    // Classification
    category_id: z
      .number({ required_error: "Seleccione una categoría", invalid_type_error: "Seleccione una categoría" })
      .int()
      .positive(),
    equipment_type_id: z
      .number({ required_error: "Seleccione un tipo", invalid_type_error: "Seleccione un tipo" })
      .int()
      .positive(),
    quantity_total: z.coerce.number().int().min(0, "No puede ser negativo").max(1000000),
    quantity_available: z.coerce.number().int().min(0, "No puede ser negativo").max(1000000),

    // Location & status
    current_area_id: z
      .number({ required_error: "Seleccione un área", invalid_type_error: "Seleccione un área" })
      .int()
      .positive(),
    status: z.enum(statuses),
    sub_location_id: z
      .number({ invalid_type_error: "Sublocación inválida" })
      .int()
      .positive()
      .nullable()
      .optional(),

    // ── Patrón 6 — Overrides individuales (null = hereda del área) ──────────
    is_loanable: z.boolean().nullable(),
    is_publicly_visible: z.boolean().nullable(),
    loan_approval_level: z.enum(approvalLevels).nullable(),
    transfer_requires_approval: z.boolean().nullable(),
    transfer_approval_level: z.enum(approvalLevels).nullable(),

    // Assignment & maintenance
    assigned_to_user_id: z.number().int().positive().nullable().optional(),
    maintenance_order_number: optionalString(50),

    // Acquisition & financial
    acquisition_type: z.enum(acquisitionTypes, {
      required_error: "Seleccione el tipo de adquisición",
      invalid_type_error: "Seleccione el tipo de adquisición",
    }),
    acquisition_cost: z
      .union([z.coerce.number().min(0, "No puede ser negativo"), z.literal("").transform(() => undefined)])
      .optional(),
    currency: z.string().trim().min(3).max(3),
    purchase_order_number: optionalString(50),
    invoice_number: optionalString(50),

    // Dates
    acquired_at: optionalString(10),
    received_at: optionalString(10),
    warranty_expires_at: optionalString(10),

    // Notes
    notes: optionalString(2000),
  })
  // ── Matriz de validación por tipo de placa (ADR-ACTIVOS-001) ──────────────
  .superRefine((data, ctx) => {
    const issue = (path: keyof typeof data, message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });

    if (data.plate_type === "institutional") {
      if (!data.institutional_plate) {
        issue("institutional_plate", "Requerida para activos institucionales");
      }
      if (!data.oaf_name) {
        issue("oaf_name", "El nombre OAF es obligatorio para activos institucionales");
      }
    }

    if (data.plate_type === "internal" && !data.internal_plate) {
      issue("internal_plate", "Requerida para activos con placa interna");
    }

    if (data.plate_type === "bulk") {
      if (data.quantity_total < 1) {
        issue("quantity_total", "Los activos a granel requieren una cantidad mayor a 0");
      }
    } else {
      // Los activos con placa son unitarios: las cantidades no son editables.
      if (data.quantity_total !== 1) {
        issue("quantity_total", "Los activos con placa siempre son 1 unidad");
      }
      if (data.quantity_available > 1) {
        issue("quantity_available", "Los activos con placa siempre son 1 unidad");
      }
    }

    if (data.quantity_available > data.quantity_total) {
      issue("quantity_available", "No puede superar la cantidad total");
    }
  });

export type EquipmentFormValues = z.infer<typeof equipmentSchema>;
