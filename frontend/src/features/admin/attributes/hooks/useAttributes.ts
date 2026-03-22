'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@shared/lib/query-keys'
import { createAttribute, deleteAttribute, listAttributes, updateAttribute } from '../services/attributes.service'
import type { CreateAttributeInput, UpdateAttributeInput } from '../schemas/attributes.schema'

export function useAttributesList(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.attributes.list(params),
    queryFn: () => listAttributes(params),
    staleTime: 5 * 60_000,
  })
}

export function useAttributeMutations() {
  const qc = useQueryClient()

  const create = useMutation({
    mutationFn: (input: CreateAttributeInput) => createAttribute(input),
    onSettled: () => { void qc.invalidateQueries({ queryKey: queryKeys.attributes.all() }) },
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAttributeInput }) => updateAttribute(id, input),
    onSettled: () => { void qc.invalidateQueries({ queryKey: queryKeys.attributes.all() }) },
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteAttribute(id),
    onSettled: () => { void qc.invalidateQueries({ queryKey: queryKeys.attributes.all() }) },
  })

  return { create, update, remove }
}
