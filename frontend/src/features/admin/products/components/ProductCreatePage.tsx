"use client";

import type { Attribute } from "@features/admin/attributes/types/attributes.types";
import { ProductBasicsSection } from "@features/admin/products/components/create/ProductBasicsSection";
import { ProductClassificationSection } from "@features/admin/products/components/create/ProductClassificationSection";
import { ProductCreateSummarySidebar } from "@features/admin/products/components/create/ProductCreateSummarySidebar";
import { ProductCreateTabNav } from "@features/admin/products/components/create/ProductCreateTabNav";
import { ProductPricingInventorySection } from "@features/admin/products/components/create/ProductPricingInventorySection";
import { ProductStatusSection } from "@features/admin/products/components/create/ProductStatusSection";
import { ProductGroupFieldsTab } from "@features/admin/products/components/create/tabs/ProductGroupFieldsTab";
import { ProductLotMatrixTab } from "@features/admin/products/components/create/tabs/ProductLotMatrixTab";
import { ProductMarketingMediaTab } from "@features/admin/products/components/create/tabs/ProductMarketingMediaTab";
import { ProductMediaTab } from "@features/admin/products/components/create/tabs/ProductMediaTab";
import { ProductPhysicalTab } from "@features/admin/products/components/create/tabs/ProductPhysicalTab";
import { ProductVendorsTab } from "@features/admin/products/components/create/tabs/ProductVendorsTab";
import { ProductZonesTab } from "@features/admin/products/components/create/tabs/ProductZonesTab";
import {
  ProductCreateWorkspaceSchema,
  type ProductCreateWorkspaceValues,
} from "@features/admin/products/schemas/products.schema";
import { formatProductType } from "@features/admin/products/services/product-admin.helpers";
import {
  buildProductCreateSummary,
  buildProductCreateTabs,
  buildProductCreateWorkspacePayload,
  computeLotMatrixCount,
  createEmptyLotMatrixRow,
  createEmptyMarketingMediaItem,
  createEmptyMediaItem,
  createRuntimeLotMatrixAttribute,
  createEmptyVendorItem,
  createEmptyZoneItem,
  generateLotMatrixRows,
  syncGroupFieldValues,
  syncLotMatrixRows,
  updateLotMatrixRowSelection,
} from "@features/admin/products/services/product-create.helpers";
import {
  findCategory,
  MOCK_ATTRIBUTES,
  MOCK_DEPARTMENTS,
  MOCK_GROUPS,
  MOCK_SUB_CATEGORIES,
} from "@features/admin/products/services/product-admin.mock";
import type {
  ProductCreateTabKey,
  ProductGroupFieldValueDraft,
  ProductLotMatrixAttributeBuilderInput,
  ProductLotMatrixRowDraft,
  ProductMarketingMediaDraft,
  ProductMediaDraft,
  ProductVendorDraft,
  ProductZoneDraft,
} from "@features/admin/products/types/product-create.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@shared/components/ui/button";
import { Form } from "@shared/components/ui/form";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

