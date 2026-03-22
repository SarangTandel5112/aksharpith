'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@shared/lib/query-keys'
import { createUser, deleteUser, listUsers, updateUser } from '../services/users.service'
import type { CreateUserInput, UpdateUserInput } from '../schemas/users.schema'

export function useUsersList(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => listUsers(params),
    staleTime: 5 * 60_000,
  })
}

export function useUserMutations() {
  const qc = useQueryClient()

  const create = useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSettled: () => { void qc.invalidateQueries({ queryKey: queryKeys.users.all() }) },
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) => updateUser(id, input),
    onSettled: () => { void qc.invalidateQueries({ queryKey: queryKeys.users.all() }) },
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSettled: () => { void qc.invalidateQueries({ queryKey: queryKeys.users.all() }) },
  })

  return { create, update, remove }
}
