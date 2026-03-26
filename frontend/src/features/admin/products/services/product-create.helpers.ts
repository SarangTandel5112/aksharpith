import type { Attribute } from "@features/admin/attributes/types/attributes.types";
import type {
  Group,
  GroupField,
} from "@features/admin/groups/types/groups.types";
import type {
  ProductCreateCatalogContext,
  ProductCreateSetupItem,
  ProductCreateSummary,
  ProductCreateTabDefinition,
  ProductCreateWorkspaceState,
  ProductCreateWorkspaceContext,
  ProductCreateWorkspacePayload,
  ProductGridCardModel,
  ProductGroupFieldValueDraft,
  ProductLotMatrixAttributeDefinition,
  ProductLotMatrixAttributeBuilderInput,
  ProductLotMatrixRowDraft,
  ProductLotMatrixSelectionDraft,
  ProductMarketingMediaDraft,
  ProductMediaDraft,
  ProductVendorDraft,
  ProductZoneDraft,
} from "../types/product-create.types";
import type {
  CreateProductInput,
  ProductCreateWorkspaceValues,
} from "../schemas/products.schema";
import type { Product, ProductListRow } from "../types/products.types";
import {
  normalizeRichTextHtml,
  plainTextFromRichText,
} from "@shared/lib/rich-text";
import { formatCurrency } from "./product-admin.helpers";

function normalizeOptionalString(
  value: string | null | undefined,
): string | undefined {
  const next = value?.trim();
  return next ? next : undefined;
}

function normalizeOptionalRichText(
  value: string | null | undefined,
): string | undefined {
  const next = normalizeRichTextHtml(value);
  return next.length > 0 ? next : undefined;
}

function normalizeOptionalNumber(
  value: number | null | undefined,
): number | undefined {
  return value === null || value === undefined || Number.isNaN(value)
    ? undefined
    : value;
}

function normalizeOptionalDimension(
  value: string | null | undefined,
): string | undefined {
  const next = value?.trim();
  return next ? next : undefined;
}

export function createEmptyMediaItem(index: number): ProductMediaDraft {
  return {
    url: "",
    type: "image",
    sortOrder: index,
    isPrimary: index === 0,
  };
}

export function createEmptyMarketingMediaItem(
  index: number,
): ProductMarketingMediaDraft {
  return {
    url: "",
    type: "image",
    sortOrder: index,
    thumbnailUrl: null,
    duration: null,
    fileSize: null,
  };
}

export function createEmptyVendorItem(index: number): ProductVendorDraft {
  return {
    name: "",
    contactPerson: null,
    contactEmail: null,
    contactPhone: null,
    gstin: null,
    address: null,
    isPrimary: index === 0,
    notes: null,
    isActive: true,
  };
}

export function createEmptyZoneItem(): ProductZoneDraft {
  return {
    name: "",
    code: null,
    description: null,
    isActive: true,
  };
}

export function createRuntimeLotMatrixAttribute(
  input: ProductLotMatrixAttributeBuilderInput,
): Attribute {
  const timestamp = new Date().toISOString();
  const attributeId = Date.now();
  const uniqueValues = Array.from(
    new Set(input.values.map((value) => value.trim()).filter(Boolean)),
  );

  return {
    id: attributeId,
    productId: 0,
    name: input.name.trim(),
    code: formatSkuSegment(input.name) || `ATTR${attributeId}`,
    sortOrder: 0,
    isRequired: false,
    isActive: true,
    createdAt: timestamp,
    values: uniqueValues.map((value, index) => ({
      id: Number(`${attributeId}${index + 1}`),
      attributeId,
      label: value,
      code: formatSkuSegment(value) || `VALUE${index + 1}`,
      sortOrder: index,
      isActive: true,
      createdAt: timestamp,
    })),
  };
}

function buildGroupFieldEntry(field: GroupField): ProductGroupFieldValueDraft {
  return {
    fieldId: field.id,
    name: field.name,
    key: field.key,
    type: field.type,
    isRequired: field.isRequired,
    valueText: null,
    valueNumber: null,
    valueBoolean: false,
    valueOptionId: null,
    options: field.options.map((option) => ({
      id: option.id,
      label: option.label,
      value: option.value,
    })),
  };
}

export function createEmptyGroupFieldValues(
  group: Group | undefined,
): ProductGroupFieldValueDraft[] {
  return group?.fields.map(buildGroupFieldEntry) ?? [];
}

