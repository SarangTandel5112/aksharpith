import { SectionCard, StatusBadge } from "@shared/components/admin";
import type React from "react";

type ProductCreateSidebarProps = {
  categoryName: string | null;
  departmentName: string | null;
  subCategoryName: string | null;
  groupName: string | null;
  productTypeLabel: string;
  hasGroup: boolean;
};

export function ProductCreateSidebar(
  props: ProductCreateSidebarProps,
): React.JSX.Element {
  return (
    <div className="space-y-5">
      <SectionCard
        title="Summary"
        description="A quick view of the choices made for this product."
      >
        <div className="space-y-3 text-sm text-zinc-600">
          <div className="flex items-center justify-between rounded-md bg-zinc-50 px-4 py-3">
            <span>Department</span>
            <span className="font-medium text-zinc-900">
              {props.departmentName ?? "Not selected"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-zinc-50 px-4 py-3">
            <span>Sub-category</span>
            <span className="font-medium text-zinc-900">
              {props.subCategoryName ?? "Not selected"}
            </span>
          </div>
          {props.categoryName ? (
            <div className="flex items-center justify-between rounded-md bg-zinc-50 px-4 py-3">
              <span>Category</span>
              <span className="font-medium text-zinc-900">
                {props.categoryName}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between rounded-md bg-zinc-50 px-4 py-3">
            <span>Product group</span>
            <span className="font-medium text-zinc-900">
              {props.groupName ?? "Not selected"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-zinc-50 px-4 py-3">
            <span>Product type</span>
            <StatusBadge label={props.productTypeLabel} variant="info" />
          </div>
          <div className="flex items-center justify-between rounded-md bg-zinc-50 px-4 py-3">
            <span>Group fields</span>
            <StatusBadge
              label={props.hasGroup ? "Available" : "None"}
              variant={props.hasGroup ? "success" : "neutral"}
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
