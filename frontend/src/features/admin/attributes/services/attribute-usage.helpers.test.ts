import { describe, expect, it } from "vitest";

import { MOCK_ATTRIBUTES, MOCK_IDS } from "@features/admin/products/services/product-admin.mock";

import {
  buildAttributeUsageMap,
  summarizeAttributeUsage,
} from "./attribute-usage.helpers";

describe("attribute-usage.helpers", () => {
  it("summarizes usage for an attribute used by live lot matrix rows", () => {
    const colorAttribute = MOCK_ATTRIBUTES.find(
      (attribute) => attribute.id === MOCK_IDS.attributeColor,
    );

    expect(colorAttribute).toBeDefined();

    const usage = summarizeAttributeUsage(colorAttribute!);

    expect(usage.productCount).toBe(1);
    expect(usage.lotMatrixRowCount).toBe(2);
    expect(usage.inUse).toBe(true);
    expect(usage.valueUsageById[MOCK_IDS.valueSilver]).toMatchObject({
      productCount: 1,
      lotMatrixRowCount: 1,
      inUse: true,
    });
  });

  it("returns zero usage for a new attribute with no linked rows", () => {
    const usageMap = buildAttributeUsageMap([
      {
        id: 9001,
        productId: 0,
        name: "Material",
        code: "MATERIAL",
        sortOrder: 0,
        isRequired: false,
        isActive: true,
        createdAt: "2026-03-25T00:00:00.000Z",
        values: [
          {
            id: 90011,
            attributeId: 9001,
            label: "Steel",
            code: "STEEL",
            sortOrder: 0,
            isActive: true,
            createdAt: "2026-03-25T00:00:00.000Z",
          },
        ],
      },
    ]);

    expect(usageMap[9001]).toMatchObject({
      productCount: 0,
      lotMatrixRowCount: 0,
      inUse: false,
    });
    expect(usageMap[9001]?.valueUsageById[90011]).toMatchObject({
      productCount: 0,
      lotMatrixRowCount: 0,
      inUse: false,
    });
  });
});
