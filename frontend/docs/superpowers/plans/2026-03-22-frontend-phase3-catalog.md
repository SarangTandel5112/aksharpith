# Frontend Phase 3 — Customer Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the customer-facing product catalog with Aceternity UI — a dark-themed hero page, filterable product grid, and product detail page. All authenticated users can access this surface.

**Architecture:** Aceternity UI copy-paste components (BackgroundBeams, CardHoverEffect, FloatingNav) live inside `'use client'` boundaries. The catalog layout wraps `(catalog)/*` routes with a FloatingNav and ThemeToggle. TanStack Query fetches products through Next.js BFF route handlers. Zustand stores active filter state client-side.

**Tech Stack:** Next.js 16.1.6 · Aceternity UI (copy-paste) · Framer Motion 12 · TanStack Query v5 · Zustand v5 · MSW v2 · Vitest 2

**Prerequisites:** Phase 1 (foundation) and Phase 2 (admin — for BFF patterns) must be complete.

---

## File Map

| File | Purpose |
|------|---------|
| `src/features/catalog/types/catalog.types.ts` | CatalogProduct + FilterState types |
| `src/features/catalog/schemas/catalog.schema.ts` | Zod schemas for product API responses |
| `src/features/catalog/schemas/catalog.schema.test.ts` | Schema tests |
| `src/features/catalog/services/catalog.service.ts` | BFF fetch functions |
| `src/features/catalog/hooks/useProducts.ts` | TanStack Query hooks |
| `src/features/catalog/hooks/useProducts.test.ts` | Hook tests with MSW |
| `src/features/catalog/stores/catalog-filters.store.ts` | Zustand: active filter state |
| `src/features/catalog/stores/catalog-filters.store.test.ts` | Store tests |
| `src/features/catalog/components/HeroSection.tsx` | Aceternity BackgroundBeams + SpotlightEffect |
| `src/features/catalog/components/FilterSidebar.tsx` | Left-side filter panel |
| `src/features/catalog/components/ProductCard.tsx` | Aceternity CardHoverEffect wrapper |
| `src/features/catalog/components/ProductGrid.tsx` | Grid of ProductCard + empty/loading states |
| `src/features/catalog/components/ProductGrid.test.tsx` | Component tests |
| `src/features/catalog/components/ProductDetail.tsx` | Product detail view |
| `src/features/catalog/components/ProductsPanel.tsx` | `'use client'` container for products listing (filters + grid + pagination) |
| `src/shared/components/aceternity/BackgroundBeams.tsx` | Copy-paste from aceternity.com |
| `src/shared/components/aceternity/CardHoverEffect.tsx` | Copy-paste from aceternity.com |
| `src/shared/components/aceternity/FloatingNav.tsx` | Copy-paste from aceternity.com |
| `src/app/api/products/route.ts` | BFF: GET product list (already created in Phase 2) |
| `src/app/api/products/[id]/route.ts` | BFF: GET product detail (already created in Phase 2) |
| `src/app/api/categories/route.ts` | BFF: GET categories for filter sidebar |
| `src/app/api/departments/route.ts` | BFF: GET departments for filter sidebar |
| `src/app/(catalog)/layout.tsx` | FloatingNav + ThemeToggle (replaces shell from Phase 1) |
| `src/app/(catalog)/page.tsx` | Hero page with BackgroundBeams |
| `src/app/(catalog)/products/page.tsx` | Catalog listing page |
| `src/app/(catalog)/products/loading.tsx` | Grid skeleton |
| `src/app/(catalog)/products/[id]/page.tsx` | Product detail page |
| `src/app/(catalog)/products/[id]/loading.tsx` | Detail skeleton |
| `src/app/(catalog)/not-found.tsx` | Product not found |
| `src/__tests__/msw/handlers/catalog.handlers.ts` | MSW handlers for catalog endpoints |

---

## Task 0: MSW catalog handlers + Aceternity UI component files

**Files:**
- Create: `src/__tests__/msw/handlers/catalog.handlers.ts`
- Create: `src/shared/components/aceternity/BackgroundBeams.tsx`
- Create: `src/shared/components/aceternity/CardHoverEffect.tsx`
- Create: `src/shared/components/aceternity/FloatingNav.tsx`
- Modify: `src/__tests__/msw/handlers/index.ts`

- [ ] **Step 1: Create MSW catalog handlers**

