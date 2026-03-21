# 09 — TanStack Query Patterns

---

## Query Keys — Always Tenant-Scoped

Every query key must start with `[organizationId, storeId]`.
This ensures one tenant's cached data never leaks into another's.

```ts
// ✅ RIGHT — tenant context first
queryKey: [ctx.organizationId, ctx.storeId, 'orders', { status: 'draft' }]
queryKey: [ctx.organizationId, ctx.storeId, 'catalog', { query: searchTerm }]
queryKey: [ctx.organizationId, ctx.storeId, 'sync', 'status', ctx.terminalId]

// ❌ WRONG — no tenant context
queryKey: ['orders']
queryKey: ['catalog', searchTerm]
```

---

## Query Keys File

All query key factories live in `src/shared/lib/query-keys.ts`.
Never inline query keys — always import from this file.

```ts
// src/shared/lib/query-keys.ts (already exists)
// Add new key factories here when building new features

export const queryKeys = {
  orders: {
    all:    (ctx: TenantContext) => [ctx.organizationId, ctx.storeId, 'orders'] as const,
    list:   (ctx: TenantContext, filters?: object) =>
              [...queryKeys.orders.all(ctx), 'list', filters] as const,
    detail: (ctx: TenantContext, id: string) =>
              [...queryKeys.orders.all(ctx), 'detail', id] as const,
  },
  catalog: {
    all:    (ctx: TenantContext) => [ctx.organizationId, ctx.storeId, 'catalog'] as const,
    search: (ctx: TenantContext, query: string) =>
              [...queryKeys.catalog.all(ctx), 'search', query] as const,
  },
}
```

---

## `useSuspenseQuery` vs `useQuery`

Use `useSuspenseQuery` inside components that are already wrapped by `<Suspense>`.
Use `useQuery` in hooks that need to handle loading/error states manually.

```tsx
// ✅ RIGHT — useSuspenseQuery in a Suspense-wrapped component
// The component becomes a pure render — no if (isLoading) needed
function OrderList(): React.JSX.Element {
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.orders.list(ctx),
    queryFn:  () => fetchOrders(ctx),
    staleTime: 30_000,
  })
  // data is always defined here — Suspense handles the loading state above
  return <ul>{data.orders.map(o => <OrderRow key={o.id} order={o} />)}</ul>
}

// ✅ RIGHT — useQuery when you need to handle states in the same component
function SyncStatus(): React.JSX.Element {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.sync.status(ctx),
    queryFn:  () => getSyncStatus(ctx),
    refetchInterval: 5_000,
  })
  if (isLoading) return <span>Checking sync...</span>
  if (isError)   return <span>Sync unavailable</span>
  return <span>{data.pendingCount} pending</span>
}
```

---

## `staleTime` Defaults

Set `staleTime` explicitly on every query. Never leave it at 0 (refetches on every focus).

| Data type | Recommended staleTime | Why |
|-----------|----------------------|-----|
| Product catalog | `5 * 60_000` (5 min) | Changes infrequently |
| Order list | `30_000` (30s) | Cashier needs recent data |
| Order detail | `60_000` (1 min) | Unlikely to change once fetched |
| Auth session | `Infinity` | next-auth manages this |
| Sync status | `10_000` (10s) | Needs to be fairly current |

```ts
// ✅ RIGHT — explicit staleTime
const { data } = useSuspenseQuery({
  queryKey:  queryKeys.catalog.search(ctx, query),
  queryFn:   () => searchProducts(ctx, query),
  staleTime: 5 * 60_000,
})

// ❌ WRONG — implicit 0 = refetch on every window focus
const { data } = useSuspenseQuery({
  queryKey: queryKeys.catalog.search(ctx, query),
  queryFn:  () => searchProducts(ctx, query),
})
```

---

## Invalidating Queries

Invalidate at the right level — not too broad, not too narrow.

```ts
const queryClient = useQueryClient()

// ✅ RIGHT — invalidate just the orders list after creating an order
queryClient.invalidateQueries({
  queryKey: queryKeys.orders.list(ctx)
})

// ✅ RIGHT — invalidate all orders for this tenant after a bulk action
queryClient.invalidateQueries({
  queryKey: queryKeys.orders.all(ctx)
})

// ❌ WRONG — invalidates every query in the cache (too broad)
queryClient.invalidateQueries()

// ❌ WRONG — invalidates across tenants (missing tenant prefix)
queryClient.invalidateQueries({ queryKey: ['orders'] })
```

---

## Mutations — Always `onSettled` for Invalidation

Use `onSettled` (not `onSuccess`) to invalidate — it runs even if the mutation fails,
keeping the cache fresh either way.

```ts
const createOrderMutation = useMutation({
  mutationFn: (input: CreateOrderInput) => createOrder(input),

  onMutate: async (newOrder) => {
    // Cancel in-flight queries to prevent race conditions
    await queryClient.cancelQueries({ queryKey: queryKeys.orders.all(ctx) })
    // Snapshot for rollback
    const previous = queryClient.getQueryData(queryKeys.orders.list(ctx))
    return { previous }
  },

  onError: (_err, _vars, context) => {
    // Roll back on error
    if (context?.previous) {
      queryClient.setQueryData(queryKeys.orders.list(ctx), context.previous)
    }
  },

  onSettled: () => {
    // Always re-fetch after mutation — success OR failure
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.all(ctx) })
  },
})
```

---

## QueryProvider

`src/shared/providers/QueryProvider.tsx` wraps the whole app in `app/layout.tsx`.
Never create a second `QueryClient` — there is exactly one per app.

```ts
// ✅ RIGHT — import the singleton query client
import { queryClient } from '@shared/lib/query-client'

// ❌ WRONG — creating a second client breaks cache sharing
const queryClient = new QueryClient()
```

---

## Logout — Clear the Cache

When a user logs out, clear all cached data to prevent data leakage between sessions.

```ts
// In your logout handler
await signOut()
queryClient.clear()  // ← removes ALL cached queries
```
