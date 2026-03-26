"use client";

import { SectionCard } from "@shared/components/admin";
import { Checkbox } from "@shared/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@shared/components/ui/form";
import type React from "react";
import type { Control } from "react-hook-form";

type ProductStatusSectionProps = {
  control: Control<any>;
};

export function ProductStatusSection(
  props: ProductStatusSectionProps,
): React.JSX.Element {
  return (
    <SectionCard
      title="Status"
      description="Use one switch for listing and one for selling."
    >
      <FormField
        control={props.control}
        name="isActive"
        render={({ field }) => (
          <FormItem className="flex items-start gap-3 space-y-0 rounded-md border border-zinc-200 p-4">
            <FormControl>
              <Checkbox
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1">
              <FormLabel className="text-sm font-medium text-zinc-900">
                Show in catalog
              </FormLabel>
              <p className="text-sm text-zinc-500">
                Turn this off to hide the product from normal catalog views.
              </p>
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={props.control}
        name="itemInactive"
        render={({ field }) => (
          <FormItem className="flex items-start gap-3 space-y-0 rounded-md border border-zinc-200 p-4">
            <FormControl>
              <Checkbox
                checked={!(field.value ?? false)}
                onCheckedChange={(checked) => field.onChange(!Boolean(checked))}
              />
            </FormControl>
            <div className="space-y-1">
              <FormLabel className="text-sm font-medium text-zinc-900">
                Available for sale
              </FormLabel>
              <p className="text-sm text-zinc-500">
                Turn this off to keep the product listed but not sellable.
              </p>
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={props.control}
        name="nonTaxable"
        render={({ field }) => (
          <FormItem className="flex items-start gap-3 space-y-0 rounded-md border border-zinc-200 p-4">
            <FormControl>
              <Checkbox
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1">
              <FormLabel className="text-sm font-medium text-zinc-900">
                Non-taxable
              </FormLabel>
              <p className="text-sm text-zinc-500">
                Mark this product as exempt from tax calculations.
              </p>
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={props.control}
        name="nonStockItem"
        render={({ field }) => (
          <FormItem className="flex items-start gap-3 space-y-0 rounded-md border border-zinc-200 p-4">
            <FormControl>
              <Checkbox
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1">
              <FormLabel className="text-sm font-medium text-zinc-900">
                Non-stock item
              </FormLabel>
              <p className="text-sm text-zinc-500">
                Turn this on when inventory should not be tracked for this product.
              </p>
            </div>
          </FormItem>
        )}
      />
    </SectionCard>
  );
}