export function syncGroupFieldValues(
  group: Group | undefined,
  currentValues: ProductGroupFieldValueDraft[],
): ProductGroupFieldValueDraft[] {
  if (!group) return [];

  const currentByFieldId = new Map(
    currentValues.map((entry) => [entry.fieldId, entry]),
  );

  return group.fields.map((field) => {
    const current = currentByFieldId.get(field.id);
    const next = buildGroupFieldEntry(field);

    if (!current) return next;

    return {
      ...next,
      valueText: current.valueText,
      valueNumber: current.valueNumber,
      valueBoolean: current.valueBoolean,
      valueOptionId: current.valueOptionId,
    };
  });
}

export function countFilledGroupFieldValues(
  values: ProductGroupFieldValueDraft[],
): number {
  return values.filter((value) => {
    if (value.type === "boolean") return value.valueBoolean;
    if (value.type === "number") return value.valueNumber !== null;
    if (value.type === "dropdown") return value.valueOptionId !== null;
    return Boolean(value.valueText?.trim());
  }).length;
}

export function countPhysicalFields(
  values: ProductCreateWorkspaceValues,
): number {
  return [
    values.physicalWeight,
    values.physicalLength,
    values.physicalWidth,
    values.physicalHeight,
  ].filter((value) => value !== null && value !== undefined).length;
}

export function computeLotMatrixCount(
  attributes: Attribute[],
  selectedAttributeIds: number[],
): number {
  const selectedAttributes = attributes.filter((attribute) =>
    selectedAttributeIds.includes(attribute.id),
  );

  if (selectedAttributes.length === 0) return 0;

  return selectedAttributes.reduce(
    (total, attribute) =>
      total *
      Math.max(attribute.values.filter((value) => value.isActive).length, 1),
    1,
  );
}

export function buildLotMatrixPreview(
  attributes: Attribute[],
  selectedAttributeIds: number[],
  limit = 8,
): string[] {
  const selectedAttributes = attributes.filter((attribute) =>
    selectedAttributeIds.includes(attribute.id),
  );

  if (selectedAttributes.length === 0) return [];

  const valueSets = selectedAttributes.map((attribute) => ({
    name: attribute.name,
    values: attribute.values.filter((value) => value.isActive),
  }));

  if (valueSets.some((entry) => entry.values.length === 0)) return [];

  const preview: string[] = [];

  function walk(index: number, parts: string[]): void {
    if (preview.length >= limit) return;

    if (index === valueSets.length) {
      preview.push(parts.join(" / "));
      return;
    }

    const current = valueSets[index]!;
    for (const value of current.values) {
      walk(index + 1, [...parts, `${current.name}: ${value.label}`]);
      if (preview.length >= limit) return;
    }
  }

  walk(0, []);
  return preview;
}

export function getSelectedLotMatrixAttributes(
  attributes: Attribute[],
  selectedAttributeIds: number[],
): ProductLotMatrixAttributeDefinition[] {
  const attributeOrder = new Map(
    selectedAttributeIds.map((attributeId, index) => [attributeId, index]),
  );

  return attributes
    .filter((attribute) => selectedAttributeIds.includes(attribute.id))
    .sort(
      (left, right) =>
        (attributeOrder.get(left.id) ?? 0) -
        (attributeOrder.get(right.id) ?? 0),
    )
    .map((attribute) => ({
      id: attribute.id,
      name: attribute.name,
      values: attribute.values
        .filter((value) => value.isActive)
        .map((value) => ({
          id: value.id,
          label: value.label,
        })),
    }));
}

