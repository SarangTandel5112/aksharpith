"use client";

import type { Group } from "@features/admin/groups/types/groups.types";
import type { ProductGroupFieldValueDraft } from "@features/admin/products/types/product-create.types";
import { SectionCard, StatusBadge } from "@shared/components/admin";
import { Checkbox } from "@shared/components/ui/checkbox";
import { Input } from "@shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { Textarea } from "@shared/components/ui/textarea";
import type React from "react";

type ProductGroupFieldsTabProps = {
  group: Group | undefined;
  groupFieldValues: ProductGroupFieldValueDraft[];
  onChangeGroupFieldValues: (values: ProductGroupFieldValueDraft[]) => void;
};

function formatFieldType(
  fieldType: ProductGroupFieldValueDraft["type"],
): string {
  if (fieldType === "textarea") return "Textarea";
  if (fieldType === "dropdown") return "Dropdown";
  if (fieldType === "boolean") return "Boolean";
  if (fieldType === "number") return "Number";
  return "Text";
}

export function ProductGroupFieldsTab(
  props: ProductGroupFieldsTabProps,
): React.JSX.Element {
  if (!props.group) {
    return (
      <SectionCard title="Dynamic Details">
        Select a group template to load fields.
      </SectionCard>
    );
  }

  if (props.group.fields.length === 0) {
    return (
      <SectionCard title="Dynamic Details">
        No fields in this template yet.
      </SectionCard>
    );
  }

  function updateEntry(
    index: number,
    patch: Partial<ProductGroupFieldValueDraft>,
  ): void {
    props.onChangeGroupFieldValues(
      props.groupFieldValues.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, ...patch } : entry,
      ),
    );
  }

  function renderValueInput(
    entry: ProductGroupFieldValueDraft,
    index: number,
  ): React.JSX.Element {
    if (entry.type === "text") {
      return (
        <Input
          placeholder={`Enter ${entry.name}`}
          value={entry.valueText ?? ""}
          onChange={(event) =>
            updateEntry(index, { valueText: event.target.value || null })
          }
        />
      );
    }

    if (entry.type === "textarea") {
      return (
        <Textarea
          placeholder={`Enter ${entry.name}`}
          value={entry.valueText ?? ""}
          onChange={(event) =>
            updateEntry(index, { valueText: event.target.value || null })
          }
          rows={3}
        />
      );
    }

    if (entry.type === "number") {
      return (
        <Input
          type="number"
          placeholder={`Enter ${entry.name}`}
          value={entry.valueNumber ?? ""}
          onChange={(event) =>
            updateEntry(index, {
              valueNumber:
                event.target.value === "" ? null : Number(event.target.value),
            })
          }
        />
      );
    }

    if (entry.type === "boolean") {
      return (
        <label
          htmlFor={`group-field-${entry.fieldId}`}
          className="flex h-10 items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3"
        >
          <Checkbox
            id={`group-field-${entry.fieldId}`}
            checked={entry.valueBoolean}
            onCheckedChange={(checked) =>
              updateEntry(index, { valueBoolean: Boolean(checked) })
            }
          />
          <span className="text-sm text-zinc-700">
            {entry.valueBoolean ? "Yes" : "No"}
          </span>
        </label>
      );
    }

    return (
      <Select
        value={entry.valueOptionId !== null ? String(entry.valueOptionId) : "__none__"}
        onValueChange={(value) =>
          updateEntry(index, {
            valueOptionId: value === "__none__" ? null : Number(value),
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder={`Select ${entry.name}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">No selection</SelectItem>
          {entry.options.map((option) => (
            <SelectItem key={option.id} value={String(option.id)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <SectionCard title="Dynamic Details">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-zinc-900 px-3 py-1 text-sm font-medium text-white">
          {props.group.name}
        </span>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-600">
          {props.groupFieldValues.length} field
          {props.groupFieldValues.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="space-y-3">
        {props.groupFieldValues.map((entry, index) => (
          <div
            key={entry.fieldId}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-zinc-950">
                    {entry.name}
                  </h3>
                  <StatusBadge
                    label={formatFieldType(entry.type)}
                    variant={
                      entry.type === "dropdown" ? "info" : "neutral"
                    }
                  />
                  {entry.isRequired ? (
                    <StatusBadge label="Required" variant="warning" />
                  ) : null}
                </div>
              </div>
              <div className="min-w-0">{renderValueInput(entry, index)}</div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
