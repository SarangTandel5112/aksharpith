'use client'

import { FilterSidebar }                              from './FilterSidebar'
import { ProductGrid }                                from './ProductGrid'
import { useCatalogFiltersStore, selectFilters }      from '../stores/catalog-filters.store'
import { useProductsList }                            from '../hooks/useProducts'
import type { CatalogProduct }                        from '../types/catalog.types'

export function ProductsPanel(): React.JSX.Element {
  const filters            = useCatalogFiltersStore(selectFilters)
  const { data, isLoading } = useProductsList(filters)

  const products = (data?.data?.items ?? []) as CatalogProduct[]

  return (
    <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--text-heading)] mb-8">
        All Products
      </h1>
      <div className="flex gap-8">
        <FilterSidebar />
        <div className="flex-1">
          <ProductGrid products={products} isLoading={isLoading} />

          {data?.data !== undefined && data.data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: data.data.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => useCatalogFiltersStore.getState().setPage(p)}
                  className={`h-8 w-8 rounded text-sm ${filters.page === p ? 'bg-[var(--primary-500)] text-white' : 'border border-[var(--surface-border)] text-[var(--text-muted)] hover:text-[var(--text-body)]'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
