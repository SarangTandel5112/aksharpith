import type {
  CreateAttributeValueDto,
  CreateProductAttributeDto,
  PaginatedData,
  ProductAttributeResponseDto,
  ProductAttributeValueResponseDto,
  UpdateAttributeValueDto,
  UpdateProductAttributeDto,
} from "@shared/contracts";

export type ProductAttributeValue = ProductAttributeValueResponseDto;
export type ProductAttribute = ProductAttributeResponseDto;
export type Attribute = ProductAttribute;
export type PaginatedAttributes = PaginatedData<Attribute>;
export type CreateAttributeInput = CreateProductAttributeDto;
export type UpdateAttributeInput = UpdateProductAttributeDto;
export type AttributeValueInput = CreateAttributeValueDto;
export type UpdateAttributeValueInput = UpdateAttributeValueDto;

export type AttributeValueUsageSummary = {
  valueId: number;
  productCount: number;
  lotMatrixRowCount: number;
  inUse: boolean;
};

export type AttributeUsageSummary = {
  productCount: number;
  lotMatrixRowCount: number;
  inUse: boolean;
  valueUsageById: Record<number, AttributeValueUsageSummary>;
};
