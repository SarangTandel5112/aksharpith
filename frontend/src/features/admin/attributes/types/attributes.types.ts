import type {
  CreateAttributeValueDto,
  CreateProductAttributeDto,
  ProductAttributeResponseDto,
  ProductAttributeValueResponseDto,
  UpdateAttributeValueDto,
  UpdateProductAttributeDto,
} from "@features/admin/attributes/contracts/attributes.contracts";
import type { PaginatedResponse } from "@shared/types/core";

export type ProductAttributeValue = Omit<
  ProductAttributeValueResponseDto,
  "value"
> & {
  attributeId: string;
  label: ProductAttributeValueResponseDto["value"];
};
export type ProductAttribute = Omit<ProductAttributeResponseDto, "values"> & {
  values: ProductAttributeValue[];
};
export type Attribute = ProductAttribute;
export type PaginatedAttributes = PaginatedResponse<Attribute>;
export type CreateAttributeInput = CreateProductAttributeDto;
export type UpdateAttributeInput = UpdateProductAttributeDto;
export type AttributeValueInput = CreateAttributeValueDto;
export type UpdateAttributeValueInput = UpdateAttributeValueDto;

export type AttributeValueUsageSummary = {
  valueId: string;
  productCount: number;
  lotMatrixRowCount: number;
  inUse: boolean;
};

export type AttributeUsageSummary = {
  productCount: number;
  lotMatrixRowCount: number;
  inUse: boolean;
  valueUsageById: Record<string, AttributeValueUsageSummary>;
};
