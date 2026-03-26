"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { GroupFieldEditor } from "@features/admin/groups/components/dialog/GroupFieldEditor";
import {
  CreateGroupSchema,
  type CreateGroupInput,
} from "@features/admin/groups/schemas/groups.schema";
import type { Group } from "@features/admin/groups/types/groups.types";
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
import { IconPlus } from "@tabler/icons-react";
import type React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";

type GroupFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateGroupInput) => void;
  isSubmitting: boolean;
  group?: Group;
};

export function GroupFormDialog(
  props: GroupFormDialogProps,
): React.JSX.Element {
  const form = useForm<
    z.input<typeof CreateGroupSchema>,
    unknown,
    CreateGroupInput
  >({
    resolver: zodResolver(CreateGroupSchema),
    defaultValues: {
      name: props.group?.name ?? "",
      description: props.group?.description ?? null,
      isActive: props.group?.isActive ?? true,
      fields: props.group?.fields.map((field) => ({
        name: field.name,
        key: field.key,
        type: field.type,
        isRequired: field.isRequired,
        isFilterable: field.isFilterable,
        sortOrder: field.sortOrder,
        isActive: field.isActive,
        options: field.options.map((option) => ({
          label: option.label,
          value: option.value,
          sortOrder: option.sortOrder,
          isActive: option.isActive,
        })),
      })) ?? [
        {
          name: "",
          key: "",
          type: "text",
          isRequired: false,
          isFilterable: false,
          sortOrder: 0,
          isActive: true,
          options: [],
        },
      ],
    },
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: "fields",
  });

  const existingFieldCount = props.group?.fields.length ?? 0;

  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>
            {props.group ? "Edit Group Template" : "Add Group Template"}
          </DialogTitle>
          <DialogDescription>
            Define the template and its dynamic fields.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(props.onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Books - Product Details"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Optional description"
                          {...field}
                          value={field.value ?? ""}
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
                    <FormItem className="flex h-full items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal text-zinc-700">
                        Active
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      Dynamic Field Builder
                    </p>
                    <p className="text-sm text-zinc-500">
                      Add the fields and dropdown options that should appear in the product's dynamic details table.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      fieldArray.append({
                        name: "",
                        key: "",
                        type: "text",
                        isRequired: false,
                        isFilterable: false,
                        sortOrder: fieldArray.fields.length,
                        isActive: true,
                        options: [],
                      })
                    }
                  >
                    <IconPlus className="h-4 w-4" />
                    Add Dynamic Field
                  </Button>
                </div>
                <div className="space-y-3">
                  {fieldArray.fields.map((field, index) => (
                    <GroupFieldEditor
                      key={field.id}
                      control={form.control}
                      index={index}
                      canRemove={fieldArray.fields.length > 1}
                      onRemove={() => fieldArray.remove(index)}
                      lockKeyAndType={
                        Boolean(props.group) && index < existingFieldCount
                      }
                    />
                  ))}
                </div>
              </div>
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
                {props.isSubmitting ? "Saving…" : "Save Template"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
