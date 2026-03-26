import type { ProductMarketingWorkspaceRow } from "@features/admin/marketing-media/types/marketing-media.types";
import type { ProductMediaWorkspaceRow } from "@features/admin/media/types/media.types";
import type {
  DirectVariantWorkspaceRow,
  Variant,
} from "@features/admin/variants/types/variants.types";
import type {
  Product,
  ProductListRow,
  ProductWorkspaceTab,
} from "../types/products.types";
import {
  findGroup,
  getCategoryForProduct,
  getMarketingMediaForProduct,
  getMediaForProduct,
  getVariantsForProduct,
  MOCK_ATTRIBUTES,
  MOCK_PRODUCTS,
} from "./product-admin.mock";

export const PRODUCT_WORKSPACE_TABS: ProductWorkspaceTab[] = [
  {
    key: "overview",
    label: "Overview",
    description: "Catalog basics, pricing, classification, and state.",
  },
  {
    key: "physical-attributes",
    label: "Physical Attributes",
    description: "Size and weight details for this product.",
  },
  {
    key: "group-field-values",
    label: "Group Field Values",
    description: "Metadata values added from the selected group template.",
  },
  {
    key: "media",
    label: "Media",
    description: "Product photos and videos.",
  },
  {
    key: "marketing-media",
    label: "Marketing Media",
    description: "Campaign photos and videos.",
  },
  {
    key: "vendors",
    label: "Vendors",
    description: "Suppliers linked to this product.",
  },
  {
    key: "zones",
    label: "Zones",
    description: "Zones linked to this product.",
  },
  {
    key: "metadata",
    label: "Metadata",
    description: "IDs and saved dates.",
  },
];

const PRODUCT_TYPE_LABELS: Record<Product["type"], string> = {
  Standard: "Standard",
  "Lot Matrix": "Lot Matrix",
};

const ATTRIBUTE_VALUE_BY_ID = new Map(
  MOCK_ATTRIBUTES.flatMap((attribute) =>
    attribute.values.map((value) => [
      value.id,
      `${attribute.name}: ${value.label}`,
    ]),
  ),
);

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatProductType(type: Product["type"]): string {
  return PRODUCT_TYPE_LABELS[type];
}

export function formatProductListingStatus(isActive: boolean): string {
  return isActive ? "Listed" : "Hidden";
}

export function formatProductSellingStatus(itemInactive: boolean): string {
  return itemInactive ? "Not sellable" : "Sellable";
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(
    value,
  );
}

export function formatNullableNumber(
  value: number | null,
  unit?: string,
): string {
  if (value === null) return "Not set";

  const base = formatCompactNumber(value);
  return unit ? `${base} ${unit}` : base;
}

export function summarizeVariantAttributes(variant: Variant): string {
  return variant.variantAttributes
    .map(
      (attribute) =>
        ATTRIBUTE_VALUE_BY_ID.get(attribute.attributeValueId) ?? "Unknown",
    )
    .join(" / ");
}

export function buildProductListRows(): ProductListRow[] {
  return MOCK_PRODUCTS.map((product) => {
    const category = getCategoryForProduct(product);
    const group = product.groupId ? findGroup(product.groupId) : undefined;
    const media = getMediaForProduct(product.id);
    const marketingMedia = getMarketingMediaForProduct(product.id);
    const variants = getVariantsForProduct(product.id);

    return {
      id: product.id,
      product,
      departmentName: product.department?.name ?? "Unassigned",
      categoryName: category?.name ?? "Not assigned",
      subCategoryName: product.subCategory?.name ?? "Unassigned",
      groupName: group?.name ?? "No group",
      mediaCount: media.length,
      marketingMediaCount: marketingMedia.length,
      variantCount: variants.length,
      activeVariantCount: variants.filter((variant) => variant.isActive).length,
    };
  });
}

export function buildMediaWorkspaceRows(): ProductMediaWorkspaceRow[] {
  return MOCK_PRODUCTS.map((product) => {
    const items = getMediaForProduct(product.id);

    return {
      product,
      totalMedia: items.length,
      imageCount: items.filter((item) => item.type === "image").length,
      videoCount: items.filter((item) => item.type === "video").length,
      primaryMedia: items.find((item) => item.isPrimary) ?? items[0] ?? null,
      items,
    };
  });
}

export function buildMarketingWorkspaceRows(): ProductMarketingWorkspaceRow[] {
  return MOCK_PRODUCTS.map((product) => {
    const items = getMarketingMediaForProduct(product.id);

    return {
      product,
      totalAssets: items.length,
      photoCount: items.filter((item) => item.type === "image").length,
      videoCount: items.filter((item) => item.type === "video").length,
      heroAsset: items[0] ?? null,
      items,
    };
  });
}

export function buildVariantWorkspaceRows(): DirectVariantWorkspaceRow[] {
  return MOCK_PRODUCTS.map((product) => {
    const variants = getVariantsForProduct(product.id);

    return {
      id: product.id,
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      productType: product.type,
      variantCount: variants.length,
      activeVariantCount: variants.filter((variant) => variant.isActive).length,
    };
  });
}
