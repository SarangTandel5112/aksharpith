"use client";

import type { ProductLotMatrixAttributeBuilderInput } from "@features/admin/products/types/product-create.types";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type React from "react";
import { useMemo, useState } from "react";

type LotMatrixAttributeBuilderProps = {
  onCreateAttribute: (input: ProductLotMatrixAttributeBuilderInput) => void;
};

export function LotMatrixAttributeBuilder(
  props: LotMatrixAttributeBuilderProps,
): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [values, setValues] = useState<string[]>(["", ""]);

  const normalizedValues = useMemo(
    () =>
      Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))),
    [values],
  );
  const canSave = name.trim().length > 0 && normalizedValues.length > 0;

  function reset(): void {
    setName("");
    setValues(["", ""]);
    setIsOpen(false);
  }

  function handleSave(): void {
    if (!canSave) return;

    props.onCreateAttribute({
      name: name.trim(),
      values: normalizedValues,
    });
    reset();
  }

  return !isOpen ? (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-full justify-center"
      onClick={() => setIsOpen(true)}
    >
      <IconPlus className="h-4 w-4" />
      New Attribute
    </Button>
  ) : (
    <div className="space-y-4 rounded-[1.25rem] border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-[0.04em] text-zinc-950">
          New Attribute
        </h3>
        <Button type="button" variant="ghost" size="sm" onClick={reset}>
          Close
        </Button>
      </div>
      <div className="space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
          Name
        </p>
        <Input
          placeholder="Size"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
            Values
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setValues((current) => [...current, ""])}
          >
            <IconPlus className="h-4 w-4" />
            Add Value
          </Button>
        </div>
        <div className="space-y-2">
          {values.map((value, index) => (
            <div key={`value-${index}`} className="flex items-center gap-2">
              <Input
                placeholder={`Value ${index + 1}`}
                value={value}
                onChange={(event) =>
                  setValues((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? event.target.value : item,
                    ),
                  )
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={values.length <= 1}
                aria-label="Remove attribute value"
                onClick={() =>
                  setValues((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                <IconTrash className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <Button
        type="button"
        onClick={handleSave}
        disabled={!canSave}
        className="w-full justify-center"
      >
        Save Attribute
      </Button>
    </div>
  );
}
