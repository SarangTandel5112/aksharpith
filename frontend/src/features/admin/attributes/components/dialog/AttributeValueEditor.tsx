"use client";

import { Checkbox } from "@shared/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@shared/components/ui/form";
import { Input } from "@shared/components/ui/input";
import { Button } from "@shared/components/ui/button";
import { IconTrash } from "@tabler/icons-react";
import type React from "react";
import type { Control } from "react-hook-form";

type AttributeValueEditorProps = {
  control: Control<any>;
  index: number;
  canRemove: boolean;
  isLocked?: boolean;
  lockReason?: string;
  onRemove: () => void;
};

export function AttributeValueEditor(
  props: AttributeValueEditorProps,
): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-zinc-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-zinc-900">
          Value {props.index + 1}
        </p>
        {props.canRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={props.onRemove}
            disabled={props.isLocked}
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      {props.isLocked ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
          {props.lockReason ??
            "This value is already used by live lot matrix rows, so rename and delete actions are locked here."}
        </p>
      ) : null}
      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_120px]">
        <FormField
          control={props.control}
          name={`values.${props.index}.label` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Silver" disabled={props.isLocked} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={props.control}
          name={`values.${props.index}.code` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. SILVER"
                  disabled={props.isLocked}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-[120px_minmax(0,1fr)]">
        <FormField
          control={props.control}
          name={`values.${props.index}.sortOrder` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort Order</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  disabled={props.isLocked}
                  value={field.value ?? 0}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={props.control}
        name={`values.${props.index}.isActive` as const}
        render={({ field }) => (
          <FormItem className="mt-4 flex items-center gap-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
                disabled={props.isLocked}
              />
            </FormControl>
            <FormLabel className="text-sm font-normal text-zinc-700">
              Active value
            </FormLabel>
          </FormItem>
        )}
      />
    </div>
  );
}
