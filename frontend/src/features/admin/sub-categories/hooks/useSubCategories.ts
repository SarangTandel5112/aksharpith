'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@shared/lib/query-keys'
import { createSubCategory, deleteSubCategory, listSubCategories, updateSubCategory } from '../services/sub-categories.service'
import type { CreateSubCategoryInput, UpdateSubCategoryInput } from '../schemas/sub-categories.schema'

export function useSubCategoriesList(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.subCategories.list(params),
    queryFn: () => listSubCategories(params),
    staleTime: 5 * 60_000,
  })
}

export function useSubCategoryMutations() {
  const qc = useQueryClient()

  const create = useMutation({
    mutationFn: (input: CreateSubCategoryInput) => createSubCategory(input),
    onSettled: () => { void qc.invalidateQueries({ queryKey: queryKeys.subCategories.all() }) },
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSubCategoryInput }) => updateSubCategory(id, input),
    onSettled: () => { void qc.invalidateQueries({ queryKey: queryKeys.subCategories.all() }) },
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteSubCategory(id),
    onSettled: () => { void qc.invalidateQueries({ queryKey: queryKeys.subCategories.all() }) },
  })

  return { create, update, remove }
}
