"use client";

import type { ProductZoneDraft } from "@features/admin/products/types/product-create.types";
import { SectionCard } from "@shared/components/admin";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import { Input } from "@shared/components/ui/input";
import { RichTextEditor } from "@shared/components/ui/rich-text-editor";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type React from "react";

type ProductZonesTabProps = {
  items: ProductZoneDraft[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (
    index: number,
    field: keyof ProductZoneDraft,
    value: string | boolean | null,
  ) => void;
};

export function ProductZonesTab(
  props: ProductZonesTabProps,
): React.JSX.Element {
  return (
    <SectionCard
      title="Zones"
      description="Assign this product to geographic or operational zones."
    >
      <div className="space-y-4">
        <Button type="button" variant="outline" size="sm" onClick={props.onAdd}>
          <IconPlus className="h-4 w-4" />
          Add Zone
        </Button>

        {props.items.length === 0 && (
          <p className="text-sm text-zinc-500">
            No zones added yet. Click "Add Zone" to get started.
          </p>
        )}

        {props.items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-800">
                {item.name || `Zone ${index + 1}`}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => props.onRemove(index)}
                aria-label="Remove zone"
              >
                <IconTrash className="h-4 w-4 text-red-500" />
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-600">
                  Zone name <span className="text-red-500">*</span>
                </p>
                <Input
                  placeholder="e.g. North Zone"
                  value={item.name}
                  onChange={(e) =>
                    props.onChange(index, "name", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-600">Zone code</p>
                <Input
                  placeholder="e.g. NORTH"
                  value={item.code ?? ""}
                  onChange={(e) =>
                    props.onChange(index, "code", e.target.value || null)
                  }
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <p className="text-xs font-medium text-zinc-600">Description</p>
                <RichTextEditor
                  placeholder="Optional description for this zone"
                  value={item.description ?? ""}
                  onChange={(value) =>
                    props.onChange(index, "description", value || null)
                  }
                  editorClassName="min-h-24"
                />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`zone-active-${index}`}
                  checked={item.isActive ?? false}
                  onCheckedChange={(checked) =>
                    props.onChange(index, "isActive", Boolean(checked))
                  }
                />
                <label
                  htmlFor={`zone-active-${index}`}
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
