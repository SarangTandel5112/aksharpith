"use client";

import { ProductsGridView } from "@features/admin/products/components/list/ProductsGridView";
import { ProductsSummaryStrip } from "@features/admin/products/components/list/ProductsSummaryStrip";
import {
  buildProductListRows,
  formatCurrency,
  formatProductListingStatus,
  formatProductSellingStatus,
  formatProductType,
} from "@features/admin/products/services/product-admin.helpers";
import type { ProductListRow } from "@features/admin/products/types/products.types";
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
import { cn } from "@shared/lib/utils";
import {
  IconDots,
  IconLayoutGrid,
  IconList,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";

type ViewMode = "list" | "grid";

const COLUMNS: Column<ProductListRow>[] = [
  {
    key: "product",
    label: "Product",
    sortable: true,
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-zinc-950">{row.product.name}</p>
        <p className="text-xs text-zinc-500">
          {row.product.code} • {row.categoryName}
        </p>
      </div>
    ),
  },
  {
    key: "departmentName",
    label: "Department",
    render: (row) => (
      <div className="space-y-1">
        <p className="text-sm text-zinc-800">{row.departmentName}</p>
        <p className="text-xs text-zinc-500">{row.subCategoryName}</p>
      </div>
    ),
  },
  {
    key: "groupName",
    label: "Group",
  },
  {
    key: "type",
    label: "Type",
    render: (row) => (
      <StatusBadge
        label={formatProductType(row.product.type)}
        variant="info"
      />
    ),
  },
  {
    key: "price",
    label: "Price / Stock",
    render: (row) => (
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-900">
          {formatCurrency(row.product.price)}
        </p>
        <p className="text-xs text-zinc-500">
          {row.product.stockQuantity} in stock
        </p>
      </div>
    ),
  },
  {
    key: "mediaCount",
    label: "Assets",
    render: (row) => (
      <div className="space-y-1 text-sm text-zinc-700">
        <p>{row.mediaCount} media</p>
        <p>{row.marketingMediaCount} marketing</p>
        <p>{row.variantCount} lot matrix rows</p>
      </div>
    ),
  },
  {
    key: "isActive",
    label: "Status",
    render: (row) => (
      <div className="flex flex-col gap-2">
        <StatusBadge
          label={formatProductListingStatus(row.product.isActive)}
          variant={row.product.isActive ? "success" : "neutral"}
        />
        <StatusBadge
          label={formatProductSellingStatus(row.product.itemInactive)}
          variant={row.product.itemInactive ? "warning" : "info"}
        />
      </div>
    ),
  },
];

