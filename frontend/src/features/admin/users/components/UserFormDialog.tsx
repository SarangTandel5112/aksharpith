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
import { Form } from "@shared/components/ui/form";
import type React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import type { User } from "../types/users.types";
import {
  CreateUserFormSchema,
  type CreateUserFormValues,
  UpdateUserFormSchema,
  type UpdateUserFormValues,
} from "@features/users/validations/user-form.schema";
import { UserFormFields } from "./dialog/UserFormFields";

type RoleOption = {
  id: string;
  name: string;
};

type UserFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateUserFormValues | UpdateUserFormValues) => void;
  isSubmitting: boolean;
  user?: User;
  roleOptions: RoleOption[];
};

export function UserFormDialog(props: UserFormDialogProps): React.JSX.Element {
  const isEditing = props.user !== undefined;

  const createForm = useForm<
    z.input<typeof CreateUserFormSchema>,
    unknown,
    CreateUserFormValues
  >({
    resolver: zodResolver(CreateUserFormSchema),
    defaultValues: {
      username: "",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      password: "",
      roleId: "",
      isActive: true,
      isTempPassword: false,
    },
  });

  const editForm = useForm<
    z.input<typeof UpdateUserFormSchema>,
    unknown,
    UpdateUserFormValues
  >({
    resolver: zodResolver(UpdateUserFormSchema),
    defaultValues: {
      username: props.user?.username ?? "",
      firstName: props.user?.firstName ?? "",
      middleName: props.user?.middleName ?? "",
      lastName: props.user?.lastName ?? "",
      email: props.user?.email ?? "",
      roleId: props.user?.roleId ?? props.user?.role?.id ?? "",
      isActive: props.user?.isActive ?? true,
      isTempPassword: props.user?.isTempPassword ?? false,
    },
  });

  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Add User"}</DialogTitle>
          <DialogDescription>Enter the user details.</DialogDescription>
        </DialogHeader>
        {isEditing ? (
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(props.onSubmit)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
                <UserFormFields
                  control={editForm.control}
                  includePassword={false}
                  roleOptions={props.roleOptions}
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
                  {props.isSubmitting ? "Saving…" : "Save User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(props.onSubmit)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
                <UserFormFields
                  control={createForm.control}
                  includePassword
                  roleOptions={props.roleOptions}
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
                  {props.isSubmitting ? "Saving…" : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
