import { z } from "zod";

export const CategoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  description: z
    .string()
    .max(500)
    .optional()
    .transform((v) => v || undefined),
  departmentId: z.string().min(1, "Please select a department"),
});

export type CategoryFormValues = z.output<typeof CategoryFormSchema>;
export type CategoryFormInput = z.input<typeof CategoryFormSchema>;
