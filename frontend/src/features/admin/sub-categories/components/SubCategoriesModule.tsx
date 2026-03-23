'use client'

import { useState } from "react"
import type React from "react"
import { Button } from "@shared/components/ui/button"
import {
  DataTable,
  DeleteDialog,
  PageHeader,
  StatusBadge,
  TablePagination,
  TableToolbar,
} from "@shared/components/admin"
import type { Column } from "@shared/components/admin/DataTable"
import { IconPencil, IconTrash } from "@tabler/icons-react"
import { SubCategoryFormDialog } from "./SubCategoryFormDialog"

// ── Types ─────────────────────────────────────────────────────────────────────

type SubCategoryRow = {
  id: string
  name: string
  categoryName: string
  productCount: number
  isActive: boolean
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_SUB_CATEGORIES: SubCategoryRow[] = [
  { id: "1", name: "Smartphones", categoryName: "Electronics", productCount: 24, isActive: true },
  { id: "2", name: "Laptops", categoryName: "Electronics", productCount: 18, isActive: true },
  { id: "3", name: "T-Shirts", categoryName: "Clothing", productCount: 45, isActive: true },
  { id: "4", name: "Dresses", categoryName: "Clothing", productCount: 32, isActive: true },
  { id: "5", name: "Fresh Produce", categoryName: "Food & Beverage", productCount: 67, isActive: true },
  { id: "6", name: "Beverages", categoryName: "Food & Beverage", productCount: 41, isActive: false },
  { id: "7", name: "Washing Machines", categoryName: "Home Appliances", productCount: 9, isActive: true },
  { id: "8", name: "Fiction", categoryName: "Books", productCount: 156, isActive: true },
  { id: "9", name: "Running Gear", categoryName: "Sports", productCount: 28, isActive: true },
  { id: "10", name: "Headphones", categoryName: "Electronics", productCount: 15, isActive: false },
]

// ── Columns ───────────────────────────────────────────────────────────────────

const COLUMNS: Column<SubCategoryRow>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "categoryName", label: "Parent Category" },
  {
    key: "productCount",
    label: "Products",
    render: (row) => <span className="text-sm text-zinc-700">{row.productCount}</span>,
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
]

// ── Component ─────────────────────────────────────────────────────────────────

export function SubCategoriesModule(): React.JSX.Element {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<SubCategoryRow | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<SubCategoryRow | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const filtered = search.trim()
    ? MOCK_SUB_CATEGORIES.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.categoryName.toLowerCase().includes(search.toLowerCase()),
      )
    : MOCK_SUB_CATEGORIES

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  function renderActions(row: SubCategoryRow): React.ReactNode {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => { setEditItem(row); setDialogOpen(true) }}
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
    )
  }

  return (
    <div>
      <PageHeader
        title="Sub-categories"
        subtitle="Manage product sub-categories"
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
            onSearch={(v) => { setSearch(v); setPage(1) }}
            placeholder="Search sub-categories..."
            selectedCount={selectedIds.length}
            action={
              <Button
                size="sm"
                onClick={() => { setEditItem(undefined); setDialogOpen(true) }}
              >
                Add Sub-category
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
            onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
          />
        }
      />
      <SubCategoryFormDialog
        key={editItem?.id ?? "new"}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditItem(undefined) }}
        onSubmit={() => setDialogOpen(false)}
        isSubmitting={false}
        {...(editItem
          ? {
              subCategory: {
                id: editItem.id,
                name: editItem.name,
                categoryName: editItem.categoryName,
                description: null,
                isActive: editItem.isActive,
              },
            }
          : {})}
      />
      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete Sub-category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={() => setDeleteTarget(undefined)}
        onCancel={() => setDeleteTarget(undefined)}
        isDeleting={false}
      />
    </div>
  )
}
