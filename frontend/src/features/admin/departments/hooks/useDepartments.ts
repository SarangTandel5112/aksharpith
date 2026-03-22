'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@shared/lib/query-keys'
import { createDepartment, deleteDepartment, listDepartments, updateDepartment } from '../services/departments.service'
import type { CreateDepartmentInput, UpdateDepartmentInput } from '../schemas/departments.schema'

export function useDepartmentsList(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey:  queryKeys.departments.list(params),
    queryFn:   () => listDepartments(params),
    staleTime: 5 * 60_000,
  })
}

export function useDepartmentMutations() {
  const qc = useQueryClient()

  const create = useMutation({
    mutationFn: (input: CreateDepartmentInput) => createDepartment(input),
    onSettled:  () => { void qc.invalidateQueries({ queryKey: queryKeys.departments.all() }) },
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDepartmentInput }) => updateDepartment(id, input),
    onSettled:  () => { void qc.invalidateQueries({ queryKey: queryKeys.departments.all() }) },
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSettled:  () => { void qc.invalidateQueries({ queryKey: queryKeys.departments.all() }) },
  })

  return { create, update, remove }
}
