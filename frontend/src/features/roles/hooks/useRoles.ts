"use client";

// src/features/roles/hooks/useRoles.ts
// Query keys omit organizationId/storeId — NestJS handles tenant scoping via JWT.

import { queryKeys } from "@shared/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRole as apiCreateRole,
  deleteRole as apiDeleteRole,
  fetchRoles,
  updateRole as apiUpdateRole,
} from "../api/roles.api";
import type {
  CreateRoleInput,
  Role,
  UpdateRoleInput,
} from "../types/roles.types";

type UseRolesReturn = {
  roles: Role[];
  isLoading: boolean;
  createRole: (input: CreateRoleInput) => Promise<Role>;
  updateRole: (id: number, input: UpdateRoleInput) => Promise<Role>;
  deleteRole: (id: number) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
};

export function useRoles(): UseRolesReturn {
  const qc = useQueryClient();

  const listQuery = useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: fetchRoles,
    staleTime: 5 * 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateRoleInput) => apiCreateRole(input),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.roles.all() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateRoleInput }) =>
      apiUpdateRole(id, input),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.roles.all() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDeleteRole(id),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.roles.all() });
    },
  });

  return {
    roles: listQuery.data?.items ?? [],
    isLoading: listQuery.isLoading,

    createRole: (input: CreateRoleInput): Promise<Role> =>
      createMutation.mutateAsync(input),

    updateRole: (id: number, input: UpdateRoleInput): Promise<Role> =>
      updateMutation.mutateAsync({ id, input }),

    deleteRole: (id: number): Promise<void> =>
      deleteMutation.mutateAsync(id),

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
