import type { ProductListRow } from "@features/admin/products/types/products.types";
import { SectionCard, StatusBadge } from "@shared/components/admin";
import { RichTextContent } from "@shared/components/ui/rich-text-content";
import type React from "react";
import {
  formatCurrency,
  formatProductListingStatus,
  formatProductSellingStatus,
  formatProductType,
} from "../../services/product-admin.helpers";

type ProductOverviewPanelProps = {
  row: ProductListRow;
};

export function ProductOverviewPanel(
  props: ProductOverviewPanelProps,
): React.JSX.Element {
  const { row } = props;

  return (
    <SectionCard
      title="Catalog Overview"
      description="Review the main product details and catalog placement."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-zinc-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
            Type
          </p>
          <p className="mt-2 text-sm font-medium text-zinc-900">
            {formatProductType(row.product.type)}
          </p>
        </div>
        <div className="rounded-2xl bg-zinc-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
            Base price
          </p>
          <p className="mt-2 text-sm font-medium text-zinc-900">
            {formatCurrency(row.product.price)}
          </p>
        </div>
        <div className="rounded-2xl bg-zinc-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
            Stock quantity
          </p>
          <p className="mt-2 text-sm font-medium text-zinc-900">
            {row.product.stockQuantity}
          </p>
        </div>
        <div className="rounded-2xl bg-zinc-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
            Status
          </p>
          <div className="mt-2 flex gap-2">
            <StatusBadge
              label={formatProductListingStatus(row.product.isActive)}
              variant={row.product.isActive ? "success" : "neutral"}
            />
            <StatusBadge
              label={formatProductSellingStatus(row.product.itemInactive)}
              variant={row.product.itemInactive ? "warning" : "info"}
            />
          </div>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-zinc-200 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
            Description
          </p>
          {row.product.description ? (
            <RichTextContent
              value={row.product.description}
              className="mt-2 text-zinc-600"
            />
          ) : (
            <p className="mt-2 text-sm leading-7 text-zinc-600">
              No description has been added yet.
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-zinc-200 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
            Classification
          </p>
          <dl className="mt-3 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-zinc-500">Department</dt>
              <dd className="text-sm font-medium text-zinc-900">
                {row.departmentName}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-zinc-500">Category</dt>
              <dd className="text-sm font-medium text-zinc-900">
                {row.categoryName}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-zinc-500">Sub-category</dt>
              <dd className="text-sm font-medium text-zinc-900">
                {row.subCategoryName}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-zinc-500">Group</dt>
              <dd className="text-sm font-medium text-zinc-900">
                {row.groupName}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </SectionCard>
  );
}
