# Coverage Baseline — 2026-03-11

Generated from `npm run coverage` (vitest v8 provider, 122 tests across 24 files).

## Summary

| Metric     | Overall |
|------------|---------|
| Lines      | 59.57%  |
| Statements | 59.57%  |
| Branches   | 75.86%  |
| Functions  | 63.35%  |

Thresholds: lines ≥ 50%, functions ≥ 50%, branches ≥ 40% — **all passing**.

---

## Full Coverage Table (src/ files only)

| File | Lines % | Functions % | Branches % | Uncovered Lines |
|------|--------:|------------:|-----------:|-----------------|
| `src/proxy.ts` | 100 | 100 | 83.33 | 45 |
| `src/config/env.ts` | 100 | 100 | 100 | — |
| `src/app/api/_lib/validate-request.ts` | 100 | 100 | 100 | — |
| `src/app/api/orders/route.ts` | 100 | 100 | 100 | — |
| `src/core/domain/order/order.factory.ts` | 100 | 100 | 93.33 | 47 |
| `src/core/infrastructure/api/api-fetch.ts` | 100 | 100 | 80 | 50-51 |
| `src/core/infrastructure/offline/catalog-sync.service.ts` | 100 | 100 | 87.5 | 39,49 |
| `src/core/infrastructure/offline/indexeddb.client.ts` | 100 | 100 | 100 | — |
| `src/core/infrastructure/offline/queue-integrity.ts` | 100 | 100 | 62.5 | 22,24-31,58 |
| `src/features/catalog/hooks/useProductSearch.ts` | 100 | 100 | 70 | 18,46-47 |
| `src/features/checkout/components/OfflineBanner.tsx` | 100 | 100 | 94.73 | 71 |
| `src/shared/hooks/useConnectivity.ts` | 100 | 50 | 100 | — |
| `src/features/checkout/hooks/useSessionGuard.ts` | 93.75 | 100 | 63.63 | 47-48 |
| `src/shared/lib/query-client.ts` | 91.66 | 100 | 75 | 26-27 |
| `src/core/infrastructure/offline/queue-writer.ts` | 89.47 | 100 | 90 | 67-72 |
| `src/features/checkout/store/cart.store.ts` | 88.09 | 66.66 | 81.25 | 48-49,52-53,63 |
| `src/shared/lib/sentry.ts` | 87.03 | 100 | 87.5 | 63-64,68-72 |
| `src/shared/lib/query-keys.ts` | 85 | 50 | 100 | 13,19,23 |
| `src/core/application/checkout/checkout.saga.ts` | 84.96 | 100 | 71.42 | 194-200,212-219 |
| `src/core/infrastructure/offline/sync.service.ts` | 83.1 | 100 | 82.6 | 124-137,176-181 |
| `src/features/checkout/hooks/useSessionGuard.ts` | 93.75 | 100 | 63.63 | 47-48 |
| `src/core/domain/shared/value-objects.ts` | 76.19 | 80 | 100 | 20-24 |
| `src/__tests__/msw/handlers/auth.handlers.ts` | 75.86 | 100 | 100 | 35-39,44,49 |
| `src/shared/lib/analytics.ts` | 69.87 | 71.42 | 100 | 13-41 |
| `src/core/infrastructure/offline/idempotency.ts` | 52 | 50 | 100 | 6-17 |
| `src/__tests__/msw/handlers/sync.handlers.ts` | 54.54 | 100 | 100 | 10-14 |
| `src/__tests__/msw/handlers/orders.handlers.ts` | 19.78 | 0 | 100 | (most of file) |
| `src/__tests__/msw/handlers/products.handlers.ts` | 15 | 0 | 100 | 8-29,35-46 |
| `src/app/layout.tsx` | 0 | 0 | 0 | 1-33 |
| `src/app/page.tsx` | 0 | 0 | 0 | 1-10 |
| `src/app/(pos)/layout.tsx` | 0 | 0 | 0 | 1-9 |
| `src/app/(pos)/catalog/error.tsx` | 0 | 0 | 0 | 1-13 |
| `src/app/(pos)/catalog/loading.tsx` | 0 | 0 | 0 | 1-11 |
| `src/app/(pos)/catalog/page.tsx` | 0 | 0 | 0 | 1-3 |
| `src/app/(pos)/checkout/error.tsx` | 0 | 0 | 0 | 1-13 |
| `src/app/(pos)/checkout/loading.tsx` | 0 | 0 | 0 | 1-11 |
| `src/app/(pos)/checkout/page.tsx` | 0 | 0 | 0 | 1-3 |
| `src/app/receipts/[id]/error.tsx` | 0 | 0 | 0 | 1-13 |
| `src/app/receipts/[id]/loading.tsx` | 0 | 0 | 0 | 1-11 |
| `src/app/receipts/[id]/page.tsx` | 0 | 0 | 0 | 1-5 |
| `src/app/api/checkout/route.ts` | 0 | 0 | 0 | 1-76 |
| `src/app/api/health/route.ts` | 0 | 0 | 0 | 1-10 |
| `src/app/api/sync/command/route.ts` | 0 | 0 | 0 | 1-59 |
| `src/app/login/error.tsx` | 0 | 0 | 0 | 1-13 |
| `src/app/login/loading.tsx` | 0 | 0 | 0 | 1-11 |
| `src/app/login/page.tsx` | 0 | 0 | 0 | 1-13 |
| `src/core/domain/order/order.repository.ts` | 0 | 0 | 0 | (whole file) |
| `src/core/domain/order/order.types.ts` | 0 | 0 | 0 | (whole file) |
| `src/core/domain/product/product.repository.ts` | 0 | 0 | 0 | (whole file) |
| `src/core/domain/product/product.types.ts` | 0 | 0 | 0 | (whole file) |
| `src/features/catalog/types/catalog.types.ts` | 0 | 0 | 0 | (whole file) |
| `src/features/checkout/hooks/useCartRestore.ts` | 0 | 0 | 0 | 1-74 |
| `src/features/checkout/hooks/useQueueStatus.ts` | 0 | 0 | 0 | 1-30 |
| `src/features/checkout/types/cart.types.ts` | 0 | 0 | 0 | (whole file) |
| `src/features/checkout/types/queue.types.ts` | 0 | 0 | 0 | (whole file) |
| `src/features/checkout/types/saga.types.ts` | 0 | 0 | 0 | (whole file) |
| `src/features/checkout/types/sync.types.ts` | 0 | 0 | 0 | (whole file) |
| `src/shared/providers/QueryProvider.tsx` | 0 | 0 | 0 | 1-16 |
| `src/shared/types/analytics.types.ts` | 0 | 0 | 0 | (whole file) |
| `src/shared/types/core.ts` | 0 | 0 | 0 | (whole file) |
| `src/shared/types/index.ts` | 0 | 0 | 0 | (whole file) |
| `src/shared/types/pagination.types.ts` | 0 | 0 | 0 | (whole file) |

