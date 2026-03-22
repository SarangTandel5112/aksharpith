import type { CreateGroupInput, UpdateGroupInput } from '../schemas/groups.schema'

export async function listGroups(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  const res = await fetch(`/api/groups?${qs}`)
  return res.json()
}

export async function createGroup(body: CreateGroupInput) {
  const res = await fetch('/api/groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return res.json()
}

export async function updateGroup(id: string, body: UpdateGroupInput) {
  const res = await fetch(`/api/groups/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return res.json()
}

export async function deleteGroup(id: string) {
  const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' })
  return res.json()
}
