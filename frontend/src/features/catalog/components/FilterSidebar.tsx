"use client";

import type {
  CategoryResponseDto,
} from "@features/admin/categories/contracts/categories.contracts";
import type { DepartmentResponseDto } from "@features/departments/contracts/departments.contracts";
import { useShallow } from "zustand/react/shallow";
import { useCategories, useDepartments } from "../hooks/useProducts";
import {
  selectFilters,
  useCatalogFiltersStore,
} from "../stores/catalog-filters.store";

export function FilterSidebar(): React.JSX.Element {
  const filters = useCatalogFiltersStore(useShallow(selectFilters));
  const catsQuery = useCategories();
  const depsQuery = useDepartments();

  const categories: CategoryResponseDto[] = catsQuery.data?.data.items ?? [];
  const departments: DepartmentResponseDto[] = depsQuery.data?.data.items ?? [];

  return (
    <aside className="w-56 shrink-0 flex flex-col gap-6">
      <div>
        <label
          htmlFor="filter-search"
          className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 block"
        >
          Search
        </label>
        <input
          id="filter-search"
          type="search"
          value={filters.search}
          onChange={(e) =>
            useCatalogFiltersStore.getState().setSearch(e.target.value)
          }
          placeholder="Search products…"
          className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--bg-dark-2)] px-3 py-2 text-sm text-[var(--text-body)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary-500)] outline-none"
        />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
          Category
        </p>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() =>
              useCatalogFiltersStore.getState().setCategoryId(null)
            }
            className={`text-left text-sm px-2 py-1 rounded ${filters.categoryId === null ? "text-[var(--primary-400)] font-medium" : "text-[var(--text-body)] hover:text-[var(--text-heading)]"}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                useCatalogFiltersStore.getState().setCategoryId(cat.id)
              }
              className={`text-left text-sm px-2 py-1 rounded ${filters.categoryId === cat.id ? "text-[var(--primary-400)] font-medium" : "text-[var(--text-body)] hover:text-[var(--text-heading)]"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
          Department
        </p>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() =>
              useCatalogFiltersStore.getState().setDepartmentId(null)
            }
            className={`text-left text-sm px-2 py-1 rounded ${filters.departmentId === null ? "text-[var(--primary-400)] font-medium" : "text-[var(--text-body)] hover:text-[var(--text-heading)]"}`}
          >
            All Departments
          </button>
          {departments.map((dep) => (
            <button
              key={dep.id}
              type="button"
              onClick={() =>
                useCatalogFiltersStore.getState().setDepartmentId(dep.id)
              }
              className={`text-left text-sm px-2 py-1 rounded ${filters.departmentId === dep.id ? "text-[var(--primary-400)] font-medium" : "text-[var(--text-body)] hover:text-[var(--text-heading)]"}`}
            >
              {dep.name}
            </button>
          ))}
        </div>
      </div>

      {(filters.search !== "" ||
        filters.categoryId !== null ||
        filters.departmentId !== null) && (
        <button
          type="button"
          onClick={() => useCatalogFiltersStore.getState().reset()}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--color-danger)] transition-colors"
        >
          Clear all filters
        </button>
      )}
    </aside>
  );
}