```ts
// src/__tests__/msw/handlers/catalog.handlers.ts
import { faker } from '@faker-js/faker'
import { HttpResponse, http } from 'msw'

const BASE = 'http://localhost:3001'

function fakeProduct() {
  return {
    id:          faker.string.uuid(),
    name:        faker.commerce.productName(),
    sku:         faker.string.alphanumeric(8).toUpperCase(),
    description: faker.commerce.productDescription(),
    basePrice:   faker.number.float({ min: 10, max: 5000, fractionDigits: 2 }),
    category:    { id: faker.string.uuid(), name: faker.commerce.department() },
    subCategory: null,
    department:  { id: faker.string.uuid(), name: faker.commerce.department() },
    isActive:    true,
    createdAt:   faker.date.past().toISOString(),
    updatedAt:   faker.date.recent().toISOString(),
  }
}

const FAKE_PRODUCTS = Array.from({ length: 12 }, fakeProduct)

export const catalogHandlers = [
  http.get(`${BASE}/api/products`, ({ request }) => {
    const url   = new URL(request.url)
    const page  = Number(url.searchParams.get('page')  ?? 1)
    const limit = Number(url.searchParams.get('limit') ?? 12)
    const items = FAKE_PRODUCTS.slice((page - 1) * limit, page * limit)
    return HttpResponse.json({
      statusCode: 200, message: 'OK',
      data: { items, total: FAKE_PRODUCTS.length, page, limit, totalPages: 1 },
    })
  }),

  http.get(`${BASE}/api/products/:id`, ({ params }) => {
    const product = FAKE_PRODUCTS.find((p) => p.id === params['id']) ?? fakeProduct()
    return HttpResponse.json({ statusCode: 200, message: 'OK', data: product })
  }),

  http.get(`${BASE}/api/categories`, () =>
    HttpResponse.json({
      statusCode: 200, message: 'OK',
      data: {
        items: [
          { id: faker.string.uuid(), name: 'Electronics' },
          { id: faker.string.uuid(), name: 'Clothing' },
          { id: faker.string.uuid(), name: 'Books' },
        ],
        total: 3, page: 1, limit: 100, totalPages: 1,
      },
    }),
  ),

  http.get(`${BASE}/api/departments`, () =>
    HttpResponse.json({
      statusCode: 200, message: 'OK',
      data: {
        items: [
          { id: faker.string.uuid(), name: 'Retail' },
          { id: faker.string.uuid(), name: 'Wholesale' },
        ],
        total: 2, page: 1, limit: 100, totalPages: 1,
      },
    }),
  ),
]
```

- [ ] **Step 2: Update handlers index**

```ts
// src/__tests__/msw/handlers/index.ts
import { adminHandlers }   from './admin.handlers'
import { authHandlers }    from './auth.handlers'
import { catalogHandlers } from './catalog.handlers'

export const handlers = [
  ...authHandlers,
  ...adminHandlers,
  ...catalogHandlers,
]
```

- [ ] **Step 3: Create Aceternity UI components**

> **Test exemption:** The Aceternity components (`BackgroundBeams`, `CardHoverEffect`, `FloatingNav`) are intentionally exempt from the "every file needs a test" rule. They are third-party copy-paste visual components whose internals use canvas/WebGL that do not meaningfully test in happy-dom. They are consumed by feature components which ARE tested. No `.test.tsx` files are needed for files under `src/shared/components/aceternity/`.

These are copy-paste components from https://ui.aceternity.com. Run the Aceternity CLI for each, or copy the component source manually.

Install Aceternity component for BackgroundBeams:
```bash
cd frontend && npx aceternity-ui@latest add background-beams
```

If CLI fails, create the minimal version manually:

```tsx
// src/shared/components/aceternity/BackgroundBeams.tsx
'use client'

import { useEffect, useRef } from 'react'

type BackgroundBeamsProps = {
  className?: string
}

export function BackgroundBeams(props: BackgroundBeamsProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Simplified beam animation — replace with full Aceternity version
    const canvas  = canvasRef.current
    if (canvas === null) return
    const ctx     = canvas.getContext('2d')
    if (ctx === null) return
    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    let frame = 0
    let animId: number

    function draw() {
      if (ctx === null || canvas === null) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height, 0,
        canvas.width / 2, canvas.height, canvas.width * 0.8,
      )
      gradient.addColorStop(0, `rgba(59, 130, 246, ${0.15 + Math.sin(frame * 0.02) * 0.05})`)
      gradient.addColorStop(0.5, `rgba(6, 182, 212, ${0.08 + Math.cos(frame * 0.015) * 0.03})`)
      gradient.addColorStop(1, 'rgba(3, 7, 18, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      frame++
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${props.className ?? ''}`}
      aria-hidden="true"
    />
  )
}
```

```tsx
// src/shared/components/aceternity/CardHoverEffect.tsx
'use client'

import { cn } from '@shared/lib/cn'
import { useState } from 'react'

type CardItem = {
  title:       string
  description: string
  link:        string
}

type CardHoverEffectProps = {
  items:     CardItem[]
  className?: string
}

