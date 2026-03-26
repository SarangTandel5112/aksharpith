"use client";

import { SectionCard } from "@shared/components/admin";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@shared/components/ui/form";
import { Input } from "@shared/components/ui/input";
import type React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";

// ── Types ─────────────────────────────────────────────────────────────────────

type ProductPhysicalTabProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function ProductPhysicalTab<TFieldValues extends FieldValues>(
  props: ProductPhysicalTabProps<TFieldValues>,
): React.JSX.Element {
  return (
    <SectionCard
      title="Physical Attributes"
      description="Dimensions and weight are used for shipping and logistics."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={props.control}
          name={"physicalWeight" as Path<TFieldValues>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700">Weight (kg)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. 0.187"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={props.control}
          name={"physicalLength" as Path<TFieldValues>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700">Length (cm)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. 15.4"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={props.control}
          name={"physicalWidth" as Path<TFieldValues>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700">Width (cm)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. 7.08"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={props.control}
          name={"physicalHeight" as Path<TFieldValues>}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700">Height (cm)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. 14.67"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </SectionCard>
  );
}
