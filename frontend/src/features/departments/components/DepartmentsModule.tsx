'use client'

import type React from 'react'
import { useState } from 'react'
import { IconPlus } from '@tabler/icons-react'
import { Button } from '@shared/components/ui/button'
import { DataTable, DeleteDialog, PageHeader } from '@shared/components/admin'
import { useToast } from '@shared/hooks/useToast'
import { useDepartments } from '../hooks/useDepartments'
import { DepartmentFormDialog } from './DepartmentFormDialog'
import type { Department } from '../types/departments.types'
import type { DepartmentFormValues } from '../validations/department-form.schema'

// ── Types ─────────────────────────────────────────────────────────────────────

type DepartmentRow = {
  id: string
  name: string
  description: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: 'name' as const, label: 'Name' },
  { key: 'description' as const, label: 'Description' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function DepartmentsModule(): React.JSX.Element {
  const toast = useToast()
  const {
    departments,
    isLoading,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    isCreating,
    isUpdating,
    isDeleting,
  } = useDepartments()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDepartment, setEditDepartment] = useState<Department | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Department | undefined>(undefined)

  function handleOpenAdd(): void {
    setEditDepartment(undefined)
    setDialogOpen(true)
  }

  function handleOpenEdit(dept: Department): void {
    setEditDepartment(dept)
    setDialogOpen(true)
  }

  function handleCloseDialog(): void {
    setDialogOpen(false)
    setEditDepartment(undefined)
  }

  function buildInput(values: DepartmentFormValues): { name: string; description?: string } {
    if (values.description !== undefined) {
      return { name: values.name, description: values.description }
    }
    return { name: values.name }
  }

  function handleSubmit(values: DepartmentFormValues): void {
    const input = buildInput(values)
    if (editDepartment) {
      void updateDepartment(editDepartment.id, input)
        .then(() => {
          toast.success('Department updated')
          handleCloseDialog()
        })
        .catch(() => {
          toast.error('Failed to update department')
        })
    } else {
      void createDepartment(input)
        .then(() => {
          toast.success('Department created')
          handleCloseDialog()
        })
        .catch(() => {
          toast.error('Failed to create department')
        })
    }
  }

  function handleDeleteConfirm(): void {
    if (!deleteTarget) return
    void deleteDepartment(deleteTarget.id)
      .then(() => {
        toast.success('Department deleted')
        setDeleteTarget(undefined)
      })
      .catch(() => {
        toast.error('Failed to delete department')
      })
  }

  const rows: DepartmentRow[] = departments.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description ?? '—',
  }))

  function renderActions(row: DepartmentRow): React.ReactNode {
    const dept = departments.find((d) => d.id === row.id)
    return (
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (dept) handleOpenEdit(dept)
          }}
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setDeleteTarget(dept)}
        >
          Delete
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        subtitle="Manage your product departments"
        action={
          <Button onClick={handleOpenAdd} size="sm">
            <IconPlus className="mr-1.5 h-4 w-4" />
            Add Department
          </Button>
        }
      />

      <DataTable
        columns={COLUMNS}
        rows={rows}
        isLoading={isLoading}
        emptyMessage="No departments yet. Add your first department."
        renderActions={renderActions}
      />

      <DepartmentFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        {...(editDepartment !== undefined ? { department: editDepartment } : {})}
      />

      <DeleteDialog
        open={deleteTarget !== undefined}
        title="Delete Department"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(undefined)}
        isDeleting={isDeleting}
      />
    </div>
  )
}