export function CardHoverEffect(props: CardHoverEffectProps): React.JSX.Element {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', props.className)}>
      {props.items.map((item, idx) => (
        <a
          key={item.link}
          href={item.link}
          className="relative group block rounded-xl border border-[var(--surface-border)] p-6 hover:border-[var(--primary-500)] transition-colors bg-[var(--surface-subtle)] hover:bg-[var(--bg-dark-2)]"
          onMouseEnter={() => setHoveredIdx(idx)}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {hoveredIdx === idx && (
            <span className="absolute inset-0 rounded-xl bg-[var(--primary-alpha-1)]" />
          )}
          <h3 className="relative text-sm font-semibold text-[var(--text-heading)] mb-1">
            {item.title}
          </h3>
          <p className="relative text-xs text-[var(--text-muted)] line-clamp-2">
            {item.description}
          </p>
        </a>
      ))}
    </div>
  )
}
```

```tsx
// src/shared/components/aceternity/FloatingNav.tsx
'use client'

import { cn }        from '@shared/lib/cn'
import Link          from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@shared/components/ThemeToggle'

type NavItem = {
  name: string
  link: string
}

type FloatingNavProps = {
  navItems:  NavItem[]
  className?: string
}

export function FloatingNav(props: FloatingNavProps): React.JSX.Element {
  const pathname = usePathname()

  return (
    <nav className={cn(
      'fixed top-4 inset-x-0 mx-auto z-50 flex max-w-2xl items-center justify-between rounded-full border border-[var(--surface-border)] bg-[var(--bg-dark-2)]/80 px-4 py-2 backdrop-blur-md shadow-lg',
      props.className,
    )}>
      <div className="flex items-center gap-1">
        {props.navItems.map((item) => (
          <Link
            key={item.link}
            href={item.link}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm transition-colors',
              pathname === item.link
                ? 'bg-[var(--primary-500)] text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text-body)]',
            )}
          >
            {item.name}
          </Link>
        ))}
      </div>
      <ThemeToggle />
    </nav>
  )
}
```

- [ ] **Step 4: Commit Aceternity components and handlers**

```bash
git add src/shared/components/aceternity/ src/__tests__/msw/handlers/
git commit -m "feat(catalog): add Aceternity UI components and MSW catalog handlers"
```

---

## Task 1: Catalog types, schemas, and filter store

**Files:**
- Create: `src/features/catalog/types/catalog.types.ts`
- Create: `src/features/catalog/schemas/catalog.schema.ts` + `.test.ts`
- Create: `src/features/catalog/stores/catalog-filters.store.ts` + `.test.ts`

- [ ] **Step 1: Create types**

```ts
// src/features/catalog/types/catalog.types.ts
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
  setSearch:      (search: string) => void
  setCategoryId:  (id: string | null) => void
  setDepartmentId:(id: string | null) => void
  setPriceRange:  (min: number | null, max: number | null) => void
  setPage:        (page: number) => void
  reset:          () => void
}
```

- [ ] **Step 2: Write schema tests (TDD — RED)**

```ts
// src/features/catalog/schemas/catalog.schema.test.ts
import { describe, expect, it } from 'vitest'
import { CatalogProductSchema } from './catalog.schema'

