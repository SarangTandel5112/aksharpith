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
import { CategoryFormDialog } from "./CategoryFormDialog";

// ── Types ─────────────────────────────────────────────────────────────────────

type CategoryRow = {
  id: string;
  name: string;
  departmentName: string;
  subCategoryCount: number;
  isActive: boolean;
};

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_CATEGORIES: CategoryRow[] = [
  {
    id: "1",
    name: "Electronics",
    departmentName: "Technology",
    subCategoryCount: 5,
    isActive: true,
  },
  {
    id: "2",
    name: "Clothing",
    departmentName: "Fashion",
    subCategoryCount: 8,
    isActive: true,
  },
  {
    id: "3",
    name: "Food & Beverage",
    departmentName: "Grocery",
    subCategoryCount: 12,
    isActive: true,
  },
  {
    id: "4",
    name: "Home Appliances",
    departmentName: "Technology",
    subCategoryCount: 6,
    isActive: true,
  },
  {
    id: "5",
    name: "Books",
    departmentName: "Education",
    subCategoryCount: 3,
    isActive: false,
  },
  {
    id: "6",
    name: "Sports",
    departmentName: "Recreation",
    subCategoryCount: 7,
    isActive: true,
  },
];

// ── Constants ─────────────────────────────────────────────────────────────────

const COLUMNS: Column<CategoryRow>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "departmentName", label: "Department" },
  { key: "subCategoryCount", label: "Sub-categories" },
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
];

// ── Component ─────────────────────────────────────────────────────────────────

export function CategoriesModule(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<CategoryRow | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | undefined>(
    undefined,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = search.trim()
    ? MOCK_CATEGORIES.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase()),
      )
    : MOCK_CATEGORIES;

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function handleSearch(v: string): void {
    setSearch(v);
    setPage(1);
  }

  function handleOpenAdd(): void {
    setEditItem(undefined);
    setDialogOpen(true);
  }

  function handleOpenEdit(item: CategoryRow): void {
    setEditItem(item);
    setDialogOpen(true);
  }

  function handleClose(): void {
    setDialogOpen(false);
    setEditItem(undefined);
  }

  function handleDeleteConfirm(): void {
    setDeleteTarget(undefined);
  }

  function renderActions(row: CategoryRow): React.ReactNode {
    const item = MOCK_CATEGORIES.find((c) => c.id === row.id);
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
              if (item) handleOpenEdit(item);
            }}
          >
            <IconPencil className="h-3.5 w-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteTarget(item)}
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
        title="Categories"
        subtitle="Manage your product categories"
      />
      <DataTable
        columns={COLUMNS}
        rows={paginated}
        selectable
        onSelectionChange={setSelectedIds}
        renderActions={renderActions}
        toolbar={
          <TableToolbar
            search={search}
            onSearch={handleSearch}
            placeholder="Search categories…"
            selectedCount={selectedIds.length}
            action={
              <Button onClick={handleOpenAdd} size="sm">
                <IconPlus className="mr-1.5 h-4 w-4" />
                Add Category
              </Button>
            }
          />
        }
        footer={
          <TablePagination
            total={filtered.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
          />
        }
      />
      <CategoryFormDialog
        key={editItem?.id ?? "new"}
        open={dialogOpen}
        onClose={handleClose}
        onSubmit={handleClose}
        isSubmitting={false}
        category={editItem}
      />
      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(undefined)}
        isDeleting={false}
      />
    </div>
  );
}
