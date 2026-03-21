# 08 — Zustand Store Patterns

---

## When to Create a Store

A Zustand store is for **UI state that multiple components in a feature need to share**.

```
✅ Create a store when:
   - State is shared across 3+ components in the same feature
   - State needs to persist across route changes within the feature
   - State drives complex multi-step UI (e.g. checkout flow)

❌ Do NOT create a store for:
   - State that belongs in a single component (use useState)
   - Server data (use TanStack Query)
   - State only two components share (lift state or use props)
```

---

## One Store Per Feature (not per concept)

```ts
// ✅ RIGHT — one store for the whole checkout feature
features/checkout/store/cart.store.ts

// ❌ WRONG — too granular
features/checkout/store/items.store.ts
features/checkout/store/payment.store.ts
features/checkout/store/status.store.ts
```

Split a store only when it grows beyond ~10 actions. Even then, prefer one store
with clearly grouped actions over multiple stores that need to coordinate.

---

## Store File Structure

```ts
'use client'

import { create } from 'zustand'
import type { CartStore } from '../types/cart.types'

// ── Store ─────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartStore>((set, get) => ({
  // Initial state
  order:        null,
  status:       'idle',
  errorMessage: null,

  // Actions — grouped with comments
  // ── Order lifecycle ─────────────────────────────────────────────────────────
  initOrder: (ctx) => { ... },
  clearCart:  ()  => { set({ order: null, status: 'idle', errorMessage: null }) },

  // ── Item management ─────────────────────────────────────────────────────────
  addItem:    (input) => { ... },
  removeItem: (lineId) => { ... },

  // ── Status management ───────────────────────────────────────────────────────
  setStatus: (status) => { set({ status }) },
  setError:  (message) => { set({ errorMessage: message }) },
}))

// ── Selectors ─────────────────────────────────────────────────────────────────
// Export selectors at the bottom — never inline them in components

export const selectOrder       = (s: CartStore): Order | null  => s.order
export const selectCartStatus  = (s: CartStore): CartStatus    => s.status
export const selectActiveLines = (s: CartStore): OrderLine[]   =>
  s.order?.lines.filter(l => l.status === 'active') ?? []
export const selectCartTotal   = (s: CartStore): Money | null  => s.order?.total ?? null
export const selectLineCount   = (s: CartStore): number        =>
  s.order?.lines.filter(l => l.status === 'active').length ?? 0
```

---

## Selector Rules

Always use selectors — never select the whole store.

```ts
// ✅ RIGHT — precise selector, only re-renders when order changes
const order = useCartStore(selectOrder)

// ✅ RIGHT — inline selector for one-off derived values
const hasItems = useCartStore(s => (s.order?.lines.length ?? 0) > 0)

// ❌ WRONG — re-renders on ANY store change (status, error, anything)
const { order, status, errorMessage } = useCartStore()

// ❌ WRONG — whole store object
const store = useCartStore()
```

---

## Action Naming

| Pattern | Example | When |
|---------|---------|------|
| `verbNoun` | `addItem`, `removeItem` | Mutating actions |
| `setNoun` | `setStatus`, `setError` | Setting a field directly |
| `resetNoun` / `clearNoun` | `clearCart`, `resetStatus` | Clearing to initial state |
| `initNoun` | `initOrder` | Initialising a complex object |
| `restoreNoun` | `restoreOrder` | Rehydrating from stored state |

---

## Types — Always in a Separate Types File

```ts
// ✅ RIGHT — types in types/cart.types.ts
export type CartStatus =
  | 'idle'
  | 'checkout_pending'
  | 'checkout_processing'
  | 'checkout_complete'
  | 'checkout_failed'

export type CartStore = {
  // State
  order:        Order | null
  status:       CartStatus
  errorMessage: string | null
  // Actions
  initOrder:    (ctx: TenantContext) => void
  addItem:      (input: AddLineInput) => void
  // ...
}

// ❌ WRONG — types inline in store file
export const useCartStore = create<{
  order: Order | null
  addItem: (input: AddLineInput) => void
}>(() => ({ ... }))
```

---

## Testing Stores

```ts
import { useCartStore, selectActiveLines } from './cart.store'

beforeEach(() => {
  // Always reset store between tests — stores are singletons
  useCartStore.getState().clearCart()
})

it('adds item and updates total', () => {
  // Call actions directly on getState()
  useCartStore.getState().initOrder(ctx)
  useCartStore.getState().addItem(coffeeItem)

  // Read state via selectors
  const lines = selectActiveLines(useCartStore.getState())
  expect(lines).toHaveLength(1)
})
```

**Never instantiate the store in tests.** It's a singleton — call `.getState()` directly.

---

## Store vs TanStack Query

| Use store for… | Use TanStack Query for… |
|----------------|------------------------|
| Cart contents (local UI state) | Order history from server |
| Checkout step / status | Product catalog from server |
| Error messages | Session data |
| Multi-step form progress | Any data that lives on Django |