export function ProductCreatePage(): React.JSX.Element {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProductCreateTabKey>("basic");

  const form = useForm<
    z.input<typeof ProductCreateWorkspaceSchema>,
    unknown,
    ProductCreateWorkspaceValues
  >({
    resolver: zodResolver(ProductCreateWorkspaceSchema),
    defaultValues: {
      code: "",
      upc: "",
      name: "",
      model: "",
      description: "",
      type: "Standard",
      hsnCode: "",
      price: 0,
      stockQuantity: 0,
      departmentId: 0,
      subCategoryId: 0,
      groupId: 0,
      nonTaxable: false,
      itemInactive: false,
      nonStockItem: false,
      isActive: true,
      physicalWeight: null,
      physicalLength: null,
      physicalWidth: null,
      physicalHeight: null,
    },
  });

  const watchedValues = form.watch() as ProductCreateWorkspaceValues;
  const watchedProductType = watchedValues.type;
  const watchedGroupId = watchedValues.groupId;
  const watchedSubCategoryId = watchedValues.subCategoryId;
  const watchedDepartmentId = watchedValues.departmentId;

  const selectedSubCategory = watchedSubCategoryId
    ? MOCK_SUB_CATEGORIES.find((subCategory) => subCategory.id === watchedSubCategoryId)
    : undefined;
  const derivedCategoryName = selectedSubCategory
    ? (findCategory(selectedSubCategory.categoryId)?.name ?? null)
    : null;
  const selectedSubCategoryName = selectedSubCategory?.name ?? null;
  const selectedDepartmentName =
    MOCK_DEPARTMENTS.find((department) => department.id === watchedDepartmentId)
      ?.name ?? null;
  const selectedGroup = watchedGroupId
    ? MOCK_GROUPS.find((group) => group.id === watchedGroupId)
    : undefined;
  const selectedGroupName = selectedGroup?.name ?? null;

  const [groupFieldValues, setGroupFieldValues] = useState<
    ProductGroupFieldValueDraft[]
  >([]);
  const [mediaItems, setMediaItems] = useState<ProductMediaDraft[]>([]);
  const [marketingItems, setMarketingItems] = useState<
    ProductMarketingMediaDraft[]
  >([]);
  const [productAttributes, setProductAttributes] = useState<Attribute[]>(
    () => MOCK_ATTRIBUTES,
  );
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<number[]>(
    [],
  );
  const [lotMatrixRows, setLotMatrixRows] = useState<ProductLotMatrixRowDraft[]>(
    [],
  );
  const [highlightedLotMatrixRowId, setHighlightedLotMatrixRowId] = useState<
    string | null
  >(null);
  const [vendors, setVendors] = useState<ProductVendorDraft[]>([]);
  const [zones, setZones] = useState<ProductZoneDraft[]>([]);

  const possibleLotMatrixCount = useMemo(
    () => computeLotMatrixCount(productAttributes, selectedAttributeIds),
    [productAttributes, selectedAttributeIds],
  );
  const lotMatrixBadgeCount =
    lotMatrixRows.length > 0 ? lotMatrixRows.length : possibleLotMatrixCount;

  useEffect(() => {
    setGroupFieldValues((current) => syncGroupFieldValues(selectedGroup, current));
  }, [selectedGroup]);

  useEffect(() => {
    if (watchedProductType !== "Lot Matrix" && selectedAttributeIds.length > 0) {
      setSelectedAttributeIds([]);
    }
  }, [selectedAttributeIds.length, watchedProductType]);

  useEffect(() => {
    setLotMatrixRows((current) =>
      syncLotMatrixRows(current, productAttributes, selectedAttributeIds),
    );
  }, [productAttributes, selectedAttributeIds]);

  useEffect(() => {
    if (highlightedLotMatrixRowId === null) return;

    const timeoutId = window.setTimeout(() => {
      setHighlightedLotMatrixRowId(null);
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [highlightedLotMatrixRowId]);

  const visibleTabs = useMemo(
    () =>
      buildProductCreateTabs({
        productType: watchedProductType ?? "Standard",
        selectedGroup,
        mediaCount: mediaItems.length,
        marketingCount: marketingItems.length,
        vendorCount: vendors.length,
        zoneCount: zones.length,
        lotMatrixBadgeCount,
      }),
    [
      lotMatrixBadgeCount,
      marketingItems.length,
      mediaItems.length,
      selectedGroup,
      vendors.length,
      watchedProductType,
      zones.length,
    ],
  );

  useEffect(() => {
    if (visibleTabs.some((tab) => tab.key === activeTab)) return;
    setActiveTab("basic");
  }, [activeTab, visibleTabs]);

  const payload = useMemo(
    () =>
      buildProductCreateWorkspacePayload({
        values: watchedValues,
        state: {
          groupFieldValues,
          media: mediaItems,
          marketingMedia: marketingItems,
          selectedAttributeIds,
          lotMatrixRows,
          vendors,
          zones,
        },
        attributes: productAttributes,
      }),
    [
      groupFieldValues,
      marketingItems,
      mediaItems,
      lotMatrixRows,
      productAttributes,
      selectedAttributeIds,
      vendors,
      watchedValues,
      zones,
    ],
  );

  const summary = useMemo(
    () =>
      buildProductCreateSummary({
        payload,
        values: watchedValues,
        catalog: {
          currentTabLabel:
            visibleTabs.find((tab) => tab.key === activeTab)?.label ?? "Basic Info",
          productTypeLabel: formatProductType(watchedProductType ?? "Standard"),
          departmentName: selectedDepartmentName,
          categoryName: derivedCategoryName,
          subCategoryName: selectedSubCategoryName,
          groupName: selectedGroupName,
        },
      }),
    [
      activeTab,
      derivedCategoryName,
      payload,
      selectedDepartmentName,
      selectedGroupName,
      selectedSubCategoryName,
      visibleTabs,
      watchedProductType,
      watchedValues,
    ],
  );

  function handleSubmit(values: ProductCreateWorkspaceValues): void {
    console.log(
      "Create product workspace payload",
      buildProductCreateWorkspacePayload({
        values,
        state: {
          groupFieldValues,
          media: mediaItems,
          marketingMedia: marketingItems,
          selectedAttributeIds,
          lotMatrixRows,
          vendors,
          zones,
        },
        attributes: productAttributes,
      }),
    );
    router.push("/admin/products");
  }

  function handleCreateLotMatrixAttribute(
    input: ProductLotMatrixAttributeBuilderInput,
  ): void {
    const normalizedName = input.name.trim().toLowerCase();
    const nameExists = productAttributes.some(
      (attribute) => attribute.name.trim().toLowerCase() === normalizedName,
    );

    if (nameExists) {
      toast.error("That attribute already exists in this lot matrix");
      return;
    }

    const nextAttribute = createRuntimeLotMatrixAttribute(input);
    setProductAttributes((current) => [...current, nextAttribute]);
    setSelectedAttributeIds((current) => [...current, nextAttribute.id]);
    toast.success(`${nextAttribute.name} added as a shared lot matrix attribute`);
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <IconArrowLeft className="h-4 w-4" />
        Back to products
      </Link>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <ProductCreateTabNav
            tabs={visibleTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              {activeTab === "basic" ? (
                <>
                  <ProductBasicsSection control={form.control} />
                  <ProductPricingInventorySection control={form.control} />
                  <ProductClassificationSection
                    control={form.control}
                    departments={MOCK_DEPARTMENTS}
                    subCategories={MOCK_SUB_CATEGORIES}
                    groups={MOCK_GROUPS}
                    categoryName={derivedCategoryName}
                  />
                  <ProductStatusSection control={form.control} />
                </>
              ) : null}

              {activeTab === "physical" ? (
                <ProductPhysicalTab control={form.control} />
              ) : null}

              {activeTab === "group-fields" ? (
                <ProductGroupFieldsTab
                  key={watchedGroupId ?? "no-group"}
                  group={selectedGroup}
                  groupFieldValues={groupFieldValues}
                  onChangeGroupFieldValues={setGroupFieldValues}
                />
              ) : null}

              {activeTab === "media" ? (
                <ProductMediaTab
                  items={mediaItems}
                  onAdd={() =>
                    setMediaItems((current) => [
                      ...current,
                      createEmptyMediaItem(current.length),
                    ])
                  }
                  onRemove={(index) =>
                    setMediaItems((current) =>
                      current
                        .filter((_, currentIndex) => currentIndex !== index)
                        .map((item, currentIndex) => ({
                          ...item,
                          sortOrder: currentIndex,
                          isPrimary: currentIndex === 0 ? true : item.isPrimary ?? false,
                        })),
                    )
                  }
                  onChange={(index, field, value) =>
                    setMediaItems((current) =>
                      current.map((item, currentIndex) =>
                        currentIndex === index
                          ? { ...item, [field]: value }
                          : field === "isPrimary" && value === true
                            ? { ...item, isPrimary: false }
                            : item,
                      ),
                    )
                  }
                />
              ) : null}

              {activeTab === "marketing" ? (
                <ProductMarketingMediaTab
                  items={marketingItems}
                  onAdd={() =>
                    setMarketingItems((current) => [
                      ...current,
                      createEmptyMarketingMediaItem(current.length),
                    ])
                  }
                  onRemove={(index) =>
                    setMarketingItems((current) =>
                      current.filter((_, currentIndex) => currentIndex !== index),
                    )
                  }
                  onChange={(index, field, value) =>
                    setMarketingItems((current) =>
                      current.map((item, currentIndex) =>
                        currentIndex === index ? { ...item, [field]: value } : item,
                      ),
                    )
                  }
                />
              ) : null}

              {activeTab === "lot-matrix" ? (
                <ProductLotMatrixTab
                  attributes={productAttributes}
                  productType={watchedProductType ?? "Standard"}
                  selectedAttributeIds={selectedAttributeIds}
                  highlightedRowId={highlightedLotMatrixRowId}
                  onToggleAttribute={(attributeId: number) =>
                    setSelectedAttributeIds((current) =>
                      current.includes(attributeId)
                        ? current.filter((value) => value !== attributeId)
                        : [...current, attributeId],
                    )
                  }
                  productCode={watchedValues.code}
                  price={watchedValues.price}
                  rows={lotMatrixRows}
                  onGenerateRows={() =>
                    setLotMatrixRows((current) =>
                      generateLotMatrixRows({
                        attributes: productAttributes,
                        selectedAttributeIds,
                        productCode: watchedValues.code,
                        price: watchedValues.price,
                        currentRows: current,
                      }),
                    )
                  }
                  onCreateAttribute={handleCreateLotMatrixAttribute}
                  onAddRow={() =>
                    setLotMatrixRows((current) => {
                      const nextRow = createEmptyLotMatrixRow({
                        attributes: productAttributes,
                        selectedAttributeIds,
                        productCode: watchedValues.code,
                        price: watchedValues.price,
                        rowIndex: current.length,
                      });

                      setHighlightedLotMatrixRowId(nextRow.id);
                      toast.success("Added a lot matrix row");

                      return [...current, nextRow];
                    })
                  }
                  onResetRows={() => setLotMatrixRows([])}
                  onRemoveRow={(rowId) =>
                    setLotMatrixRows((current) =>
                      current.filter((row) => row.id !== rowId),
                    )
                  }
                  onChangeSelection={(rowId, attributeId, attributeValueId) =>
                    setLotMatrixRows((current) =>
                      current.map((row) =>
                        row.id === rowId
                          ? updateLotMatrixRowSelection({
                              row,
                              attributeId,
                              attributeValueId,
                              attributes: productAttributes,
                              selectedAttributeIds,
                            })
                          : row,
                      ),
                    )
                  }
                  onChangeField={(rowId, field, value) =>
                    setLotMatrixRows((current) =>
                      current.map((row) =>
                        row.id === rowId ? { ...row, [field]: value } : row,
                      ),
                    )
                  }
                />
              ) : null}

              {activeTab === "vendors" ? (
                <ProductVendorsTab
                  items={vendors}
                  onAdd={() =>
                    setVendors((current) => [
                      ...current,
                      createEmptyVendorItem(current.length),
                    ])
                  }
                  onRemove={(index) =>
                    setVendors((current) =>
                      current.filter((_, currentIndex) => currentIndex !== index),
                    )
                  }
                  onChange={(index, field, value) =>
                    setVendors((current) =>
                      current.map((item, currentIndex) =>
                        currentIndex === index
                          ? { ...item, [field]: value }
                          : field === "isPrimary" && value === true
                            ? { ...item, isPrimary: false }
                            : item,
                      ),
                    )
                  }
                />
              ) : null}

              {activeTab === "zones" ? (
                <ProductZonesTab
                  items={zones}
                  onAdd={() =>
                    setZones((current) => [...current, createEmptyZoneItem()])
                  }
                  onRemove={(index) =>
                    setZones((current) =>
                      current.filter((_, currentIndex) => currentIndex !== index),
                    )
                  }
                  onChange={(index, field, value) =>
                    setZones((current) =>
                      current.map((item, currentIndex) =>
                        currentIndex === index ? { ...item, [field]: value } : item,
                      ),
                    )
                  }
                />
              ) : null}
            </div>
            <ProductCreateSummarySidebar summary={summary} />
          </div>
          <div className="flex justify-end gap-3 border-t border-zinc-200 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/products")}
            >
              Cancel
            </Button>
            <Button type="submit">Create Product</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
