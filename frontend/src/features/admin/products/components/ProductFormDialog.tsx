"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
import {
  Form,
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
import { Textarea } from "@shared/components/ui/textarea";
import type React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// ── Schema ─────────────────────────────────────────────────────────────────────

const ProductFormSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  sku: z.string().min(1, "SKU is required").max(50),
  productType: z.string().min(1, "Product type is required"),
  description: z
    .string()
    .max(1000)
    .optional()
    .transform((v) => v || undefined),
  basePrice: z.coerce.number().min(0, "Price must be positive"),
  stockQuantity: z.coerce.number().int().min(0, "Stock must be non-negative"),
  department: z.string().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof ProductFormSchema>;

// ── Static Options ─────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "Electronics",
  "Clothing",
  "Food & Beverage",
  "Home & Garden",
];
const CATEGORIES = [
  "Smartphones",
  "Laptops",
  "T-Shirts",
  "Dresses",
  "Kitchen",
  "Garden Tools",
];
const SUB_CATEGORIES = [
  "iPhone",
  "Android",
  "MacBook",
  "Windows Laptop",
  "Casual",
  "Formal",
];
const PRODUCT_TYPES = ["SIMPLE", "VARIABLE", "DIGITAL", "SERVICE"] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

type ProductDialogProduct = {
  id: string;
  name: string;
  sku: string;
  productType: string;
  description: string;
  basePrice: number;
  stockQuantity: number;
  department: string;
  category: string;
  subCategory: string;
  isActive: boolean;
};

type ProductFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
  isSubmitting: boolean;
  product?: ProductDialogProduct;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function ProductFormDialog(
  props: ProductFormDialogProps,
): React.JSX.Element {
  const form = useForm<
    z.input<typeof ProductFormSchema>,
    unknown,
    ProductFormValues
  >({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: props.product?.name ?? "",
      sku: props.product?.sku ?? "",
      productType: props.product?.productType ?? "",
      description: props.product?.description ?? "",
      basePrice: props.product?.basePrice ?? 0,
      stockQuantity: props.product?.stockQuantity ?? 0,
      department: props.product?.department ?? "",
      category: props.product?.category ?? "",
      subCategory: props.product?.subCategory ?? "",
      isActive: props.product?.isActive ?? true,
    },
  });

  const title = props.product ? "Edit Product" : "Add Product";
  const description = props.product
    ? "Update the product details."
    : "Create a new product in your catalog.";

  function handleSubmit(values: ProductFormValues): void {
    props.onSubmit(values);
  }

  function handleOpenChange(open: boolean): void {
    if (!open) props.onClose();
  }

  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader className="border-b border-zinc-100 pb-4">
          <DialogTitle className="text-base font-semibold text-zinc-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500">
            {description}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            key={props.product?.id ?? "new"}
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="space-y-5 py-5">
              {/* Section: Basic Information */}
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Basic Information
              </p>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. IPH-15-PRO" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRODUCT_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional product description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Section: Pricing & Inventory */}
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Pricing & Inventory
              </p>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          value={field.value as number}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stockQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          value={field.value as number}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section: Organization */}
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Organization
              </p>
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub-Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sub-category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SUB_CATEGORIES.map((sc) => (
                            <SelectItem key={sc} value={sc}>
                              {sc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Active</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="border-t border-zinc-100 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={props.onClose}
                disabled={props.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={props.isSubmitting}>
                {props.isSubmitting ? "Saving\u2026" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
