import type { Attribute } from "@features/admin/attributes/types/attributes.types";
import type { Group } from "@features/admin/groups/types/groups.types";
import type {
  CreateProductMarketingMediaDto,
  CreateProductMediaDto,
  CreateProductVendorDto,
  ProductType,
  UpsertProductGroupFieldValueDto,
  UpsertProductPhysicalAttributesDto,
  UpsertProductZoneDto,
} from "@features/admin/products/contracts/products.contracts";
import type {
  CreateProductInput,
  ProductCreateWorkspaceValues,
} from "../schemas/products.schema";

export type ProductCreateTabKey =
  | "basic"
  | "physical"
  | "group-fields"
  | "media"
  | "marketing"
  | "lot-matrix"
  | "vendors"
  | "zones";

export type ProductCreateTabDefinition = {
  key: ProductCreateTabKey;
  label: string;
  badge?: number;
};

export type ProductGroupFieldOptionDraft = {
  id: string;
  label: string;
  value: string;
};

export type ProductGroupFieldValueDraft = {
  fieldId: string;
  name: string;
  key: string;
  type: "text" | "textarea" | "number" | "boolean" | "dropdown";
  isRequired: boolean;
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean;
  valueOptionId: string | null;
  options: ProductGroupFieldOptionDraft[];
};

export type ProductGroupFieldValuePayloadItem = UpsertProductGroupFieldValueDto;

export type ProductMediaDraft = CreateProductMediaDto & {
  clientId?: string;
};

export type ProductMarketingMediaDraft = CreateProductMarketingMediaDto & {
  clientId?: string;
};

export type ProductVendorDraft = CreateProductVendorDto & {
  clientId?: string;
};

export type ProductZoneDraft = UpsertProductZoneDto & {
  clientId?: string;
};

export type ProductPhysicalAttributesDraft = UpsertProductPhysicalAttributesDto;

export type ProductLotMatrixAttributeValueDefinition = {
  id: string;
  label: string;
};

export type ProductLotMatrixAttributeDefinition = {
  id: string;
  name: string;
  values: ProductLotMatrixAttributeValueDefinition[];
};

export type ProductLotMatrixAttributeBuilderInput = {
  name: string;
  values: string[];
};

export type ProductLotMatrixSelectionDraft = {
  attributeId: string;
  attributeName: string;
  attributeValueId: string | null;
  attributeValueLabel: string | null;
};

export type ProductLotMatrixRowDraft = {
  id: string;
  sku: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  source: "generated" | "manual";
  selections: ProductLotMatrixSelectionDraft[];
};

export type ProductLotMatrixVariantPayloadItem = {
  sku: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  attributeValueIds: string[];
};

export type ProductLotMatrixDraft = {
  attributeIds: string[];
  expectedVariantCount: number;
  preview: string[];
  variants: ProductLotMatrixVariantPayloadItem[];
};

export type ProductCreateWorkspaceState = {
  groupFieldValues: ProductGroupFieldValueDraft[];
  media: ProductMediaDraft[];
  marketingMedia: ProductMarketingMediaDraft[];
  selectedAttributeIds: string[];
  lotMatrixRows: ProductLotMatrixRowDraft[];
  vendors: ProductVendorDraft[];
  zones: ProductZoneDraft[];
};

export type ProductCreateWorkspacePayload = {
  product: CreateProductInput;
  physicalAttributes: ProductPhysicalAttributesDraft | null;
  groupFieldValues: { values: ProductGroupFieldValuePayloadItem[] };
  media: ProductMediaDraft[];
  marketingMedia: ProductMarketingMediaDraft[];
  lotMatrix: ProductLotMatrixDraft | null;
  vendors: ProductVendorDraft[];
  zones: ProductZoneDraft[];
};

export type ProductCreateSetupItem = {
  label: string;
  value: string;
  tone: "neutral" | "info" | "success" | "warning";
  detail: string;
};

export type ProductCreateSummary = {
  currentTabLabel: string;
  productName: string;
  productCode: string;
  description: string | null;
  primaryMediaUrl: string | null;
  productTypeLabel: string;
  isActive: boolean;
  itemInactive: boolean;
  departmentName: string | null;
  categoryName: string | null;
  subCategoryName: string | null;
  groupName: string | null;
  completionText: string;
  setupItems: ProductCreateSetupItem[];
};

export type ProductCreateWorkspaceContext = {
  values: ProductCreateWorkspaceValues;
  state: ProductCreateWorkspaceState;
  attributes: Attribute[];
};

export type ProductCreateClassificationContext = {
  departmentName: string | null;
  categoryName: string | null;
  subCategoryName: string | null;
  groupName: string | null;
};

export type ProductCreateCatalogContext = ProductCreateClassificationContext & {
  currentTabLabel: string;
  productTypeLabel: string;
};

export type ProductCreateInitializers = {
  createEmptyGroupFieldValues: (group: Group | undefined) => ProductGroupFieldValueDraft[];
  createEmptyMediaItem: (index: number) => ProductMediaDraft;
  createEmptyMarketingMediaItem: (index: number) => ProductMarketingMediaDraft;
  createEmptyVendorItem: (index: number) => ProductVendorDraft;
  createEmptyZoneItem: () => ProductZoneDraft;
};

export type ProductCardMetric = {
  label: string;
  value: string;
  tone: "neutral" | "info" | "success" | "warning";
};

export type ProductGridCardModel = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  productType: ProductType;
  isActive: boolean;
  itemInactive: boolean;
  departmentName: string;
  categoryName: string;
  subCategoryName: string;
  groupName: string;
  priceLabel: string;
  stockLabel: string;
  setupMetrics: ProductCardMetric[];
};