describe('CatalogProductSchema', () => {
  it('accepts a valid product', () => {
    const result = CatalogProductSchema.safeParse({
      id: 'p1', name: 'Test', sku: 'T-001', description: 'Desc',
      basePrice: 99.99,
      category:   { id: 'c1', name: 'Cat' },
      subCategory: null,
      department:  { id: 'd1', name: 'Dep' },
      isActive: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing name', () => {
    const result = CatalogProductSchema.safeParse({ id: 'p1', sku: 'T-001' })
    expect(result.success).toBe(false)
  })
})
```

```bash
cd frontend && npx vitest run --project ui src/features/catalog/schemas/catalog.schema.test.ts
```
Expected: FAIL — `Cannot find module './catalog.schema'`

- [ ] **Step 3: Create Zod schema (TDD — GREEN)**

```ts
// src/features/catalog/schemas/catalog.schema.ts
import { z } from 'zod'

export const CatalogProductSchema = z.object({
  id:          z.string(),
  name:        z.string(),
  sku:         z.string(),
  description: z.string(),
  basePrice:   z.number(),
  category:    z.object({ id: z.string(), name: z.string() }),
  subCategory: z.object({ id: z.string(), name: z.string() }).nullable(),
  department:  z.object({ id: z.string(), name: z.string() }),
  isActive:    z.boolean(),
  createdAt:   z.string(),
  updatedAt:   z.string(),
})

export type CatalogProductResponse = z.infer<typeof CatalogProductSchema>
```

```bash
cd frontend && npx vitest run --project ui src/features/catalog/schemas/catalog.schema.test.ts
```
Expected: 2/2 pass

- [ ] **Step 4: Write filter store tests (RED)**

```ts
// src/features/catalog/stores/catalog-filters.store.test.ts
import { describe, beforeEach, it, expect } from 'vitest'
import { useCatalogFiltersStore } from './catalog-filters.store'

beforeEach(() => useCatalogFiltersStore.getState().reset())

describe('catalog-filters.store', () => {
  it('setSearch updates search and resets page to 1', () => {
    useCatalogFiltersStore.getState().setPage(3)
    useCatalogFiltersStore.getState().setSearch('blue shirt')
    expect(useCatalogFiltersStore.getState().search).toBe('blue shirt')
    expect(useCatalogFiltersStore.getState().page).toBe(1)
  })

  it('setCategoryId updates categoryId', () => {
    useCatalogFiltersStore.getState().setCategoryId('cat-1')
    expect(useCatalogFiltersStore.getState().categoryId).toBe('cat-1')
    useCatalogFiltersStore.getState().setCategoryId(null)
    expect(useCatalogFiltersStore.getState().categoryId).toBeNull()
  })

  it('reset returns to initial state', () => {
    useCatalogFiltersStore.getState().setSearch('test')
    useCatalogFiltersStore.getState().setCategoryId('cat-1')
    useCatalogFiltersStore.getState().reset()
    expect(useCatalogFiltersStore.getState().search).toBe('')
    expect(useCatalogFiltersStore.getState().categoryId).toBeNull()
    expect(useCatalogFiltersStore.getState().page).toBe(1)
  })
})
```

```bash
cd frontend && npx vitest run --project ui src/features/catalog/stores/catalog-filters.store.test.ts
```
Expected: FAIL → create store → PASS

- [ ] **Step 5: Create filter store**

```ts
// src/features/catalog/stores/catalog-filters.store.ts
'use client'

import { create } from 'zustand'
import type { CatalogFiltersStore } from '../types/catalog.types'

const initialState = {
  search:       '',
  categoryId:   null,
  departmentId: null,
  minPrice:     null,
  maxPrice:     null,
  page:         1,
  limit:        12,
}

export const useCatalogFiltersStore = create<CatalogFiltersStore>((set) => ({
  ...initialState,

  setSearch: (search) =>
    set({ search, page: 1 }),  // reset page on new search

  setCategoryId: (categoryId) =>
    set({ categoryId, page: 1 }),

  setDepartmentId: (departmentId) =>
    set({ departmentId, page: 1 }),

  setPriceRange: (minPrice, maxPrice) =>
    set({ minPrice, maxPrice, page: 1 }),

  setPage: (page) => set({ page }),

  reset: () => set(initialState),
}))

// Selectors
export const selectFilters = (s: CatalogFiltersStore) => ({
  search:       s.search,
  categoryId:   s.categoryId,
  departmentId: s.departmentId,
  minPrice:     s.minPrice,
  maxPrice:     s.maxPrice,
  page:         s.page,
  limit:        s.limit,
})
```

- [ ] **Step 6: Run all catalog store + schema tests**

```bash
cd frontend && npx vitest run --project ui src/features/catalog/
```
Expected: all pass

- [ ] **Step 7: Commit**

```bash
git add src/features/catalog/types/ src/features/catalog/schemas/ src/features/catalog/stores/
git commit -m "feat(catalog): types, schemas, and filter store with tests"
```

---

## Task 2: Catalog service + hooks

**Files:**
- Create: `src/features/catalog/services/catalog.service.ts`
- Create: `src/features/catalog/hooks/useProducts.ts`
- Create: `src/features/catalog/hooks/useProducts.test.ts`

- [ ] **Step 1: Create catalog service (BFF fetch)**

```ts
// src/features/catalog/services/catalog.service.ts
import type { FilterState } from '../types/catalog.types'

export function buildProductsUrl(filters: Partial<FilterState>): string {
  const qs = new URLSearchParams()
  if (filters.search)       qs.set('search',       filters.search)
  if (filters.categoryId)   qs.set('categoryId',   filters.categoryId)
  if (filters.departmentId) qs.set('departmentId', filters.departmentId)
  if (filters.minPrice !== null && filters.minPrice !== undefined)
    qs.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice !== null && filters.maxPrice !== undefined)
    qs.set('maxPrice', String(filters.maxPrice))
  if (filters.page)  qs.set('page',  String(filters.page))
  if (filters.limit) qs.set('limit', String(filters.limit))
  return `/api/products?${qs}`
}

export async function fetchProducts(filters: Partial<FilterState>) {
  const res = await fetch(buildProductsUrl(filters))
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`)
  return res.json()
}

export async function fetchProductById(id: string) {
  const res = await fetch(`/api/products/${id}`)
  if (!res.ok) throw new Error(`Product not found: ${id}`)
  return res.json()
}

export async function fetchCategories() {
  const res = await fetch('/api/categories?limit=100')
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

export async function fetchDepartments() {
  const res = await fetch('/api/departments?limit=100')
  if (!res.ok) throw new Error('Failed to fetch departments')
  return res.json()
}
```

- [ ] **Step 2: Write hook tests (RED)**

```ts
// src/features/catalog/hooks/useProducts.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { useProductsList } from './useProducts'
import type { ReactNode } from 'react'

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper(props: { children: ReactNode }): React.JSX.Element {
    return <QueryClientProvider client={qc}>{props.children}</QueryClientProvider>
  }
}

describe('useProductsList', () => {
  it('returns product list data from BFF', async () => {
    const { result } = renderHook(
      () => useProductsList({}),
      { wrapper: makeWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data?.items).toBeDefined()
    expect(Array.isArray(result.current.data?.data?.items)).toBe(true)
  })

  it('starts in loading state', () => {
    const { result } = renderHook(
      () => useProductsList({}),
      { wrapper: makeWrapper() },
    )
    expect(result.current.isLoading).toBe(true)
  })
})
```

```bash
cd frontend && npx vitest run --project ui src/features/catalog/hooks/useProducts.test.ts
```
Expected: FAIL — "Cannot find module './useProducts'"

- [ ] **Step 3: Create hooks**

```ts
// src/features/catalog/hooks/useProducts.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@shared/lib/query-keys'
import { fetchProductById, fetchProducts, fetchCategories, fetchDepartments } from '../services/catalog.service'
import type { FilterState } from '../types/catalog.types'

export function useProductsList(filters: Partial<FilterState>) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn:  () => fetchProducts(filters),
    staleTime: 5 * 60_000,
  })
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn:  () => fetchProductById(id),
    staleTime: 60_000,
    enabled:   id.length > 0,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn:  fetchCategories,
    staleTime: 5 * 60_000,
  })
}

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments.list(),
    queryFn:  fetchDepartments,
    staleTime: 5 * 60_000,
  })
}
```

- [ ] **Step 4: Run hook tests (GREEN)**

```bash
cd frontend && npx vitest run --project ui src/features/catalog/hooks/useProducts.test.ts
```
Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add src/features/catalog/services/ src/features/catalog/hooks/
git commit -m "feat(catalog): catalog service and TanStack Query hooks"
```

---

## Task 3: Catalog components

**Files:**
- Create: `src/features/catalog/components/ProductCard.tsx`
- Create: `src/features/catalog/components/ProductGrid.tsx`
- Create: `src/features/catalog/components/ProductGrid.test.tsx`
- Create: `src/features/catalog/components/FilterSidebar.tsx`
- Create: `src/features/catalog/components/HeroSection.tsx`
- Create: `src/features/catalog/components/ProductDetail.tsx`

- [ ] **Step 1: Write ProductGrid tests (RED)**

```tsx
// src/features/catalog/components/ProductGrid.test.tsx
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { ProductGrid } from './ProductGrid'

function makeWrapper(qc: QueryClient) {
  return function Wrapper(props: { children: React.ReactNode }): React.JSX.Element {
    return <QueryClientProvider client={qc}>{props.children}</QueryClientProvider>
  }
}

const products = [
  {
    id: 'p1', name: 'Blue Shirt', sku: 'BS-001', description: 'Nice shirt',
    basePrice: 29.99,
    category: { id: 'c1', name: 'Clothing' },
    subCategory: null,
    department: { id: 'd1', name: 'Retail' },
    isActive: true, createdAt: '', updatedAt: '',
  },
]

describe('ProductGrid', () => {
  it('renders product cards when products are provided', () => {
    const qc = new QueryClient()
    render(<ProductGrid products={products} isLoading={false} />, {
      wrapper: makeWrapper(qc),
    })
    expect(screen.getByText('Blue Shirt')).toBeInTheDocument()
  })

  it('shows loading skeleton when isLoading is true', () => {
    const qc = new QueryClient()
    render(<ProductGrid products={[]} isLoading />, {
      wrapper: makeWrapper(qc),
    })
    expect(screen.getByTestId('product-grid-skeleton')).toBeInTheDocument()
  })

  it('shows empty state when no products', () => {
    const qc = new QueryClient()
    render(<ProductGrid products={[]} isLoading={false} />, {
      wrapper: makeWrapper(qc),
    })
    expect(screen.getByText(/no products found/i)).toBeInTheDocument()
  })
})
```

```bash
cd frontend && npx vitest run --project ui src/features/catalog/components/ProductGrid.test.tsx
```
Expected: FAIL — no component yet

- [ ] **Step 2: Create ProductCard component**

```tsx
// src/features/catalog/components/ProductCard.tsx
'use client'

import Link from 'next/link'
import type { CatalogProduct } from '../types/catalog.types'

type ProductCardProps = {
  product: CatalogProduct
}

export function ProductCard(props: ProductCardProps): React.JSX.Element {
  return (
    <Link
      href={`/products/${props.product.id}`}
      className="group relative block rounded-xl border border-[var(--surface-border)] bg-[var(--surface-subtle)] p-5 hover:border-[var(--primary-500)] hover:bg-[var(--bg-dark-2)] transition-all"
    >
      {/* Category badge */}
      <span className="inline-flex rounded-full bg-[var(--primary-alpha-1)] px-2 py-0.5 text-xs font-medium text-[var(--primary-500)] mb-3">
        {props.product.category.name}
      </span>

      {/* Product name */}
      <h3 className="font-semibold text-sm text-[var(--text-heading)] mb-1 line-clamp-2 group-hover:text-[var(--primary-400)]">
        {props.product.name}
      </h3>

      {/* SKU */}
      <p className="text-xs text-[var(--text-muted)] mb-3">{props.product.sku}</p>

      {/* Description */}
      <p className="text-xs text-[var(--text-body)] line-clamp-2 mb-4">
        {props.product.description}
      </p>

      {/* Price */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-[var(--primary-400)]">
          ₹{props.product.basePrice.toLocaleString('en-IN')}
        </span>
        <span className="text-xs text-[var(--text-muted)]">
          {props.product.department.name}
        </span>
      </div>
    </Link>
  )
}
```

- [ ] **Step 3: Create ProductGrid component**

```tsx
// src/features/catalog/components/ProductGrid.tsx
'use client'

import { ProductCard } from './ProductCard'
import type { CatalogProduct } from '../types/catalog.types'

type ProductGridProps = {
  products:  CatalogProduct[]
  isLoading: boolean
}

export function ProductGrid(props: ProductGridProps): React.JSX.Element {
  if (props.isLoading) {
    return (
      <div
        data-testid="product-grid-skeleton"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-52 rounded-xl bg-[var(--surface-subtle)] animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (props.products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-[var(--text-heading)] mb-2">
          No products found
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          Try adjusting your filters or search term.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {props.products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run ProductGrid tests (GREEN)**

```bash
cd frontend && npx vitest run --project ui src/features/catalog/components/ProductGrid.test.tsx
```
Expected: all pass

- [ ] **Step 5: Create FilterSidebar component**

```tsx
// src/features/catalog/components/FilterSidebar.tsx
'use client'

import {
  useCatalogFiltersStore,
  selectFilters,
} from '../stores/catalog-filters.store'
import { useCategories, useDepartments } from '../hooks/useProducts'

export function FilterSidebar(): React.JSX.Element {
  const { search, categoryId, departmentId } = useCatalogFiltersStore(selectFilters)
  // Actions called inline via getState() — no re-render risk
  const catsQuery = useCategories()
  const depsQuery = useDepartments()

  const categories  = catsQuery.data?.data?.items ?? []
  const departments = depsQuery.data?.data?.items ?? []

  return (
    <aside className="w-56 shrink-0 flex flex-col gap-6">
      {/* Search */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 block">
          Search
        </label>
        <input
          type="search"
          value={search}
          onChange={(e) => useCatalogFiltersStore.getState().setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--bg-dark-2)] px-3 py-2 text-sm text-[var(--text-body)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary-500)] outline-none"
        />
      </div>

      {/* Categories */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 block">
          Category
        </label>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => useCatalogFiltersStore.getState().setCategoryId(null)}
            className={`text-left text-sm px-2 py-1 rounded ${categoryId === null ? 'text-[var(--primary-400)] font-medium' : 'text-[var(--text-body)] hover:text-[var(--text-heading)]'}`}
          >
            All Categories
          </button>
          {categories.map((cat: { id: string; name: string }) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => useCatalogFiltersStore.getState().setCategoryId(cat.id)}
              className={`text-left text-sm px-2 py-1 rounded ${categoryId === cat.id ? 'text-[var(--primary-400)] font-medium' : 'text-[var(--text-body)] hover:text-[var(--text-heading)]'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Departments */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 block">
          Department
        </label>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => useCatalogFiltersStore.getState().setDepartmentId(null)}
            className={`text-left text-sm px-2 py-1 rounded ${departmentId === null ? 'text-[var(--primary-400)] font-medium' : 'text-[var(--text-body)] hover:text-[var(--text-heading)]'}`}
          >
            All Departments
          </button>
          {departments.map((dep: { id: string; name: string }) => (
            <button
              key={dep.id}
              type="button"
              onClick={() => useCatalogFiltersStore.getState().setDepartmentId(dep.id)}
              className={`text-left text-sm px-2 py-1 rounded ${departmentId === dep.id ? 'text-[var(--primary-400)] font-medium' : 'text-[var(--text-body)] hover:text-[var(--text-heading)]'}`}
            >
              {dep.name}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      {(search !== '' || categoryId !== null || departmentId !== null) && (
        <button
          type="button"
          onClick={() => useCatalogFiltersStore.getState().reset()}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--color-danger)] transition-colors"
        >
          Clear all filters
        </button>
      )}
    </aside>
  )
}
```

- [ ] **Step 6: Create HeroSection**

```tsx
// src/features/catalog/components/HeroSection.tsx
'use client'

import { BackgroundBeams } from '@shared/components/aceternity/BackgroundBeams'
import Link                from 'next/link'

export function HeroSection(): React.JSX.Element {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-[var(--bg-dark)] px-4 text-center">
      <BackgroundBeams />
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl mx-auto">
        <span className="rounded-full border border-[var(--primary-alpha-2)] bg-[var(--primary-alpha-1)] px-4 py-1 text-xs font-medium text-[var(--primary-400)]">
          Digital Catalog
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
          Aksharpith
          <span className="block text-[var(--primary-400)]">Product Catalog</span>
        </h1>
        <p className="text-base text-[var(--text-muted)] max-w-md">
          Browse our complete product range. Use filters to find exactly what you need.
        </p>
        <Link
          href="/products"
          className="rounded-full bg-[var(--primary-500)] hover:bg-[var(--primary-600)] px-6 py-3 text-sm font-semibold text-white transition-colors"
        >
          Browse Products →
        </Link>
      </div>
    </section>
  )
}
```

- [ ] **Step 7: Create ProductDetail**

```tsx
// src/features/catalog/components/ProductDetail.tsx
'use client'

import { useProductDetail } from '../hooks/useProducts'
import Link                 from 'next/link'

type ProductDetailProps = {
  productId: string
}

export function ProductDetail(props: ProductDetailProps): React.JSX.Element {
  const { data, isLoading, isError } = useProductDetail(props.productId)

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 max-w-2xl">
        <div className="h-8 bg-[var(--surface-subtle)] rounded w-2/3" />
        <div className="h-4 bg-[var(--surface-subtle)] rounded w-1/4" />
        <div className="h-24 bg-[var(--surface-subtle)] rounded" />
      </div>
    )
  }

  if (isError || data === undefined) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-[var(--color-danger)]">Failed to load product.</p>
        <Link href="/products" className="text-sm text-[var(--primary-500)] underline">
          Back to catalog
        </Link>
      </div>
    )
  }

  const product = data.data

  return (
    <article className="max-w-2xl">
      <Link href="/products" className="text-sm text-[var(--primary-500)] hover:underline mb-4 inline-block">
        ← Back to catalog
      </Link>

      <span className="inline-flex rounded-full bg-[var(--primary-alpha-1)] px-2 py-0.5 text-xs font-medium text-[var(--primary-500)] mb-3">
        {product.category?.name}
      </span>

      <h1 className="text-2xl font-bold text-[var(--text-heading)] mb-1">{product.name}</h1>
      <p className="text-sm text-[var(--text-muted)] mb-4">SKU: {product.sku}</p>

      <p className="text-3xl font-bold text-[var(--primary-400)] mb-6">
        ₹{product.basePrice?.toLocaleString('en-IN')}
      </p>

      <div className="prose-sm text-[var(--text-body)] mb-6">
        <p>{product.description}</p>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
        <span>Department: <strong className="text-[var(--text-body)]">{product.department?.name}</strong></span>
        {product.subCategory !== null && (
          <span>Sub-Category: <strong className="text-[var(--text-body)]">{product.subCategory?.name}</strong></span>
        )}
      </div>
    </article>
  )
}
```

- [ ] **Step 8: Run all catalog component tests**

```bash
cd frontend && npx vitest run --project ui src/features/catalog/
```
Expected: all pass

- [ ] **Step 9: Commit**

```bash
git add src/features/catalog/components/
git commit -m "feat(catalog): ProductCard, ProductGrid, FilterSidebar, HeroSection, ProductDetail"
```

---

## Task 4: Catalog layout + pages

**Files:**
- Modify: `src/app/(catalog)/layout.tsx`
- Modify: `src/app/(catalog)/page.tsx` → home hero
- Create: `src/app/(catalog)/products/page.tsx`
- Create: `src/app/(catalog)/products/loading.tsx`
- Create: `src/app/(catalog)/products/[id]/page.tsx`
- Create: `src/app/(catalog)/products/[id]/loading.tsx`
- Create: `src/app/(catalog)/not-found.tsx`
- Create BFF routes: `src/app/api/categories/route.ts`, `src/app/api/departments/route.ts`

- [ ] **Step 1: Create BFF route for categories**

```ts
// src/app/api/categories/route.ts
import { bffGet } from '@app/api/_lib/bff-handler'
import { type NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  return bffGet({ path: '/api/categories', request: req })
}
```

```ts
// src/app/api/departments/route.ts
import { bffGet } from '@app/api/_lib/bff-handler'
import { type NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  return bffGet({ path: '/api/departments', request: req })
}
```

- [ ] **Step 2: Update catalog layout with FloatingNav**

```tsx
// src/app/(catalog)/layout.tsx
import { FloatingNav } from '@shared/components/aceternity/FloatingNav'

const NAV_ITEMS = [
  { name: 'Home',     link: '/' },
  { name: 'Products', link: '/products' },
]

type CatalogLayoutProps = { children: React.ReactNode }

export default function CatalogLayout(props: CatalogLayoutProps): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)]">
      <FloatingNav navItems={NAV_ITEMS} />
      {props.children}
    </div>
  )
}
```

- [ ] **Step 3: Create home hero page**

```tsx
// src/app/(catalog)/page.tsx
import { HeroSection } from '@features/catalog/components/HeroSection'