---

## Analysis

### 1. Overall line coverage

**59.57%** (statements and lines are identical under v8).

### 2. Files with 0% coverage (never touched by tests)

These are real logic files with zero coverage (type-only files omitted as expected):

**App layer — Next.js pages/routes (no component tests yet):**
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/(pos)/layout.tsx`
- `src/app/(pos)/catalog/page.tsx`, `error.tsx`, `loading.tsx`
- `src/app/(pos)/checkout/page.tsx`, `error.tsx`, `loading.tsx`
- `src/app/receipts/[id]/page.tsx`, `error.tsx`, `loading.tsx`
- `src/app/login/page.tsx`, `error.tsx`, `loading.tsx`
- `src/app/api/checkout/route.ts` (76 lines — largest untested API route)
- `src/app/api/health/route.ts`
- `src/app/api/sync/command/route.ts` (59 lines)

**Feature hooks (no tests written yet):**
- `src/features/checkout/hooks/useCartRestore.ts` (74 lines)
- `src/features/checkout/hooks/useQueueStatus.ts` (30 lines)

**Shared:**
- `src/shared/providers/QueryProvider.tsx`

### 3. Lowest coverage among files WITH some tests (sorted ascending)

| File | Lines % | Notes |
|------|--------:|-------|
| `src/__tests__/msw/handlers/products.handlers.ts` | 15% | Handler fns not called directly — expected |
| `src/__tests__/msw/handlers/orders.handlers.ts` | 19.78% | Same — handler fns unused by test infra |
| `src/core/infrastructure/offline/idempotency.ts` | 52% | Lines 6-17 uncovered (import path logic) |
| `src/__tests__/msw/handlers/sync.handlers.ts` | 54.54% | Lines 10-14 uncovered |
| `src/shared/lib/analytics.ts` | 69.87% | Lines 13-41 — several event-type branches untested |
| `src/core/domain/shared/value-objects.ts` | 76.19% | Lines 20-24 — one value-object variant untested |
| `src/__tests__/msw/handlers/auth.handlers.ts` | 75.86% | Lines 35-39,44,49 — response branches |
| `src/core/infrastructure/offline/sync.service.ts` | 83.1% | Lines 124-137,176-181 — error paths |
| `src/core/application/checkout/checkout.saga.ts` | 84.96% | Lines 194-200,212-219 — rollback paths |
| `src/features/checkout/store/cart.store.ts` | 88.09% | Lines 48-49,52-53,63 — edge case actions |

> Note: The MSW handler files (products, orders) show low line % because the individual
> `faker` factory functions are never called in isolation — they are only invoked when MSW
> intercepts a matching request. This is not a real gap.
> The meaningful low-coverage targets are `idempotency.ts`, `analytics.ts`,
> `value-objects.ts`, `sync.service.ts`, and `checkout.saga.ts`.
