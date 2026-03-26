import type { Product } from "@features/admin/products/types/products.types";

export type CatalogProduct = Product;

export type FilterState = {
  search: string;
  categoryId: string | null;
  departmentId: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  page: number;
  limit: number;
};

export type CatalogFiltersStore = FilterState & {
  setSearch: (search: string) => void;
  setCategoryId: (id: string | null) => void;
  setDepartmentId: (id: string | null) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  setPage: (page: number) => void;
  reset: () => void;
};
