export type CreateProductVariantDto = {
  sku: string;
  upc?: string | null;
  costPrice?: number | null;
  unitPrice?: number | null;
  salePrice?: number | null;
  stockQuantity?: number;
  attributeValueIds: number[];  // the combination that defines this variant
};
