import type { CreateUserInput, UpdateUserInput } from '../schemas/users.schema'

export async function listUsers(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  const res = await fetch(`/api/users?${qs}`)
  return res.json()
}

export async function createUser(body: CreateUserInput) {
  const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return res.json()
}

export async function updateUser(id: string, body: UpdateUserInput) {
  const res = await fetch(`/api/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return res.json()
}

export async function deleteUser(id: string) {
  const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
  return res.json()
}
