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
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
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
      description: props.department?.description ?? "",
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {props.department
              ? "Update the department details."
              : "Create a new product department."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Department name" {...field} />
                  </FormControl>
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
                    <Textarea placeholder="Optional description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                {props.isSubmitting ? "Saving\u2026" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
