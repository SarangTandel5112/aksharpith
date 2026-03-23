"use client";

import { DataTable, DeleteDialog, PageHeader } from "@shared/components/admin";
import { Button } from "@shared/components/ui/button";
import { useToast } from "@shared/hooks/useToast";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import type React from "react";
import { useState } from "react";
import { useRoles } from "../hooks/useRoles";
import type { Role } from "../types/roles.types";
import type { RoleFormValues } from "../validations/role-form.schema";
import { RoleFormDialog } from "./RoleFormDialog";

// ── Types ─────────────────────────────────────────────────────────────────────

type RoleRow = {
  id: string;
  roleName: string;
  description: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: "roleName" as const, label: "Role Name" },
  { key: "description" as const, label: "Description" },
];

// ── Component ─────────────────────────────────────────────────────────────────

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

  function handleOpenAdd(): void {
    setEditRole(undefined);
    setDialogOpen(true);
  }

  function handleOpenEdit(role: Role): void {
    setEditRole(role);
    setDialogOpen(true);
  }

  function handleCloseDialog(): void {
    setDialogOpen(false);
    setEditRole(undefined);
  }

  function buildInput(values: RoleFormValues): {
    roleName: string;
    description?: string;
  } {
    if (values.description !== undefined) {
      return { roleName: values.roleName, description: values.description };
    }
    return { roleName: values.roleName };
  }

  function handleSubmit(values: RoleFormValues): void {
    const input = buildInput(values);
    if (editRole) {
      void updateRole(editRole.id, input)
        .then(() => {
          toast.success("Role updated");
          handleCloseDialog();
        })
        .catch(() => {
          toast.error("Failed to update role");
        });
    } else {
      void createRole(input)
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

  const rows: RoleRow[] = roles.map((r) => ({
    id: r.id,
    roleName: r.roleName,
    description: r.description ?? "—",
  }));

  function renderActions(row: RoleRow): React.ReactNode {
    const role = roles.find((r) => r.id === row.id);
    return (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-zinc-500 hover:text-zinc-900"
          onClick={() => {
            if (role) handleOpenEdit(role);
          }}
        >
          <IconPencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50"
          onClick={() => setDeleteTarget(role)}
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
        title="Roles"
        subtitle="Manage your access roles"
        action={
          <Button onClick={handleOpenAdd} size="sm">
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
        renderActions={renderActions}
      />

      <RoleFormDialog
        key={editRole?.id ?? "create"}
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        {...(editRole !== undefined ? { role: editRole } : {})}
      />

      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete Role"
        description={`Are you sure you want to delete "${deleteTarget?.roleName}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(undefined)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
