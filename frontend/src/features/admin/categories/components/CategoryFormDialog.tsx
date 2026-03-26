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
import type { Department } from "@features/departments/types/departments.types";
import {
  CreateCategorySchema,
  type CreateCategoryInput,
} from "../schemas/categories.schema";
import type { Category } from "../types/categories.types";

type CategoryFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateCategoryInput) => void;
  isSubmitting: boolean;
  category?: Category;
  departments: Pick<Department, "id" | "name">[];
};

export function CategoryFormDialog(
  props: CategoryFormDialogProps,
): React.JSX.Element {
  const form = useForm<
    z.input<typeof CreateCategorySchema>,
    unknown,
    CreateCategoryInput
  >({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      name: props.category?.name ?? "",
      description: props.category?.description ?? "",
      photo: props.category?.photo ?? null,
      departmentId: props.category?.departmentId ?? "",
    },
  });
  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>
            {props.category ? "Edit Category" : "Add Category"}
          </DialogTitle>
          <DialogDescription>
            Add the category details, department, and photo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(props.onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Audio" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="departmentId"
                render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      {(() => {
                        const currentValue = field.value ?? "";
                        return (
                      <Select
                        value={currentValue}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {props.departments.map((department) => (
                            <SelectItem key={department.id} value={department.id}>
                              {department.name}
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
              </div>
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
                        placeholder="Add a short description for this category."
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
                        emptyLabel="Drop the category image here"
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
                {props.isSubmitting ? "Saving…" : "Save Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
