"use client";

import {
  buildProductListRows,
  formatCompactNumber,
  formatCurrency,
  formatProductListingStatus,
  formatProductSellingStatus,
  formatProductType,
} from "@features/admin/products/services/product-admin.helpers";
import {
  findProduct,
  getGroupFieldValuesForProduct,
  getMarketingMediaForProduct,
  getMediaForProduct,
  getPhysicalAttributesForProduct,
  getVariantsForProduct,
  getVendorsForProduct,
  getZonesForProduct,
} from "@features/admin/products/services/product-admin.mock";
import { PageHeader, SectionCard, StatusBadge } from "@shared/components/admin";
import { Button } from "@shared/components/ui/button";
import { RichTextContent } from "@shared/components/ui/rich-text-content";
import { cn } from "@shared/lib/utils";
import {
  IconArrowLeft,
  IconExternalLink,
  IconPhoto,
  IconVideo,
} from "@tabler/icons-react";
import Link from "next/link";
import type React from "react";
import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ProductViewPageProps = {
  productId: string;
};

type TabKey =
  | "overview"
  | "physical-attributes"
  | "group-field-values"
  | "media"
  | "marketing-media"
  | "vendors"
  | "zones"
  | "metadata";

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "physical-attributes", label: "Physical Attributes" },
  { key: "group-field-values", label: "Dynamic Details" },
  { key: "media", label: "Media" },
  { key: "marketing-media", label: "Marketing Media" },
  { key: "vendors", label: "Vendors" },
  { key: "zones", label: "Zones" },
  { key: "metadata", label: "Metadata" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

type FieldRowProps = {
  label: string;
  value: React.ReactNode;
};

function FieldRow(props: FieldRowProps): React.JSX.Element {
  return (
    <div className="flex items-start gap-4 border-b border-zinc-100 py-2.5 last:border-0">
      <span className="w-44 shrink-0 text-sm text-zinc-500">{props.label}</span>
      <div className="min-w-0 flex-1 text-sm text-zinc-800">{props.value}</div>
    </div>
  );
}

type SectionHeadingProps = {
  label: string;
};

function SectionHeading(props: SectionHeadingProps): React.JSX.Element {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
      {props.label}
    </p>
  );
}

