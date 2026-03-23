// src/features/admin/products/types/products.types.ts

export type Product = {
  id: string;
  name: string;
  productCode?: string;
  upcCode?: string;
  sku?: string;
  productType: "simple" | "variable" | "digital" | "service";
  description?: string;
  model?: string;
  departmentId?: string;
  departmentName?: string;
  department?: { id: string; name: string };
  subCategoryId?: string;
  subCategoryName?: string;
  subCategory?: { id: string; name: string };
  category?: { id: string; name: string };
  groupId?: string;
  groupName?: string;
  size?: string;
  pack?: string;
  vintage?: string;
  hsnCode?: string;
  basePrice: number;
  stockQuantity: number;
  nonTaxable: boolean;
  nonStockItem: boolean;
  isActive: boolean;
  createdAt: string;
};
