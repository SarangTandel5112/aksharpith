# 02 — TypeScript Rules

---

## Non-negotiable Rules

### 1. `type` keyword only — never `interface`

```ts
// ✅ RIGHT
export type Order = {
  id:     string
  status: OrderStatus
}

// ❌ WRONG — interface can be augmented, breaks React Compiler
export interface Order {
  id:     string
}
```

### 2. No `any` — ever

```ts
// ✅ RIGHT
const body = await response.json() as { reservationId: string }

// ❌ WRONG
const body: any = await response.json()
```

### 3. No `!` assertions without a comment

```ts
// ✅ RIGHT
// Safe: array is guaranteed non-empty by the length check above
const first = items[0]!

// ❌ WRONG — silent crash risk
const first = items[0]!
```

### 4. No `enum` keyword — use `as const`

```ts
// ✅ RIGHT
export const ORDER_STATUS = {
  DRAFT:     'draft',
  CONFIRMED: 'confirmed',
  PAID:      'paid',
} as const
export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS]

// ❌ WRONG — TypeScript enums emit runtime code and are not tree-shakeable
export enum OrderStatus { Draft = 'draft' }
```

---

## Type Organisation Rules

### Where types live

| Type is used… | Put it in… |
|---------------|-----------|
| Only inside one file | Same file — do not export |
| Across a feature | `features/<feature>/types/<name>.types.ts` |
| Backend DTO contract owned by one feature/domain | `features/<feature>/contracts/<name>.contracts.ts` |
| Across the whole app | `shared/types/<name>.types.ts` |
| Only inside infrastructure | Same infrastructure file |

### Real examples from this project

```
shared/types/core.ts              -> TenantContext, Money, PaginatedResponse, Result
shared/types/validation.types.ts  -> ValidationError, FormState (shared form primitives)
shared/types/analytics.types.ts   -> AnalyticsEvent, PosEvent

features/checkout/types/
  cart.types.ts                   -> CartStatus, CartStore
  queue.types.ts                  -> QueueStatus
  saga.types.ts                   -> CheckoutSagaResult, SagaStep
  sync.types.ts                   -> SyncStatus

features/catalog/types/
  catalog.types.ts                -> CatalogProduct, SearchResult

features/auth/types/
  (empty -- add auth.types.ts here when building the auth feature)

features/admin/products/contracts/
  products.contracts.ts           -> ProductResponseDto, CreateProductDto

features/users/contracts/
  users.contracts.ts              -> UserResponseDto, CreateUserDto
```

### Never re-export types from implementation files

```ts
// ✅ RIGHT
// cart.types.ts — types live here
export type CartStatus = 'idle' | 'checkout_processing'

// cart.store.ts — imports and uses internally
import type { CartStatus } from '../types/cart.types'

// ❌ WRONG — implementation re-exporting its own types
// cart.store.ts
export type { CartStatus }
```

---

## Core Types (already in project — use these, never redefine)

These are shared across frontend and NestJS backend.

```ts
// src/shared/types/core.ts

type TenantContext = {
  organizationId: string
  storeId:        string
  terminalId:     string
  userId:         string
}

type Money = {
  amount:   number   // ← ALWAYS in paise (₹1 = 100, ₹50 = 5000)
  currency: string   // ← 'INR'
}

// NestJS pagination shape — matches PaginatedResponseDto in nest-backend
type PaginatedResponse<T> = {
  items:      T[]
  total:      number
  page:       number
  limit:      number
  totalPages: number
}

type Result<T, E = Error> =
  | { success: true;  data: T }
  | { success: false; error: E }
```

---

## Money Rules

Amounts are **always stored and passed as integers in paise**.

```ts
// ✅ RIGHT — store as paise
const price: Money = { amount: 5250, currency: 'INR' } // = ₹52.50

// Display only — use formatMoney() from @domain/shared/value-objects
import { formatMoney } from '@domain/shared/value-objects'
formatMoney({ amount: 5250, currency: 'INR' }) // → "₹52.50"

// ❌ WRONG — never store decimals
const price = { amount: 52.50, currency: 'INR' }
```

Available money utilities (already implemented):
- `addMoney(a, b)` — add two Money values
- `multiplyMoney(money, quantity)` — multiply for line totals
- `zeroMoney(currency)` — create zero value
- `formatMoney(money)` — display string (Intl.NumberFormat en-IN)
- `isPositiveMoney(money)` — guard check

---

## Importing Rules

```ts
// ✅ RIGHT — use path aliases
import type { Order } from '@domain/order/order.types'
import { apiFetch }   from '@infrastructure/api/api-fetch'
import type { CartStore } from '@features/checkout/types/cart.types'

// ❌ WRONG — relative paths that break when files move
import type { Order } from '../../../core/domain/order/order.types'
```

Always use `import type` for type-only imports.
