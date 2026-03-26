"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AttributeValueEditor } from "@features/admin/attributes/components/dialog/AttributeValueEditor";
import {
  CreateAttributeSchema,
  type CreateAttributeInput,
} from "@features/admin/attributes/schemas/attributes.schema";
import type {
  Attribute,
  AttributeUsageSummary,
} from "@features/admin/attributes/types/attributes.types";
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

type AttributeFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateAttributeInput) => void;
  isSubmitting: boolean;
  attribute?: Attribute;
  usage?: AttributeUsageSummary;
};

export function AttributeFormDialog(
  props: AttributeFormDialogProps,
): React.JSX.Element {
  const form = useForm<any>({
    resolver: zodResolver(CreateAttributeSchema),
    defaultValues: {
      name: props.attribute?.name ?? "",
      code: props.attribute?.code ?? "",
      sortOrder: props.attribute?.sortOrder ?? 0,
      isRequired: props.attribute?.isRequired ?? false,
      isActive: props.attribute?.isActive ?? true,
      values: props.attribute?.values.map((value) => ({
        valueId: value.id,
        label: value.label,
        code: value.code,
        sortOrder: value.sortOrder,
        isActive: value.isActive,
      })) ?? [{ label: "", code: "", sortOrder: 0, isActive: true }],
    },
  });

  const valueFields = useFieldArray({
    control: form.control,
    name: "values",
  });
  const watchedValues = form.watch("values");
  const usage = props.usage;
  const isSharedAttributeLocked = Boolean(props.attribute && usage?.inUse);
  const existingValueCount = props.attribute?.values.length ?? 0;

  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>
            {props.attribute ? "Edit Attribute" : "Add Attribute"}
          </DialogTitle>
          <DialogDescription>Enter the attribute and its values.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              props.onSubmit(values as CreateAttributeInput),
            )}
            className="space-y-6"
          >
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attribute Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Color"
                          disabled={isSharedAttributeLocked}
                          {...field}
                        />
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
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. COLOR"
                          disabled={isSharedAttributeLocked}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-[140px_160px_180px]">
                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          disabled={isSharedAttributeLocked}
                          value={field.value ?? 0}
                          onChange={(event) => field.onChange(event.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isRequired"
                  render={({ field }) => (
                    <FormItem className="flex h-full items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                          disabled={isSharedAttributeLocked}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal text-zinc-700">
                        Required
                      </FormLabel>
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
                          disabled={isSharedAttributeLocked}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal text-zinc-700">
                        Active
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              {isSharedAttributeLocked ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-950">
                  This shared attribute is already used by {usage?.productCount} product
                  {usage?.productCount === 1 ? "" : "s"} and {usage?.lotMatrixRowCount} lot
                  matrix row{usage?.lotMatrixRowCount === 1 ? "" : "s"}. Rename, status, and
                  in-use value edits are locked here to avoid changing live products by mistake.
                  Add new values instead, or plan a controlled catalog migration first.
                </div>
              ) : null}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      Structured Values
                    </p>
                    <p className="text-sm text-zinc-500">
                      Add the values that should appear for this attribute.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      valueFields.append({
                        valueId: undefined,
                        label: "",
                        code: "",
                        sortOrder: valueFields.fields.length,
                        isActive: true,
                      })
                    }
                  >
                    <IconPlus className="h-4 w-4" />
                    Add Value
                  </Button>
                </div>
                <div className="space-y-3">
                  {valueFields.fields.map((valueField, index) => {
                    const valueId = watchedValues?.[index]?.valueId;
                    const valueUsage = valueId
                      ? usage?.valueUsageById[valueId]
                      : undefined;
                    const isValueLocked =
                      props.attribute !== undefined &&
                      index < existingValueCount &&
                      Boolean(valueUsage?.inUse);

                    return (
                      <AttributeValueEditor
                        key={valueField.id}
                        control={form.control}
                        index={index}
                        canRemove={valueFields.fields.length > 1 && !isValueLocked}
                        isLocked={isValueLocked}
                        {...(isValueLocked
                          ? {
                              lockReason: `This value is already used by ${
                                valueUsage?.productCount
                              } product${
                                valueUsage?.productCount === 1 ? "" : "s"
                              } and ${valueUsage?.lotMatrixRowCount} lot matrix row${
                                valueUsage?.lotMatrixRowCount === 1 ? "" : "s"
                              }.`,
                            }
                          : {})}
                        onRemove={() => valueFields.remove(index)}
                      />
                    );
                  })}
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
                {props.isSubmitting ? "Saving…" : "Save Attribute"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