function formatOptionalText(value: string | null): string {
  return value && value.trim().length > 0 ? value : "Not set";
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProductViewPage(
  props: ProductViewPageProps,
): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const productId = Number(props.productId);

  const row = buildProductListRows().find(
    (item) => item.product.id === productId,
  );

  if (!row || !findProduct(productId)) {
    return (
      <SectionCard
        title="Product Not Found"
        description="We couldn't find that product."
      >
        <Button asChild>
          <Link href="/admin/products">Return to products</Link>
        </Button>
      </SectionCard>
    );
  }

  const product = row.product;
  const media = getMediaForProduct(product.id);
  const marketingMedia = getMarketingMediaForProduct(product.id);
  const variants = getVariantsForProduct(product.id);
  const physicalAttrs = getPhysicalAttributesForProduct(product.id);
  const groupFieldValues = getGroupFieldValuesForProduct(product.id);
  const vendors = getVendorsForProduct(product.id);
  const zones = getZonesForProduct(product.id);

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <IconArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      {/* Page header */}
      <PageHeader
        title={product.name}
        subtitle={`${product.code} · ${row.departmentName} · ${row.subCategoryName} · ${formatCurrency(product.price)}`}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/media">Open Media</Link>
            </Button>
            <Button asChild>
              <Link href={`/admin/products/${product.id}/variants`}>
                Open Lot Matrix
                <IconExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        }
      />

      {/* Summary strip */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Media", value: media.length },
          { label: "Marketing Assets", value: marketingMedia.length },
          { label: "Lot Matrix", value: variants.length },
          { label: "Vendors", value: vendors.length },
          { label: "Zones", value: zones.length },
        ].map((item: { label: string; value: number }) => (
          <div
            key={item.label}
            className="flex items-center gap-2.5 rounded-md border border-zinc-200 bg-white px-4 py-2.5 shadow-sm"
          >
            <span className="text-sm text-zinc-500">{item.label}</span>
            <span className="text-sm font-semibold text-zinc-900">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "shrink-0 rounded px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <SectionCard
          title="Overview"
          description="Core product details and classification."
        >
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <SectionHeading label="Identity" />
              <FieldRow label="Code" value={product.code} />
              <FieldRow
                label="Product Type"
                value={formatProductType(product.type)}
              />
              <FieldRow
                label="Listing"
                value={
                  <StatusBadge
                    label={formatProductListingStatus(product.isActive)}
                    variant={product.isActive ? "success" : "neutral"}
                  />
                }
              />
              <FieldRow
                label="Selling"
                value={formatProductSellingStatus(product.itemInactive)}
              />
              {product.description && (
                <FieldRow
                  label="Description"
                  value={<RichTextContent value={product.description} />}
                />
              )}
            </div>
            <div>
              <SectionHeading label="Classification" />
              <FieldRow label="Department" value={row.departmentName} />
              <FieldRow label="Category" value={row.categoryName} />
              <FieldRow label="Sub-category" value={row.subCategoryName} />
              <FieldRow label="Group" value={row.groupName} />
            </div>
            <div>
              <SectionHeading label="Pricing & Stock" />
              <FieldRow
                label="Price"
                value={formatCurrency(product.price)}
              />
              <FieldRow
                label="Stock"
                value={`${product.stockQuantity} units`}
              />
            </div>
          </div>
        </SectionCard>
      )}

      {/* Tab: Physical Attributes */}
      {activeTab === "physical-attributes" && (
        <SectionCard
          title="Physical Attributes"
          description="Size and weight details for this product."
        >
          <FieldRow
            label="Weight"
            value={formatOptionalText(physicalAttrs.weight)}
          />
          <FieldRow
            label="Length"
            value={formatOptionalText(physicalAttrs.length)}
          />
          <FieldRow
            label="Width"
            value={formatOptionalText(physicalAttrs.width)}
          />
          <FieldRow
            label="Height"
            value={formatOptionalText(physicalAttrs.height)}
          />
        </SectionCard>
      )}

      {/* Tab: Group Field Values */}
      {activeTab === "group-field-values" && (
        <SectionCard
          title="Dynamic Details"
          description="Metadata values assigned from the selected group template."
        >
          {groupFieldValues.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No dynamic metadata has been saved for this product.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Field
                  </th>
                  <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Type
                  </th>
                  <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupFieldValues.map((value) => (
                  <tr
                    key={value.fieldId}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="py-2.5 text-zinc-700">{value.fieldName}</td>
                    <td className="py-2.5">
                      <StatusBadge label={value.fieldType} variant="neutral" />
                    </td>
                    <td className="py-2.5 text-zinc-700">
                      {value.displayValue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {/* Tab: Media */}
      {activeTab === "media" && (
        <SectionCard title="Media" description="Product images and videos.">
          {media.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No product media has been linked yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                >
                  <div className="flex h-24 items-center justify-center rounded-md bg-zinc-100">
                    {item.type === "video" ? (
                      <IconVideo className="h-8 w-8 text-zinc-400" />
                    ) : (
                      <IconPhoto className="h-8 w-8 text-zinc-400" />
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <StatusBadge label={item.type} variant="info" />
                    {item.isPrimary && (
                      <StatusBadge label="Primary" variant="success" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    Order: {item.sortOrder}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* Tab: Marketing Media */}
      {activeTab === "marketing-media" && (
        <SectionCard
          title="Marketing Media"
          description="Campaign images and videos for this product."
        >
          {marketingMedia.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No marketing media is configured for this product.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {marketingMedia.map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                >
                  <div className="flex h-24 items-center justify-center rounded-md bg-zinc-100">
                    {item.type === "video" ? (
                      <IconVideo className="h-8 w-8 text-zinc-400" />
                    ) : (
                      <IconPhoto className="h-8 w-8 text-zinc-400" />
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <StatusBadge label={item.type} variant="info" />
                  </div>
                  {item.duration !== null && (
                    <p className="mt-1 text-xs text-zinc-400">
                      {formatCompactNumber(item.duration)} sec
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Order: {item.sortOrder}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* Tab: Vendors */}
      {activeTab === "vendors" && (
        <SectionCard
          title="Vendors"
          description="Supplier records linked to this product."
        >
          {vendors.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No vendors are attached to this product.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Vendor
                  </th>
                  <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Contact
                  </th>
                  <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    GSTIN
                  </th>
                  <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Primary
                  </th>
                  <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="py-2.5 text-zinc-700">
                      {vendor.name}
                    </td>
                    <td className="py-2.5 text-zinc-600">
                      {vendor.contactPerson ?? vendor.contactEmail ?? "Not set"}
                    </td>
                    <td className="py-2.5 text-zinc-600">
                      {vendor.gstin ?? "Not set"}
                    </td>
                    <td className="py-2.5 text-zinc-700">
                      {vendor.isPrimary ? "Yes" : "No"}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge
                        label={vendor.isActive ? "Active" : "Inactive"}
                        variant={vendor.isActive ? "success" : "neutral"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {/* Tab: Zones */}
      {activeTab === "zones" && (
        <SectionCard
          title="Zones"
          description="Zone coverage linked to this product."
        >
          {zones.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No zones are configured for this product.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Zone
                  </th>
                  <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Code
                  </th>
                  <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Description
                  </th>
                  <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr
                    key={zone.id}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="py-2.5 text-zinc-700">{zone.name}</td>
                    <td className="py-2.5 text-zinc-600">
                      {zone.code ?? "N/A"}
                    </td>
                    <td className="py-2.5 text-zinc-600">
                      {zone.description ? (
                        <RichTextContent
                          value={zone.description}
                          className="text-zinc-600"
                        />
                      ) : (
                        "No description"
                      )}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge
                        label={zone.isActive ? "Active" : "Inactive"}
                        variant={zone.isActive ? "success" : "neutral"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      )}

      {/* Tab: Metadata */}
      {activeTab === "metadata" && (
        <SectionCard
          title="Metadata"
          description="Reference details for this record."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-zinc-200 px-4 py-4">
              <p className="text-xs uppercase tracking-wide text-zinc-400">
                Record ID
              </p>
              <p className="mt-1 break-all text-sm text-zinc-700">
                {product.id}
              </p>
            </div>
            <div className="rounded-md border border-zinc-200 px-4 py-4">
              <p className="text-xs uppercase tracking-wide text-zinc-400">
                Pricing snapshot
              </p>
              <p className="mt-1 text-sm text-zinc-700">
                {formatCurrency(product.price)} price ·{" "}
                {product.stockQuantity} units in stock
              </p>
            </div>
            <div className="rounded-md border border-zinc-200 px-4 py-4">
              <p className="text-xs uppercase tracking-wide text-zinc-400">
                Created
              </p>
              <p className="mt-1 text-sm text-zinc-700">{product.createdAt}</p>
            </div>
            <div className="rounded-md border border-zinc-200 px-4 py-4">
              <p className="text-xs uppercase tracking-wide text-zinc-400">
                Last updated
              </p>
              <p className="mt-1 text-sm text-zinc-700">{product.updatedAt}</p>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
