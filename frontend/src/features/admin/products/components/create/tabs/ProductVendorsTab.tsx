"use client";

import type { ProductVendorDraft } from "@features/admin/products/types/product-create.types";
import { SectionCard } from "@shared/components/admin";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type React from "react";

type ProductVendorsTabProps = {
  items: ProductVendorDraft[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (
    index: number,
    field: keyof ProductVendorDraft,
    value: string | boolean | null,
  ) => void;
};

export function ProductVendorsTab(
  props: ProductVendorsTabProps,
): React.JSX.Element {
  return (
    <SectionCard
      title="Vendors"
      description="Track which vendors supply this product."
    >
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={props.onAdd}
        >
          <IconPlus className="h-4 w-4" />
          Add Vendor
        </Button>

        {props.items.length === 0 && (
          <p className="text-sm text-zinc-500">
            No vendors added yet. Click "Add Vendor" to get started.
          </p>
        )}

        {props.items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-800">
                {item.name || `Vendor ${index + 1}`}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => props.onRemove(index)}
                aria-label="Remove vendor"
              >
                <IconTrash className="h-4 w-4 text-red-500" />
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-600">
                  Vendor name <span className="text-red-500">*</span>
                </p>
                <Input
                  placeholder="e.g. Apple India Pvt Ltd"
                  value={item.name}
                  onChange={(e) =>
                    props.onChange(index, "name", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-600">
                  Contact person
                </p>
                <Input
                  placeholder="e.g. Rahul Sharma"
                  value={item.contactPerson ?? ""}
                  onChange={(e) =>
                    props.onChange(
                      index,
                      "contactPerson",
                      e.target.value || null,
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-600">
                  Contact email
                </p>
                <Input
                  type="email"
                  placeholder="vendor@example.com"
                  value={item.contactEmail ?? ""}
                  onChange={(e) =>
                    props.onChange(
                      index,
                      "contactEmail",
                      e.target.value || null,
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-600">
                  Contact phone
                </p>
                <Input
                  placeholder="+91-9000000000"
                  value={item.contactPhone ?? ""}
                  onChange={(e) =>
                    props.onChange(
                      index,
                      "contactPhone",
                      e.target.value || null,
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-600">GSTIN</p>
                <Input
                  placeholder="27AABCA1234B1ZX"
                  value={item.gstin ?? ""}
                  onChange={(e) =>
                    props.onChange(index, "gstin", e.target.value || null)
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-600">Address</p>
                <Input
                  placeholder="City, State"
                  value={item.address ?? ""}
                  onChange={(e) =>
                    props.onChange(index, "address", e.target.value || null)
                  }
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <p className="text-xs font-medium text-zinc-600">Notes</p>
                <Textarea
                  placeholder="Optional notes about this vendor relationship"
                  value={item.notes ?? ""}
                  onChange={(e) =>
                    props.onChange(index, "notes", e.target.value || null)
                  }
                  rows={2}
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`vendor-primary-${index}`}
                  checked={item.isPrimary ?? false}
                  onCheckedChange={(checked) =>
                    props.onChange(index, "isPrimary", Boolean(checked))
                  }
                />
                <label
                  htmlFor={`vendor-primary-${index}`}
                  className="cursor-pointer text-xs text-zinc-600"
                >
                  Primary vendor
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`vendor-active-${index}`}
                  checked={item.isActive ?? false}
                  onCheckedChange={(checked) =>
                    props.onChange(index, "isActive", Boolean(checked))
                  }
                />
                <label
                  htmlFor={`vendor-active-${index}`}
                  className="cursor-pointer text-xs text-zinc-600"
                >
                  Active
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
