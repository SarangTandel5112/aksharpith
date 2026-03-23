"use client";

import {
  DataTable,
  DeleteDialog,
  PageHeader,
  TablePagination,
  TableToolbar,
} from "@shared/components/admin";
import { Button } from "@shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu";
import { useToast } from "@shared/hooks/useToast";
import { IconDots, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import type React from "react";
import { useState } from "react";
import { useDepartments } from "../hooks/useDepartments";
import type { Department } from "../types/departments.types";
import type { DepartmentFormValues } from "../validations/department-form.schema";
import { DepartmentFormDialog } from "./DepartmentFormDialog";

// ── Types ─────────────────────────────────────────────────────────────────────

type DepartmentRow = {
  id: string;
  name: string;
  description: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: "name" as const, label: "Name", sortable: true },
  { key: "description" as const, label: "Description" },
];

const PAGE_SIZE_DEFAULT = 10;

// ── Component ─────────────────────────────────────────────────────────────────

export function DepartmentsModule(): React.JSX.Element {
  const toast = useToast();
  const {
    departments,
    isLoading,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    isCreating,
    isUpdating,
    isDeleting,
  } = useDepartments();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDepartment, setEditDepartment] = useState<Department | undefined>(
    undefined,
  );
  const [deleteTarget, setDeleteTarget] = useState<Department | undefined>(
    undefined,
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function handleOpenAdd(): void {
    setEditDepartment(undefined);
    setDialogOpen(true);
  }

  function handleOpenEdit(dept: Department): void {
    setEditDepartment(dept);
    setDialogOpen(true);
  }

  function handleCloseDialog(): void {
    setDialogOpen(false);
    setEditDepartment(undefined);
  }

  function handleSubmit(values: DepartmentFormValues): void {
    const input =
      values.description !== undefined
        ? { name: values.name, description: values.description }
        : { name: values.name };

    if (editDepartment) {
      void updateDepartment(editDepartment.id, input)
        .then(() => {
          toast.success("Department updated");
          handleCloseDialog();
        })
        .catch(() => {
          toast.error("Failed to update department");
        });
    } else {
      void createDepartment(input)
        .then(() => {
          toast.success("Department created");
          handleCloseDialog();
        })
        .catch(() => {
          toast.error("Failed to create department");
        });
    }
  }

  function handleDeleteConfirm(): void {
    if (!deleteTarget) return;
    void deleteDepartment(deleteTarget.id)
      .then(() => {
        toast.success("Department deleted");
        setDeleteTarget(undefined);
      })
      .catch(() => {
        toast.error("Failed to delete department");
      });
  }

  function handleSearch(value: string): void {
    setSearch(value);
    setPage(1);
  }

  function handlePageSizeChange(size: number): void {
    setPageSize(size);
    setPage(1);
  }

  // Build rows
  const allRows: DepartmentRow[] = departments.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description ?? "—",
  }));

  const filteredRows =
    search.trim().length === 0
      ? allRows
      : allRows.filter(
          (r) =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            (r.description !== "—" &&
              r.description.toLowerCase().includes(search.toLowerCase())),
        );

  const paginatedRows = filteredRows.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  function renderActions(row: DepartmentRow): React.ReactNode {
    const dept = departments.find((d) => d.id === row.id);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-700"
          >
            <IconDots className="h-4 w-4" />
            <span className="sr-only">Row actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => {
              if (dept) handleOpenEdit(dept);
            }}
          >
            <IconPencil className="h-3.5 w-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteTarget(dept)}
          >
            <IconTrash className="h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        subtitle="Manage your product departments"
      />

      <DataTable
        columns={COLUMNS}
        rows={paginatedRows}
        isLoading={isLoading}
        emptyMessage={
          search.trim().length > 0
            ? "No departments match your search."
            : "No departments yet."
        }
        emptySubMessage={
          search.trim().length > 0
            ? "Try a different search term."
            : "Add your first department to get started."
        }
        selectable
        onSelectionChange={setSelectedIds}
        renderActions={renderActions}
        toolbar={
          <TableToolbar
            search={search}
            onSearch={handleSearch}
            placeholder="Search departments…"
            selectedCount={selectedIds.length}
            action={
              <Button onClick={handleOpenAdd} size="sm">
                <IconPlus className="mr-1.5 h-4 w-4" />
                Add Department
              </Button>
            }
          />
        }
        footer={
          <TablePagination
            total={filteredRows.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        }
      />

      <DepartmentFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        {...(editDepartment !== undefined
          ? { department: editDepartment }
          : {})}
      />

      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete Department"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(undefined)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
