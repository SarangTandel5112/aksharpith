'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@shared/lib/query-keys'
import { fetchProductById, fetchProducts, fetchCategories, fetchDepartments } from '../services/catalog.service'
import type { FilterState } from '../types/catalog.types'

export function useProductsList(filters: Partial<FilterState>) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn:  () => fetchProducts(filters),
    staleTime: 5 * 60_000,
  })
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn:  () => fetchProductById(id),
    staleTime: 60_000,
    enabled:   id.length > 0,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn:  fetchCategories,
    staleTime: 5 * 60_000,
  })
}

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments.list(),
    queryFn:  fetchDepartments,
    staleTime: 5 * 60_000,
  })
}
