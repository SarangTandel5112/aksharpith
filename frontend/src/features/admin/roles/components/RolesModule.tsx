'use client'

import { useState } from "react"
import type React from "react"
import { Button } from "@shared/components/ui/button"
import { DataTable, DeleteDialog, PageHeader, StatusBadge, TablePagination, TableToolbar } from "@shared/components/admin"
import { IconPencil, IconTrash } from "@tabler/icons-react"
import { RoleFormDialog } from "./RoleFormDialog"
import type { Role } from "../types/roles.types"

const MOCK_ROLES: Role[] = [
  { id: "1", roleName: "Admin", userCount: 2, isActive: true, createdAt: "2024-01-01" },
  { id: "2", roleName: "Manager", userCount: 4, isActive: true, createdAt: "2024-01-15" },
  { id: "3", roleName: "Staff", userCount: 8, isActive: true, createdAt: "2024-02-01" },
  { id: "4", roleName: "Viewer", userCount: 0, isActive: false, createdAt: "2024-03-01" },
]

export function RolesModule(): React.JSX.Element {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<Role | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Role | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const filtered = MOCK_ROLES.filter(r =>
    r.roleName.toLowerCase().includes(search.toLowerCase())
  )
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns = [
    { key: "roleName" as const, label: "Role Name", sortable: true },
    {
      key: "userCount" as const,
      label: "Users",
      render: (row: Role) => <span className="text-sm text-zinc-700">{row.userCount}</span>,
    },
    {
      key: "isActive" as const,
      label: "Status",
      render: (row: Role) => (
        <StatusBadge variant={row.isActive ? "success" : "neutral"} label={row.isActive ? "Active" : "Inactive"} />
      ),
    },
    {
      key: "createdAt" as const,
      label: "Created",
      render: (row: Role) => <span className="text-sm text-zinc-500">{row.createdAt}</span>,
    },
  ]

  return (
    <div>
      <PageHeader title="Roles" subtitle="Manage user access roles" />
      <DataTable
        columns={columns}
        rows={paginated}
        selectable
        onSelectionChange={setSelectedIds}
        renderActions={(row: Role) => (
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
            placeholder="Search roles..."
            selectedCount={selectedIds.length}
            action={<Button size="sm" onClick={() => { setEditItem(undefined); setDialogOpen(true) }}>Add Role</Button>}
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
      <RoleFormDialog
        key={editItem?.id ?? "new"}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditItem(undefined) }}
        onSubmit={() => setDialogOpen(false)}
        isSubmitting={false}
        {...(editItem ? { role: editItem } : {})}
      />
      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete Role"
        description={`Are you sure you want to delete the "${deleteTarget?.roleName}" role? This action cannot be undone.`}
        onConfirm={() => setDeleteTarget(undefined)}
        onCancel={() => setDeleteTarget(undefined)}
        isDeleting={false}
      />
    </div>
  )
}
