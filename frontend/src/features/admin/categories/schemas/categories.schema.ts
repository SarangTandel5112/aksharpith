import { z } from 'zod'

export const CategorySchema = z.object({
  id: z.string(), name: z.string(), description: z.string(),
  department: z.object({ id: z.string(), name: z.string() }),
  createdAt: z.string(), updatedAt: z.string(),
})

export const CreateCategorySchema = z.object({
  name:         z.string().min(1, 'Category name is required'),
  description:  z.string().optional(),
  departmentId: z.string().uuid('Select a department'),
})

export const UpdateCategorySchema = CreateCategorySchema.partial()

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>
