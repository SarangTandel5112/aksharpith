import { z } from 'zod'

export const CreateProductSchema = z.object({
  name:          z.string().min(1, 'Product name is required'),
  description:   z.string().optional(),
  sku:           z.string().min(1, 'SKU is required'),
  price:         z.number().int().positive('Price must be positive'),
  categoryId:    z.string().uuid('Select a category'),
  subCategoryId: z.string().uuid('Select a sub-category'),
  departmentId:  z.string().uuid('Select a department'),
})

export const UpdateProductSchema = CreateProductSchema.partial()

export type CreateProductInput = z.infer<typeof CreateProductSchema>
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>
