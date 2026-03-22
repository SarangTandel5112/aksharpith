'use client'

// src/features/roles/hooks/useRoles.ts
// Stub hook for role dropdown in user forms.

import { useQuery } from '@tanstack/react-query'
import { fetchRoles } from '../api/roles.api'
import type { Role } from '../types/roles.types'

type UseRolesReturn = {
  roles: Role[]
  isLoading: boolean
}

export function useRoles(): UseRolesReturn {
  const query = useQuery({
    queryKey: ['roles', 'list', undefined],
    queryFn: fetchRoles,
    staleTime: 5 * 60_000,
  })

  return {
    roles: query.data?.items ?? [],
    isLoading: query.isLoading,
  }
}
