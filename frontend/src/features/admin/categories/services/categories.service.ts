import type { CreateCategoryInput, UpdateCategoryInput } from '../schemas/categories.schema'

export async function listCategories(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  const res = await fetch(`/api/categories?${qs}`)
  return res.json()
}

export async function createCategory(body: CreateCategoryInput) {
  const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return res.json()
}

export async function updateCategory(id: string, body: UpdateCategoryInput) {
  const res = await fetch(`/api/categories/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return res.json()
}

export async function deleteCategory(id: string) {
  const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
  return res.json()
}
