import { z } from 'zod'

export const SubCategorySchema = z.object({
  id: z.string(), name: z.string(), description: z.string(),
  category: z.object({ id: z.string(), name: z.string() }),
  createdAt: z.string(), updatedAt: z.string(),
})

export const CreateSubCategorySchema = z.object({
  name:        z.string().min(1, 'Sub-category name is required'),
  description: z.string().optional(),
  categoryId:  z.string().uuid('Select a category'),
})

export const UpdateSubCategorySchema = CreateSubCategorySchema.partial()

export type CreateSubCategoryInput = z.infer<typeof CreateSubCategorySchema>
export type UpdateSubCategoryInput = z.infer<typeof UpdateSubCategorySchema>
