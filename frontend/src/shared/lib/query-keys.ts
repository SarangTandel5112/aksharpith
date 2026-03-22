// src/shared/lib/query-keys.ts
// No tenant scoping: NestJS handles user isolation server-side via JWT.
// See frontend/docs/superpowers/specs/2026-03-22-frontend-design.md for rationale.

export const queryKeys = {
  products: {
    all:    ()                    => ['products'] as const,
    list:   (q?: object)          => ['products', 'list', q] as const,
    detail: (id: string)          => ['products', id] as const,
  },
  categories: {
    all:    ()                    => ['categories'] as const,
    list:   (q?: object)          => ['categories', 'list', q] as const,
    detail: (id: string)          => ['categories', id] as const,
  },
  subCategories: {
    all:    ()                    => ['sub-categories'] as const,
    list:   (q?: object)          => ['sub-categories', 'list', q] as const,
    detail: (id: string)          => ['sub-categories', id] as const,
  },
  departments: {
    all:    ()                    => ['departments'] as const,
    list:   (q?: object)          => ['departments', 'list', q] as const,
    detail: (id: string)          => ['departments', id] as const,
  },
  groups: {
    all:    ()                    => ['groups'] as const,
    list:   (q?: object)          => ['groups', 'list', q] as const,
    detail: (id: string)          => ['groups', id] as const,
    fields: (groupId: string)     => ['groups', groupId, 'fields'] as const,
  },
  attributes: {
    all:    ()                    => ['attributes'] as const,
    list:   (q?: object)          => ['attributes', 'list', q] as const,
    detail: (id: string)          => ['attributes', id] as const,
  },
  roles: {
    all:    ()                    => ['roles'] as const,
    list:   (q?: object)          => ['roles', 'list', q] as const,
    detail: (id: string)          => ['roles', id] as const,
  },
  users: {
    all:    ()                    => ['users'] as const,
    list:   (q?: object)          => ['users', 'list', q] as const,
    detail: (id: string)          => ['users', id] as const,
  },
  variants: {
    all:    (productId: string)   => ['products', productId, 'variants'] as const,
    list:   (productId: string, q?: object) =>
              ['products', productId, 'variants', 'list', q] as const,
    detail: (productId: string, variantId: string) =>
              ['products', productId, 'variants', variantId] as const,
  },
} as const
