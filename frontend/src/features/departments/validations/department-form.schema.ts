import { z } from "zod";

export const DepartmentFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters"),
  code: z
    .string()
    .max(10, "Code must be under 10 characters")
    .optional()
    .transform((value) => value?.trim() || undefined),
  description: z
    .string()
    .optional()
    .transform((value) => value || undefined),
  isActive: z.boolean().default(true),
});

export type DepartmentFormValues = z.infer<typeof DepartmentFormSchema>;

export const DepartmentPatchSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters")
    .optional(),
  code: z
    .string()
    .max(10, "Code must be under 10 characters")
    .optional()
    .transform((value) => value?.trim() || undefined),
  description: z
    .string()
    .optional(),
  isActive: z.boolean().optional(),
});

export type DepartmentPatchValues = z.infer<typeof DepartmentPatchSchema>;
