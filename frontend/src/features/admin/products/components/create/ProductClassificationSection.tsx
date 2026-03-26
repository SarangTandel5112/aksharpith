"use client";

import type { Group } from "@features/admin/groups/types/groups.types";
import type { SubCategory } from "@features/admin/sub-categories/types/sub-categories.types";
import type { Department } from "@features/departments/types/departments.types";
import { SectionCard } from "@shared/components/admin";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@shared/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import type React from "react";
import type { Control } from "react-hook-form";

type ProductClassificationSectionProps = {
  control: Control<any>;
  departments: Department[];
  subCategories: SubCategory[];
  groups: Group[];
  categoryName: string | null;
};

const EMPTY_VALUE = "__none__";

export function ProductClassificationSection(
  props: ProductClassificationSectionProps,
): React.JSX.Element {
  return (
    <SectionCard
      title="Classification"
      description="Choose the department, sub-category, and group."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={props.control}
          name="departmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700">Department</FormLabel>
              <Select
                value={typeof field.value === "number" ? String(field.value) : EMPTY_VALUE}
                onValueChange={(value) =>
                  field.onChange(value === EMPTY_VALUE ? undefined : Number(value))
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign a department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={EMPTY_VALUE}>No department</SelectItem>
                  {props.departments.map((department) => (
                    <SelectItem key={department.id} value={String(department.id)}>
                      {department.name}
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
          name="subCategoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700">Sub-category</FormLabel>
              <Select
                value={typeof field.value === "number" ? String(field.value) : EMPTY_VALUE}
                onValueChange={(value) =>
                  field.onChange(value === EMPTY_VALUE ? undefined : Number(value))
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign a sub-category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={EMPTY_VALUE}>No sub-category</SelectItem>
                  {props.subCategories.map((subCategory) => (
                    <SelectItem key={subCategory.id} value={String(subCategory.id)}>
                      {subCategory.name} • {subCategory.category?.name ?? "Unassigned"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {props.categoryName ? (
        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
            Category
          </p>
          <p className="mt-1 text-sm text-zinc-700">{props.categoryName}</p>
        </div>
      ) : null}
      <FormField
        control={props.control}
        name="groupId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-zinc-700">Group Template</FormLabel>
            <Select
              value={typeof field.value === "number" ? String(field.value) : EMPTY_VALUE}
              onValueChange={(value) =>
                field.onChange(value === EMPTY_VALUE ? undefined : Number(value))
              }
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a group template" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={EMPTY_VALUE}>No template</SelectItem>
                {props.groups.map((group) => (
                  <SelectItem key={group.id} value={String(group.id)}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </SectionCard>
  );
}
