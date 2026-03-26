import type { ProductCreateSummary } from "@features/admin/products/types/product-create.types";
import { SectionCard, StatusBadge } from "@shared/components/admin";
import {
  formatProductListingStatus,
  formatProductSellingStatus,
} from "@features/admin/products/services/product-admin.helpers";
import type React from "react";

type ProductCreateSummarySidebarProps = {
  summary: ProductCreateSummary;
};

function buildInitials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "NP"
  );
}

function DetailRow(props: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 py-3 last:border-0">
      <p className="text-sm text-zinc-500">{props.label}</p>
      <p className="text-sm font-medium text-zinc-900">{props.value}</p>
    </div>
  );
}

export function ProductCreateSummarySidebar(
  props: ProductCreateSummarySidebarProps,
): React.JSX.Element {
  const { summary } = props;
  const initials = buildInitials(summary.productName);

  return (
    <div className="space-y-5 xl:sticky xl:top-6">
      <div className="overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-sm">
        <div className="aspect-[4/3] overflow-hidden border-b border-zinc-200 bg-zinc-100">
          {summary.primaryMediaUrl ? (
            <img
              src={summary.primaryMediaUrl}
              alt={summary.productName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-end bg-gradient-to-br from-zinc-100 via-white to-sky-100 p-5">
              <div className="space-y-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-lg font-semibold text-white shadow-sm">
                  {initials}
                </div>
                <p className="text-sm font-medium text-zinc-800">
                  Primary photo will appear here
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
              {summary.currentTabLabel}
            </p>
            <div>
              <p className="text-lg font-semibold text-zinc-950">
                {summary.productName}
              </p>
              <p className="mt-1 text-sm text-zinc-500">{summary.productCode}</p>
            </div>
            {summary.description ? (
              <p className="text-sm leading-6 text-zinc-500">
                {summary.description}
              </p>
            ) : (
              <p className="text-sm leading-6 text-zinc-400">
                Add a short description to give this product more context.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={summary.productTypeLabel} variant="info" />
            <StatusBadge
              label={formatProductListingStatus(summary.isActive)}
              variant={summary.isActive ? "success" : "neutral"}
            />
            <StatusBadge
              label={formatProductSellingStatus(summary.itemInactive)}
              variant={summary.itemInactive ? "warning" : "neutral"}
            />
          </div>
        </div>
      </div>
      <SectionCard
        title="Product Details"
        description="Review the catalog details for the product you are building."
      >
        <DetailRow label="Current Tab" value={summary.currentTabLabel} />
        <DetailRow label="Type" value={summary.productTypeLabel} />
        <DetailRow
          label="Department"
          value={summary.departmentName ?? "Not selected"}
        />
        <DetailRow
          label="Category"
          value={summary.categoryName ?? "Not selected"}
        />
        <DetailRow
          label="Sub-category"
          value={summary.subCategoryName ?? "Not selected"}
        />
        <DetailRow label="Group" value={summary.groupName ?? "Not selected"} />
      </SectionCard>
      <SectionCard
        title="Setup Progress"
        description="Track which parts of the product are ready."
      >
        <div className="mb-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
            Completion
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge label={summary.completionText} variant="neutral" />
          </div>
        </div>
        <div className="space-y-3">
          {summary.setupItems.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {item.detail}
                  </p>
                </div>
                <StatusBadge label={item.value} variant={item.tone} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
