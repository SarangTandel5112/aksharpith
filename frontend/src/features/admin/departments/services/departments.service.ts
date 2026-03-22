import type { CreateDepartmentInput, UpdateDepartmentInput } from '../schemas/departments.schema'

export async function listDepartments(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams()
  if (params?.page)  qs.set('page',  String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  const res = await fetch(`/api/departments?${qs}`)
  return res.json()
}

export async function createDepartment(body: CreateDepartmentInput) {
  const res = await fetch('/api/departments', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  return res.json()
}

export async function updateDepartment(id: string, body: UpdateDepartmentInput) {
  const res = await fetch(`/api/departments/${id}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  return res.json()
}

export async function deleteDepartment(id: string) {
  const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' })
  return res.json()
}
