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
import { cn } from "@shared/lib/utils";
import { IconPencil, IconPhoto, IconTrash } from "@tabler/icons-react";
import type React from "react";
import { useState } from "react";
import { ProductFormDialog } from "./ProductFormDialog";

// ── Types ─────────────────────────────────────────────────────────────────────

type ProductRow = {
  id: string;
  name: string;
  sku: string;
  productType: string;
  basePrice: number;
  stockQuantity: number;
  department: string;
  isActive: boolean;
};

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_PRODUCTS: ProductRow[] = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    sku: "IPH-15-PRO",
    productType: "SIMPLE",
    basePrice: 134900,
    stockQuantity: 45,
    department: "Electronics",
    isActive: true,
  },
  {
    id: "2",
    name: "Samsung Galaxy S24",
    sku: "SAM-S24-BLK",
    productType: "VARIABLE",
    basePrice: 89900,
    stockQuantity: 32,
    department: "Electronics",
    isActive: true,
  },
  {
    id: "3",
    name: "Men's Cotton T-Shirt",
    sku: "TSH-MEN-001",
    productType: "VARIABLE",
    basePrice: 599,
    stockQuantity: 200,
    department: "Clothing",
    isActive: true,
  },
  {
    id: "4",
    name: 'MacBook Pro 14"',
    sku: "MBP-14-M3",
    productType: "SIMPLE",
    basePrice: 199900,
    stockQuantity: 12,
    department: "Electronics",
    isActive: true,
  },
  {
    id: "5",
    name: "Wireless Headphones",
    sku: "WH-BT-200",
    productType: "SIMPLE",
    basePrice: 4999,
    stockQuantity: 78,
    department: "Electronics",
    isActive: true,
  },
  {
    id: "6",
    name: "Organic Green Tea",
    sku: "TEA-ORG-100",
    productType: "SIMPLE",
    basePrice: 299,
    stockQuantity: 500,
    department: "Food & Beverage",
    isActive: false,
  },
  {
    id: "7",
    name: "Running Shoes",
    sku: "SHO-RUN-M42",
    productType: "VARIABLE",
    basePrice: 3499,
    stockQuantity: 65,
    department: "Clothing",
    isActive: true,
  },
  {
    id: "8",
    name: "E-Book: React Mastery",
    sku: "EBOOK-REACT-01",
    productType: "DIGITAL",
    basePrice: 999,
    stockQuantity: 999,
    department: "Electronics",
    isActive: true,
  },
  {
    id: "9",
    name: "Premium Yoga Mat",
    sku: "YM-PRO-6MM",
    productType: "SIMPLE",
    basePrice: 1499,
    stockQuantity: 43,
    department: "Home & Garden",
    isActive: true,
  },
  {
    id: "10",
    name: "Coffee Subscription",
    sku: "COFFSUB-3M",
    productType: "SERVICE",
    basePrice: 2999,
    stockQuantity: 0,
    department: "Food & Beverage",
    isActive: false,
  },
];

// ── Columns ───────────────────────────────────────────────────────────────────

const columns: Column<ProductRow>[] = [
  {
    key: "name",
    label: "Product",
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-zinc-100 flex items-center justify-center flex-shrink-0">
          <IconPhoto size={16} className="text-zinc-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-900">{row.name}</p>
          <p className="text-xs text-zinc-500">{row.sku}</p>
        </div>
      </div>
    ),
  },
  {
    key: "productType",
    label: "Type",
    render: (row) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-700">
        {row.productType}
      </span>
    ),
  },
  {
    key: "basePrice",
    label: "Price",
    sortable: true,
    render: (row) => (
      <span className="text-sm text-zinc-900">
        &#8377;{row.basePrice.toLocaleString("en-IN")}
      </span>
    ),
  },
  {
    key: "stockQuantity",
    label: "Stock",
    sortable: true,
    render: (row) => (
      <span
        className={cn(
          "text-sm",
          row.stockQuantity === 0 ? "text-red-500" : "text-zinc-700",
        )}
      >
        {row.stockQuantity === 0 ? "Out of stock" : row.stockQuantity}
      </span>
    ),
  },
  {
    key: "department",
    label: "Department",
  },
  {
    key: "isActive",
    label: "Status",
    render: (row) => (
      <StatusBadge
        variant={row.isActive ? "success" : "neutral"}
        label={row.isActive ? "Active" : "Inactive"}
      />
    ),
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function ProductsModule(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ProductRow | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | undefined>(
    undefined,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase()),
  );

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function renderActions(row: ProductRow): React.ReactNode {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            setEditItem(row);
            setDialogOpen(true);
          }}
          className="p-1.5 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <IconPencil size={16} />
        </button>
        <button
          type="button"
          onClick={() => setDeleteTarget(row)}
          className="p-1.5 rounded hover:bg-zinc-100 text-zinc-400 hover:text-red-500 transition-colors"
        >
          <IconTrash size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Products" subtitle="Manage your product catalog" />
      <DataTable
        columns={columns}
        rows={paginated}
        selectable
        onSelectionChange={setSelectedIds}
        renderActions={renderActions}
        toolbar={
          <TableToolbar
            search={search}
            onSearch={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search products..."
            selectedCount={selectedIds.length}
            action={
              <Button
                size="sm"
                onClick={() => {
                  setEditItem(undefined);
                  setDialogOpen(true);
                }}
              >
                Add Product
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
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        }
      />
      <ProductFormDialog
        key={editItem?.id ?? "new"}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditItem(undefined);
        }}
        onSubmit={() => setDialogOpen(false)}
        isSubmitting={false}
        {...(editItem !== undefined
          ? {
              product: {
                id: editItem.id,
                name: editItem.name,
                sku: editItem.sku,
                productType: editItem.productType,
                description: "",
                basePrice: editItem.basePrice,
                stockQuantity: editItem.stockQuantity,
                department: editItem.department,
                category: "",
                subCategory: "",
                isActive: editItem.isActive,
              },
            }
          : {})}
      />
      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={() => setDeleteTarget(undefined)}
        onCancel={() => setDeleteTarget(undefined)}
        isDeleting={false}
      />
    </div>
  );
}
