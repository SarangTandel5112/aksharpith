import type { Attribute } from "@features/admin/attributes/types/attributes.types";
import { SectionCard } from "@shared/components/admin";
import { cn } from "@shared/lib/utils";
import { CheckIcon } from "lucide-react";
import type React from "react";

type AttributePickerProps = {
  attributes: Attribute[];
  selectedAttributeIds: string[];
  onToggle: (attributeId: string) => void;
};

export function AttributePicker(
  props: AttributePickerProps,
): React.JSX.Element {
  return (
    <SectionCard
      title="Choose Attributes"
      description="Select the attributes you want to combine into the lot matrix."
    >
      <div className="grid gap-3">
        {props.attributes.map((attribute) => (
          <button
            type="button"
            key={attribute.id}
            aria-pressed={props.selectedAttributeIds.includes(attribute.id)}
            onClick={() => props.onToggle(attribute.id)}
            className="flex w-full cursor-pointer items-start gap-3 rounded-2xl border border-zinc-200 p-4 text-left transition-colors hover:border-zinc-300"
          >
            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                props.selectedAttributeIds.includes(attribute.id)
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-300 bg-white text-transparent",
              )}
            >
              <CheckIcon className="size-3" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-900">{attribute.name}</p>
              <p className="text-sm text-zinc-500">
                {attribute.values
                  .map((value) => value.label)
                  .join(", ")}
              </p>
            </div>
          </button>
        ))}
      </div>
    </SectionCard>
  );
}
