"use client";

import { create } from "zustand";
import type { CatalogFiltersStore } from "../types/catalog.types";

const initialState = {
  search: "",
  categoryId: null as string | null,
  departmentId: null as string | null,
  minPrice: null as number | null,
  maxPrice: null as number | null,
  page: 1,
  limit: 12,
};

export const useCatalogFiltersStore = create<CatalogFiltersStore>((set) => ({
  ...initialState,

  setSearch: (search) => set({ search, page: 1 }),
  setCategoryId: (categoryId) => set({ categoryId, page: 1 }),
  setDepartmentId: (departmentId) => set({ departmentId, page: 1 }),
  setPriceRange: (minPrice, maxPrice) => set({ minPrice, maxPrice, page: 1 }),
  setPage: (page) => set({ page }),
  reset: () => set(initialState),
}));

// Selectors
export const selectFilters = (s: CatalogFiltersStore) => ({
  search: s.search,
  categoryId: s.categoryId,
  departmentId: s.departmentId,
  minPrice: s.minPrice,
  maxPrice: s.maxPrice,
  page: s.page,
  limit: s.limit,
});
