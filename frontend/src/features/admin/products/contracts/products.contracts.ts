export type ProductType = "Standard" | "Lot Matrix" | "Digital" | "Service";
export type MediaType = "photo" | "video";
export type MarketingMediaType = "photo" | "video";

export type ProductResponseDto = {
  id: string;
  name: string;
  sku: string;
  upc: string | null;
  description: string | null;
  productType: ProductType;
  basePrice: number;
  model: string | null;
  stockQuantity: number;
  departmentId: string | null;
  subCategoryId: string | null;
  groupId: string | null;
  hsnCode: string | null;
  nonTaxable: boolean;
  itemInactive: boolean;
  nonStockItem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateProductDto = {
  name: string;
  sku: string;
  upc?: string;
  description?: string;
  productType?: ProductType;
  basePrice?: number;
  model?: string;
  stockQuantity?: number;
  departmentId?: string;
  subCategoryId?: string;
  groupId?: string;
  hsnCode?: string;
  nonTaxable?: boolean;
  itemInactive?: boolean;
  nonStockItem?: boolean;
  isActive?: boolean;
};

export type UpdateProductDto = Partial<CreateProductDto> & {
  clearFieldValues?: boolean;
};

export type QueryProductDto = {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  subCategoryId?: string;
  groupId?: string;
  productType?: ProductType;
  isActive?: boolean;
  itemInactive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  gf?: Record<string, string>;
};

export type ProductMediaResponseDto = {
  id: string;
  productId: string;
  url: string;
  mediaType: MediaType;
  sortOrder: number;
  isPrimary: boolean;
  fileSize: number | null;
  fileName: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateProductMediaDto = {
  url: string;
  mediaType?: MediaType;
  sortOrder?: number;
  isPrimary?: boolean;
};

export type ProductMarketingMediaResponseDto = {
  id: string;
  productId: string;
  mediaUrl: string;
  mediaType: MarketingMediaType;
  displayOrder: number;
  thumbnailUrl: string | null;
  duration: number | null;
  fileSize: number | null;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateMarketingMediaDto = {
  mediaUrl: string;
  mediaType?: MarketingMediaType;
  displayOrder?: number;
  thumbnailUrl?: string;
  duration?: number;
  fileSize?: number;
};

export type ProductVendorResponseDto = {
  id: string;
  productId: string;
  vendorName: string;
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

export type CreateProductVendorDto = {
  vendorName: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  gstin?: string;
  address?: string;
  isPrimary?: boolean;
  notes?: string;
  isActive?: boolean;
};

export type ProductZoneResponseDto = {
  id: string;
  productId: string;
  zoneName: string;
  zoneCode: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateProductZoneDto = {
  zoneName: string;
  zoneCode?: string;
  description?: string;
  isActive?: boolean;
};

export type ProductPhysicalAttributesResponseDto = {
  id: string;
  productId: string;
  height: string | number | null;
  length: string | number | null;
  width: string | number | null;
  weight: string | number | null;
  createdAt: string;
  updatedAt: string | null;
};

export type UpsertPhysicalAttributesDto = {
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
};

export type ProductGroupFieldValueResponseDto = {
  id: string;
  productId: string;
  fieldId: string;
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  valueOptionId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type UpsertGroupFieldValueDto = {
  fieldId: string;
  valueText?: string | null;
  valueNumber?: number | null;
  valueBoolean?: boolean | null;
  valueOptionId?: string | null;
};

export type FieldValueItemDto = UpsertGroupFieldValueDto;

export type BulkUpsertGroupFieldValuesDto = {
  values: FieldValueItemDto[];
};

export type CreateProductMarketingMediaDto = CreateMarketingMediaDto;
export type UpsertProductPhysicalAttributesDto = UpsertPhysicalAttributesDto;
export type UpsertProductGroupFieldValueDto = UpsertGroupFieldValueDto;
export type UpsertProductZoneDto = CreateProductZoneDto;
