import type { Variant } from "@features/admin/variants/types/variants.types";
import { ProductResourcePanel } from "@features/admin/products/components/workspace/ProductResourcePanel";
import type React from "react";
import { summarizeVariantAttributes } from "@features/admin/products/services/product-admin.helpers";
import { StatusBadge } from "@shared/components/admin";

type PersistedVariantTableProps = {
  variants: Variant[];
};

export function PersistedVariantTable(
  props: PersistedVariantTableProps,
): React.JSX.Element {
  return (
    <ProductResourcePanel
      title="Saved Lot Matrix Rows"
      description="Review the saved lot matrix rows for this product."
      headers={["SKU", "Attributes", "Price", "Stock", "Status"]}
      rows={props.variants.map((variant) => [
        variant.sku,
        summarizeVariantAttributes(variant),
        variant.price === null
          ? "Not set"
          : new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(variant.price),
        String(variant.stockQuantity),
        <div key={variant.id} className="flex flex-col gap-2">
          <StatusBadge
            label={variant.isActive ? "Active" : "Inactive"}
            variant={variant.isActive ? "success" : "neutral"}
          />
          <StatusBadge
            label={variant.isDeleted ? "Deleted" : "Current"}
            variant={variant.isDeleted ? "danger" : "info"}
          />
        </div>,
      ])}
      emptyMessage="No lot matrix rows have been created for this product yet."
    />
  );
}
