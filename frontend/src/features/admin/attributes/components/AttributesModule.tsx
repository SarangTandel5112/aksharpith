'use client'

import { useState } from 'react'
import { useAttributesList, useAttributeMutations } from '../hooks/useAttributes'
import type { Attribute } from '../types/attributes.types'
import type { CreateAttributeInput } from '../schemas/attributes.schema'

export function AttributesModule(): React.JSX.Element {
  const { data, isLoading, isError } = useAttributesList()
  const { create, update, remove } = useAttributeMutations()
  const [editItem, setEditItem] = useState<Attribute | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  if (isLoading) return <div className="animate-pulse h-40 rounded-lg bg-[var(--surface-subtle)]" />
  if (isError) return <p className="text-sm text-[var(--color-danger)]">Failed to load attributes.</p>

  const items: Attribute[] = (data?.data?.items ?? []) as Attribute[]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[var(--text-heading)]">Attributes</h1>
        <button type="button" onClick={() => setShowCreate(true)} className="rounded-md bg-[var(--primary-500)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--primary-600)]">Add Attribute</button>
      </div>
      <div className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-page)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--surface-border)] bg-[var(--surface-subtle)]">
              <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Attribute Name</th>
              <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Values</th>
              <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Description</th>
              <th className="text-right px-4 py-3 font-medium text-[var(--text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-[var(--text-muted)]">No attributes found.</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} className="border-b border-[var(--surface-border)] last:border-0">
                <td className="px-4 py-3 font-medium text-[var(--text-heading)]">{item.attributeName}</td>
                <td className="px-4 py-3 text-[var(--text-body)]">{item.values.join(', ')}</td>
                <td className="px-4 py-3 text-[var(--text-body)]">{item.description}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setEditItem(item)} className="text-xs text-[var(--primary-500)] hover:underline">Edit</button>
                    <button type="button" onClick={() => { if (window.confirm(`Delete "${item.attributeName}"?`)) remove.mutate(item.id) }} className="text-xs text-[var(--color-danger)] hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showCreate && <AttributeForm onSubmit={(input) => create.mutate(input, { onSuccess: () => setShowCreate(false) })} onCancel={() => setShowCreate(false)} isSubmitting={create.isPending} />}
      {editItem !== null && <AttributeForm initial={editItem} onSubmit={(input) => update.mutate({ id: editItem.id, input }, { onSuccess: () => setEditItem(null) })} onCancel={() => setEditItem(null)} isSubmitting={update.isPending} />}
    </div>
  )
}

type AttributeFormProps = { initial?: Attribute; onSubmit: (input: CreateAttributeInput) => void; onCancel: () => void; isSubmitting: boolean }

function AttributeForm(props: AttributeFormProps): React.JSX.Element {
  const [attributeName, setAttributeName] = useState(props.initial?.attributeName ?? '')
  const [description, setDescription] = useState(props.initial?.description ?? '')
  const [values, setValues] = useState<string[]>(props.initial?.values ?? [''])

  function handleValueChange(index: number, value: string): void {
    const next = [...values]
    next[index] = value
    setValues(next)
  }

  function handleAddValue(): void {
    setValues([...values, ''])
  }

  function handleRemoveValue(index: number): void {
    setValues(values.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--surface-page)] rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-base font-semibold text-[var(--text-heading)] mb-4">{props.initial !== undefined ? 'Edit Attribute' : 'Create Attribute'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); props.onSubmit({ attributeName, description, values }) }} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[var(--text-muted)]">Attribute Name *</label>
            <input value={attributeName} onChange={(e) => setAttributeName(e.target.value)} className="rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[var(--text-muted)]">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[var(--text-muted)]">Values *</label>
            {values.map((val, index) => (
              <div key={index} className="flex gap-2">
                <input value={val} onChange={(e) => handleValueChange(index, e.target.value)} className="flex-1 rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]" required />
                <button type="button" onClick={() => handleRemoveValue(index)} disabled={values.length === 1} className="px-2 py-1 text-xs text-[var(--color-danger)] border border-[var(--surface-border)] rounded disabled:opacity-40">Remove</button>
              </div>
            ))}
            <button type="button" onClick={handleAddValue} className="self-start px-3 py-1.5 text-xs text-[var(--primary-500)] border border-[var(--primary-500)] rounded hover:bg-[var(--surface-subtle)]">Add Value</button>
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
