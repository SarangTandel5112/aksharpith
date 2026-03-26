import { z } from "zod";

export const AttributeValueSchema = z.object({
  valueId: z.number().int().positive().optional(),
  label: z.string().min(1, "Label is required").max(255),
  code: z.string().min(1, "Code is required").max(100),
  sortOrder: z.coerce.number().int().min(0).nullable().default(0),
  isActive: z.boolean().default(true),
});

export const CreateAttributeSchema = z.object({
  name: z.string().min(1, "Attribute name is required").max(150),
  code: z.string().min(1, "Code is required").max(100),
  sortOrder: z.coerce.number().int().min(0).nullable().default(0),
  isRequired: z.boolean().default(false),
  isActive: z.boolean().default(true),
  values: z.array(AttributeValueSchema).default([]),
});

export const UpdateAttributeSchema = CreateAttributeSchema.partial();

export type CreateAttributeInput = z.infer<typeof CreateAttributeSchema>;
export type UpdateAttributeInput = z.infer<typeof UpdateAttributeSchema>;
