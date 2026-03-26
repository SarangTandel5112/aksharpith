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
import { plainTextFromRichText } from "@shared/lib/rich-text";
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
import type { CreateSubCategoryInput } from "../schemas/sub-categories.schema";
import { SubCategoryFormDialog } from "./SubCategoryFormDialog";
import type { Category } from "@features/admin/categories/types/categories.types";
import type { SubCategory } from "../types/sub-categories.types";

type SubCategoryRow = SubCategory & {
  productCount: number;
};

const CATEGORIES: Pick<Category, "id" | "name">[] = [
  { id: 101, name: "Smart Devices" },
  { id: 102, name: "Audio" },
  { id: 103, name: "Furniture" },
];

const SUB_CATEGORY_ROWS: SubCategoryRow[] = [
  {
    id: 201,
    name: "Phones",
    categoryId: 101,
    description: "<p>Mobile phones and smartphones.</p>",
    photo: null,
    sortOrder: 0,
    category: CATEGORIES[0]!,
    productCount: 24,
    isActive: true,
    createdAt: "2026-03-11",
    updatedAt: "2026-03-24",
  },
  {
    id: 202,
    name: "Headphones",
    categoryId: 102,
    description: "<p>Over-ear, on-ear, and in-ear audio.</p>",
    photo: null,
    sortOrder: 1,
    category: CATEGORIES[1]!,
    productCount: 12,
    isActive: true,
    createdAt: "2026-03-10",
    updatedAt: "2026-03-23",
  },
  {
    id: 203,
    name: "Desks",
    categoryId: 103,
    description: "<p>Standing desks and workstations.</p>",
    photo: null,
    sortOrder: 2,
    category: CATEGORIES[2]!,
    productCount: 7,
    isActive: true,
    createdAt: "2026-03-09",
    updatedAt: "2026-03-22",
  },
];

const COLUMNS: Column<SubCategoryRow>[] = [
  {
    key: "photo",
    label: "Photo",
    render: (row) =>
      row.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.photo}
          alt={row.name}
          className="h-10 w-10 rounded-xl object-cover"
        />
      ) : (
        <div className="h-10 w-10 rounded-xl border border-zinc-200 bg-zinc-50" />
      ),
  },
  { key: "name", label: "Sub-category", sortable: true },
  {
    key: "category",
    label: "Category",
    render: (row) => row.category?.name ?? "—",
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
  { key: "sortOrder", label: "Order" },
  { key: "productCount", label: "Products" },
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

export function SubCategoriesModule(): React.JSX.Element {
  const [rows, setRows] = useState<SubCategoryRow[]>(SUB_CATEGORY_ROWS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [photoFilter, setPhotoFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<SubCategoryRow | undefined>(
    undefined,
  );
  const [deleteTarget, setDeleteTarget] = useState<SubCategoryRow | undefined>(
    undefined,
  );
  const [selectedIds, setSelectedIds] = useState<SubCategoryRow["id"][]>([]);

  const searchFiltered = search.trim()
    ? rows.filter(
        (row) =>
          row.name.toLowerCase().includes(search.toLowerCase()) ||
          (row.category?.name ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : rows;
  const filtered = searchFiltered.filter((row) => {
    const matchesCategory =
      categoryFilter === "all"
        ? true
        : row.categoryId === Number(categoryFilter);
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? row.isActive
          : !row.isActive;
    const matchesPhoto =
      photoFilter === "all"
        ? true
        : photoFilter === "with-photo"
          ? row.photo !== null
          : row.photo === null;

    return matchesCategory && matchesStatus && matchesPhoto;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function handleSubmit(values: CreateSubCategoryInput): void {
    const today = new Date().toISOString().slice(0, 10);
    const category = CATEGORIES.find((c) => c.id === values.categoryId);
    if (editItem) {
      setRows(rows.map((r) =>
        r.id === editItem.id
          ? {
              ...r,
              name: values.name,
              categoryId: values.categoryId,
              category: category ?? null,
              description: values.description ?? null,
              photo: values.photo ?? null,
              sortOrder: values.sortOrder,
              isActive: values.isActive,
              updatedAt: today,
            }
          : r,
      ));
      toast.success("Sub-category updated");
    } else {
      const newRow: SubCategoryRow = {
        id: Date.now(),
        name: values.name,
        categoryId: values.categoryId,
        category: category ?? null,
        description: values.description ?? null,
        photo: values.photo ?? null,
        sortOrder: values.sortOrder,
        productCount: 0,
        isActive: values.isActive,
        createdAt: today,
        updatedAt: today,
      };
      setRows([...rows, newRow]);
      toast.success("Sub-category created");
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
        title="Sub-categories"
        subtitle="Manage the sub-categories used for product organization."
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <IconPlus className="h-4 w-4" />
            Add Sub-category
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
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Sub-category actions"
              >
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
            placeholder="Search sub-categories…"
            selectedCount={selectedIds.length}
            filters={[
              {
                id: "category",
                label: "Category",
                value: categoryFilter,
                onChange: (value) => {
                  setCategoryFilter(value);
                  setPage(1);
                },
                options: CATEGORIES.map((category) => ({
                  label: category.name,
                  value: String(category.id),
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
              {
                id: "photo",
                label: "Photo",
                value: photoFilter,
                onChange: (value) => {
                  setPhotoFilter(value);
                  setPage(1);
                },
                options: [
                  { label: "With Photo", value: "with-photo" },
                  { label: "Without Photo", value: "without-photo" },
                ],
              },
            ]}
            onClearFilters={() => {
              setSearch("");
              setCategoryFilter("all");
              setStatusFilter("all");
              setPhotoFilter("all");
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
      <SubCategoryFormDialog
        key={editItem?.id ?? "new"}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditItem(undefined);
        }}
        onSubmit={handleSubmit}
        isSubmitting={false}
        {...(editItem
          ? {
              subCategory: {
                id: editItem.id,
                name: editItem.name,
                categoryId: editItem.categoryId,
                ...(editItem.description !== null
                  ? { description: editItem.description }
                  : {}),
                ...(editItem.photo !== null ? { photo: editItem.photo } : {}),
                sortOrder: editItem.sortOrder,
                isActive: editItem.isActive,
                createdAt: editItem.createdAt,
                updatedAt: editItem.updatedAt,
              },
            }
          : {})}
        categories={CATEGORIES}
      />
      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete Sub-category"
        description={`Delete "${deleteTarget?.name}" from the admin? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(undefined)}
        isDeleting={false}
      />
    </div>
  );
}
