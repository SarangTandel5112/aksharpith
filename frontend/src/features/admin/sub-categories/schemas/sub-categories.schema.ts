import { z } from 'zod'

export const SubCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  categoryId: z.string(),
  description: z.string().nullable(),
  photo: z.string().nullable(),
  sortOrder: z.number().int().min(0),
  category: z.object({
    id: z.string(),
    name: z.string(),
  }).nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
})

export const CreateSubCategorySchema = z.object({
  name: z.string().min(1, 'Sub-category name is required').max(100),
  categoryId: z.string().min(1, 'Select a category'),
  description: z.string().optional(),
  photo: z.string().nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
})

export const UpdateSubCategorySchema = CreateSubCategorySchema.partial()

export type CreateSubCategoryInput = z.infer<typeof CreateSubCategorySchema>
export type UpdateSubCategoryInput = z.infer<typeof UpdateSubCategorySchema>
