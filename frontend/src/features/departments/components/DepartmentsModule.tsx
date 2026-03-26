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
import { plainTextFromRichText } from "@shared/lib/rich-text";
import { DepartmentFormDialog } from "./DepartmentFormDialog";
import type { Department } from "../types/departments.types";
import type { DepartmentFormValues } from "../validations/department-form.schema";

const MOCK_DEPARTMENTS: Department[] = [
  { id: "1", name: "Electronics", code: "ELEC", description: "<p>Devices and accessories.</p>", isActive: true, createdAt: "2026-03-01", updatedAt: "2026-03-21" },
  { id: "2", name: "Fashion", code: "FSHN", description: "<p>Apparel and lifestyle collections.</p>", isActive: true, createdAt: "2026-03-02", updatedAt: "2026-03-21" },
  { id: "3", name: "Home", code: "HOME", description: "<p>Furniture and home setups.</p>", isActive: true, createdAt: "2026-03-03", updatedAt: "2026-03-21" },
  { id: "4", name: "Archive", code: "ARCH", description: "<p>Retired catalog section.</p>", isActive: false, createdAt: "2026-03-04", updatedAt: "2026-03-12" },
];

const COLUMNS: Column<Department>[] = [
  { key: "name", label: "Department", sortable: true },
  {
    key: "code",
    label: "Code",
    render: (row) => (
      <span className="text-sm text-zinc-500">{row.code ?? "—"}</span>
    ),
  },
  {
    key: "description",
    label: "Description",
    render: (row) => (
      <span className="line-clamp-1 text-sm text-zinc-500">
        {plainTextFromRichText(row.description) || "No description"}
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
    render: (row) => (
      <span className="text-sm text-zinc-500">{row.updatedAt}</span>
    ),
  },
];

export function DepartmentsModule(): React.JSX.Element {
  const [rows, setRows] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Department | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Department | undefined>(
    undefined,
  );
  const [selectedIds, setSelectedIds] = useState<Department["id"][]>([]);

  const filtered = search.trim()
    ? rows.filter((record) =>
        record.name.toLowerCase().includes(search.toLowerCase()) ||
        (record.code ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : rows;
  const statusFiltered = filtered.filter((record) =>
    statusFilter === "all"
      ? true
      : statusFilter === "active"
        ? record.isActive
        : !record.isActive,
  );

  const paginated = statusFiltered.slice((page - 1) * pageSize, page * pageSize);

  function handleOpenAdd(): void {
    setEditItem(undefined);
    setDialogOpen(true);
  }

  function handleOpenEdit(item: Department): void {
    setEditItem(item);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        subtitle="Manage the top-level sections of your catalog."
        action={
          <Button onClick={handleOpenAdd}>
            <IconPlus className="h-4 w-4" />
            Add Department
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
              <Button variant="ghost" size="icon-sm" aria-label="Department actions">
                <IconDots className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleOpenEdit(row)}>
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
            placeholder="Search departments…"
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
            total={statusFiltered.length}
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
      <DepartmentFormDialog
        key={editItem?.id ?? "new"}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditItem(undefined);
        }}
        onSubmit={(values: DepartmentFormValues) => {
          const today = new Date().toISOString().split("T")[0] ?? "";
          if (editItem) {
            setRows((prev) =>
              prev.map((r) =>
                r.id === editItem.id
                  ? {
                      ...r,
                      name: values.name,
                      code: values.code ?? null,
                      description: values.description ?? null,
                      updatedAt: today,
                    }
                  : r,
              ),
            );
            toast.success("Department updated");
          } else {
            setRows((prev) => [
              ...prev,
              {
                id: String(Date.now()),
                name: values.name,
                code: values.code ?? null,
                description: values.description ?? null,
                isActive: true,
                createdAt: today,
                updatedAt: today,
              },
            ]);
            toast.success("Department created");
          }
          setDialogOpen(false);
          setEditItem(undefined);
        }}
        isSubmitting={false}
        {...(editItem ? { department: editItem } : {})}
      />
      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete Department"
        description={`Delete "${deleteTarget?.name}" from the admin? This action cannot be undone.`}
        onConfirm={() => {
          if (deleteTarget) {
            setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
            toast.success(`"${deleteTarget.name}" deleted`);
          }
          setDeleteTarget(undefined);
        }}
        onCancel={() => setDeleteTarget(undefined)}
        isDeleting={false}
      />
    </div>
  );
}
