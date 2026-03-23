"use client";

// src/features/admin/categories/hooks/useCategories.ts
// Query keys omit organizationId/storeId — NestJS handles tenant scoping via JWT.

import { queryKeys } from "@shared/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory as apiCreateCategory,
  deleteCategory as apiDeleteCategory,
  updateCategory as apiUpdateCategory,
  fetchCategories,
} from "../api/categories.api";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../types/categories.types";

// Thin query hook — matches the pattern used by old ProductsModule / SubCategoriesModule
// which destructure { data } directly from the TanStack Query result.
export function useCategoriesList(_params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });
}

type UseCategoriesReturn = {
  categories: Category[];
  isLoading: boolean;
  createCategory: (input: CreateCategoryInput) => Promise<Category>;
  updateCategory: (id: string, input: UpdateCategoryInput) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
};

export function useCategories(): UseCategoriesReturn {
  const qc = useQueryClient();

  const listQuery = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateCategoryInput) => apiCreateCategory(input),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.categories.all() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      apiUpdateCategory(id, input),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.categories.all() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteCategory(id),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.categories.all() });
    },
  });

  return {
    categories: listQuery.data?.items ?? [],
    isLoading: listQuery.isLoading,

    createCategory: (input: CreateCategoryInput): Promise<Category> =>
      createMutation.mutateAsync(input),

    updateCategory: (
      id: string,
      input: UpdateCategoryInput,
    ): Promise<Category> => updateMutation.mutateAsync({ id, input }),

    deleteCategory: (id: string): Promise<void> =>
      deleteMutation.mutateAsync(id),

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
