'use client'

// src/features/users/hooks/useUsers.ts
// TanStack Query v5 hook for users CRUD.
// NestJS handles tenant scoping via JWT — no tenant prefix in query keys.

import { queryKeys } from '@shared/lib/query-keys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createUser as apiCreateUser,
  deleteUser as apiDeleteUser,
  fetchUsers,
  updateUser as apiUpdateUser,
} from '../api/users.api'
import type { CreateUserInput, UpdateUserInput, User } from '../types/users.types'

type UseUsersReturn = {
  users: User[]
  isLoading: boolean
  create: (input: CreateUserInput) => Promise<User>
  update: (id: string, input: UpdateUserInput) => Promise<User>
  remove: (id: string) => Promise<void>
  isCreating: boolean
  isUpdating: boolean
  isRemoving: boolean
}

export function useUsers(): UseUsersReturn {
  const qc = useQueryClient()

  const listQuery = useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: fetchUsers,
    staleTime: 5 * 60_000,
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateUserInput) => apiCreateUser(input),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.users.all() })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      apiUpdateUser(id, input),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.users.all() })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteUser(id),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.users.all() })
    },
  })

  return {
    users: listQuery.data?.items ?? [],
    isLoading: listQuery.isLoading,

    create: (input: CreateUserInput): Promise<User> =>
      createMutation.mutateAsync(input),

    update: (id: string, input: UpdateUserInput): Promise<User> =>
      updateMutation.mutateAsync({ id, input }),

    remove: (id: string): Promise<void> => deleteMutation.mutateAsync(id),

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: deleteMutation.isPending,
  }
}
