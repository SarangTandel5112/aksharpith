'use client'

import { useState }                                    from 'react'
import { useDepartmentsList, useDepartmentMutations }  from '../hooks/useDepartments'
import type { Department }                             from '../types/departments.types'
import type { CreateDepartmentInput }                  from '../schemas/departments.schema'

export function DepartmentsModule(): React.JSX.Element {
  const { data, isLoading, isError }  = useDepartmentsList()
  const { create, update, remove }    = useDepartmentMutations()
  const [editItem, setEditItem]       = useState<Department | null>(null)
  const [showCreate, setShowCreate]   = useState(false)

  if (isLoading) {
    return <div className="animate-pulse h-40 rounded-lg bg-[var(--surface-subtle)]" />
  }

  if (isError) {
    return <p className="text-sm text-[var(--color-danger)]">Failed to load departments. Please refresh.</p>
  }

  const items: Department[] = (data?.data?.items ?? []) as Department[]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[var(--text-heading)]">Departments</h1>
        <button type="button" onClick={() => setShowCreate(true)}
          className="rounded-md bg-[var(--primary-500)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--primary-600)]">
          Add Department
        </button>
      </div>

      <div className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-page)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--surface-border)] bg-[var(--surface-subtle)]">
              <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Name</th>
              <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Description</th>
              <th className="text-right px-4 py-3 font-medium text-[var(--text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-8 text-[var(--text-muted)]">No departments found.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-[var(--surface-border)] last:border-0">
                  <td className="px-4 py-3 font-medium text-[var(--text-heading)]">{item.name}</td>
                  <td className="px-4 py-3 text-[var(--text-body)]">{item.description}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setEditItem(item)} className="text-xs text-[var(--primary-500)] hover:underline">Edit</button>
                      <button type="button" onClick={() => { if (window.confirm(`Delete "${item.name}"?`)) remove.mutate(item.id) }} className="text-xs text-[var(--color-danger)] hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <DepartmentForm onSubmit={(input) => create.mutate(input, { onSuccess: () => setShowCreate(false) })} onCancel={() => setShowCreate(false)} isSubmitting={create.isPending} />
      )}
      {editItem !== null && (
        <DepartmentForm initial={editItem} onSubmit={(input) => update.mutate({ id: editItem.id, input }, { onSuccess: () => setEditItem(null) })} onCancel={() => setEditItem(null)} isSubmitting={update.isPending} />
      )}
    </div>
  )
}

type DepartmentFormProps = {
  initial?:     Department
  onSubmit:     (input: CreateDepartmentInput) => void
  onCancel:     () => void
  isSubmitting: boolean
}

function DepartmentForm(props: DepartmentFormProps): React.JSX.Element {
  const [name, setName]               = useState(props.initial?.name ?? '')
  const [description, setDescription] = useState(props.initial?.description ?? '')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--surface-page)] rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-base font-semibold text-[var(--text-heading)] mb-4">
          {props.initial !== undefined ? 'Edit Department' : 'Create Department'}
        </h2>
        <form onSubmit={(e) => { e.preventDefault(); props.onSubmit({ name, description }) }} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[var(--text-muted)]">Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[var(--text-muted)]">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]" />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={props.onCancel} className="px-4 py-2 text-sm rounded border border-[var(--surface-border)] text-[var(--text-body)]">Cancel</button>
            <button type="submit" disabled={props.isSubmitting} className="px-4 py-2 text-sm rounded bg-[var(--primary-500)] text-white disabled:opacity-60">{props.isSubmitting ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
