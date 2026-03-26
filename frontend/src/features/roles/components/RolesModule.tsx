"use client";

import { DataTable, DeleteDialog, PageHeader, StatusBadge } from "@shared/components/admin";
import { Button } from "@shared/components/ui/button";
import { useToast } from "@shared/hooks/useToast";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import type React from "react";
import { useState } from "react";
import { useRoles } from "../hooks/useRoles";
import type { Role } from "../types/roles.types";
import type { RoleFormValues } from "../validations/role-form.schema";
import { RoleFormDialog } from "./RoleFormDialog";

type RoleRow = {
  id: number;
  name: string;
  isActive: boolean;
};

const COLUMNS = [
  { key: "name" as const, label: "Role Name" },
  {
    key: "isActive" as const,
    label: "Status",
    render: (row: RoleRow) => (
      <StatusBadge
        label={row.isActive ? "Active" : "Inactive"}
        variant={row.isActive ? "success" : "neutral"}
      />
    ),
  },
];

export function RolesModule(): React.JSX.Element {
  const toast = useToast();
  const {
    roles,
    isLoading,
    createRole,
    updateRole,
    deleteRole,
    isCreating,
    isUpdating,
    isDeleting,
  } = useRoles();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Role | undefined>(undefined);

  function handleCloseDialog(): void {
    setDialogOpen(false);
    setEditRole(undefined);
  }

  function handleSubmit(values: RoleFormValues): void {
    if (editRole) {
      void updateRole(editRole.id, values)
        .then(() => {
          toast.success("Role updated");
          handleCloseDialog();
        })
        .catch(() => {
          toast.error("Failed to update role");
        });
    } else {
      void createRole(values)
        .then(() => {
          toast.success("Role created");
          handleCloseDialog();
        })
        .catch(() => {
          toast.error("Failed to create role");
        });
    }
  }

  function handleDeleteConfirm(): void {
    if (!deleteTarget) return;
    void deleteRole(deleteTarget.id)
      .then(() => {
        toast.success("Role deleted");
        setDeleteTarget(undefined);
      })
      .catch(() => {
        toast.error("Failed to delete role");
      });
  }

  const rows: RoleRow[] = roles.map((role) => ({
    id: role.id,
    name: role.name,
    isActive: role.isActive,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        subtitle="Manage your access roles"
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <IconPlus className="mr-1.5 h-4 w-4" />
            Add Role
          </Button>
        }
      />
      <DataTable
        columns={COLUMNS}
        rows={rows}
        isLoading={isLoading}
        emptyMessage="No roles yet. Add your first role."
        renderActions={(row) => {
          const role = roles.find((item) => item.id === row.id);
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-zinc-500 hover:text-zinc-900"
                onClick={() => {
                  if (role) {
                    setEditRole(role);
                    setDialogOpen(true);
                  }
                }}
              >
                <IconPencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                onClick={() => setDeleteTarget(role)}
              >
                <IconTrash className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          );
        }}
      />
      <RoleFormDialog
        key={editRole?.id ?? "create"}
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        {...(editRole ? { role: editRole } : {})}
      />
      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete Role"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(undefined)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
