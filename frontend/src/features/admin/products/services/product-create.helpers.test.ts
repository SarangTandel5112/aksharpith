import { describe, expect, it } from "vitest";

import { MOCK_ATTRIBUTES, MOCK_GROUPS } from "./product-admin.mock";
import {
  buildLotMatrixPreview,
  buildProductCreateSetupItems,
  buildProductCreateTabs,
  buildProductCreateWorkspacePayload,
  countCompleteLotMatrixRows,
  createEmptyLotMatrixRow,
  createRuntimeLotMatrixAttribute,
  generateLotMatrixRows,
  syncGroupFieldValues,
  syncLotMatrixRows,
} from "./product-create.helpers";

describe("product-create.helpers", () => {
  it("keeps all product setup sections in the workspace payload", () => {
    const payload = buildProductCreateWorkspacePayload({
      values: {
        code: "IPH16PRO",
        upc: "123456789012",
        name: "iPhone 16 Pro",
        type: "Lot Matrix",
        description: "Flagship phone",
        model: "A1",
        hsnCode: "8517",
        price: 129900,
        stockQuantity: 42,
        departmentId: "1",
        subCategoryId: "10",
        groupId: MOCK_GROUPS[0]!.id,
        nonTaxable: false,
        itemInactive: false,
        nonStockItem: false,
        isActive: true,
        physicalWeight: "0.18 kg",
        physicalLength: "15 cm",
        physicalWidth: "7 cm",
        physicalHeight: "0.8 cm",
      },
      state: {
        groupFieldValues: [
          {
            fieldId: MOCK_GROUPS[0]!.fields[0]!.id,
            name: MOCK_GROUPS[0]!.fields[0]!.name,
            key: MOCK_GROUPS[0]!.fields[0]!.key,
            type: MOCK_GROUPS[0]!.fields[0]!.type,
            isRequired: MOCK_GROUPS[0]!.fields[0]!.isRequired,
            valueText: "4500 mAh",
            valueNumber: null,
            valueBoolean: false,
            valueOptionId: null,
            options: [],
          },
        ],
        media: [
          {
            url: "https://example.com/product.jpg",
            mediaType: "photo",
            sortOrder: 0,
            isPrimary: true,
          },
        ],
        marketingMedia: [
          {
            mediaUrl: "https://example.com/campaign.jpg",
            mediaType: "photo",
            displayOrder: 0,
          },
        ],
        selectedAttributeIds: [MOCK_ATTRIBUTES[0]!.id],
        lotMatrixRows: [
          {
            id: "variant-row-1",
            sku: "IPH16PRO-SLV",
            price: 129900,
            stockQuantity: 10,
            isActive: true,
            source: "generated",
            selections: [
              {
                attributeId: MOCK_ATTRIBUTES[0]!.id,
                attributeName: MOCK_ATTRIBUTES[0]!.name,
                attributeValueId: MOCK_ATTRIBUTES[0]!.values[0]!.id,
                attributeValueLabel: MOCK_ATTRIBUTES[0]!.values[0]!.label,
              },
            ],
          },
        ],
        vendors: [
          {
            vendorName: "Acme Supplies",
            contactEmail: "vendor@example.com",
            isPrimary: true,
            isActive: true,
          },
        ],
        zones: [
          {
            zoneName: "North",
            zoneCode: "N",
            isActive: true,
          },
        ],
      },
      attributes: MOCK_ATTRIBUTES,
    });

    expect(payload).toMatchObject({
      product: {
        name: "iPhone 16 Pro",
        code: "IPH16PRO",
        type: "Lot Matrix",
      },
      physicalAttributes: {
        weight: 0.18,
        length: 15,
        width: 7,
        height: 0.8,
      },
      groupFieldValues: {
        values: [{ fieldId: MOCK_GROUPS[0]!.fields[0]!.id }],
      },
      media: [{ url: "https://example.com/product.jpg" }],
      marketingMedia: [{ mediaUrl: "https://example.com/campaign.jpg" }],
      vendors: [{ vendorName: "Acme Supplies" }],
      zones: [{ zoneName: "North" }],
    });
    expect(payload.lotMatrix?.attributeIds).toEqual([MOCK_ATTRIBUTES[0]!.id]);
    expect(payload.lotMatrix?.variants).toEqual([
      {
        sku: "IPH16PRO-SLV",
        price: 129900,
        stockQuantity: 10,
        isActive: true,
        attributeValueIds: [MOCK_ATTRIBUTES[0]!.values[0]!.id],
      },
    ]);
  });

  it("syncs dynamic group fields when the selected group changes", () => {
    const current = [
      {
        fieldId: MOCK_GROUPS[0]!.fields[0]!.id,
        name: MOCK_GROUPS[0]!.fields[0]!.name,
        key: MOCK_GROUPS[0]!.fields[0]!.key,
        type: MOCK_GROUPS[0]!.fields[0]!.type,
        isRequired: MOCK_GROUPS[0]!.fields[0]!.isRequired,
        valueText: "4500 mAh",
        valueNumber: null,
        valueBoolean: false,
        valueOptionId: null,
        options: [],
      },
    ];

    const synced = syncGroupFieldValues(MOCK_GROUPS[0], current);

    expect(synced).toHaveLength(MOCK_GROUPS[0]!.fields.length);
    expect(synced[0]!.valueText).toBe("4500 mAh");
  });

  it("builds a lot-matrix preview from active attribute values", () => {
    const preview = buildLotMatrixPreview(MOCK_ATTRIBUTES, [
      MOCK_ATTRIBUTES[0]!.id,
      MOCK_ATTRIBUTES[1]!.id,
    ]);

    expect(preview.length).toBeGreaterThan(0);
    expect(preview[0]).toContain("Color:");
  });

  it("generates editable lot-matrix rows from selected attributes", () => {
    const rows = generateLotMatrixRows({
      attributes: MOCK_ATTRIBUTES,
      selectedAttributeIds: [MOCK_ATTRIBUTES[0]!.id, MOCK_ATTRIBUTES[1]!.id],
      productCode: "IPH16PRO",
      price: 129900,
    });

    expect(rows).toHaveLength(4);
    expect(rows[0]?.sku).toContain("IPH16PRO");
    expect(rows[0]?.selections).toHaveLength(2);
    expect(countCompleteLotMatrixRows(rows)).toBe(4);
  });

  it("keeps manually added lot-matrix rows even before attributes are selected", () => {
    const manualRow = createEmptyLotMatrixRow({
      attributes: MOCK_ATTRIBUTES,
      selectedAttributeIds: [],
      productCode: "IPH16PRO",
      price: 129900,
      rowIndex: 0,
    });

    const emptySelectionRows = syncLotMatrixRows([manualRow], MOCK_ATTRIBUTES, []);
    const hydratedRows = syncLotMatrixRows(
      emptySelectionRows,
      MOCK_ATTRIBUTES,
      [MOCK_ATTRIBUTES[0]!.id],
    );

    expect(emptySelectionRows).toHaveLength(1);
    expect(emptySelectionRows[0]?.selections).toEqual([]);
    expect(hydratedRows[0]?.selections).toHaveLength(1);
    expect(hydratedRows[0]?.selections[0]?.attributeId).toBe(
      MOCK_ATTRIBUTES[0]!.id,
    );
  });

  it("keeps every product setup module visible in the create workspace", () => {
    const tabs = buildProductCreateTabs({
      productType: "Standard",
      selectedGroup: undefined,
      mediaCount: 0,
      marketingCount: 0,
      vendorCount: 0,
      zoneCount: 0,
      lotMatrixBadgeCount: 0,
    });

    expect(tabs.map((tab) => tab.key)).toEqual([
      "basic",
      "physical",
      "group-fields",
      "media",
      "marketing",
      "lot-matrix",
      "vendors",
      "zones",
    ]);
  });

  it("uses the lot-matrix badge for rows or possible combinations instead of selected attributes", () => {
    const tabs = buildProductCreateTabs({
      productType: "Lot Matrix",
      selectedGroup: undefined,
      mediaCount: 0,
      marketingCount: 0,
      vendorCount: 0,
      zoneCount: 0,
      lotMatrixBadgeCount: 4,
    });

    expect(tabs.find((tab) => tab.key === "lot-matrix")?.badge).toBe(4);
  });

  it("creates a new runtime lot-matrix attribute with active values", () => {
    const attribute = createRuntimeLotMatrixAttribute({
      name: "Size",
      values: ["S", "M", "M", "L"],
    });

    expect(attribute.name).toBe("Size");
    expect(attribute.values.map((value) => value.label)).toEqual(["S", "M", "L"]);
    expect(attribute.values.every((value) => value.attributeId === attribute.id)).toBe(
      true,
    );
  });

  it("does not count untouched group fields as completed", () => {
    const setupItems = buildProductCreateSetupItems(
      {
        product: {
          code: "IPH16PRO",
          upc: "123456789012",
          name: "iPhone 16 Pro",
          type: "Lot Matrix",
          hsnCode: "8517",
          price: 129900,
          stockQuantity: 42,
          departmentId: "1",
          subCategoryId: "10",
          groupId: MOCK_GROUPS[0]!.id,
          nonTaxable: false,
          itemInactive: false,
          nonStockItem: false,
          isActive: true,
        },
        physicalAttributes: null,
        groupFieldValues: {
          values: [
            { fieldId: "1", valueText: null },
            { fieldId: "2", valueBoolean: false },
            { fieldId: "3", valueOptionId: null },
          ],
        },
        media: [],
        marketingMedia: [],
        lotMatrix: null,
        vendors: [],
        zones: [],
      },
      {
        code: "IPH16PRO",
        upc: "123456789012",
        name: "iPhone 16 Pro",
        type: "Lot Matrix",
        description: "Flagship phone",
        model: "A1",
        hsnCode: "8517",
        price: 129900,
        stockQuantity: 42,
        departmentId: "1",
        subCategoryId: "10",
        groupId: MOCK_GROUPS[0]!.id,
        nonTaxable: false,
        itemInactive: false,
        nonStockItem: false,
        isActive: true,
        physicalWeight: null,
        physicalLength: null,
        physicalWidth: null,
        physicalHeight: null,
      },
    );

    expect(setupItems.find((item) => item.label === "Dynamic details")).toMatchObject({
      value: "0/3",
      tone: "warning",
    });
  });
});
