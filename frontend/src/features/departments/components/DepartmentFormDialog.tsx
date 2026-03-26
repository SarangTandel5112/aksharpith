"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@shared/components/ui/checkbox";
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
import { Input } from "@shared/components/ui/input";
import { RichTextEditor } from "@shared/components/ui/rich-text-editor";
import type React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import type { Department } from "../types/departments.types";
import {
  DepartmentFormSchema,
  type DepartmentFormValues,
} from "../validations/department-form.schema";

type DepartmentFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: DepartmentFormValues) => void;
  isSubmitting: boolean;
  department?: Department;
};

export function DepartmentFormDialog(
  props: DepartmentFormDialogProps,
): React.JSX.Element {
  const form = useForm<
    z.input<typeof DepartmentFormSchema>,
    unknown,
    DepartmentFormValues
  >({
    resolver: zodResolver(DepartmentFormSchema),
    defaultValues: {
      name: props.department?.name ?? "",
      code: props.department?.code ?? "",
      description: props.department?.description ?? "",
      isActive: props.department?.isActive ?? true,
    },
  });

  const title = props.department ? "Edit Department" : "Add Department";

  function handleSubmit(values: DepartmentFormValues): void {
    props.onSubmit(values);
  }

  function handleOpenChange(open: boolean): void {
    if (!open) props.onClose();
  }

  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Add the department details used across the catalog.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Electronics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. ELEC" {...field} value={field.value ?? ""} />
                      </FormControl>
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
                        placeholder="Add a short description for this department."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="text-sm font-medium text-zinc-900">
                        Active
                      </FormLabel>
                      <p className="text-sm text-zinc-500">
                        Show this department for catalog setup.
                      </p>
                    </div>
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
                {props.isSubmitting ? "Saving…" : "Save Department"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
