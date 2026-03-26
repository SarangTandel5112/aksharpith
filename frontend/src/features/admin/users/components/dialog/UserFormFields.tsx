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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import type React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";

type RoleOption = {
  id: string;
  name: string;
};

type UserFormFieldsProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  includePassword: boolean;
  roleOptions: RoleOption[];
};

export function UserFormFields<TFieldValues extends FieldValues>(
  props: UserFormFieldsProps<TFieldValues>,
): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={props.control}
          name={"username" as Path<TFieldValues>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="e.g. arjun.sharma" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={props.control}
          name={"firstName" as Path<TFieldValues>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="First name" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={props.control}
          name={"middleName" as Path<TFieldValues>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Middle Name</FormLabel>
              <FormControl>
                <Input placeholder="Optional" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={props.control}
          name={"lastName" as Path<TFieldValues>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Last name" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={props.control}
          name={"email" as Path<TFieldValues>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="user@aksharpith.com"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {props.includePassword && (
        <FormField
          control={props.control}
          name={"password" as Path<TFieldValues>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Minimum 8 characters"
                  {...field}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={props.control}
          name={"roleId" as Path<TFieldValues>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {props.roleOptions.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
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
          name={"isActive" as Path<TFieldValues>}
          render={({ field }) => (
            <FormItem className="flex h-full items-center gap-3 rounded-xl border border-zinc-200 px-4">
              <FormControl>
                <Checkbox
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1">
                <FormLabel className="cursor-pointer">Active User</FormLabel>
                <p className="text-xs text-zinc-500">
                  Controls whether the account is currently usable.
                </p>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
