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
import type { Control } from "react-hook-form";

type ProductPricingInventorySectionProps = {
  control: Control<any>;
};

export function ProductPricingInventorySection(
  props: ProductPricingInventorySectionProps,
): React.JSX.Element {
  return (
    <SectionCard
      title="Pricing & Inventory"
      description="Set the base price and opening stock."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={props.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700">Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={field.value ?? 0}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={props.control}
          name="stockQuantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700">Stock Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={field.value ?? 0}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={props.control}
          name="hsnCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700">HSN Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 85171300" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </SectionCard>
  );
}
