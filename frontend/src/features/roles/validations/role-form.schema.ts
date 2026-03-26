import { z } from "zod";

export const RoleFormSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(100, "Role name must be under 100 characters"),
});

export type RoleFormValues = z.infer<typeof RoleFormSchema>;
