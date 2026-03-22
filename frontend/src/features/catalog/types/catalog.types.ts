export type CatalogProduct = {
  id:          string
  name:        string
  sku:         string
  description: string
  basePrice:   number
  category:    { id: string; name: string }
  subCategory: { id: string; name: string } | null
  department:  { id: string; name: string }
  isActive:    boolean
  createdAt:   string
  updatedAt:   string
}

export type FilterState = {
  search:       string
  categoryId:   string | null
  departmentId: string | null
  minPrice:     number | null
  maxPrice:     number | null
  page:         number
  limit:        number
}

export type CatalogFiltersStore = FilterState & {
  setSearch:       (search: string) => void
  setCategoryId:   (id: string | null) => void
  setDepartmentId: (id: string | null) => void
  setPriceRange:   (min: number | null, max: number | null) => void
  setPage:         (page: number) => void
  reset:           () => void
}
