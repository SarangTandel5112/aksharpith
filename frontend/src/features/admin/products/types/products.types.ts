import type {
  GroupFieldResponseDto,
  ProductGroupFieldValueResponseDto,
  ProductMarketingMediaResponseDto,
  ProductMediaResponseDto,
  ProductPhysicalAttributesResponseDto,
  ProductResponseDto,
  ProductType,
  ProductVendorResponseDto,
  ProductZoneResponseDto,
} from "@shared/contracts";

export type Product = ProductResponseDto;
export type ProductPhysicalAttributes = ProductPhysicalAttributesResponseDto;
export type ProductMediaItem = ProductMediaResponseDto;
export type ProductMarketingMediaItem = ProductMarketingMediaResponseDto;
export type ProductVendor = ProductVendorResponseDto;
export type ProductZone = ProductZoneResponseDto;

export type ProductGroupFieldValue = ProductGroupFieldValueResponseDto & {
  fieldName: string;
  fieldType: GroupFieldResponseDto["type"];
  displayValue: string;
};

export type ProductListRow = {
  id: number;
  product: Product;
  departmentName: string;
  categoryName: string;
  subCategoryName: string;
  groupName: string;
  mediaCount: number;
  marketingMediaCount: number;
  variantCount: number;
  activeVariantCount: number;
};

export type ProductWorkspaceTabKey =
  | "overview"
  | "physical-attributes"
  | "group-field-values"
  | "media"
  | "marketing-media"
  | "vendors"
  | "zones"
  | "metadata";

export type ProductWorkspaceTab = {
  key: ProductWorkspaceTabKey;
  label: string;
  description: string;
};

export type ProductTypeLabel = ProductType;
