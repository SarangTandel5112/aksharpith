import { z } from 'zod'

export const CatalogProductSchema = z.object({
  id:          z.string(),
  name:        z.string(),
  sku:         z.string(),
  description: z.string(),
  basePrice:   z.number(),
  category:    z.object({ id: z.string(), name: z.string() }),
  subCategory: z.object({ id: z.string(), name: z.string() }).nullable(),
  department:  z.object({ id: z.string(), name: z.string() }),
  isActive:    z.boolean(),
  createdAt:   z.string(),
  updatedAt:   z.string(),
})

export type CatalogProductResponse = z.infer<typeof CatalogProductSchema>
