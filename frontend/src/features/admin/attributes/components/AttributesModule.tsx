"use client";

import { AttributeFormDialog } from "@features/admin/attributes/components/AttributeFormDialog";
import { buildAttributeUsageMap } from "@features/admin/attributes/services/attribute-usage.helpers";
import type { Attribute } from "@features/admin/attributes/types/attributes.types";
import { MOCK_ATTRIBUTES } from "@features/admin/products/services/product-admin.mock";
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
import { useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";

type AttributeTableRow = Attribute & {
  usage: ReturnType<typeof buildAttributeUsageMap>[number];
};

export function AttributesModule(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState("all");
  const [usageFilter, setUsageFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Attribute | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Attribute | undefined>(
    undefined,
  );
  const [selectedIds, setSelectedIds] = useState<Attribute["id"][]>([]);
  const [rows, setRows] = useState<Attribute[]>(MOCK_ATTRIBUTES);

  const searchFilteredRows = deferredSearch.trim()
    ? rows.filter((attribute) =>
        attribute.name.toLowerCase().includes(deferredSearch.toLowerCase()),
      )
    : rows;
  const usageByAttribute = useMemo(() => buildAttributeUsageMap(rows), [rows]);
  const tableRows = useMemo<AttributeTableRow[]>(
    () =>
      searchFilteredRows
        .filter((attribute) => {
          const usage = usageByAttribute[attribute.id];
          const matchesStatus =
            statusFilter === "all"
              ? true
              : statusFilter === "active"
                ? attribute.isActive
                : !attribute.isActive;
          const matchesUsage =
            usageFilter === "all"
              ? true
              : usageFilter === "in-use"
                ? Boolean(usage?.inUse)
                : !usage?.inUse;

          return matchesStatus && matchesUsage;
        })
        .map((attribute) => ({
        ...attribute,
        usage: usageByAttribute[attribute.id] ?? {
          productCount: 0,
          lotMatrixRowCount: 0,
          inUse: false,
          valueUsageById: {},
        },
      })),
    [searchFilteredRows, statusFilter, usageByAttribute, usageFilter],
  );
  const columns = useMemo<Column<AttributeTableRow>[]>(
    () => [
      { key: "name", label: "Attribute", sortable: true },
      {
        key: "values",
        label: "Structured Values",
        render: (row) => (
          <div className="flex flex-wrap gap-2">
            {row.values.map((value) => (
              <span
                key={value.id}
                className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700"
              >
                {value.label}
              </span>
            ))}
          </div>
        ),
      },
      {
        key: "usage",
        label: "Usage",
        render: (row) => (
          <div className="space-y-2">
            <StatusBadge
              label={row.usage.inUse ? "Used in catalog" : "Not used yet"}
              variant={row.usage.inUse ? "warning" : "neutral"}
            />
            <p className="text-xs leading-5 text-zinc-500">
              {row.usage.inUse
                ? `${row.usage.productCount} product${
                    row.usage.productCount === 1 ? "" : "s"
                  } • ${row.usage.lotMatrixRowCount} lot matrix row${
                    row.usage.lotMatrixRowCount === 1 ? "" : "s"
                  }`
                : "Safe to rename or delete while it has no linked rows."}
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
    ],
    [],
  );

  const paginatedRows = tableRows.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attributes"
        subtitle="Manage the attribute options used across your catalog."
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <IconPlus className="h-4 w-4" />
            Add Attribute
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={paginatedRows}
        selectable
        onSelectionChange={setSelectedIds}
        renderActions={(row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Attribute actions"
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
                disabled={row.usage.inUse}
                onClick={() => {
                  if (row.usage.inUse) {
                    toast.error("This attribute is already used in the catalog");
                    return;
                  }
                  setDeleteTarget(row);
                }}
              >
                <IconTrash className="h-3.5 w-3.5" />
                {row.usage.inUse ? "Delete blocked" : "Delete"}
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
            placeholder="Search attributes…"
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
                id: "usage",
                label: "Usage",
                value: usageFilter,
                onChange: (value) => {
                  setUsageFilter(value);
                  setPage(1);
                },
                options: [
                  { label: "In Use", value: "in-use" },
                  { label: "Unused", value: "unused" },
                ],
              },
            ]}
            onClearFilters={() => {
              setSearch("");
              setStatusFilter("all");
              setUsageFilter("all");
              setPage(1);
            }}
          />
        }
        footer={
          <TablePagination
            total={tableRows.length}
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
      <AttributeFormDialog
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
                      code: values.code,
                      sortOrder: values.sortOrder ?? null,
                      isRequired: values.isRequired ?? false,
                      isActive: values.isActive,
                      values: values.values.map((v, i) => ({
                        id: v.valueId ?? Date.now() + i,
                        attributeId: r.id,
                        label: v.label,
                        code: v.code,
                        sortOrder: v.sortOrder,
                        isActive: v.isActive,
                        createdAt:
                          r.values.find((existingValue) => existingValue.id === v.valueId)
                            ?.createdAt ?? today,
                      })),
                      updatedAt: today,
                    }
                  : r,
              ),
            );
            toast.success("Attribute updated");
          } else {
            const newId = Date.now();
            setRows((prev) => [
              ...prev,
              {
                id: newId,
                productId: 0,
                name: values.name,
                code: values.code,
                sortOrder: values.sortOrder ?? null,
                isRequired: values.isRequired ?? false,
                isActive: values.isActive,
                values: values.values.map((v, i) => ({
                  id: newId * 100 + i,
                  attributeId: newId,
                  label: v.label,
                  code: v.code,
                  sortOrder: v.sortOrder,
                  isActive: v.isActive,
                  createdAt: today,
                })),
                createdAt: today,
              },
            ]);
            toast.success("Attribute created");
          }
          setDialogOpen(false);
          setEditItem(undefined);
        }}
        isSubmitting={false}
        {...(editItem && usageByAttribute[editItem.id]
          ? { usage: usageByAttribute[editItem.id] }
          : {})}
        {...(editItem ? { attribute: editItem } : {})}
      />
      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete Attribute"
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
