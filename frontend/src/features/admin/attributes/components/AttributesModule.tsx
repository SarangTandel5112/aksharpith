'use client'

import { useState } from "react"
import type React from "react"
import { Button } from "@shared/components/ui/button"
import { DataTable, DeleteDialog, PageHeader, StatusBadge, TablePagination, TableToolbar } from "@shared/components/admin"
import { IconPencil, IconTrash } from "@tabler/icons-react"
import { AttributeFormDialog } from "./AttributeFormDialog"

type AttributeRow = {
  id: string
  name: string
  values: string[]
  isActive: boolean
}

const MOCK_ATTRIBUTES: AttributeRow[] = [
  { id: "1", name: "Color", values: ["Red", "Blue", "Green", "Black", "White", "Yellow"], isActive: true },
  { id: "2", name: "Size", values: ["XS", "S", "M", "L", "XL", "XXL"], isActive: true },
  { id: "3", name: "Material", values: ["Cotton", "Polyester", "Wool", "Silk"], isActive: true },
  { id: "4", name: "Storage", values: ["64GB", "128GB", "256GB", "512GB"], isActive: true },
  { id: "5", name: "RAM", values: ["4GB", "8GB", "16GB", "32GB"], isActive: false },
]

export function AttributesModule(): React.JSX.Element {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<AttributeRow | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<AttributeRow | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const filtered = MOCK_ATTRIBUTES.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  )
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns = [
    { key: "name" as const, label: "Attribute", sortable: true },
    {
      key: "values" as const,
      label: "Values",
      render: (row: AttributeRow) => (
        <div className="flex flex-wrap gap-1">
          {row.values.slice(0, 4).map((v) => (
            <span key={v} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-zinc-100 text-zinc-700">
              {v}
            </span>
          ))}
          {row.values.length > 4 && (
            <span className="text-xs text-zinc-400">+{row.values.length - 4} more</span>
          )}
        </div>
      ),
    },
    {
      key: "isActive" as const,
      label: "Status",
      render: (row: AttributeRow) => (
        <StatusBadge
          variant={row.isActive ? "success" : "neutral"}
          label={row.isActive ? "Active" : "Inactive"}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Attributes"
        subtitle="Manage product attributes and their values"
      />
      <DataTable
        columns={columns}
        rows={paginated}
        selectable
        onSelectionChange={setSelectedIds}
        renderActions={(row: AttributeRow) => (
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
        )}
        toolbar={
          <TableToolbar
            search={search}
            onSearch={(v) => { setSearch(v); setPage(1) }}
            placeholder="Search attributes..."
            selectedCount={selectedIds.length}
            action={
              <Button size="sm" onClick={() => { setEditItem(undefined); setDialogOpen(true) }}>
                Add Attribute
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
      <AttributeFormDialog
        key={editItem?.id ?? "new"}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditItem(undefined) }}
        onSubmit={() => setDialogOpen(false)}
        isSubmitting={false}
        {...(editItem ? { attribute: editItem } : {})}
      />
      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete Attribute"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={() => setDeleteTarget(undefined)}
        onCancel={() => setDeleteTarget(undefined)}
        isDeleting={false}
      />
    </div>
  )
}