export function ProductsModule(): React.JSX.Element {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [listingFilter, setListingFilter] = useState("all");
  const [sellingFilter, setSellingFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedIds, setSelectedIds] = useState<ProductListRow["id"][]>([]);
  const [deleteTarget, setDeleteTarget] = useState<ProductListRow | undefined>(
    undefined,
  );

  const [rows, setRows] = useState<ProductListRow[]>(() =>
    buildProductListRows(),
  );

  const searchFilteredRows = deferredSearch.trim()
    ? rows.filter((row) =>
        [
          row.product.name,
          row.product.code,
          row.departmentName,
          row.categoryName,
          row.subCategoryName,
          row.groupName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(deferredSearch.toLowerCase()),
      )
    : rows;
  const filteredRows = searchFilteredRows.filter((row) => {
    const matchesDepartment =
      departmentFilter === "all"
        ? true
        : row.departmentName === departmentFilter;
    const matchesType =
      typeFilter === "all" ? true : row.product.type === typeFilter;
    const matchesListing =
      listingFilter === "all"
        ? true
        : listingFilter === "listed"
          ? row.product.isActive
          : !row.product.isActive;
    const matchesSelling =
      sellingFilter === "all"
        ? true
        : sellingFilter === "sellable"
          ? !row.product.itemInactive
          : row.product.itemInactive;

    return (
      matchesDepartment &&
      matchesType &&
      matchesListing &&
      matchesSelling
    );
  });

  const paginatedRows = filteredRows.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const summaryItems = [
    {
      label: "Products",
      value: String(rows.length),
      tone: "info" as const,
    },
    {
      label: "Merchandising Ready",
      value: String(
        rows.filter((row) => row.mediaCount > 0 && row.marketingMediaCount > 0)
          .length,
      ),
      tone: "success" as const,
    },
    {
      label: "Lot Matrix Catalog",
      value: String(rows.filter((row) => row.variantCount > 0).length),
      tone: "neutral" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog, media, and lot matrix readiness."
        action={
          <Button asChild>
            <Link href="/admin/products/new">
              <IconPlus className="h-4 w-4" />
              Add Product
            </Link>
          </Button>
        }
      />
      <ProductsSummaryStrip items={summaryItems} />
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <TableToolbar
          search={search}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search products, SKU, category, or group…"
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
              options: Array.from(new Set(rows.map((row) => row.departmentName))).map(
                (departmentName) => ({
                  label: departmentName,
                  value: departmentName,
                }),
              ),
            },
            {
              id: "type",
              label: "Type",
              value: typeFilter,
              onChange: (value) => {
                setTypeFilter(value);
                setPage(1);
              },
              options: [
                  { label: "Standard", value: "Standard" },
                  { label: "Lot Matrix", value: "Lot Matrix" },
              ],
            },
            {
              id: "listing",
              label: "Listing",
              value: listingFilter,
              onChange: (value) => {
                setListingFilter(value);
                setPage(1);
              },
              options: [
                { label: "Listed", value: "listed" },
                { label: "Hidden", value: "hidden" },
              ],
            },
            {
              id: "selling",
              label: "Selling",
              value: sellingFilter,
              onChange: (value) => {
                setSellingFilter(value);
                setPage(1);
              },
              options: [
                { label: "Sellable", value: "sellable" },
                { label: "Not Sellable", value: "not-sellable" },
              ],
            },
          ]}
          onClearFilters={() => {
            setSearch("");
            setDepartmentFilter("all");
            setTypeFilter("all");
            setListingFilter("all");
            setSellingFilter("all");
            setPage(1);
          }}
          action={
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-md border border-zinc-200 bg-zinc-50 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm transition-colors",
                    viewMode === "list"
                      ? "bg-zinc-950 text-white"
                      : "text-zinc-500 hover:text-zinc-900",
                  )}
                >
                  <IconList className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm transition-colors",
                    viewMode === "grid"
                      ? "bg-zinc-950 text-white"
                      : "text-zinc-500 hover:text-zinc-900",
                  )}
                >
                  <IconLayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          }
        />
        <div>
          {viewMode === "list" ? (
            <DataTable
              columns={COLUMNS}
              rows={paginatedRows}
              selectable
              onSelectionChange={setSelectedIds}
              renderActions={(row) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Product actions"
                    >
                      <IconDots className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/admin/products/${row.product.id}`)
                      }
                    >
                      Open Product
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          `/admin/products/${row.product.id}/variants`,
                        )
                      }
                    >
                      Open Lot Matrix
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
          ) : (
            <>
              <ProductsGridView
                rows={paginatedRows}
                onDelete={(row) => setDeleteTarget(row)}
              />
              <div className="mt-5">
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
              </div>
            </>
          )}
        </div>
      </div>
      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete Product"
        description={`Delete "${deleteTarget?.product.name}"? This action cannot be undone.`}
        onConfirm={() => {
          if (deleteTarget) {
            setRows((prev) =>
              prev.filter((r) => r.product.id !== deleteTarget.product.id),
            );
            toast.success(`"${deleteTarget.product.name}" deleted`);
          }
          setDeleteTarget(undefined);
        }}
        onCancel={() => setDeleteTarget(undefined)}
        isDeleting={false}
      />
    </div>
  );
}
