import type {
  CreateProductVariantDto,
  ProductAttributeResponseDto,
  ProductResponseDto,
  ProductVariantResponseDto,
  UpdateProductVariantDto,
} from "@shared/contracts";

export type VariantAttributeLink = {
  variantId: number;
  attributeId: ProductAttributeResponseDto["id"];
  attributeValueId: number;
};

export type Variant = ProductVariantResponseDto & {
  variantAttributes: VariantAttributeLink[];
};
export type VariantCreateInput = CreateProductVariantDto;
export type VariantUpdateInput = UpdateProductVariantDto;

export type VariantListRow = {
  id: number;
  sku: string;
  attributesSummary: string;
  price: number | null;
  stockQuantity: number;
  isActive: boolean;
};

export type DirectVariantWorkspaceRow = {
  id: number;
  productId: ProductResponseDto["id"];
  productName: ProductResponseDto["name"];
  productCode: ProductResponseDto["code"];
  productType: ProductResponseDto["type"];
  variantCount: number;
  activeVariantCount: number;
};

export type VariantGenerateInput = {
  attributeIds: number[];
};

export type LotMatrixState = {
  selectedAttributeIds: number[];
  isSubmitting: boolean;
  setSelectedAttributeIds: (attributeIds: number[]) => void;
  toggleAttribute: (attributeId: number) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
};