export default function HomePage(): React.JSX.Element {
  return <HeroSection />
}
```

- [ ] **Step 4: Create products listing page**

> **Pages-are-shells rule:** Pages must be Server Components — no `'use client'`, no hooks. Client-side state (Zustand filters, TanStack Query) belongs in a feature component. Create `ProductsPanel.tsx` as the `'use client'` container, then make the page a thin server shell.

```tsx
// src/features/catalog/components/ProductsPanel.tsx
'use client'

import { FilterSidebar } from './FilterSidebar'
import { ProductGrid }   from './ProductGrid'
import { useCatalogFiltersStore, selectFilters } from '../stores/catalog-filters.store'
import { useProductsList } from '../hooks/useProducts'

export function ProductsPanel(): React.JSX.Element {
  const filters = useCatalogFiltersStore(selectFilters)
  const { data, isLoading } = useProductsList(filters)

  const products = data?.data?.items ?? []

  return (
    <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--text-heading)] mb-8">
        All Products
      </h1>
      <div className="flex gap-8">
        <FilterSidebar />
        <div className="flex-1">
          <ProductGrid products={products} isLoading={isLoading} />

          {/* Pagination */}
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
```

```tsx
// src/app/(catalog)/products/page.tsx
import { ProductsPanel } from '@features/catalog/components/ProductsPanel'

