import { z } from "zod";

export const CreateProductSchema = z.object({
  code: z
    .string()
    .min(1, "Product code is required")
    .max(10)
    .regex(/^[A-Za-z0-9]+$/, "Product code must be alphanumeric"),
  upc: z.string().min(1, "UPC is required").max(20),
  name: z.string().min(1, "Product name is required").max(150),
  type: z.enum(["Standard", "Lot Matrix"]).default("Standard"),
  description: z.string().max(500).optional(),
  model: z.string().max(100).optional(),
  hsnCode: z
    .string()
    .min(4, "HSN code is required")
    .max(8)
    .regex(/^\d{4,8}$/, "HSN code must be 4, 6, or 8 digits"),
  price: z.coerce.number().min(0, "Price must be 0 or more").default(0),
  stockQuantity: z.coerce
    .number()
    .int()
    .min(0, "Stock must be 0 or more")
    .default(0),
  departmentId: z.string().min(1, "Select a department"),
  subCategoryId: z.string().min(1, "Select a sub-category"),
  groupId: z.string().min(1, "Select a group"),
  nonTaxable: z.boolean().default(false),
  itemInactive: z.boolean().default(false),
  nonStockItem: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const ProductCreateWorkspaceSchema = CreateProductSchema.extend({
  physicalWeight: z.string().max(50).nullable().optional(),
  physicalLength: z.string().max(50).nullable().optional(),
  physicalWidth: z.string().max(50).nullable().optional(),
  physicalHeight: z.string().max(50).nullable().optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductCreateWorkspaceValues = z.infer<
  typeof ProductCreateWorkspaceSchema
>;
