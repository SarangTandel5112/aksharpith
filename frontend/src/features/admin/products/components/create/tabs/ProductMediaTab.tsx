"use client";

import type { ProductMediaDraft } from "@features/admin/products/types/product-create.types";
import { SectionCard } from "@shared/components/admin";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
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

type ProductMediaTabProps = {
  items: ProductMediaDraft[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (
    index: number,
    field: keyof ProductMediaDraft,
    value: string | number | boolean,
  ) => void;
};

export function ProductMediaTab(props: ProductMediaTabProps): React.JSX.Element {
  return (
    <SectionCard
      title="Media"
      description="Enter URL of the media asset (image or video). The first item is automatically marked as primary."
    >
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={props.onAdd}
        >
          <IconPlus className="h-4 w-4" />
          Add Media
        </Button>

        {props.items.length === 0 && (
          <p className="text-sm text-zinc-500">
            No media added yet. Click "Add Media" to get started.
          </p>
        )}

        {props.items.map((item, index) => (
          <div
            key={item.clientId ?? `${item.url}-${item.sortOrder ?? index}`}
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
          >
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px_100px]">
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-600">URL</p>
                <Input
                  placeholder="https://images.example.com/photo.jpg"
                  value={item.url}
                  onChange={(e) =>
                    props.onChange(index, "url", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-600">Type</p>
                <Select
                  value={item.mediaType ?? "photo"}
                  onValueChange={(val) =>
                    props.onChange(index, "mediaType", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-600">Sort order</p>
                <Input
                  type="number"
                  min={0}
                  value={item.sortOrder}
                  onChange={(e) =>
                    props.onChange(index, "sortOrder", Number(e.target.value))
                  }
                />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`media-primary-${index}`}
                  checked={item.isPrimary ?? false}
                  disabled={index === 0}
                  onCheckedChange={(checked) =>
                    props.onChange(index, "isPrimary", Boolean(checked))
                  }
                />
                <label
                  htmlFor={`media-primary-${index}`}
                  className="cursor-pointer text-xs text-zinc-600"
                >
                  Primary{index === 0 ? " (auto)" : ""}
                </label>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => props.onRemove(index)}
                aria-label="Remove media"
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
