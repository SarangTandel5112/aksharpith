# 03 — Testing Rules

---

## TDD is Non-negotiable

```
RED   → Write the test. Run it. Confirm it FAILS.
GREEN → Write the minimal implementation to make it pass.
        Run it. Confirm it PASSES.
REFACTOR → Clean up. Run tests. Still green.
```

**Never write implementation before the test exists and fails.**
If you write implementation first, delete it and start with the test.

---

## Test File Location

Every implementation file gets a test file alongside it:

```
src/core/domain/order/order.factory.ts
src/core/domain/order/order.factory.test.ts   ← same folder

src/features/checkout/store/cart.store.ts
src/features/checkout/store/cart.store.test.ts ← same folder
```

---

## Two Vitest Projects

Defined in `vitest.workspace.ts`. Each project has its own environment:

| Project | Environment | Covers |
|---------|-------------|--------|
| `unit`  | node        | `src/core/**`, `src/shared/lib/**`, `src/app/**`, `src/proxy.ts` |
| `ui`    | happy-dom   | `src/features/**`, `src/shared/hooks/**` |

Run a specific project:
```bash
npx vitest run --project unit
npx vitest run --project ui
```

---

## MSW — HTTP Mocking

**All HTTP calls in tests go through MSW. No `vi.mock('fetch')` ever.**

### Handler files (already created)

```
src/__tests__/msw/handlers/
  orders.handlers.ts    → GET /orders, POST /orders, GET /orders/:id
                          POST /orders/:id/reserve/
                          POST /orders/:id/payment/
                          POST /orders/:id/confirm/
                          POST /orders/:id/release-reservation/
  products.handlers.ts  → GET /products  (product list for catalog UI)
  auth.handlers.ts      → POST /auth/login, POST /auth/logout, GET /auth/me
  sync.handlers.ts      → POST /sync/command/  ← Django path, NOT /api/sync/command
```

> **Important URL distinction:**
> - `POST /api/sync/command` — the **Next.js BFF** route (called from the browser)
> - `POST /sync/command/` — the **Django backend** route (called by `apiFetch()` inside the BFF)
> MSW intercepts Django calls. The sync handler path must be `/sync/command/` not `/api/sync/command`.

> **Catalog sync vs product search:**
> - `GET /products` — product search endpoint used by the catalog UI feature
> - `GET /catalog/` — catalog delta sync endpoint used by `catalog-sync.service.ts`
> If you write tests for `catalog-sync.service.ts`, add a `/catalog/` handler override in that test file.

Base URL for all handlers: `http://localhost:8000`

### Per-test override pattern

```ts
import { server } from '@test/msw/server'
import { http, HttpResponse } from 'msw'

it('handles 409 conflict', async () => {
  server.use(
    http.post('http://localhost:8000/orders/:id/reserve/', () =>
      HttpResponse.json(
        { reason: 'INVENTORY_CONFLICT', details: 'Out of stock' },
        { status: 409 },
      ),
    ),
  )
  // ... test
})
// Handler auto-resets after each test via afterEach → server.resetHandlers()
```

---

## IndexedDB — Dexie in Tests

```ts
// At the TOP of every test file that touches IndexedDB
import 'fake-indexeddb/auto'
import { resetDBForTesting } from '@infrastructure/offline/indexeddb.client'

// Inside the describe block
beforeEach(() => resetDBForTesting())
afterEach(()  => resetDBForTesting())
```

Never mock Dexie manually. `fake-indexeddb` runs it for real in memory.

---

## Test Structure Pattern

```ts
import { describe, it, expect, beforeEach } from 'vitest'

// ── Constants ─────────────────────────────────────────────────────────────────

const ctx = {
  organizationId: 'org_001',
  storeId:        'store_001',
  terminalId:     'term_001',
  userId:         'user_001',
}

// ── Factories ─────────────────────────────────────────────────────────────────

function makeOrder(): Order {
  return createOrder({ lines: [], ctx })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('feature name', () => {
  beforeEach(() => { /* reset state */ })

  describe('happy path', () => {
    it('does the expected thing', async () => {
      // Arrange
      const input = makeOrder()

      // Act
      const result = await doSomething(input)

      // Assert
      expect(result.status).toBe('completed')
    })
  })

  describe('error cases', () => {
    it('handles network failure', async () => {
      // ...
    })
  })
})
```

---

## What to Test

| Layer | Test focus |
|-------|-----------|
| `domain/` | Factory output shapes, value object calculations, type guards |
| `application/` | Saga step sequence, compensation on failure, offline fallback |
| `infrastructure/` | Queue write/read, sync outcomes, idempotency |
| `features/hooks/` | Hook return values, loading states, error states |
| `features/store/` | Store actions, selector outputs, state transitions |
| `features/components/` | Renders correct content, user interactions, accessibility |
| `app/api/` | Auth check, body validation, correct response codes |

---

## Common Test Utilities

### Tenant context (use this exact shape)
```ts
const ctx = {
  organizationId: 'org_001',
  storeId:        'store_001',
  terminalId:     'term_001',
  userId:         'user_001',
  accessToken:    'test-token',  // only when accessToken is needed
}
```

### Cart store reset between tests
```ts
beforeEach(() => {
  useCartStore.getState().clearCart()
})
```

### Asserting Money values
```ts
// Amount is in paise — ₹52.50 = 5250
expect(order.total.amount).toBe(5250)
expect(order.total.currency).toBe('INR')
```

---

## Known Missing Tests (write these before new features)

These implementation files have real logic but no test file yet.
Write tests for them using TDD rules above before adding new features.

| File | What to test |
|------|-------------|
| `src/app/api/checkout/route.ts` | 401 when no session, 422 on bad body, 200 on valid checkout, Django error forwarding |
| `src/app/api/sync/command/route.ts` | 401 when no session, 422 on bad body, idempotency key forwarding, Django error forwarding |
| `src/features/checkout/hooks/useCartRestore.ts` | restores order from IndexedDB on mount, no-op when nothing to restore |
| `src/features/checkout/hooks/useQueueStatus.ts` | returns pending count, updates on queue change |

Files that are intentionally untested (acceptable):
- `src/app/api/health/route.ts` -- trivial, no logic
- `src/config/env.ts` -- validated at startup, not unit-testable
- `src/core/domain/*/repository.ts` -- interface-only, no runtime code
- `src/shared/providers/QueryProvider.tsx` -- trivial wrapper
- `src/shared/types/**` -- types only, no runtime code

---

 No `any` type in tests
2. No `vi.mock` on `fetch` — use MSW handlers instead
3. No hardcoded UUIDs or timestamps — use `@faker-js/faker` or let the factory generate them
4. Every new implementation file **must** have a matching `.test.ts` file
5. Tests in `src/core/` run in Node — no DOM APIs available
6. Tests in `src/features/` run in happy-dom — browser APIs available
7. No `// @ts-ignore` or `// @ts-expect-error` in tests
