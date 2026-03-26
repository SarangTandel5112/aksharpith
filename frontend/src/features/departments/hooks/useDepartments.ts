"use client";

// src/features/departments/hooks/useDepartments.ts
// Query keys omit organizationId/storeId — NestJS handles tenant scoping via JWT.

import { queryKeys } from "@shared/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDepartment as apiCreateDepartment,
  deleteDepartment as apiDeleteDepartment,
  updateDepartment as apiUpdateDepartment,
  fetchDepartments,
} from "../api/departments.api";
import type {
  CreateDepartmentInput,
  Department,
  UpdateDepartmentInput,
} from "../types/departments.types";

type UseDepartmentsReturn = {
  departments: Department[];
  isLoading: boolean;
  createDepartment: (input: CreateDepartmentInput) => Promise<Department>;
  updateDepartment: (
    id: number,
    input: UpdateDepartmentInput,
  ) => Promise<Department>;
  deleteDepartment: (id: number) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
};

export function useDepartments(): UseDepartmentsReturn {
  const qc = useQueryClient();

  const listQuery = useQuery({
    queryKey: queryKeys.departments.list(),
    queryFn: fetchDepartments,
    staleTime: 5 * 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateDepartmentInput) => apiCreateDepartment(input),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.departments.all() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateDepartmentInput }) =>
      apiUpdateDepartment(id, input),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.departments.all() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDeleteDepartment(id),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.departments.all() });
    },
  });

  return {
    departments: listQuery.data?.items ?? [],
    isLoading: listQuery.isLoading,

    createDepartment: (input: CreateDepartmentInput): Promise<Department> =>
      createMutation.mutateAsync(input),

    updateDepartment: (
      id: number,
      input: UpdateDepartmentInput,
    ): Promise<Department> => updateMutation.mutateAsync({ id, input }),

    deleteDepartment: (id: number): Promise<void> =>
      deleteMutation.mutateAsync(id),

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
