export type UpdateProductVariantDto = {
  sku?: string;
  upc?: string | null;
  costPrice?: number | null;
  unitPrice?: number | null;
  salePrice?: number | null;
  stockQuantity?: number;
  isActive?: boolean;
};
