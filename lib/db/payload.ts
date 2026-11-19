import { MAX_CUSTOM_LABEL_LENGTH } from "@/lib/catalog-custom";
import { z } from "zod";

const customLabelSchema = z.string().max(MAX_CUSTOM_LABEL_LENGTH);

export const StepIdSchema = z.union([
  z.literal("contact"),
  z.literal("business"),
  z.literal(1),
  z.literal("design"),
  z.literal(2),
  z.literal(3),
  z.literal("notes"),
]);

export const CharacterizationPayloadSchema = z.object({
  currentStep: StepIdSchema.optional(),
  tabs: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  fields: z.record(z.string(), z.unknown()).default({}),
  customBusinessFields: z
    .array(z.object({ id: z.string(), label: customLabelSchema }))
    .default([]),
  customContactFields: z
    .array(z.object({ id: z.string(), label: customLabelSchema }))
    .default([]),
  customDashboardTabs: z
    .array(z.object({ id: z.string(), label: customLabelSchema }))
    .default([]),
  customModuleFeatures: z
    .array(
      z.object({
        id: z.string(),
        tabId: z.string(),
        label: customLabelSchema,
      }),
    )
    .default([]),
  customModuleFields: z
    .array(
      z.object({
        id: z.string(),
        featureId: z.string(),
        label: customLabelSchema,
      }),
    )
    .default([]),
  fieldOrder: z.record(z.string(), z.array(z.string())).default({}),
  designLayout: z
    .record(z.string(), z.object({ x: z.number(), y: z.number() }))
    .default({}),
  notifyRecipients: z
    .array(z.string().email("כתובת מייל לא תקינה").max(254))
    .max(5, "ניתן להוסיף עד 5 נמענים נוספים")
    .optional(),
});

export type CharacterizationPayload = z.infer<typeof CharacterizationPayloadSchema>;
export type FormStepId = z.infer<typeof StepIdSchema>;

/** Submit body — same shape as save, without currentStep (forced to notes server-side). */
export const SubmitPayloadSchema = CharacterizationPayloadSchema.omit({ currentStep: true });
export type SubmitPayload = z.infer<typeof SubmitPayloadSchema>;

export function stepToDb(step: FormStepId): string {
  return String(step);
}

export function stepFromDb(raw: string): FormStepId {
  if (raw === "contact" || raw === "business" || raw === "design" || raw === "notes") {
    return raw;
  }
  const n = Number(raw);
  if (n === 1 || n === 2 || n === 3) return n;
  return "contact";
}

export function extractContactFromFields(fields: Record<string, unknown>) {
  const email = typeof fields.contact__email === "string" ? fields.contact__email.trim() : "";
  const organizationName =
    typeof fields.contact__organization_name === "string"
      ? fields.contact__organization_name.trim()
      : "";
  const clientName =
    typeof fields.contact__client_name === "string"
      ? fields.contact__client_name.trim()
      : "";
  const phone =
    typeof fields.contact__phone === "string" ? fields.contact__phone.trim() : null;
  return { email, organizationName, clientName, phone };
}
