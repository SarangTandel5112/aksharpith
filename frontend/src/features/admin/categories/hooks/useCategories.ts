'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@shared/lib/query-keys'
import { createCategory, deleteCategory, listCategories, updateCategory } from '../services/categories.service'
import type { CreateCategoryInput, UpdateCategoryInput } from '../schemas/categories.schema'

export function useCategoriesList(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.categories.list(params),
    queryFn: () => listCategories(params),
    staleTime: 5 * 60_000,
  })
}

export function useCategoryMutations() {
  const qc = useQueryClient()

  const create = useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSettled: () => { void qc.invalidateQueries({ queryKey: queryKeys.categories.all() }) },
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) => updateCategory(id, input),
    onSettled: () => { void qc.invalidateQueries({ queryKey: queryKeys.categories.all() }) },
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSettled: () => { void qc.invalidateQueries({ queryKey: queryKeys.categories.all() }) },
  })

  return { create, update, remove }
}
