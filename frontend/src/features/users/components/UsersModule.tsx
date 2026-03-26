"use client";

// src/features/users/components/UsersModule.tsx

import { useRoles } from "@features/roles/hooks/useRoles";
import { DataTable, DeleteDialog, PageHeader } from "@shared/components/admin";
import { Button } from "@shared/components/ui/button";
import { useToast } from "@shared/hooks/useToast";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import type React from "react";
import { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import type { UpdateUserInput, User } from "../types/users.types";
import type {
  CreateUserFormValues,
  UpdateUserFormValues,
} from "../validations/user-form.schema";
import { UserFormDialog } from "./UserFormDialog";

// ── Types ─────────────────────────────────────────────────────────────────────

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: "name" as const, label: "Name" },
  { key: "email" as const, label: "Email" },
  { key: "role" as const, label: "Role" },
  { key: "createdAt" as const, label: "Created" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function UsersModule(): React.JSX.Element {
  const toast = useToast();
  const {
    users,
    isLoading,
    create,
    update,
    remove,
    isCreating,
    isUpdating,
    isRemoving,
  } = useUsers();
  const { roles, isLoading: isLoadingRoles } = useRoles();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<User | undefined>(undefined);

  function handleOpenAdd(): void {
    setEditUser(undefined);
    setDialogOpen(true);
  }

  function handleOpenEdit(user: User): void {
    setEditUser(user);
    setDialogOpen(true);
  }

  function handleCloseDialog(): void {
    setDialogOpen(false);
    setEditUser(undefined);
  }

  function handleSubmit(
    values: CreateUserFormValues | UpdateUserFormValues,
  ): void {
    if (editUser) {
      const updateValues = values as UpdateUserFormValues;
      const input: UpdateUserInput = {
        ...(updateValues.username !== undefined
          ? { username: updateValues.username }
          : {}),
        ...(updateValues.firstName !== undefined
          ? { firstName: updateValues.firstName }
          : {}),
        ...(updateValues.middleName !== undefined
          ? { middleName: updateValues.middleName }
          : {}),
        ...(updateValues.lastName !== undefined
          ? { lastName: updateValues.lastName }
          : {}),
        ...(updateValues.email !== undefined
          ? { email: updateValues.email }
          : {}),
        ...(updateValues.roleId !== undefined
          ? { roleId: updateValues.roleId }
          : {}),
        ...(updateValues.isActive !== undefined
          ? { isActive: updateValues.isActive }
          : {}),
      };

      void update(editUser.id, input)
        .then(() => {
          toast.success("User updated");
          handleCloseDialog();
        })
        .catch(() => {
          toast.error("Failed to update user");
        });
    } else {
      const createValues = values as CreateUserFormValues;
      const input = {
        username: createValues.username,
        firstName: createValues.firstName,
        ...(createValues.middleName
          ? { middleName: createValues.middleName }
          : {}),
        lastName: createValues.lastName,
        email: createValues.email,
        password: createValues.password,
        roleId: createValues.roleId,
        isActive: createValues.isActive,
      };

      void create(input)
        .then(() => {
          toast.success("User created");
          handleCloseDialog();
        })
        .catch(() => {
          toast.error("Failed to create user");
        });
    }
  }

  function handleDeleteConfirm(): void {
    if (!deleteTarget) return;
    void remove(deleteTarget.id)
      .then(() => {
        toast.success("User deleted");
        setDeleteTarget(undefined);
      })
      .catch(() => {
        toast.error("Failed to delete user");
      });
  }

  const rows: UserRow[] = users.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    role: u.role?.name ?? "—",
    createdAt: new Date(u.createdAt).toLocaleDateString(),
  }));

  function renderActions(row: UserRow): React.ReactNode {
    const user = users.find((u) => u.id === row.id);
    return (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-zinc-500 hover:text-zinc-900"
          onClick={() => {
            if (user) handleOpenEdit(user);
          }}
        >
          <IconPencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50"
          onClick={() => setDeleteTarget(user)}
        >
          <IconTrash className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage your team members"
        action={
          <Button onClick={handleOpenAdd} size="sm">
            <IconPlus className="mr-1.5 h-4 w-4" />
            Add User
          </Button>
        }
      />

      <DataTable
        columns={COLUMNS}
        rows={rows}
        isLoading={isLoading}
        emptyMessage="No users yet. Add your first user."
        renderActions={renderActions}
      />

      <UserFormDialog
        key={editUser?.id ?? "create"}
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        roles={roles}
        isLoadingRoles={isLoadingRoles}
        {...(editUser !== undefined ? { user: editUser } : {})}
      />

      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteTarget?.firstName} ${deleteTarget?.lastName}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(undefined)}
        isDeleting={isRemoving}
      />
    </div>
  );
}
