'use client'

import { useState } from "react"
import type React from "react"
import { Button } from "@shared/components/ui/button"
import { DataTable, DeleteDialog, PageHeader, StatusBadge, TablePagination, TableToolbar } from "@shared/components/admin"
import { IconPencil, IconTrash } from "@tabler/icons-react"
import { GroupFormDialog } from "./GroupFormDialog"

type GroupRow = {
  id: string
  name: string
  description: string | null
  fieldCount: number
  isActive: boolean
}

const MOCK_GROUPS: GroupRow[] = [
  { id: "1", name: "Electronics Specs", description: "Technical specifications for electronic products", fieldCount: 8, isActive: true },
  { id: "2", name: "Apparel Details", description: "Size, fit and fabric details for clothing", fieldCount: 5, isActive: true },
  { id: "3", name: "Food Info", description: "Nutritional and dietary information", fieldCount: 6, isActive: true },
  { id: "4", name: "Furniture Dimensions", description: "Size and material details for furniture", fieldCount: 4, isActive: true },
  { id: "5", name: "Book Details", description: "Author, publisher and edition information", fieldCount: 7, isActive: false },
]

export function GroupsModule(): React.JSX.Element {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<GroupRow | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<GroupRow | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const filtered = MOCK_GROUPS.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  )
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns = [
    { key: "name" as const, label: "Name", sortable: true },
    {
      key: "description" as const,
      label: "Description",
      render: (row: GroupRow) => (
        <span className="text-sm text-zinc-500 line-clamp-1">{row.description ?? "—"}</span>
      ),
    },
    {
      key: "fieldCount" as const,
      label: "Fields",
      render: (row: GroupRow) => <span className="text-sm text-zinc-700">{row.fieldCount}</span>,
    },
    {
      key: "isActive" as const,
      label: "Status",
      render: (row: GroupRow) => (
        <StatusBadge variant={row.isActive ? "success" : "neutral"} label={row.isActive ? "Active" : "Inactive"} />
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Groups" subtitle="Manage product attribute groups" />
      <DataTable
        columns={columns}
        rows={paginated}
        selectable
        onSelectionChange={setSelectedIds}
        renderActions={(row: GroupRow) => (
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => { setEditItem(row); setDialogOpen(true) }}
              className="p-1.5 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors">
              <IconPencil size={16} />
            </button>
            <button type="button" onClick={() => setDeleteTarget(row)}
              className="p-1.5 rounded hover:bg-zinc-100 text-zinc-400 hover:text-red-500 transition-colors">
              <IconTrash size={16} />
            </button>
          </div>
        )}
        toolbar={
          <TableToolbar
            search={search}
            onSearch={(v) => { setSearch(v); setPage(1) }}
            placeholder="Search groups..."
            selectedCount={selectedIds.length}
            action={<Button size="sm" onClick={() => { setEditItem(undefined); setDialogOpen(true) }}>Add Group</Button>}
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
      <GroupFormDialog
        key={editItem?.id ?? "new"}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditItem(undefined) }}
        onSubmit={() => setDialogOpen(false)}
        isSubmitting={false}
        {...(editItem ? { group: { id: editItem.id, name: editItem.name, description: editItem.description, isActive: editItem.isActive } } : {})}
      />
      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete Group"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={() => setDeleteTarget(undefined)}
        onCancel={() => setDeleteTarget(undefined)}
        isDeleting={false}
      />
    </div>
  )
}
