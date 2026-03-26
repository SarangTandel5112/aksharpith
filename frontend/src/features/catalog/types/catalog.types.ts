import type { ProductResponseDto } from "@shared/contracts";

export type CatalogProduct = ProductResponseDto;

export type FilterState = {
  search: string;
  categoryId: number | null;
  departmentId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  page: number;
  limit: number;
};

export type CatalogFiltersStore = FilterState & {
  setSearch: (search: string) => void;
  setCategoryId: (id: number | null) => void;
  setDepartmentId: (id: number | null) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  setPage: (page: number) => void;
  reset: () => void;
};
