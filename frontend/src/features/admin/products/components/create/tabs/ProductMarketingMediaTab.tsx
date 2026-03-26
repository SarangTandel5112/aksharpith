"use client";

import type { ProductMarketingMediaDraft } from "@features/admin/products/types/product-create.types";
import { SectionCard } from "@shared/components/admin";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type React from "react";

type ProductMarketingMediaTabProps = {
  items: ProductMarketingMediaDraft[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (
    index: number,
    field: keyof ProductMarketingMediaDraft,
    value: string | number | null,
  ) => void;
};

export function ProductMarketingMediaTab(
  props: ProductMarketingMediaTabProps,
): React.JSX.Element {
  return (
    <SectionCard
      title="Marketing Media"
      description="Campaign and lifestyle assets used for marketing channels."
    >
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={props.onAdd}
        >
          <IconPlus className="h-4 w-4" />
          Add Marketing Media
        </Button>

        {props.items.length === 0 && (
          <p className="text-sm text-zinc-500">
            No marketing media added yet. Click "Add Marketing Media" to get
            started.
          </p>
        )}

        {props.items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-600">Media URL</p>
                <Input
                  placeholder="https://images.example.com/campaign.jpg"
                  value={item.url}
                  onChange={(e) =>
                    props.onChange(index, "url", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-600">
                  Thumbnail URL
                </p>
                <Input
                  placeholder="https://images.example.com/thumb.jpg"
                  value={item.thumbnailUrl ?? ""}
                  onChange={(e) =>
                    props.onChange(
                      index,
                      "thumbnailUrl",
                      e.target.value || null,
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-600">Type</p>
                <Select
                  value={item.type}
                  onValueChange={(val) =>
                    props.onChange(index, "type", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-600">
                  Display order
                </p>
                <Input
                  type="number"
                  min={0}
                  value={item.sortOrder}
                  onChange={(e) =>
                    props.onChange(
                      index,
                      "sortOrder",
                      Number(e.target.value),
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-600">
                  Duration (s)
                </p>
                <Input
                  type="number"
                  min={0}
                  placeholder="Optional — for videos"
                  value={item.duration ?? ""}
                  onChange={(e) =>
                    props.onChange(
                      index,
                      "duration",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-600">
                  File size (KB)
                </p>
                <Input
                  type="number"
                  min={0}
                  placeholder="Optional"
                  value={item.fileSize ?? ""}
                  onChange={(e) =>
                    props.onChange(
                      index,
                      "fileSize",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => props.onRemove(index)}
                aria-label="Remove marketing media"
              >
                <IconTrash className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
