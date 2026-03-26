"use client";

import type { Attribute } from "@features/admin/attributes/types/attributes.types";
import { SectionCard } from "@shared/components/admin";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import type React from "react";

type LotMatrixAttributeSelectorProps = {
  attributes: Attribute[];
  selectedAttributeIds: number[];
  canGenerate: boolean;
  canAddRow: boolean;
  possibleCount: number;
  onToggleAttribute: (attributeId: number) => void;
  onGenerateRows: () => void;
  onAddRow: () => void;
  onResetRows: () => void;
};

export function LotMatrixAttributeSelector(
  props: LotMatrixAttributeSelectorProps,
): React.JSX.Element {
  return (
    <SectionCard title="Matrix Setup">
      <div className="space-y-2">
        {props.attributes.map((attribute) => {
          const activeValues = attribute.values.filter(
            (value) => value.isActive,
          );
          const visibleValues = activeValues.slice(0, 3);
          const remainingCount = Math.max(
            activeValues.length - visibleValues.length,
            0,
          );
          const isSelected = props.selectedAttributeIds.includes(attribute.id);

          return (
            <label
              key={attribute.id}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-3 transition-colors ${
                isSelected
                  ? "border-zinc-900 bg-zinc-50"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => props.onToggleAttribute(attribute.id)}
                aria-label={`Use ${attribute.name} in lot matrix`}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium text-zinc-950">
                    {attribute.name}
                  </p>
                  {isSelected ? (
                    <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-white">
                      Selected
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeValues.length === 0 ? (
                    <span className="text-xs text-zinc-400">No values</span>
                  ) : (
                    <>
                      {visibleValues.map((value) => (
                        <span
                          key={value.id}
                          className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600"
                        >
                          {value.label}
                        </span>
                      ))}
                      {remainingCount > 0 ? (
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-500">
                          +{remainingCount}
                        </span>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>
      <div className="grid grid-cols-1 gap-2">
        <Button
          type="button"
          onClick={props.onGenerateRows}
          disabled={!props.canGenerate}
          size="sm"
          className="w-full justify-center"
        >
          {props.possibleCount > 0
            ? `Generate ${props.possibleCount}`
            : "Generate"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={props.onAddRow}
          disabled={!props.canAddRow}
          size="sm"
          className="w-full justify-center"
        >
          Add Row
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={props.onResetRows}
          size="sm"
          className="w-full justify-center"
        >
          Clear
        </Button>
      </div>
    </SectionCard>
  );
}
