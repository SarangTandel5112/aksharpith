"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@shared/components/ui/button";
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
import { ImageDropzone } from "@shared/components/ui/image-dropzone";
import { Input } from "@shared/components/ui/input";
import { RichTextEditor } from "@shared/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import type React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import {
  CreateSubCategorySchema,
  type CreateSubCategoryInput,
} from "../schemas/sub-categories.schema";
import type { Category } from "@features/admin/categories/types/categories.types";

type SubCategoryFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateSubCategoryInput) => void;
  isSubmitting: boolean;
  subCategory?: CreateSubCategoryInput & {
    id: string;
    createdAt: string;
    updatedAt: string | null;
  };
  categories: Pick<Category, "id" | "name">[];
};

export function SubCategoryFormDialog(
  props: SubCategoryFormDialogProps,
): React.JSX.Element {
  const form = useForm<
    z.input<typeof CreateSubCategorySchema>,
    unknown,
    CreateSubCategoryInput
  >({
    resolver: zodResolver(CreateSubCategorySchema),
    defaultValues: {
      name: props.subCategory?.name ?? "",
      categoryId: props.subCategory?.categoryId ?? "",
      description: props.subCategory?.description ?? "",
      photo: props.subCategory?.photo ?? null,
      sortOrder: props.subCategory?.sortOrder ?? 0,
    },
  });
  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>
            {props.subCategory ? "Edit Sub-category" : "Add Sub-category"}
          </DialogTitle>
          <DialogDescription>
            Add the sub-category details, category, and display order.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(props.onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_200px]">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub-category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Phones" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        value={typeof field.value === "number" ? field.value : 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    {(() => {
                      const currentValue = field.value ?? "";
                      return (
                    <Select
                      value={currentValue}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {props.categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                      );
                    })()}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="Add a short description for this sub-category."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo</FormLabel>
                    <FormControl>
                      <ImageDropzone
                        value={field.value ?? null}
                        onChange={field.onChange}
                        emptyLabel="Drop the sub-category image here"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={props.onClose}
                disabled={props.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={props.isSubmitting}>
                {props.isSubmitting ? "Saving…" : "Save Sub-category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
