import { z } from 'zod'

export const CategorySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  photo: z.string().nullable(),
  departmentId: z.number().int(),
  department: z
    .object({
      id: z.number().int(),
      name: z.string(),
    })
    .nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
})

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().optional(),
  photo: z.string().nullable().optional(),
  departmentId: z.coerce.number().int().min(1, 'Select a department'),
  isActive: z.boolean().default(true),
})

export const UpdateCategorySchema = CreateCategorySchema.partial()

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>
