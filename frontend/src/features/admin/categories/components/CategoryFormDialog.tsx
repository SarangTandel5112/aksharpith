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
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
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

// ── Schema ────────────────────────────────────────────────────────────────────

const CategoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  departmentId: z.string().min(1, "Please select a department"),
  description: z.string().max(500).optional(),
  isActive: z.boolean(),
});

type CategoryFormValues = z.infer<typeof CategoryFormSchema>;

// ── Types ─────────────────────────────────────────────────────────────────────

type CategoryFormItem = {
  id: string;
  name: string;
  departmentName: string;
  subCategoryCount: number;
  isActive: boolean;
};

type CategoryFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  category?: CategoryFormItem | undefined;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const DEPARTMENT_OPTIONS = [
  "Technology",
  "Fashion",
  "Grocery",
  "Education",
  "Recreation",
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export function CategoryFormDialog(
  props: CategoryFormDialogProps,
): React.JSX.Element {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: props.category?.name ?? "",
      departmentId: props.category?.departmentName ?? "",
      description: "",
      isActive: props.category?.isActive ?? true,
    },
  });

  const title = props.category ? "Edit Category" : "Add Category";

  function handleFormSubmit(_data: CategoryFormValues): void {
    props.onSubmit();
  }

  function handleOpenChange(open: boolean): void {
    if (!open) props.onClose();
  }

  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader className="border-b border-zinc-100 pb-4">
          <DialogTitle className="text-base font-semibold text-zinc-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500">
            {props.category
              ? "Update the category details."
              : "Fill in the details to create a new category."}
          </DialogDescription>
        </DialogHeader>
        <form
          key={props.category?.id ?? "new"}
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cat-name"
              placeholder="Category name"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-department">
              Department <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.watch("departmentId")}
              onValueChange={(v) => form.setValue("departmentId", v)}
            >
              <SelectTrigger id="cat-department">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.departmentId && (
              <p className="text-sm text-red-500">
                {form.formState.errors.departmentId.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-description">Description</Label>
            <Textarea
              id="cat-description"
              placeholder="Optional description"
              {...form.register("description")}
            />
          </div>
          <div className="flex items-center gap-3 space-y-0">
            <Checkbox
              id="cat-isActive"
              checked={form.watch("isActive")}
              onCheckedChange={(v) => form.setValue("isActive", Boolean(v))}
            />
            <Label htmlFor="cat-isActive">Active</Label>
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
              {props.isSubmitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