export default function ProductsPage(): React.JSX.Element {
  return <ProductsPanel />
}
```

- [ ] **Step 5: Create products loading skeleton**

```tsx
// src/app/(catalog)/products/loading.tsx
export default function ProductsLoading(): React.JSX.Element {
  return (
    <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
      <div className="h-8 w-40 bg-[var(--surface-subtle)] rounded animate-pulse mb-8" />
      <div className="flex gap-8">
        <div className="w-56 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 bg-[var(--surface-subtle)] rounded animate-pulse" />
          ))}
        </div>
        <div className="flex-1 grid grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-52 bg-[var(--surface-subtle)] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create product detail page**

```tsx
// src/app/(catalog)/products/[id]/page.tsx
import { ProductDetail } from '@features/catalog/components/ProductDetail'

export default async function ProductDetailPage(
  props: { params: Promise<{ id: string }> },
): Promise<React.JSX.Element> {
  const { id } = await props.params
  return (
    <div className="pt-24 px-6 pb-12 max-w-4xl mx-auto">
      <ProductDetail productId={id} />
    </div>
  )
}
```

- [ ] **Step 7: Create product detail loading**

```tsx
// src/app/(catalog)/products/[id]/loading.tsx
export default function ProductDetailLoading(): React.JSX.Element {
  return (
    <div className="pt-24 px-6 pb-12 max-w-4xl mx-auto animate-pulse space-y-4">
      <div className="h-4 w-24 bg-[var(--surface-subtle)] rounded" />
      <div className="h-8 w-64 bg-[var(--surface-subtle)] rounded" />
      <div className="h-4 w-20 bg-[var(--surface-subtle)] rounded" />
      <div className="h-10 w-32 bg-[var(--surface-subtle)] rounded" />
      <div className="h-20 bg-[var(--surface-subtle)] rounded" />
    </div>
  )
}
```

