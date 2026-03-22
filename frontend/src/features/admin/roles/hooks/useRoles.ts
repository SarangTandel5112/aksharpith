'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@shared/lib/query-keys'
import { createRole, deleteRole, listRoles, updateRole } from '../services/roles.service'
import type { CreateRoleInput, UpdateRoleInput } from '../schemas/roles.schema'

export function useRolesList(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey:  queryKeys.roles.list(params),
    queryFn:   () => listRoles(params),
    staleTime: 5 * 60_000,
  })
}

export function useRoleMutations() {
  const qc = useQueryClient()

  const create = useMutation({
    mutationFn: (input: CreateRoleInput) => createRole(input),
    onSettled:  () => { void qc.invalidateQueries({ queryKey: queryKeys.roles.all() }) },
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRoleInput }) => updateRole(id, input),
    onSettled:  () => { void qc.invalidateQueries({ queryKey: queryKeys.roles.all() }) },
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSettled:  () => { void qc.invalidateQueries({ queryKey: queryKeys.roles.all() }) },
  })

  return { create, update, remove }
}
