"use client";

import { useMemo } from "react";
import {
  fetchCategories,
  fetchDepartments,
  fetchProductById,
  fetchProducts,
} from "../services/catalog.service";
import type { FilterState } from "../types/catalog.types";

type StaticQueryResult<T> = {
  data: T | undefined;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
};

function buildResult<T>(data: T | undefined, error?: Error): StaticQueryResult<T> {
  return {
    data,
    isLoading: false,
    isSuccess: data !== undefined && error === undefined,
    isError: error !== undefined,
    error: error ?? null,
  };
}

export function useProductsList(
  filters: Partial<FilterState>,
): StaticQueryResult<ReturnType<typeof fetchProducts>> {
  return useMemo(
    () => buildResult(fetchProducts(filters)),
    [
      filters.search,
      filters.categoryId,
      filters.departmentId,
      filters.minPrice,
      filters.maxPrice,
      filters.page,
      filters.limit,
    ],
  );
}

export function useProductDetail(
  id: string,
): StaticQueryResult<NonNullable<ReturnType<typeof fetchProductById>>> {
  return useMemo(() => {
    if (id.length === 0) {
      return buildResult<NonNullable<ReturnType<typeof fetchProductById>>>(
        undefined,
        new Error("Missing product id"),
      );
    }

    const data = fetchProductById(id);
    return data
      ? buildResult(data)
      : buildResult<NonNullable<ReturnType<typeof fetchProductById>>>(
          undefined,
          new Error(`Product not found: ${id}`),
        );
  }, [id]);
}

export function useCategories(): StaticQueryResult<ReturnType<typeof fetchCategories>> {
  return useMemo(() => buildResult(fetchCategories()), []);
}

export function useDepartments(): StaticQueryResult<ReturnType<typeof fetchDepartments>> {
  return useMemo(() => buildResult(fetchDepartments()), []);
}
