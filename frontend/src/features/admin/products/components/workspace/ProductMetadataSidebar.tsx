import type { ProductListRow } from "@features/admin/products/types/products.types";
import { MetadataCard } from "@shared/components/admin";
import type React from "react";
import { formatDate } from "../../services/product-admin.helpers";

type ProductMetadataSidebarProps = {
  row: ProductListRow;
};

export function ProductMetadataSidebar(
  props: ProductMetadataSidebarProps,
): React.JSX.Element {
  const { row } = props;

  return (
    <MetadataCard
      title="Record Details"
      rows={[
        { label: "Product ID", value: String(row.product.id) },
        { label: "Department ID", value: String(row.product.departmentId) },
        { label: "Sub-category ID", value: String(row.product.subCategoryId) },
        {
          label: "Group ID",
          value:
            row.product.groupId !== null ? String(row.product.groupId) : "None",
        },
        { label: "Created", value: formatDate(row.product.createdAt) },
        {
          label: "Updated",
          value: row.product.updatedAt
            ? formatDate(row.product.updatedAt)
            : "Not updated yet",
        },
      ]}
    />
  );
}
