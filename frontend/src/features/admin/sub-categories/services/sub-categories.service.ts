import type { CreateSubCategoryInput, UpdateSubCategoryInput } from '../schemas/sub-categories.schema'

export async function listSubCategories(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  const res = await fetch(`/api/sub-categories?${qs}`)
  return res.json()
}

export async function createSubCategory(body: CreateSubCategoryInput) {
  const res = await fetch('/api/sub-categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return res.json()
}

export async function updateSubCategory(id: string, body: UpdateSubCategoryInput) {
  const res = await fetch(`/api/sub-categories/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return res.json()
}

export async function deleteSubCategory(id: string) {
  const res = await fetch(`/api/sub-categories/${id}`, { method: 'DELETE' })
  return res.json()
}
