import type {
  CreateProductVariantDto,
  ProductVariantResponseDto,
  UpdateProductVariantDto,
} from "@features/admin/variants/contracts/variants.contracts";
import type { ProductAttributeResponseDto } from "@features/admin/attributes/contracts/attributes.contracts";
import type { ProductResponseDto as ProductDto } from "@features/admin/products/contracts/products.contracts";

export type VariantAttributeLink = {
  variantId: string;
  attributeId: ProductAttributeResponseDto["id"];
  attributeValueId: string;
};

export type Variant = ProductVariantResponseDto & {
  variantAttributes: VariantAttributeLink[];
};
export type VariantCreateInput = CreateProductVariantDto;
export type VariantUpdateInput = UpdateProductVariantDto;

export type VariantListRow = {
  id: string;
  sku: string;
  attributesSummary: string;
  price: number | null;
  stockQuantity: number;
  isActive: boolean;
};

export type DirectVariantWorkspaceRow = {
  id: string;
  productId: ProductDto["id"];
  productName: ProductDto["name"];
  productCode: ProductDto["sku"];
  productType: ProductDto["productType"];
  variantCount: number;
  activeVariantCount: number;
};

export type VariantGenerateInput = {
  attributeIds: string[];
};

export type LotMatrixState = {
  selectedAttributeIds: string[];
  isSubmitting: boolean;
  setSelectedAttributeIds: (attributeIds: string[]) => void;
  toggleAttribute: (attributeId: string) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
};
