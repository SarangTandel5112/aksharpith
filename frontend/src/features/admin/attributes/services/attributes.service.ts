import type { CreateAttributeInput, UpdateAttributeInput } from '../schemas/attributes.schema'

export async function listAttributes(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  const res = await fetch(`/api/attributes?${qs}`)
  return res.json()
}

export async function createAttribute(body: CreateAttributeInput) {
  const res = await fetch('/api/attributes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return res.json()
}

export async function updateAttribute(id: string, body: UpdateAttributeInput) {
  const res = await fetch(`/api/attributes/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return res.json()
}

export async function deleteAttribute(id: string) {
  const res = await fetch(`/api/attributes/${id}`, { method: 'DELETE' })
  return res.json()
}
