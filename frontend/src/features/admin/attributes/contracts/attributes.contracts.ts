export type AttributeValueResponseDto = {
  id: string;
  value: string;
  code: string;
  sortOrder: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type ProductAttributeResponseDto = {
  id: string;
  name: string;
  code: string;
  productId: string | null;
  sortOrder: number | null;
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  values?: AttributeValueResponseDto[];
};

export type CreateAttributeValueDto = {
  value: string;
  code?: string;
  sortOrder?: number | null;
  isActive?: boolean;
};

export type UpdateAttributeValueDto = Partial<CreateAttributeValueDto>;

export type CreateProductAttributeDto = {
  name: string;
  code?: string;
  productId?: string;
  sortOrder?: number;
  isRequired?: boolean;
  values?: CreateAttributeValueDto[];
};

export type UpdateProductAttributeDto = {
  name?: string;
  isActive?: boolean;
};

export type ProductAttributeValueResponseDto = AttributeValueResponseDto;
