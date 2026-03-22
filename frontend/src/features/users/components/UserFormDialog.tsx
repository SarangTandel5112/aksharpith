"use client";

// src/features/users/components/UserFormDialog.tsx

import type { Role } from "@features/roles/types/roles.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@shared/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import type { User } from "../types/users.types";
import {
  CreateUserFormSchema,
  type CreateUserFormValues,
  UpdateUserFormSchema,
  type UpdateUserFormValues,
} from "../validations/user-form.schema";

// ── Types ─────────────────────────────────────────────────────────────────────

type UserFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateUserFormValues | UpdateUserFormValues) => void;
  isSubmitting: boolean;
  user?: User;
  roles: Role[];
  isLoadingRoles: boolean;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function UserFormDialog(props: UserFormDialogProps): React.JSX.Element {
  const isEditing = !!props.user;

  const createForm = useForm<
    z.input<typeof CreateUserFormSchema>,
    unknown,
    CreateUserFormValues
  >({
    resolver: zodResolver(CreateUserFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      roleId: "",
    },
  });

  const editForm = useForm<
    z.input<typeof UpdateUserFormSchema>,
    unknown,
    UpdateUserFormValues
  >({
    resolver: zodResolver(UpdateUserFormSchema),
    defaultValues: {
      firstName: props.user?.firstName ?? "",
      lastName: props.user?.lastName ?? "",
      email: props.user?.email ?? "",
      roleId: props.user?.role.id ?? "",
    },
  });

  const title = isEditing ? "Edit User" : "Add User";

  function handleCreateSubmit(values: CreateUserFormValues): void {
    props.onSubmit(values);
  }

  function handleEditSubmit(values: UpdateUserFormValues): void {
    props.onSubmit(values);
  }

  function handleOpenChange(open: boolean): void {
    if (!open) props.onClose();
  }

  if (!isEditing) {
    return (
      <Dialog key="create" open={props.open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(handleCreateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Min. 8 characters"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                      disabled={props.isLoadingRoles}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              props.isLoadingRoles
                                ? "Loading roles..."
                                : "Select a role"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {props.roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.roleName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

  return (
    <Dialog
      key={props.user?.id}
      open={props.open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...editForm}>
          <form
            onSubmit={editForm.handleSubmit(handleEditSubmit)}
            className="space-y-4"
          >
            <FormField
              control={editForm.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={editForm.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={editForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={editForm.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                    disabled={props.isLoadingRoles}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            props.isLoadingRoles
                              ? "Loading roles..."
                              : "Select a role"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {props.roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.roleName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
