import { z } from "zod";

export const RoleFormSchema = z.object({
  roleName: z
    .string()
    .min(1, "Role name is required")
    .max(100, "Role name must be under 100 characters"),
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional()
    .transform((v) => v || undefined),
});

export type RoleFormValues = z.infer<typeof RoleFormSchema>;
