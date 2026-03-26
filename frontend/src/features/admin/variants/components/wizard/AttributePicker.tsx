import type { Attribute } from "@features/admin/attributes/types/attributes.types";
import { SectionCard } from "@shared/components/admin";
import { Checkbox } from "@shared/components/ui/checkbox";
import type React from "react";

type AttributePickerProps = {
  attributes: Attribute[];
  selectedAttributeIds: number[];
  onToggle: (attributeId: number) => void;
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
          <label
            key={attribute.id}
            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-zinc-200 p-4 transition-colors hover:border-zinc-300"
          >
            <Checkbox
              checked={props.selectedAttributeIds.includes(attribute.id)}
              onCheckedChange={() => props.onToggle(attribute.id)}
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-900">{attribute.name}</p>
              <p className="text-sm text-zinc-500">
                {attribute.values
                  .map((value) => value.label)
                  .join(", ")}
              </p>
            </div>
          </label>
        ))}
      </div>
    </SectionCard>
  );
}
