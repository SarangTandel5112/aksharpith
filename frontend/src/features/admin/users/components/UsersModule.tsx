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
import type {
  CreateUserFormValues,
  UpdateUserFormValues,
} from "@features/users/validations/user-form.schema";
import { IconDots, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import type { User } from "../types/users.types";
import { UserFormDialog } from "./UserFormDialog";

const ROLE_OPTIONS = [
  {
    id: "1",
    roleName: "Admin",
    name: "Admin",
    isActive: true,
    createdAt: "2026-03-01",
    updatedAt: "2026-03-21",
  },
  {
    id: "2",
    roleName: "Staff",
    name: "Staff",
    isActive: true,
    createdAt: "2026-03-01",
    updatedAt: "2026-03-21",
  },
  {
    id: "3",
    roleName: "Viewer",
    name: "Viewer",
    isActive: true,
    createdAt: "2026-03-01",
    updatedAt: "2026-03-21",
  },
];

const MOCK_USERS: User[] = [
  {
    id: "1",
    username: "arjun.sharma",
    firstName: "Arjun",
    middleName: null,
    lastName: "Sharma",
    email: "arjun@aksharpith.com",
    role: ROLE_OPTIONS[0]!,
    roleId: ROLE_OPTIONS[0]!.id,
    isTempPassword: false,
    isActive: true,
    createdAt: "2026-03-01",
    updatedAt: "2026-03-21",
  },
  {
    id: "2",
    username: "priya.patel",
    firstName: "Priya",
    middleName: "R",
    lastName: "Patel",
    email: "priya@aksharpith.com",
    role: ROLE_OPTIONS[1]!,
    roleId: ROLE_OPTIONS[1]!.id,
    isTempPassword: false,
    isActive: true,
    createdAt: "2026-03-03",
    updatedAt: "2026-03-18",
  },
  {
    id: "3",
    username: "kiran.nair",
    firstName: "Kiran",
    middleName: null,
    lastName: "Nair",
    email: "kiran@aksharpith.com",
    role: ROLE_OPTIONS[2]!,
    roleId: ROLE_OPTIONS[2]!.id,
    isTempPassword: false,
    isActive: false,
    createdAt: "2026-03-10",
    updatedAt: "2026-03-15",
  },
];

const COLUMNS: Column<User>[] = [
  {
    key: "firstName",
    label: "User",
    sortable: true,
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-zinc-900">
          {[row.firstName, row.middleName, row.lastName].filter(Boolean).join(" ")}
        </p>
        <p className="text-xs text-zinc-500">{row.username} · {row.email}</p>
      </div>
    ),
  },
  {
    key: "role",
    label: "Role",
    render: (row) => (
      <span className="text-sm text-zinc-700">
        {row.role?.roleName ?? row.role?.name ?? "—"}
      </span>
    ),
  },
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
    render: (row) => <span className="text-sm text-zinc-500">{row.updatedAt}</span>,
  },
];

export function UsersModule(): React.JSX.Element {
  const [rows, setRows] = useState<User[]>(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<User | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<User | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<User["id"][]>([]);

  const searchFiltered = search.trim()
    ? rows.filter((user) =>
        [
          user.firstName,
          user.middleName ?? "",
          user.lastName,
          user.username,
          user.email,
          user.role?.roleName ?? user.role?.name ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : rows;
  const filtered = searchFiltered.filter((user) => {
      const matchesRole =
      roleFilter === "all" ? true : user.roleId === roleFilter;
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? user.isActive
          : !user.isActive;

    return matchesRole && matchesStatus;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function handleSubmit(values: CreateUserFormValues | UpdateUserFormValues): void {
    const today = new Date().toISOString().slice(0, 10);
    if (editItem) {
      const roleId = values.roleId;
      const matchedRole = ROLE_OPTIONS.find((r) => r.id === roleId);
      setRows(rows.map((u) =>
        u.id === editItem.id
          ? {
              ...u,
              username: values.username ?? u.username,
              firstName: values.firstName ?? u.firstName,
              middleName: values.middleName !== undefined ? (values.middleName || null) : u.middleName,
              lastName: values.lastName ?? u.lastName,
              email: values.email ?? u.email,
              role: matchedRole ?? u.role ?? null,
              roleId: matchedRole?.id ?? u.roleId,
              isActive: values.isActive ?? u.isActive,
              updatedAt: today,
            }
          : u,
      ));
      const fullName = [editItem.firstName, editItem.lastName].join(" ");
      toast.success(`${fullName} updated`);
    } else {
      const createValues = values as CreateUserFormValues;
      const roleId = createValues.roleId;
      const matchedRole = ROLE_OPTIONS.find((r) => r.id === roleId) ?? ROLE_OPTIONS[0]!;
      const newUser: User = {
        id: String(Date.now()),
        username: createValues.username ?? "",
        firstName: createValues.firstName,
        middleName: createValues.middleName ?? null,
        lastName: createValues.lastName,
        email: createValues.email,
        role: matchedRole,
        roleId: matchedRole.id,
        isTempPassword: createValues.isTempPassword ?? false,
        isActive: createValues.isActive ?? true,
        createdAt: today,
        updatedAt: today,
      };
      setRows([...rows, newUser]);
      toast.success(`${createValues.firstName} ${createValues.lastName} created`);
    }
    setDialogOpen(false);
    setEditItem(undefined);
  }

  function handleDeleteConfirm(): void {
    if (!deleteTarget) return;
    setRows(rows.filter((u) => u.id !== deleteTarget.id));
    const fullName = [deleteTarget.firstName, deleteTarget.middleName, deleteTarget.lastName]
      .filter(Boolean)
      .join(" ");
    toast.success(`"${fullName}" deleted`);
    setDeleteTarget(undefined);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage admin users and their access."
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <IconPlus className="h-4 w-4" />
            Add User
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
              <Button variant="ghost" size="icon-sm" aria-label="User actions">
                <IconDots className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => {
                setEditItem(row);
                setDialogOpen(true);
              }}>
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
            placeholder="Search users…"
            selectedCount={selectedIds.length}
            filters={[
              {
                id: "role",
                label: "Role",
                value: roleFilter,
                onChange: (value) => {
                  setRoleFilter(value);
                  setPage(1);
                },
                options: ROLE_OPTIONS.map((role) => ({
                  label: role.name,
                  value: String(role.id),
                })),
              },
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
              setRoleFilter("all");
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
      <UserFormDialog
        key={editItem?.id ?? "new"}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditItem(undefined);
        }}
        onSubmit={handleSubmit}
        isSubmitting={false}
        roleOptions={ROLE_OPTIONS}
        {...(editItem ? { user: editItem } : {})}
      />
      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete User"
        description={`Delete "${deleteTarget?.firstName} ${deleteTarget?.lastName}" from the admin? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(undefined)}
        isDeleting={false}
      />
    </div>
  );
}
