'use client'

import { useState } from "react"
import type React from "react"
import { Button } from "@shared/components/ui/button"
import { DataTable, DeleteDialog, PageHeader, StatusBadge, TablePagination, TableToolbar } from "@shared/components/admin"
import { IconPencil, IconTrash } from "@tabler/icons-react"
import { UserFormDialog } from "./UserFormDialog"
import type { User } from "../types/users.types"

const MOCK_USERS: User[] = [
  { id: "1", firstName: "Arjun", lastName: "Sharma", email: "arjun@aksharpith.com", roleName: "Admin", isActive: true, createdAt: "2024-01-01" },
  { id: "2", firstName: "Priya", lastName: "Patel", email: "priya@aksharpith.com", roleName: "Manager", isActive: true, createdAt: "2024-01-10" },
  { id: "3", firstName: "Rahul", lastName: "Mehta", email: "rahul@aksharpith.com", roleName: "Staff", isActive: true, createdAt: "2024-01-20" },
  { id: "4", firstName: "Sneha", lastName: "Joshi", email: "sneha@aksharpith.com", roleName: "Staff", isActive: true, createdAt: "2024-02-01" },
  { id: "5", firstName: "Vikram", lastName: "Singh", email: "vikram@aksharpith.com", roleName: "Manager", isActive: true, createdAt: "2024-02-10" },
  { id: "6", firstName: "Anita", lastName: "Desai", email: "anita@aksharpith.com", roleName: "Staff", isActive: false, createdAt: "2024-02-15" },
  { id: "7", firstName: "Kiran", lastName: "Nair", email: "kiran@aksharpith.com", roleName: "Viewer", isActive: true, createdAt: "2024-03-01" },
  { id: "8", firstName: "Deepak", lastName: "Gupta", email: "deepak@aksharpith.com", roleName: "Staff", isActive: true, createdAt: "2024-03-10" },
]

export function UsersModule(): React.JSX.Element {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<User | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<User | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const filtered = MOCK_USERS.filter(u =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.roleName.toLowerCase().includes(search.toLowerCase())
  )
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns = [
    {
      key: "firstName" as const,
      label: "User",
      sortable: true,
      render: (row: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-zinc-600">
              {row.firstName[0]}{row.lastName[0]}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900">{row.firstName} {row.lastName}</p>
            <p className="text-xs text-zinc-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "roleName" as const, label: "Role" },
    {
      key: "isActive" as const,
      label: "Status",
      render: (row: User) => (
        <StatusBadge variant={row.isActive ? "success" : "neutral"} label={row.isActive ? "Active" : "Inactive"} />
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage user accounts and access" />
      <DataTable
        columns={columns}
        rows={paginated}
        selectable
        onSelectionChange={setSelectedIds}
        renderActions={(row: User) => (
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
            placeholder="Search users..."
            selectedCount={selectedIds.length}
            action={<Button size="sm" onClick={() => { setEditItem(undefined); setDialogOpen(true) }}>Add User</Button>}
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
      <UserFormDialog
        key={editItem?.id ?? "new"}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditItem(undefined) }}
        onSubmit={() => setDialogOpen(false)}
        isSubmitting={false}
        {...(editItem ? { user: editItem } : {})}
      />
      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete User"
        description={`Are you sure you want to delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This action cannot be undone.`}
        onConfirm={() => setDeleteTarget(undefined)}
        onCancel={() => setDeleteTarget(undefined)}
        isDeleting={false}
      />
    </div>
  )
}
