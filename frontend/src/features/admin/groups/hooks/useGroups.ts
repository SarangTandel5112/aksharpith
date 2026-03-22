'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@shared/lib/query-keys'
import { createGroup, deleteGroup, listGroups, updateGroup } from '../services/groups.service'
import type { CreateGroupInput, UpdateGroupInput } from '../schemas/groups.schema'

export function useGroupsList(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.groups.list(params),
    queryFn: () => listGroups(params),
    staleTime: 5 * 60_000,
  })
}

export function useGroupMutations() {
  const qc = useQueryClient()

  const create = useMutation({
    mutationFn: (input: CreateGroupInput) => createGroup(input),
    onSettled: () => { void qc.invalidateQueries({ queryKey: queryKeys.groups.all() }) },
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGroupInput }) => updateGroup(id, input),
    onSettled: () => { void qc.invalidateQueries({ queryKey: queryKeys.groups.all() }) },
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteGroup(id),
    onSettled: () => { void qc.invalidateQueries({ queryKey: queryKeys.groups.all() }) },
  })

  return { create, update, remove }
}
