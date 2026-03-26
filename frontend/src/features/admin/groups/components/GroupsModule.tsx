"use client";

import { GroupFormDialog } from "@features/admin/groups/components/GroupFormDialog";
import type { Group } from "@features/admin/groups/types/groups.types";
import { MOCK_GROUPS } from "@features/admin/products/services/product-admin.mock";
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
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";

const COLUMNS: Column<Group>[] = [
  { key: "name", label: "Template", sortable: true },
  {
    key: "fields",
    label: "Dynamic Fields",
    render: (row) => (
      <div className="space-y-1">
        <p className="text-sm text-zinc-800">{row.fields.length} fields</p>
        <p className="text-xs text-zinc-500">
          {row.fields
            .map((field) => field.name)
            .slice(0, 3)
            .join(", ") || "No fields"}
        </p>
      </div>
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
];

export function GroupsModule(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState("all");
  const [fieldTypeFilter, setFieldTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Group | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Group | undefined>(
    undefined,
  );
  const [selectedIds, setSelectedIds] = useState<Group["id"][]>([]);
  const [rows, setRows] = useState<Group[]>(MOCK_GROUPS);

  const searchFilteredRows = deferredSearch.trim()
    ? rows.filter((group) =>
        group.name.toLowerCase().includes(deferredSearch.toLowerCase()),
      )
    : rows;
  const filteredRows = searchFilteredRows.filter((group) => {
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? group.isActive
          : !group.isActive;
    const matchesFieldType =
      fieldTypeFilter === "all"
        ? true
        : group.fields.some((field) => field.type === fieldTypeFilter);

    return matchesStatus && matchesFieldType;
  });

  const paginatedRows = filteredRows.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Group Templates"
        subtitle="Manage reusable custom-field templates that describe products without affecting sellable rows."
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <IconPlus className="h-4 w-4" />
            Add Template
          </Button>
        }
      />
      <DataTable
        columns={COLUMNS}
        rows={paginatedRows}
        selectable
        onSelectionChange={setSelectedIds}
        renderActions={(row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Group actions">
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
            placeholder="Search templates…"
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
              {
                id: "field-type",
                label: "Field Type",
                value: fieldTypeFilter,
                onChange: (value) => {
                  setFieldTypeFilter(value);
                  setPage(1);
                },
                options: [
                  { label: "Text", value: "text" },
                  { label: "Textarea", value: "textarea" },
                  { label: "Number", value: "number" },
                  { label: "Boolean", value: "boolean" },
                  { label: "Dropdown", value: "dropdown" },
                ],
              },
            ]}
            onClearFilters={() => {
              setSearch("");
              setStatusFilter("all");
              setFieldTypeFilter("all");
              setPage(1);
            }}
          />
        }
        footer={
          <TablePagination
            total={filteredRows.length}
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
      <GroupFormDialog
        key={editItem?.id ?? "new"}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditItem(undefined);
        }}
        onSubmit={(values) => {
          const today = new Date().toISOString();
          if (editItem) {
            setRows((prev) =>
              prev.map((r) =>
                r.id === editItem.id
                  ? {
                      ...r,
                      name: values.name,
                      description: values.description ?? null,
                      isActive: values.isActive,
                      fields: values.fields.map((f, i) => ({
                        id:
                          r.fields[i]?.id ??
                          globalThis.crypto?.randomUUID?.() ??
                          `${r.id}-field-${i + 1}`,
                        groupId: r.id,
                        name: f.name,
                        key:
                          f.key ??
                          r.fields[i]?.key ??
                          f.name.toLowerCase().replace(/\s+/g, "_"),
                        type: f.type ?? "text",
                        isRequired: f.isRequired ?? false,
                        isFilterable: f.isFilterable ?? false,
                        sortOrder: f.sortOrder ?? i,
                        isActive: f.isActive ?? true,
                        options: (f.options ?? []).map((o, j) => ({
                          id:
                            r.fields[i]?.options[j]?.id ??
                            globalThis.crypto?.randomUUID?.() ??
                            `${r.id}-field-${i + 1}-option-${j + 1}`,
                          fieldId:
                            r.fields[i]?.id ??
                            globalThis.crypto?.randomUUID?.() ??
                            `${r.id}-field-${i + 1}`,
                          label: o.label,
                          value: o.value,
                          sortOrder: o.sortOrder ?? j,
                          isActive: o.isActive ?? true,
                        })),
                        createdAt: r.fields[i]?.createdAt ?? today,
                        updatedAt: today,
                      })),
                      updatedAt: today,
                    }
                  : r,
              ),
            );
            toast.success("Group updated");
          } else {
            const newId =
              globalThis.crypto?.randomUUID?.() ?? `group-${Date.now()}`;
            setRows((prev) => [
              ...prev,
              {
                id: newId,
                name: values.name,
                description: values.description ?? null,
                isActive: values.isActive,
                fields: values.fields.map((f, i) => {
                  const fieldId =
                    globalThis.crypto?.randomUUID?.() ??
                    `${newId}-field-${i + 1}`;
                  return {
                    id: fieldId,
                    groupId: newId,
                    name: f.name,
                    key:
                      f.key ??
                      f.name.toLowerCase().replace(/\s+/g, "_"),
                    type: f.type ?? "text",
                    isRequired: f.isRequired ?? false,
                    isFilterable: f.isFilterable ?? false,
                    sortOrder: f.sortOrder ?? i,
                    isActive: f.isActive ?? true,
                    options: (f.options ?? []).map((o, j) => ({
                      id:
                        globalThis.crypto?.randomUUID?.() ??
                        `${fieldId}-option-${j + 1}`,
                      fieldId,
                      label: o.label,
                      value: o.value,
                      sortOrder: o.sortOrder ?? j,
                      isActive: o.isActive ?? true,
                    })),
                    createdAt: today,
                    updatedAt: today,
                  };
                }),
                createdAt: today,
                updatedAt: today,
              },
            ]);
            toast.success("Group created");
          }
          setDialogOpen(false);
          setEditItem(undefined);
        }}
        isSubmitting={false}
        {...(editItem ? { group: editItem } : {})}
      />
      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete Group Template"
        description={`Delete "${deleteTarget?.name}"? This action cannot be undone.`}
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