- [ ] **Step 8: Create not-found page**

```tsx
// src/app/(catalog)/not-found.tsx
import Link from 'next/link'

export default function CatalogNotFound(): React.JSX.Element {
  return (
    <div className="pt-24 px-6 flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold text-[var(--text-heading)] mb-2">Product Not Found</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        The product you are looking for does not exist or has been removed.
      </p>
      <Link
        href="/products"
        className="rounded-full bg-[var(--primary-500)] px-6 py-2.5 text-sm text-white hover:bg-[var(--primary-600)]"
      >
        Back to catalog
      </Link>
    </div>
  )
}
```

- [ ] **Step 9: Run type-check**

```bash
cd frontend && npm run type-check
```
Expected: exits 0

- [ ] **Step 10: Commit**

```bash
git add src/app/(catalog)/ src/app/api/categories/ src/app/api/departments/
git commit -m "feat(catalog): home page, product listing with filters, product detail"
```

---

## Task 5: Final Phase 3 verification

- [ ] **Step 1: Run full quality gate**

```bash
cd frontend && npm run type-check && npm run lint && npm test && npm run check:arch && npm run check:colors
```
Expected: all five exit 0

- [ ] **Step 2: Manual smoke test**

Start dev server + NestJS backend. Verify:
- `/` → hero page with BackgroundBeams gradient
- `/products` → product grid with sidebar filters
- Filter by category → grid updates without page reload
- Search → products filter instantly
- Click product → detail page with price and description
- Toggle theme → dark/light switches correctly
- Log in as Admin → `/admin/roles` accessible
- Log in as Viewer → `/admin/roles` redirects to `/unauthorized`

- [ ] **Step 3: Final commit**

```bash
git add .
git status  # verify only expected files
git commit -m "feat: complete Phase 3 customer catalog — Aceternity UI, filters, product detail"
```
