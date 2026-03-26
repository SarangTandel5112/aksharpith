import { z } from "zod";

export const CategoryFormSchema = z.object({
  categoryName: z.string().min(1, "Category name is required").max(100),
  description: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  photo: z.string().nullable().optional(),
  departmentId: z.string().uuid("Please select a department"),
  isActive: z.boolean().default(true),
});

export type CategoryFormValues = z.output<typeof CategoryFormSchema>;
export type CategoryFormInput = z.input<typeof CategoryFormSchema>;
