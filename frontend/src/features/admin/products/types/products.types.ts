import type {
  ProductGroupFieldValueResponseDto,
  ProductMarketingMediaResponseDto,
  ProductMediaResponseDto,
  ProductPhysicalAttributesResponseDto,
  ProductResponseDto,
  ProductType,
  ProductVendorResponseDto,
  ProductZoneResponseDto,
} from "@features/admin/products/contracts/products.contracts";
import type { ProductAttributeResponseDto as AttributeDto } from "@features/admin/attributes/contracts/attributes.contracts";
import type { CategoryResponseDto } from "@features/admin/categories/contracts/categories.contracts";
import type {
  GroupFieldResponseDto as GroupFieldDto,
  ProductGroupResponseDto as GroupDto,
} from "@features/admin/groups/contracts/groups.contracts";
import type { SubCategoryResponseDto } from "@features/admin/sub-categories/contracts/sub-categories.contracts";
import type { ProductVariantResponseDto } from "@features/admin/variants/contracts/variants.contracts";
import type { DepartmentResponseDto } from "@features/departments/contracts/departments.contracts";

export type Product = ProductResponseDto & {
  code: ProductResponseDto["sku"];
  type: ProductResponseDto["productType"];
  price: ProductResponseDto["basePrice"];
  department?: Pick<DepartmentResponseDto, "id" | "name"> | null;
  category?: Pick<CategoryResponseDto, "id" | "name"> | null;
  subCategory?: Pick<SubCategoryResponseDto, "id" | "name"> | null;
  group?: Pick<GroupDto, "id" | "name"> | null;
  media?: ProductMediaItem[];
  marketingMedia?: ProductMarketingMediaItem[];
  vendors?: ProductVendor[];
  zones?: ProductZone[];
  physicalAttributes?: ProductPhysicalAttributes | null;
  groupFieldValues?: ProductGroupFieldValue[];
  attributes?: AttributeDto[];
  variants?: ProductVariantResponseDto[];
};
export type ProductPhysicalAttributes = ProductPhysicalAttributesResponseDto;
export type ProductMediaItem = Omit<ProductMediaResponseDto, "mediaType"> & {
  type: ProductMediaResponseDto["mediaType"];
  mediaType: ProductMediaResponseDto["mediaType"];
};
export type ProductMarketingMediaItem = Omit<
  ProductMarketingMediaResponseDto,
  "mediaUrl" | "mediaType" | "displayOrder"
> & {
  url: ProductMarketingMediaResponseDto["mediaUrl"];
  type: ProductMarketingMediaResponseDto["mediaType"];
  sortOrder: ProductMarketingMediaResponseDto["displayOrder"];
  mediaUrl: ProductMarketingMediaResponseDto["mediaUrl"];
  mediaType: ProductMarketingMediaResponseDto["mediaType"];
  displayOrder: ProductMarketingMediaResponseDto["displayOrder"];
};
export type ProductVendor = Omit<ProductVendorResponseDto, "vendorName"> & {
  name: ProductVendorResponseDto["vendorName"];
  vendorName: ProductVendorResponseDto["vendorName"];
};
export type ProductZone = Omit<ProductZoneResponseDto, "zoneName" | "zoneCode"> & {
  name: ProductZoneResponseDto["zoneName"];
  code: ProductZoneResponseDto["zoneCode"];
  zoneName: ProductZoneResponseDto["zoneName"];
  zoneCode: ProductZoneResponseDto["zoneCode"];
};

export type ProductGroupFieldValue = ProductGroupFieldValueResponseDto & {
  fieldName: string;
  fieldType: GroupFieldDto["fieldType"];
  displayValue: string;
};

export type ProductListRow = {
  id: string;
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
