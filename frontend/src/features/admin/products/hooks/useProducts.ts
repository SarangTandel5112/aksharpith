'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@shared/lib/query-keys'
import { createProduct, deleteProduct, listProducts, updateProduct } from '../services/products.service'
import type { CreateProductInput, UpdateProductInput } from '../schemas/products.schema'

export function useProductsList(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => listProducts(params),
    staleTime: 5 * 60_000,
  })
}

export function useProductMutations() {
  const qc = useQueryClient()

  const create = useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSettled: () => { void qc.invalidateQueries({ queryKey: queryKeys.products.all() }) },
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) => updateProduct(id, input),
    onSettled: () => { void qc.invalidateQueries({ queryKey: queryKeys.products.all() }) },
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSettled: () => { void qc.invalidateQueries({ queryKey: queryKeys.products.all() }) },
  })

  return { create, update, remove }
}
