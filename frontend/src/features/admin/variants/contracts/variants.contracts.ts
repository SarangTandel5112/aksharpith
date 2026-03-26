export type VariantMediaType = "image" | "video";

export type VariantAttributeDto = {
  variantId: string;
  attributeId: string;
  attributeValueId: string;
};

export type ProductVariantMediaResponseDto = {
  id: string;
  variantId: string;
  url: string;
  mediaType: VariantMediaType;
  isPrimary: boolean;
  sortOrder: number | null;
  isActive: boolean;
  createdAt: string;
};

export type VariantResponseDto = {
  id: string;
  productId: string;
  sku: string;
  upc: string | null;
  cost: number | null;
  price: number | null;
  salePrice: number | null;
  stockQuantity: number;
  combinationHash: string;
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  variantAttributes: VariantAttributeDto[];
  media?: ProductVariantMediaResponseDto[];
};

export type CreateProductVariantDto = {
  sku: string;
  price: number;
  stockQuantity?: number;
  attributeValueIds: string[];
};

export type UpdateProductVariantDto = {
  price?: number;
  stockQuantity?: number;
  isActive?: boolean;
  isDeleted?: boolean;
};

export type GenerateLotMatrixDto = {
  attributeIds: string[];
};

export type ProductVariantResponseDto = VariantResponseDto;
