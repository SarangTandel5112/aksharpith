import type { CreateRoleInput, UpdateRoleInput } from '../schemas/roles.schema'

export async function listRoles(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams()
  if (params?.page)  qs.set('page',  String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  const res = await fetch(`/api/roles?${qs}`)
  return res.json()
}

export async function createRole(body: CreateRoleInput) {
  const res = await fetch('/api/roles', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  return res.json()
}

export async function updateRole(id: string, body: UpdateRoleInput) {
  const res = await fetch(`/api/roles/${id}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  return res.json()
}

export async function deleteRole(id: string) {
  const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' })
  return res.json()
}
