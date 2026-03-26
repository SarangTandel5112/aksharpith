"use client";

import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
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
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type React from "react";
import type { Control } from "react-hook-form";
import { useFieldArray, useWatch } from "react-hook-form";

type GroupFieldEditorProps = {
  control: Control<any>;
  index: number;
  canRemove: boolean;
  onRemove: () => void;
  lockKeyAndType: boolean;
};

const FIELD_TYPE_OPTIONS = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "dropdown", label: "Dropdown" },
] as const;

export function GroupFieldEditor(
  props: GroupFieldEditorProps,
): React.JSX.Element {
  const fieldType = useWatch({
    control: props.control,
    name: `fields.${props.index}.type` as const,
  });

  const optionsArray = useFieldArray({
    control: props.control,
    name: `fields.${props.index}.options` as const,
  });

  return (
    <div className="rounded-2xl border border-zinc-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-zinc-900">
          Field {props.index + 1}
        </p>
        {props.canRemove ? (
          <Button type="button" variant="ghost" size="icon-sm" onClick={props.onRemove}>
            <IconTrash className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <FormField
          control={props.control}
          name={`fields.${props.index}.name` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Battery Life" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={props.control}
          name={`fields.${props.index}.key` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field Key</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. battery_life"
                  {...field}
                  value={field.value ?? ""}
                  disabled={props.lockKeyAndType}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={props.control}
          name={`fields.${props.index}.type` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field Type</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={props.lockKeyAndType}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FIELD_TYPE_OPTIONS.map((option) => (
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
          name={`fields.${props.index}.sortOrder` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort Order</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  value={field.value ?? 0}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-6">
        <FormField
          control={props.control}
          name={`fields.${props.index}.isActive` as const}
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 space-y-0">
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
        <FormField
          control={props.control}
          name={`fields.${props.index}.isRequired` as const}
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal text-zinc-700">
                Required
              </FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={props.control}
          name={`fields.${props.index}.isFilterable` as const}
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal text-zinc-700">
                Filterable
              </FormLabel>
            </FormItem>
          )}
        />
      </div>
      {fieldType === "dropdown" ? (
        <div className="mt-5 space-y-3 rounded-2xl bg-zinc-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-900">Dropdown Options</p>
              <p className="text-sm text-zinc-500">
                Only used when the field type is dropdown.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                optionsArray.append({
                  label: "",
                  value: "",
                  sortOrder: optionsArray.fields.length,
                  isActive: true,
                })
              }
            >
              <IconPlus className="h-4 w-4" />
              Add Option
            </Button>
          </div>
          <div className="space-y-3">
            {optionsArray.fields.map((option, optionIndex) => (
              <div
                key={option.id}
                className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_auto]"
              >
                <FormField
                  control={props.control}
                  name={`fields.${props.index}.options.${optionIndex}.label` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Matte" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={props.control}
                  name={`fields.${props.index}.options.${optionIndex}.value` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. matte" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={props.control}
                  name={`fields.${props.index}.options.${optionIndex}.sortOrder` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          value={field.value ?? 0}
                          onChange={(event) => field.onChange(event.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={props.control}
                  name={`fields.${props.index}.options.${optionIndex}.isActive` as const}
                  render={({ field }) => (
                    <FormItem className="flex items-end gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="pb-2 text-sm font-normal text-zinc-700">
                        Active
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => optionsArray.remove(optionIndex)}
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
