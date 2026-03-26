import { z } from "zod";

export const CatalogProductSchema = z.object({
  id: z.number(),
  code: z.string(),
  upc: z.string(),
  name: z.string(),
  type: z.enum(["Standard", "Lot Matrix"]),
  description: z.string().nullable(),
  model: z.string().nullable(),
  departmentId: z.number(),
  subCategoryId: z.number(),
  groupId: z.number().nullable(),
  hsnCode: z.string(),
  price: z.number(),
  stockQuantity: z.number(),
  nonTaxable: z.boolean(),
  itemInactive: z.boolean(),
  nonStockItem: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export type CatalogProductResponse = z.infer<typeof CatalogProductSchema>;
