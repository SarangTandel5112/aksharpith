import { cn } from "@shared/lib/utils";
import type {
  BackendFieldCoverage,
  BackendFieldDefinition,
  BackendFieldOverrideMap,
} from "@shared/types/backend-field-coverage.types";
import type React from "react";

type BackendFieldCoverageCardProps = {
  coverage: BackendFieldCoverage;
  mode: "create" | "edit";
  overrides?: BackendFieldOverrideMap;
  className?: string;
};

function resolveDetail(
  field: BackendFieldDefinition,
  overrides: BackendFieldOverrideMap | undefined,
): string {
  if (overrides?.[field.key]) {
    return overrides[field.key]!;
  }

  switch (field.key) {
    case "id":
      return "Available after the record is saved.";
    case "isActive":
      return "Set automatically when the record is created.";
    case "createdAt":
      return "Added when the record is created.";
    case "updatedAt":
      return "Updated automatically when changes are saved.";
    default:
      return "Managed automatically.";
  }
}

function formatFieldDisplayLabel(field: BackendFieldDefinition): string {
  switch (field.key) {
    case "id":
      return "ID";
    case "isActive":
      return "Status";
    case "createdAt":
      return "Created";
    case "updatedAt":
      return "Updated";
    default:
      return field.label
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
  }
}

export function BackendFieldCoverageCard(
  props: BackendFieldCoverageCardProps,
): React.JSX.Element {
  const editableFields =
    props.mode === "edit"
      ? (props.coverage.updateFields ?? props.coverage.createFields)
      : props.coverage.createFields;

  const editableLabel =
    props.mode === "edit" ? "Editable In This Form" : "Added In This Form";

  return (
    <aside
      className={cn(
        "rounded-[1.25rem] border border-zinc-200 bg-zinc-50/70 p-4",
        props.className,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {editableLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {editableFields.map((field) => (
              <span
                key={field.key}
                title={field.detail}
                className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900"
              >
                {formatFieldDisplayLabel(field)}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Auto-Filled Fields
          </p>
          <div className="flex flex-wrap gap-2">
            {props.coverage.systemFields.map((field) => (
              <span
                key={field.key}
                title={resolveDetail(field, props.overrides)}
                className="inline-flex items-center rounded-full border border-dashed border-zinc-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-zinc-600"
              >
                {formatFieldDisplayLabel(field)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
