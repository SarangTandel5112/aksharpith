import type {
  Attribute,
  AttributeUsageSummary,
  AttributeValueUsageSummary,
} from "@features/admin/attributes/types/attributes.types";
import {
  MOCK_PRODUCTS,
  getVariantsForProduct,
} from "@features/admin/products/services/product-admin.mock";

export function summarizeAttributeUsage(attribute: Attribute): AttributeUsageSummary {
  const productIds = new Set<number>();
  const rowIds = new Set<number>();
  const valueProductIds = new Map<number, Set<number>>();
  const valueRowIds = new Map<number, Set<number>>();

  for (const value of attribute.values) {
    valueProductIds.set(value.id, new Set<number>());
    valueRowIds.set(value.id, new Set<number>());
  }

  for (const product of MOCK_PRODUCTS) {
    const variants = getVariantsForProduct(product.id);

    for (const variant of variants) {
      const matchingLinks = variant.variantAttributes.filter(
        (link) => link.attributeId === attribute.id,
      );

      if (matchingLinks.length === 0) {
        continue;
      }

      productIds.add(product.id);
      rowIds.add(variant.id);

      for (const link of matchingLinks) {
        const currentProductIds =
          valueProductIds.get(link.attributeValueId) ?? new Set<number>();
        currentProductIds.add(product.id);
        valueProductIds.set(link.attributeValueId, currentProductIds);

        const currentRowIds =
          valueRowIds.get(link.attributeValueId) ?? new Set<number>();
        currentRowIds.add(variant.id);
        valueRowIds.set(link.attributeValueId, currentRowIds);
      }
    }
  }

  const valueUsageById = Object.fromEntries(
    attribute.values.map((value) => {
      const usedProductIds = valueProductIds.get(value.id) ?? new Set<string>();
      const usedRowIds = valueRowIds.get(value.id) ?? new Set<string>();

      return [
        value.id,
        {
          valueId: value.id,
          productCount: usedProductIds.size,
          lotMatrixRowCount: usedRowIds.size,
          inUse: usedProductIds.size > 0 || usedRowIds.size > 0,
        } satisfies AttributeValueUsageSummary,
      ];
    }),
  );

  return {
    productCount: productIds.size,
    lotMatrixRowCount: rowIds.size,
    inUse: productIds.size > 0 || rowIds.size > 0,
    valueUsageById,
  };
}

export function buildAttributeUsageMap(
  attributes: Attribute[],
): Record<number, AttributeUsageSummary> {
  return Object.fromEntries(
    attributes.map((attribute) => [attribute.id, summarizeAttributeUsage(attribute)]),
  );
}
