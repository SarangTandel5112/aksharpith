"use client";

import { formatProductType } from "@features/admin/products/services/product-admin.helpers";
import { SectionCard } from "@shared/components/admin";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@shared/components/ui/form";
import { Input } from "@shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { RichTextEditor } from "@shared/components/ui/rich-text-editor";
import type React from "react";
import type { Control } from "react-hook-form";

type ProductBasicsSectionProps = {
  control: Control<any>;
};

const PRODUCT_TYPE_OPTIONS: Array<{
  value: "Standard" | "Lot Matrix";
  label: string;
}> = [
  { value: "Standard", label: "Standard" },
  { value: "Lot Matrix", label: "Lot Matrix" },
];

export function ProductBasicsSection(
  props: ProductBasicsSectionProps,
): React.JSX.Element {
  return (
    <SectionCard
      title="Basic Information"
      description="Start with the product name, code, UPC, type, and description."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <FormField
          control={props.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700">Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. iPhone 16 Pro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={props.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700">Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g. IPH16PRO" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={props.control}
          name="upc"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700">UPC</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 8901234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={props.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700">Model</FormLabel>
              <FormControl>
                <Input placeholder="e.g. A3101" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={props.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-700">Product Type</FormLabel>
            <Select
              value={field.value ?? "Standard"}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select product type">
                    {field.value ? formatProductType(field.value) : undefined}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {PRODUCT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={props.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-700">Description</FormLabel>
            <FormControl>
              <RichTextEditor
                placeholder="Short description for the catalog."
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </SectionCard>
  );
}
