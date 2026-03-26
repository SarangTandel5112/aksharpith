"use client";

import {
  DataTable,
  DeleteDialog,
  PageHeader,
  StatusBadge,
  TablePagination,
  TableToolbar,
} from "@shared/components/admin";
import type { Column } from "@shared/components/admin/DataTable";
import { Button } from "@shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu";
import { IconDots, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import type { Role } from "../types/roles.types";
import { RoleFormDialog } from "./RoleFormDialog";

type RoleFormValues = {
  roleName: string;
};

const MOCK_ROLES: Role[] = [
  {
    id: "1",
    roleName: "Admin",
    name: "Admin",
    isActive: true,
    createdAt: "2026-03-01",
    updatedAt: "2026-03-22",
  },
  {
    id: "2",
    roleName: "Staff",
    name: "Staff",
    isActive: true,
    createdAt: "2026-03-01",
    updatedAt: "2026-03-22",
  },
  {
    id: "3",
    roleName: "Viewer",
    name: "Viewer",
    isActive: true,
    createdAt: "2026-03-01",
    updatedAt: "2026-03-22",
  },
  {
    id: "4",
    roleName: "Legacy",
    name: "Legacy",
    isActive: false,
    createdAt: "2026-03-01",
    updatedAt: "2026-03-12",
  },
];

const COLUMNS: Column<Role>[] = [
  { key: "name", label: "Role", sortable: true },
  {
    key: "isActive",
    label: "Status",
    render: (row) => (
      <StatusBadge
        label={row.isActive ? "Active" : "Inactive"}
        variant={row.isActive ? "success" : "neutral"}
      />
    ),
  },
  {
    key: "updatedAt",
    label: "Updated",
    render: (row) => (
      <span className="text-sm text-zinc-500">{row.updatedAt}</span>
    ),
  },
];

export function RolesModule(): React.JSX.Element {
  const [rows, setRows] = useState<Role[]>(MOCK_ROLES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Role | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Role | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<Role["id"][]>([]);

  const searchFiltered = search.trim()
    ? rows.filter((role) =>
        role.name.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;
  const filtered = searchFiltered.filter((role) =>
    statusFilter === "all"
      ? true
      : statusFilter === "active"
        ? role.isActive
        : !role.isActive,
  );

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function handleSubmit(values: RoleFormValues): void {
    const today = new Date().toISOString().slice(0, 10);
    if (editItem) {
      setRows(
        rows.map((r) =>
          r.id === editItem.id
            ? {
                ...r,
                name: values.roleName,
                roleName: values.roleName,
                updatedAt: today,
              }
            : r,
        ),
      );
      toast.success("Role updated");
    } else {
      const newRole: Role = {
        id: String(Date.now()),
        name: values.roleName,
        roleName: values.roleName,
        isActive: true,
        createdAt: today,
        updatedAt: today,
      };
      setRows([...rows, newRole]);
      toast.success("Role created");
    }
    setDialogOpen(false);
    setEditItem(undefined);
  }

  function handleDeleteConfirm(): void {
    if (!deleteTarget) return;
    setRows(rows.filter((r) => r.id !== deleteTarget.id));
    toast.success(`"${deleteTarget.name}" deleted`);
    setDeleteTarget(undefined);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        subtitle="Manage the roles used for admin access."
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <IconPlus className="h-4 w-4" />
            Add Role
          </Button>
        }
      />
      <DataTable
        columns={COLUMNS}
        rows={paginated}
        selectable
        onSelectionChange={setSelectedIds}
        renderActions={(row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Role actions">
                <IconDots className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => {
                  setEditItem(row);
                  setDialogOpen(true);
                }}
              >
                <IconPencil className="h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteTarget(row)}
              >
                <IconTrash className="h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        toolbar={
          <TableToolbar
            search={search}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search roles…"
            selectedCount={selectedIds.length}
            filters={[
              {
                id: "status",
                label: "Status",
                value: statusFilter,
                onChange: (value) => {
                  setStatusFilter(value);
                  setPage(1);
                },
                options: [
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ],
              },
            ]}
            onClearFilters={() => {
              setSearch("");
              setStatusFilter("all");
              setPage(1);
            }}
          />
        }
        footer={
          <TablePagination
            total={filtered.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        }
      />
      <RoleFormDialog
        key={editItem?.id ?? "new"}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditItem(undefined);
        }}
        onSubmit={handleSubmit}
        isSubmitting={false}
        {...(editItem ? { role: editItem } : {})}
      />
      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete Role"
        description={`Delete "${deleteTarget?.name}" from the admin? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(undefined)}
        isDeleting={false}
      />
    </div>
  );
}
