export type ApiEnvelope<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type PaginatedData<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type DepartmentResponseDto = {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateDepartmentDto = {
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
};

export type UpdateDepartmentDto = Partial<CreateDepartmentDto>;

export type CategoryResponseDto = {
  id: number;
  name: string;
  description: string | null;
  photo: string | null;
  departmentId: number;
  department?: Pick<DepartmentResponseDto, "id" | "name"> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateCategoryDto = {
  name: string;
  description?: string;
  photo?: string;
  departmentId: number;
  isActive?: boolean;
};

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

export type SubCategoryResponseDto = {
  id: number;
  name: string;
  categoryId: number;
  description: string | null;
  photo: string | null;
  sortOrder: number;
  category?: Pick<CategoryResponseDto, "id" | "name"> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateSubCategoryDto = {
  name: string;
  categoryId: number;
  description?: string;
  photo?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdateSubCategoryDto = Partial<CreateSubCategoryDto>;

export type RoleResponseDto = {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateRoleDto = {
  name: string;
  isActive?: boolean;
};

export type UpdateRoleDto = Partial<CreateRoleDto>;

export type UserResponseDto = {
  id: number;
  username: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  isTempPassword: boolean;
  isActive: boolean;
  roleId: number;
  role?: Pick<RoleResponseDto, "id" | "name" | "isActive"> | null;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateUserDto = {
  username: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
  roleId?: number;
  isActive?: boolean;
};

export type UpdateUserDto = Partial<CreateUserDto>;

export type GroupFieldOptionResponseDto = {
  id: number;
  fieldId: number;
  label: string;
  value: string;
  sortOrder: number;
  isActive: boolean;
};

export type GroupFieldResponseDto = {
  id: number;
  groupId: number;
  name: string;
  key: string;
  type: "text" | "number" | "textarea" | "boolean" | "dropdown";
  isRequired: boolean;
  isFilterable: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  options: GroupFieldOptionResponseDto[];
};

export type ProductGroupResponseDto = {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  fields: GroupFieldResponseDto[];
};

export type CreateProductGroupDto = {
  name: string;
  description?: string | null;
  isActive?: boolean;
};

export type UpdateProductGroupDto = Partial<CreateProductGroupDto>;

export type CreateGroupFieldDto = {
  groupId: number;
  name: string;
  key: string;
  type: GroupFieldResponseDto["type"];
  isRequired?: boolean;
  isFilterable?: boolean;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdateGroupFieldDto = Partial<CreateGroupFieldDto>;

export type CreateGroupFieldOptionDto = {
  fieldId: number;
  label: string;
  value: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdateGroupFieldOptionDto = Partial<CreateGroupFieldOptionDto>;

export type ProductAttributeValueResponseDto = {
  id: number;
  attributeId: number;
  label: string;
  code: string;
  sortOrder: number | null;
  isActive: boolean;
  createdAt: string;
};

export type ProductAttributeResponseDto = {
  id: number;
  productId: number;
  name: string;
  code: string;
  sortOrder: number | null;
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;
  values: ProductAttributeValueResponseDto[];
};

export type CreateProductAttributeDto = {
  name: string;
  code: string;
  sortOrder?: number | null;
  isRequired?: boolean;
  isActive?: boolean;
};

export type UpdateProductAttributeDto = Partial<CreateProductAttributeDto>;

export type CreateAttributeValueDto = {
  label: string;
  code: string;
  sortOrder?: number | null;
  isActive?: boolean;
};

export type UpdateAttributeValueDto = Partial<CreateAttributeValueDto>;

export type ProductVariantMediaResponseDto = {
  id: number;
  variantId: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number | null;
  isActive: boolean;
};

export type ProductVariantResponseDto = {
  id: number;
  productId: number;
  sku: string;
  upc: string | null;
  combinationHash: string;
  cost: number | null;
  price: number | null;
  salePrice: number | null;
  stockQuantity: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string | null;
  media: ProductVariantMediaResponseDto[];
};

export type CreateProductVariantDto = {
  sku: string;
  upc?: string | null;
  cost?: number | null;
  price?: number | null;
  salePrice?: number | null;
  stockQuantity?: number;
  isActive?: boolean;
  attributeValueIds: number[];
};

export type UpdateProductVariantDto = {
  sku?: string;
  upc?: string | null;
  cost?: number | null;
  price?: number | null;
  salePrice?: number | null;
  stockQuantity?: number;
  isActive?: boolean;
};

export type ProductType = "Standard" | "Lot Matrix";

export type ProductMediaResponseDto = {
  id: number;
  productId: number;
  url: string;
  type: string;
  sortOrder: number;
  isPrimary: boolean;
  fileSize: number | null;
  fileName: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type ProductMarketingMediaResponseDto = {
  id: number;
  productId: number;
  url: string;
  type: string;
  sortOrder: number;
  thumbnailUrl: string | null;
  duration: number | null;
  fileSize: number | null;
  createdAt: string;
  updatedAt: string | null;
};

export type ProductVendorResponseDto = {
  id: number;
  productId: number;
  name: string;
  contactPerson: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  gstin: string | null;
  address: string | null;
  isPrimary: boolean;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type ProductZoneResponseDto = {
  id: number;
  productId: number;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type ProductPhysicalAttributesResponseDto = {
  id: number;
  productId: number;
  height: string | null;
  length: string | null;
  width: string | null;
  weight: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type ProductGroupFieldValueResponseDto = {
  id: number;
  productId: number;
  fieldId: number;
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  valueOptionId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type ProductResponseDto = {
  id: number;
  code: string;
  upc: string;
  name: string;
  type: ProductType;
  description: string | null;
  model: string | null;
  departmentId: number;
  subCategoryId: number;
  groupId: number | null;
  hsnCode: string;
  price: number;
  stockQuantity: number;
  nonTaxable: boolean;
  itemInactive: boolean;
  nonStockItem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  department?: Pick<DepartmentResponseDto, "id" | "name"> | null;
  subCategory?: Pick<SubCategoryResponseDto, "id" | "name"> | null;
  group?: Pick<ProductGroupResponseDto, "id" | "name"> | null;
  media?: ProductMediaResponseDto[];
  marketingMedia?: ProductMarketingMediaResponseDto[];
  vendors?: ProductVendorResponseDto[];
  zones?: ProductZoneResponseDto[];
  physicalAttributes?: ProductPhysicalAttributesResponseDto | null;
  groupFieldValues?: ProductGroupFieldValueResponseDto[];
  attributes?: ProductAttributeResponseDto[];
  variants?: ProductVariantResponseDto[];
};

export type CreateProductDto = {
  code: string;
  upc: string;
  name: string;
  type: ProductType;
  description?: string;
  model?: string;
  departmentId: number;
  subCategoryId: number;
  groupId: number;
  hsnCode: string;
  nonTaxable: boolean;
  itemInactive: boolean;
  nonStockItem: boolean;
  isActive?: boolean;
  price: number;
  stockQuantity: number;
};

export type UpdateProductDto = Partial<CreateProductDto>;

export type CreateProductMediaDto = {
  url: string;
  type: string;
  sortOrder?: number;
  isPrimary?: boolean;
  fileSize?: number | null;
  fileName?: string | null;
};

export type CreateProductMarketingMediaDto = {
  url: string;
  type: string;
  sortOrder?: number;
  thumbnailUrl?: string | null;
  duration?: number | null;
  fileSize?: number | null;
};

export type UpsertProductPhysicalAttributesDto = {
  height?: string | null;
  length?: string | null;
  width?: string | null;
  weight?: string | null;
};

export type UpsertProductZoneDto = {
  name: string;
  code?: string | null;
  description?: string | null;
  isActive?: boolean;
};

export type CreateProductVendorDto = {
  name: string;
  contactPerson?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  gstin?: string | null;
  address?: string | null;
  isPrimary?: boolean;
  notes?: string | null;
  isActive?: boolean;
};

export type UpsertProductGroupFieldValueDto = {
  fieldId: number;
  valueText?: string | null;
  valueNumber?: number | null;
  valueBoolean?: boolean | null;
  valueOptionId?: number | null;
};

export type QueryProductDto = {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: number;
  subCategoryId?: number;
  groupId?: number;
  type?: ProductType;
  isActive?: boolean;
};
