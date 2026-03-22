import type { FilterState } from '../types/catalog.types'

export function buildProductsUrl(filters: Partial<FilterState>): string {
  const qs = new URLSearchParams()
  if (filters.search)       qs.set('search',       filters.search)
  if (filters.categoryId)   qs.set('categoryId',   filters.categoryId)
  if (filters.departmentId) qs.set('departmentId', filters.departmentId)
  if (filters.minPrice !== null && filters.minPrice !== undefined)
    qs.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice !== null && filters.maxPrice !== undefined)
    qs.set('maxPrice', String(filters.maxPrice))
  if (filters.page)  qs.set('page',  String(filters.page))
  if (filters.limit) qs.set('limit', String(filters.limit))
  return `/api/products?${qs}`
}

export async function fetchProducts(filters: Partial<FilterState>) {
  const res = await fetch(buildProductsUrl(filters))
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`)
  return res.json()
}

export async function fetchProductById(id: string) {
  const res = await fetch(`/api/products/${id}`)
  if (!res.ok) throw new Error(`Product not found: ${id}`)
  return res.json()
}

export async function fetchCategories() {
  const res = await fetch('/api/categories?limit=100')
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

export async function fetchDepartments() {
  const res = await fetch('/api/departments?limit=100')
  if (!res.ok) throw new Error('Failed to fetch departments')
  return res.json()
}
