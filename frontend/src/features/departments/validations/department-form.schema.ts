import { z } from 'zod'

export const DepartmentFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be under 500 characters')
    .optional()
    .transform((v) => v || undefined),
})

export type DepartmentFormValues = z.infer<typeof DepartmentFormSchema>