function formatSkuSegment(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildLotMatrixSelectionKey(
  selections: ProductLotMatrixSelectionDraft[],
): string | null {
  if (selections.some((selection) => selection.attributeValueId === null)) {
    return null;
  }

  return selections
    .map(
      (selection) =>
        `${selection.attributeId}:${selection.attributeValueId ?? ""}`,
    )
    .join("|");
}

function buildGeneratedVariantSku(
  productSku: string,
  selections: ProductLotMatrixSelectionDraft[],
): string {
  const suffix = selections
    .map((selection) => formatSkuSegment(selection.attributeValueLabel ?? ""))
    .filter(Boolean)
    .join("-");

  const baseSku = formatSkuSegment(productSku);
  if (!suffix) return baseSku || "VARIANT";
  return baseSku ? `${baseSku}-${suffix}` : suffix;
}

function buildManualVariantSku(productSku: string, index: number): string {
  const baseSku = formatSkuSegment(productSku);
  const suffix = `VAR${index + 1}`;
  return baseSku ? `${baseSku}-${suffix}` : suffix;
}

function findAttributeValueLabel(
  matrixAttributes: ProductLotMatrixAttributeDefinition[],
  attributeId: number,
  attributeValueId: number | null,
): string | null {
  if (attributeValueId === null) return null;

  const attribute = matrixAttributes.find((item) => item.id === attributeId);
  const attributeValue = attribute?.values.find(
    (value) => value.id === attributeValueId,
  );
  return attributeValue?.label ?? null;
}

export function countCompleteLotMatrixRows(
  rows: ProductLotMatrixRowDraft[],
): number {
  return rows.filter(
    (row) =>
      Boolean(row.sku.trim()) &&
      row.selections.length > 0 &&
      row.selections.every((selection) => selection.attributeValueId !== null),
  ).length;
}

export function createEmptyLotMatrixRow(options: {
  attributes: Attribute[];
  selectedAttributeIds: number[];
  productCode: string;
  price: number;
  rowIndex: number;
}): ProductLotMatrixRowDraft {
  const matrixAttributes = getSelectedLotMatrixAttributes(
    options.attributes,
    options.selectedAttributeIds,
  );

  return {
    id:
      globalThis.crypto?.randomUUID?.() ??
      `manual-${Date.now()}-${options.rowIndex}`,
    sku: buildManualVariantSku(options.productCode, options.rowIndex),
    price: options.price,
    stockQuantity: 0,
    isActive: true,
    source: "manual",
    selections: matrixAttributes.map((attribute) => ({
      attributeId: attribute.id,
      attributeName: attribute.name,
      attributeValueId: null,
      attributeValueLabel: null,
    })),
  };
}

export function syncLotMatrixRows(
  rows: ProductLotMatrixRowDraft[],
  attributes: Attribute[],
  selectedAttributeIds: number[],
): ProductLotMatrixRowDraft[] {
  const matrixAttributes = getSelectedLotMatrixAttributes(
    attributes,
    selectedAttributeIds,
  );
  const selectedAttributeSet = new Set(selectedAttributeIds);

  return rows.map((row) => {
    const selectionsByAttributeId = new Map(
      row.selections.map((selection) => [selection.attributeId, selection]),
    );

    return {
      ...row,
      selections: matrixAttributes.map((attribute) => {
        const existing = selectionsByAttributeId.get(attribute.id);

        if (!existing || !selectedAttributeSet.has(existing.attributeId)) {
          return {
            attributeId: attribute.id,
            attributeName: attribute.name,
            attributeValueId: null,
            attributeValueLabel: null,
          };
        }

        return {
          ...existing,
          attributeName: attribute.name,
          attributeValueLabel: findAttributeValueLabel(
            matrixAttributes,
            attribute.id,
            existing.attributeValueId,
          ),
        };
      }),
    };
  });
}

export function generateLotMatrixRows(options: {
  attributes: Attribute[];
  selectedAttributeIds: number[];
  productCode: string;
  price: number;
  currentRows?: ProductLotMatrixRowDraft[];
}): ProductLotMatrixRowDraft[] {
  const matrixAttributes = getSelectedLotMatrixAttributes(
    options.attributes,
    options.selectedAttributeIds,
  );

  if (matrixAttributes.length === 0) return [];
  if (matrixAttributes.some((attribute) => attribute.values.length === 0))
    return [];

  const existingRowsByKey = new Map<string, ProductLotMatrixRowDraft>();
  for (const row of options.currentRows ?? []) {
    const key = buildLotMatrixSelectionKey(row.selections);
    if (key) existingRowsByKey.set(key, row);
  }

  const generatedSelections: ProductLotMatrixSelectionDraft[][] = [];

  function walk(
    index: number,
    selections: ProductLotMatrixSelectionDraft[],
  ): void {
    if (index === matrixAttributes.length) {
      generatedSelections.push(selections);
      return;
    }

    const attribute = matrixAttributes[index]!;
    for (const value of attribute.values) {
      walk(index + 1, [
        ...selections,
        {
          attributeId: attribute.id,
          attributeName: attribute.name,
          attributeValueId: value.id,
          attributeValueLabel: value.label,
        },
      ]);
    }
  }

  walk(0, []);

  return generatedSelections.map((selections, index) => {
    const key = buildLotMatrixSelectionKey(selections);
    const existing = key ? existingRowsByKey.get(key) : undefined;

    if (existing) {
      return {
        ...existing,
        source: "generated",
        selections,
      };
    }

    return {
      id: globalThis.crypto?.randomUUID?.() ?? `matrix-${Date.now()}-${index}`,
      sku: buildGeneratedVariantSku(options.productCode, selections),
      price: options.price,
      stockQuantity: 0,
      isActive: true,
      source: "generated",
      selections,
    };
  });
}

export function updateLotMatrixRowSelection(options: {
  row: ProductLotMatrixRowDraft;
  attributeId: number;
  attributeValueId: number | null;
  attributes: Attribute[];
  selectedAttributeIds: number[];
}): ProductLotMatrixRowDraft {
  const matrixAttributes = getSelectedLotMatrixAttributes(
    options.attributes,
    options.selectedAttributeIds,
  );

  return {
    ...options.row,
    selections: options.row.selections.map((selection) =>
      selection.attributeId === options.attributeId
        ? {
            ...selection,
            attributeValueId: options.attributeValueId,
            attributeValueLabel: findAttributeValueLabel(
              matrixAttributes,
              options.attributeId,
              options.attributeValueId,
            ),
          }
        : selection,
    ),
  };
}

export function summarizeLotMatrixRow(row: ProductLotMatrixRowDraft): string {
  return row.selections
    .map(
      (selection) =>
        `${selection.attributeName}: ${selection.attributeValueLabel ?? "Not selected"}`,
    )
    .join(" / ");
}

export function buildProductCorePayload(
  values: ProductCreateWorkspaceValues,
): CreateProductInput {
  const payload: CreateProductInput = {
    code: values.code.trim(),
    upc: values.upc.trim(),
    name: values.name.trim(),
    type: values.type,
    hsnCode: values.hsnCode.trim(),
    price: values.price,
    stockQuantity: values.stockQuantity,
    nonTaxable: values.nonTaxable,
    itemInactive: values.itemInactive,
    nonStockItem: values.nonStockItem,
    isActive: values.isActive,
    departmentId: values.departmentId,
    subCategoryId: values.subCategoryId,
    groupId: values.groupId,
  };

  const description = normalizeOptionalRichText(values.description);
  if (description !== undefined) payload.description = description;
  const model = normalizeOptionalString(values.model);
  if (model !== undefined) payload.model = model;

  return payload;
}

function buildPhysicalAttributesPayload(
  values: ProductCreateWorkspaceValues,
): ProductCreateWorkspacePayload["physicalAttributes"] {
  const payload: NonNullable<
    ProductCreateWorkspacePayload["physicalAttributes"]
  > = {};

  const weight = normalizeOptionalDimension(values.physicalWeight);
  const length = normalizeOptionalDimension(values.physicalLength);
  const width = normalizeOptionalDimension(values.physicalWidth);
  const height = normalizeOptionalDimension(values.physicalHeight);

  if (weight !== undefined) payload.weight = weight;
  if (length !== undefined) payload.length = length;
  if (width !== undefined) payload.width = width;
  if (height !== undefined) payload.height = height;

  return Object.keys(payload).length > 0 ? payload : null;
}

function buildGroupFieldValuePayload(
  value: ProductGroupFieldValueDraft,
): ProductCreateWorkspacePayload["groupFieldValues"]["values"][number] {
  const payload: ProductCreateWorkspacePayload["groupFieldValues"]["values"][number] =
    {
      fieldId: value.fieldId,
    };

  if (value.type === "text" || value.type === "textarea") {
    payload.valueText = normalizeOptionalString(value.valueText) ?? null;
  }

  if (value.type === "number") {
    payload.valueNumber = normalizeOptionalNumber(value.valueNumber) ?? null;
  }

  if (value.type === "boolean") {
    payload.valueBoolean = value.valueBoolean;
  }

  if (value.type === "dropdown") {
    payload.valueOptionId = value.valueOptionId ?? null;
  }

  return payload;
}

export function buildProductCreateWorkspacePayload(
  context: ProductCreateWorkspaceContext,
): ProductCreateWorkspacePayload {
  const { values, state, attributes } = context;

  return {
    product: buildProductCorePayload(values),
    physicalAttributes: buildPhysicalAttributesPayload(values),
    groupFieldValues: {
      values: state.groupFieldValues.map(buildGroupFieldValuePayload),
    },
    media: state.media
      .filter((item) => normalizeOptionalString(item.url))
      .map((item, index) => ({
        url: item.url.trim(),
        type: item.type,
        sortOrder: index,
        ...(item.isPrimary !== undefined ? { isPrimary: item.isPrimary } : {}),
      })),
    marketingMedia: state.marketingMedia
      .filter((item) => normalizeOptionalString(item.url))
      .map((item, index) => ({
        url: item.url.trim(),
        type: item.type,
        sortOrder: item.sortOrder ?? index,
        thumbnailUrl: normalizeOptionalString(item.thumbnailUrl) ?? null,
        duration: normalizeOptionalNumber(item.duration) ?? null,
        fileSize: normalizeOptionalNumber(item.fileSize) ?? null,
      })),
    lotMatrix: state.selectedAttributeIds.length
      ? {
          attributeIds: state.selectedAttributeIds,
          expectedVariantCount: computeLotMatrixCount(
            attributes,
            state.selectedAttributeIds,
          ),
          preview: buildLotMatrixPreview(
            attributes,
            state.selectedAttributeIds,
          ),
          variants: state.lotMatrixRows
            .filter(
              (row) =>
                Boolean(row.sku.trim()) &&
                row.selections.every(
                  (selection) => selection.attributeValueId !== null,
                ),
            )
            .map((row) => ({
              sku: row.sku.trim(),
              price: row.price,
              stockQuantity: row.stockQuantity,
              isActive: row.isActive,
              attributeValueIds: row.selections
                .map((selection) => selection.attributeValueId)
                .filter((valueId): valueId is number => valueId !== null),
            })),
        }
      : null,
    vendors: state.vendors
      .filter((item) => normalizeOptionalString(item.name))
      .map((item) => ({
        name: item.name.trim(),
        contactPerson: normalizeOptionalString(item.contactPerson) ?? null,
        contactEmail: normalizeOptionalString(item.contactEmail) ?? null,
        contactPhone: normalizeOptionalString(item.contactPhone) ?? null,
        gstin: normalizeOptionalString(item.gstin) ?? null,
        address: normalizeOptionalString(item.address) ?? null,
        ...(item.isPrimary !== undefined ? { isPrimary: item.isPrimary } : {}),
        notes: normalizeOptionalString(item.notes) ?? null,
        ...(item.isActive !== undefined ? { isActive: item.isActive } : {}),
      })),
    zones: state.zones
      .filter((item) => normalizeOptionalString(item.name))
      .map((item) => ({
        name: item.name.trim(),
        code: normalizeOptionalString(item.code) ?? null,
        description: normalizeOptionalRichText(item.description) ?? null,
        ...(item.isActive !== undefined ? { isActive: item.isActive } : {}),
      })),
  };
}

export function buildProductCreateTabs(options: {
  productType: Product["type"];
  selectedGroup: Group | undefined;
  mediaCount: number;
  marketingCount: number;
  vendorCount: number;
  zoneCount: number;
  lotMatrixBadgeCount: number;
}): ProductCreateTabDefinition[] {
  const tabs: ProductCreateTabDefinition[] = [
    { key: "basic", label: "Basic Info" },
    { key: "physical", label: "Physical" },
    {
      key: "group-fields",
      label: "Dynamic Details",
      badge: options.selectedGroup?.fields.length ?? 0,
    },
    { key: "media", label: "Media", badge: options.mediaCount },
    { key: "marketing", label: "Marketing", badge: options.marketingCount },
    {
      key: "lot-matrix",
      label: "Lot Matrix",
      badge: options.lotMatrixBadgeCount,
    },
    { key: "vendors", label: "Vendors", badge: options.vendorCount },
    { key: "zones", label: "Zones", badge: options.zoneCount },
  ];
  return tabs;
}

export function buildProductCreateSetupItems(
  payload: ProductCreateWorkspacePayload,
  values: ProductCreateWorkspaceValues,
): ProductCreateSetupItem[] {
  const physicalCount = countPhysicalFields(values);
  const filledGroupFields = payload.groupFieldValues.values.filter((value) => {
    return (
      Boolean(value.valueText?.trim()) ||
      typeof value.valueNumber === "number" ||
      value.valueBoolean === true ||
      value.valueOptionId != null
    );
  }).length;

  return [
    {
      label: "Physical",
      value: physicalCount > 0 ? `${physicalCount} fields` : "Not added",
      tone: physicalCount > 0 ? "success" : "neutral",
      detail: "Weight and size details.",
    },
    {
      label: "Dynamic details",
      value:
        payload.groupFieldValues.values.length > 0
          ? `${filledGroupFields}/${payload.groupFieldValues.values.length}`
          : "Not needed",
      tone:
        filledGroupFields > 0
          ? "success"
          : payload.groupFieldValues.values.length > 0
            ? "warning"
            : "neutral",
      detail: "Metadata from the selected group template.",
    },
    {
      label: "Media",
      value: `${payload.media.length} items`,
      tone: payload.media.length > 0 ? "success" : "neutral",
      detail: "Product images and videos.",
    },
    {
      label: "Marketing",
      value: `${payload.marketingMedia.length} items`,
      tone: payload.marketingMedia.length > 0 ? "success" : "neutral",
      detail: "Campaign images and videos.",
    },
    {
      label: "Lot matrix",
      value:
        payload.product.type !== "Lot Matrix"
          ? "Not needed"
          : payload.lotMatrix === null
            ? "Select attributes"
            : payload.lotMatrix.variants.length === 0
              ? `Generate ${payload.lotMatrix.expectedVariantCount} rows`
              : payload.lotMatrix.variants.length ===
                  payload.lotMatrix.expectedVariantCount
                ? `${payload.lotMatrix.variants.length} rows generated`
                : `${payload.lotMatrix.variants.length} of ${payload.lotMatrix.expectedVariantCount} rows kept`,
      tone:
        payload.product.type !== "Lot Matrix"
          ? "neutral"
          : payload.lotMatrix !== null && payload.lotMatrix.variants.length > 0
            ? "info"
            : "warning",
      detail:
        payload.product.type !== "Lot Matrix"
          ? "Available when product type is Lot Matrix."
          : payload.lotMatrix === null
            ? "Choose the attributes that define sellable combinations."
            : "Generate every possible row, then keep or remove the ones you want to save.",
    },
    {
      label: "Vendors",
      value: `${payload.vendors.length} vendors`,
      tone: payload.vendors.length > 0 ? "success" : "neutral",
      detail: "Supplier details for this product.",
    },
    {
      label: "Zones",
      value: `${payload.zones.length} zones`,
      tone: payload.zones.length > 0 ? "success" : "neutral",
      detail: "Availability and operational zones.",
    },
  ];
}

export function buildProductCreateSummary(options: {
  payload: ProductCreateWorkspacePayload;
  values: ProductCreateWorkspaceValues;
  catalog: ProductCreateCatalogContext;
}): ProductCreateSummary {
  const setupItems = buildProductCreateSetupItems(
    options.payload,
    options.values,
  );
  const actionableItems = setupItems.filter(
    (item) => item.value !== "Not needed",
  );
  const completedCount = actionableItems.filter(
    (item) => item.tone === "success" || item.tone === "info",
  ).length;

  return {
    currentTabLabel: options.catalog.currentTabLabel,
    productName: options.values.name || "New product",
    productCode: options.values.code || "Code will appear here",
    description: plainTextFromRichText(options.values.description) || null,
    primaryMediaUrl:
      options.payload.media.find((item) => item.isPrimary)?.url ??
      options.payload.media[0]?.url ??
      null,
    productTypeLabel: options.catalog.productTypeLabel,
    isActive: options.values.isActive,
    itemInactive: options.values.itemInactive,
    departmentName: options.catalog.departmentName,
    categoryName: options.catalog.categoryName,
    subCategoryName: options.catalog.subCategoryName,
    groupName: options.catalog.groupName,
    completionText: `${completedCount}/${actionableItems.length} sections ready`,
    setupItems,
  };
}

export function buildProductGridCardModel(
  row: ProductListRow,
): ProductGridCardModel {
  const setupMetrics = [
    {
      label: "Media",
      value: String(row.mediaCount),
      tone: row.mediaCount > 0 ? ("success" as const) : ("neutral" as const),
    },
    {
      label: "Marketing",
      value: String(row.marketingMediaCount),
      tone:
        row.marketingMediaCount > 0
          ? ("success" as const)
          : ("neutral" as const),
    },
    {
      label: "Lot Matrix",
      value: String(row.variantCount),
      tone: row.variantCount > 0 ? ("info" as const) : ("neutral" as const),
    },
  ];

  return {
    id: row.product.id,
    name: row.product.name,
    code: row.product.code,
    description: plainTextFromRichText(row.product.description) || null,
    productType: row.product.type,
    isActive: row.product.isActive,
    itemInactive: row.product.itemInactive,
    departmentName: row.departmentName,
    categoryName: row.categoryName,
    subCategoryName: row.subCategoryName,
    groupName: row.groupName,
    priceLabel: formatCurrency(row.product.price),
    stockLabel: `${row.product.stockQuantity} in stock`,
    setupMetrics,
  };
}
