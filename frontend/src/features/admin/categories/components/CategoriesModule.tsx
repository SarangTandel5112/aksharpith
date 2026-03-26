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
import { CategoryFormDialog } from "./CategoryFormDialog";
import type { CreateCategoryInput } from "../schemas/categories.schema";
import type { Category } from "../types/categories.types";
import type { Department } from "@features/departments/types/departments.types";

type CategoryRow = Category & {
  subCategoryCount: number;
};

const DEPARTMENTS: Pick<Department, "id" | "name">[] = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Fashion" },
  { id: 3, name: "Home" },
];

const MOCK_CATEGORIES: CategoryRow[] = [
  {
    id: 101,
    name: "Audio",
    description: "<p>Headphones, speakers, and sound systems.</p>",
    photo: null,
    departmentId: DEPARTMENTS[0]!.id,
    department: DEPARTMENTS[0]!,
    subCategoryCount: 8,
    isActive: true,
    createdAt: "2026-03-05",
    updatedAt: "2026-03-22",
  },
  {
    id: 102,
    name: "Smart Devices",
    description: "<p>Phones, watches, and connected devices.</p>",
    photo: null,
    departmentId: DEPARTMENTS[0]!.id,
    department: DEPARTMENTS[0]!,
    subCategoryCount: 5,
    isActive: true,
    createdAt: "2026-03-04",
    updatedAt: "2026-03-21",
  },
  {
    id: 103,
    name: "Furniture",
    description: "<p>Tables, desks, and home pieces.</p>",
    photo: null,
    departmentId: DEPARTMENTS[2]!.id,
    department: DEPARTMENTS[2]!,
    subCategoryCount: 4,
    isActive: true,
    createdAt: "2026-03-03",
    updatedAt: "2026-03-18",
  },
  {
    id: 104,
    name: "Archive",
    description: "<p>Retired categories kept for reference.</p>",
    photo: null,
    departmentId: DEPARTMENTS[2]!.id,
    department: DEPARTMENTS[2]!,
    subCategoryCount: 1,
    isActive: false,
    createdAt: "2026-03-01",
    updatedAt: "2026-03-10",
  },
];

const COLUMNS: Column<CategoryRow>[] = [
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
  { key: "name", label: "Category", sortable: true },
  {
    key: "department",
    label: "Department",
    render: (row) => row.department?.name ?? "—",
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
  {
    key: "updatedAt",
    label: "Updated",
    render: (row) => (
      <span className="text-sm text-zinc-500">{row.updatedAt}</span>
    ),
  },
];

export function CategoriesModule(): React.JSX.Element {
  const [rows, setRows] = useState<CategoryRow[]>(MOCK_CATEGORIES);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [photoFilter, setPhotoFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<CategoryRow | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | undefined>(
    undefined,
  );
  const [selectedIds, setSelectedIds] = useState<CategoryRow["id"][]>([]);

  const searchFiltered = search.trim()
    ? rows.filter((row) =>
        row.name.toLowerCase().includes(search.toLowerCase()) ||
        (row.department?.name ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : rows;
  const filtered = searchFiltered.filter((row) => {
    const matchesDepartment =
      departmentFilter === "all"
        ? true
        : row.departmentId === Number(departmentFilter);
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

    return matchesDepartment && matchesStatus && matchesPhoto;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Manage the main categories used across the catalog."
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <IconPlus className="h-4 w-4" />
            Add Category
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
                aria-label="Category actions"
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
            placeholder="Search categories…"
            selectedCount={selectedIds.length}
            filters={[
              {
                id: "department",
                label: "Department",
                value: departmentFilter,
                onChange: (value) => {
                  setDepartmentFilter(value);
                  setPage(1);
                },
                options: DEPARTMENTS.map((department) => ({
                  label: department.name,
                  value: String(department.id),
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
              setDepartmentFilter("all");
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
      <CategoryFormDialog
        key={editItem?.id ?? "new"}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditItem(undefined);
        }}
        onSubmit={(values: CreateCategoryInput) => {
          const today = new Date().toISOString().split("T")[0] ?? "";
          const department = DEPARTMENTS.find(
            (item) => item.id === values.departmentId,
          );
          if (editItem) {
            setRows((prev) =>
              prev.map((r) =>
                r.id === editItem.id
                  ? {
                      ...r,
                      name: values.name,
                      description: values.description ?? null,
                      photo: values.photo ?? null,
                      departmentId: values.departmentId,
                      department: department ?? r.department ?? null,
                      isActive: values.isActive ?? r.isActive,
                      updatedAt: today,
                    }
                  : r,
              ),
            );
            toast.success("Category updated");
          } else {
            setRows((prev) => [
              ...prev,
              {
                id: Date.now(),
                name: values.name,
                description: values.description ?? null,
                photo: values.photo ?? null,
                departmentId: values.departmentId,
                department: department ?? null,
                subCategoryCount: 0,
                isActive: values.isActive ?? true,
                createdAt: today,
                updatedAt: today,
              },
            ]);
            toast.success("Category created");
          }
          setDialogOpen(false);
          setEditItem(undefined);
        }}
        isSubmitting={false}
        {...(editItem
          ? {
              category: {
                id: editItem.id,
                name: editItem.name,
                description: editItem.description,
                photo: editItem.photo,
                departmentId: editItem.departmentId,
                department: editItem.department ?? null,
                isActive: editItem.isActive,
                createdAt: editItem.createdAt,
                updatedAt: editItem.updatedAt,
              },
            }
          : {})}
        departments={DEPARTMENTS}
      />
      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete Category"
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
