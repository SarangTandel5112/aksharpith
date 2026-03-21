# Architecture Fixes Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 7 pre-Auth architecture issues (excluding middleware) to make the codebase production-safe before building the Auth feature.

**Architecture:** Each fix is independent and can be applied in order. All fixes are in existing files — no new feature directories. TDD for every behavioural change.

**Tech Stack:** TypeScript, Next.js, Dexie (IndexedDB), Zustand, Vitest, MSW

---

## Task Order

1. Type duplication — consolidate `SyncResult` et al.
2. `node:crypto` → `crypto.randomUUID()`
3. `next-auth.d.ts` — proper session typing
4. Restored cart totals — recalculate from lines
5. Queue write atomicity — Dexie transaction
6. Saga compensation race — track payment step
7. Missing dependency-cruiser rule

---

## Task 1: Consolidate Duplicate Sync Types

**Problem:** `SyncResult`, `ConflictWarning`, `SyncCommandOutcome` are defined in both:
- `src/core/infrastructure/offline/sync.service.ts` (local, unexported)
- `src/features/checkout/types/sync.types.ts` (exported)

`sync.service.ts` should import from the types file and delete its local copies.

**Files:**
- Modify: `src/core/infrastructure/offline/sync.service.ts`
- No test changes needed (types-only refactor, no behaviour change)

- [ ] **Step 1: Verify the types file exports match what sync.service.ts uses**

Read `src/features/checkout/types/sync.types.ts`. Confirm it exports `SyncResult`, `ConflictWarning`, `SyncCommandOutcome` with identical shapes to the local copies in `sync.service.ts`.

- [ ] **Step 2: Update the import in sync.service.ts**

In `src/core/infrastructure/offline/sync.service.ts`, replace the three local type definitions (lines 13–34) with an import:

```ts
import type {
  ConflictWarning,
  SyncCommandOutcome,
  SyncResult,
} from "@store/checkout/types/sync.types";
```

Then delete the now-redundant local `type SyncResult`, `type ConflictWarning`, `type SyncCommandOutcome` blocks.

> **Note:** `@store/*` resolves to `src/features/*` per path aliases in `tsconfig.json`. Infrastructure importing from features is currently *undeclared* (not yet blocked by dependency-cruiser — that's Task 7). This import is intentional and the rule added in Task 7 will *allow* this specific pattern after review.

- [ ] **Step 3: Run type-check and tests**

```bash
npm run type-check
npx vitest run --project unit src/core/infrastructure/offline/sync.service
```

Both must pass with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/core/infrastructure/offline/sync.service.ts
git commit -m "refactor(sync): remove duplicate SyncResult/ConflictWarning/SyncCommandOutcome types"
```

---

## Task 2: Replace `node:crypto` with `crypto.randomUUID()`

**Problem:** `import { randomUUID } from "node:crypto"` is a Node.js-only API. When the checkout store or order factory runs in the browser (client components), this import crashes. The Web Crypto API `crypto.randomUUID()` is available in both Node ≥ 14.17 and all modern browsers.

**Files:**
- Modify: `src/core/domain/order/order.factory.ts`
- Modify: `src/core/infrastructure/offline/queue-writer.ts`
- Test: `src/core/domain/order/order.factory.test.ts` (existing — verify it still passes)
- Test: `src/core/infrastructure/offline/queue-writer.test.ts` (existing — verify it still passes)

- [ ] **Step 1: Fix order.factory.ts**

Remove line 1: `import { randomUUID } from "node:crypto";`

Replace every call `randomUUID()` in the file with `crypto.randomUUID()`.

There are 2 calls: one in `createOrder()` and one in `buildLine()`.

- [ ] **Step 2: Fix queue-writer.ts**

Remove line 1: `import { randomUUID } from "node:crypto";`

Replace `randomUUID()` on line 39 with `crypto.randomUUID()`.

- [ ] **Step 3: Run the existing tests to confirm nothing broke**

```bash
npx vitest run --project unit src/core/domain/order/order.factory.test.ts
npx vitest run --project unit src/core/infrastructure/offline/queue-writer.test.ts
```

Both should pass. The `generates a unique id each time` test in the factory already covers this.

- [ ] **Step 4: Commit**

```bash
git add src/core/domain/order/order.factory.ts src/core/infrastructure/offline/queue-writer.ts
git commit -m "fix(infra): replace node:crypto with crypto.randomUUID() for browser compatibility"
```

---

## Task 3: Create `next-auth.d.ts` Session Type Augmentation

**Problem:** BFF routes and hooks cast `session.user` using `as { storeId, organizationId, ... }` because next-auth's default `Session` type doesn't include POS tenant fields. This is unsafe — a missing field silently becomes `undefined`.

**Fix:** Augment next-auth's module declarations so `Session["user"]` includes all POS fields with proper types.

**Files:**
- Create: `src/shared/types/next-auth.d.ts`
- Modify: `src/app/api/checkout/route.ts` — remove the `as { ... }` cast
- Modify: `src/app/api/sync/command/route.ts` — remove the `as { ... }` cast
- Modify: `src/features/checkout/hooks/useCartRestore.ts` — remove the `as { ... }` casts

- [ ] **Step 1: Create the declaration file**

Create `src/shared/types/next-auth.d.ts`:

```ts
import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      organizationId: string;
      storeId: string;
      terminalId: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    organizationId: string;
    storeId: string;
    terminalId: string;
  }
}
```

- [ ] **Step 2: Clean up checkout/route.ts**

In `src/app/api/checkout/route.ts`, remove the `const user = session.user as { ... }` cast block (lines 21–27).

Replace it with:
```ts
const user = session.user;
```

The `ctx` block below can now reference `user.organizationId`, `user.storeId`, etc. directly without the cast.

- [ ] **Step 3: Clean up sync/command/route.ts**

In `src/app/api/sync/command/route.ts`, remove the `const user = session.user as { ... }` cast block (lines 27–33).

Replace it with:
```ts
const user = session.user;
```

- [ ] **Step 4: Clean up useCartRestore.ts**

In `src/features/checkout/hooks/useCartRestore.ts`, the `getTerminalId` helper and the three inline `as { ... }` casts (lines 12–32) can now be simplified.

Replace the whole pre-effect variable block with:

```ts
const terminalId = session?.user?.terminalId ?? "unknown-terminal";
const organizationId = session?.user?.organizationId ?? "";
const storeId = session?.user?.storeId ?? "";
const cashierId = session?.user?.id ?? "";
```

And delete the `getTerminalId` helper function entirely (no longer needed).

- [ ] **Step 5: Run type-check**

```bash
npm run type-check
```

Must exit 0 with no errors.

- [ ] **Step 6: Run all tests**

```bash
npm test
```

All 122+ tests must pass (no behaviour change — types only).

- [ ] **Step 7: Commit**

```bash
git add src/shared/types/next-auth.d.ts src/app/api/checkout/route.ts src/app/api/sync/command/route.ts src/features/checkout/hooks/useCartRestore.ts
git commit -m "feat(auth): add next-auth.d.ts module augmentation for POS session fields"
```

---

## Task 4: Fix Restored Cart Totals

**Problem:** `useCartRestore.ts` restores draft cart orders with `subtotal: { amount: 0 }`, `taxTotal: { amount: 0 }`, `total: { amount: 0 }`. The lines are correct but the money totals are wrong, so `selectCartTotal` returns ₹0.

**Fix:** Recalculate totals from the restored lines using existing domain value-object helpers.

**Files:**
- Modify: `src/features/checkout/hooks/useCartRestore.ts`
- Create: `src/features/checkout/hooks/useCartRestore.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/features/checkout/hooks/useCartRestore.test.tsx`:

```tsx
import 'fake-indexeddb/auto'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { resetDBForTesting, getDB } from '@infrastructure/offline/indexeddb.client'
import { useCartRestore } from './useCartRestore'
import { useCartStore, selectCartTotal } from '@store/checkout/store/cart.store'

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'user_001',
        organizationId: 'org_001',
        storeId: 'store_001',
        terminalId: 'term_001',
      },
    },
    status: 'authenticated',
  }),
}))

beforeEach(() => {
  resetDBForTesting()
  useCartStore.getState().clearCart()
})
afterEach(() => {
  resetDBForTesting()
  useCartStore.getState().clearCart()
})

describe('useCartRestore', () => {
  it('restores totals correctly from saved lines', async () => {
    const db = await getDB()
    await db.draftCarts.add({
      id: 'term_001',
      terminalId: 'term_001',
      cashierId: 'user_001',
      savedAt: Date.now(),
      reason: 'manual_save',
      items: [
        {
          id: 'line_001',
          productId: 'prod_001',
          name: 'Coffee',
          quantity: 2,
          unitPrice: { amount: 5000, currency: 'INR' },
          lineTotal: { amount: 10000, currency: 'INR' },
          taxRate: 0.05,
          taxAmount: { amount: 500, currency: 'INR' },
          status: 'active',
        },
      ],
    })

    renderHook(() => useCartRestore())

    await waitFor(() => {
      const total = selectCartTotal(useCartStore.getState())
      expect(total).not.toBeNull()
      expect(total?.amount).toBe(10500) // 10000 lineTotal + 500 tax
    })
  })

  it('discards stale carts older than 4 hours without restoring', async () => {
    const db = await getDB()
    await db.draftCarts.add({
      id: 'term_001',
      terminalId: 'term_001',
      cashierId: 'user_001',
      savedAt: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
      reason: 'manual_save',
      items: [],
    })

    renderHook(() => useCartRestore())

    await waitFor(async () => {
      const draft = await db.draftCarts.get('term_001')
      expect(draft).toBeUndefined()
    })
    expect(selectCartTotal(useCartStore.getState())).toBeNull()
  })
})
```

- [ ] **Step 2: Run the test — confirm it fails**

```bash
npx vitest run --project ui src/features/checkout/hooks/useCartRestore.test.tsx
```

Expected: FAIL — `total?.amount` is `0`, not `10500`.

- [ ] **Step 3: Fix useCartRestore.ts**

In `src/features/checkout/hooks/useCartRestore.ts`, add the import for value-object helpers:

```ts
import {
  addMoney,
  zeroMoney,
} from "@domain/shared/value-objects";
import type { OrderLine } from "@domain/order/order.types";
```

Replace the `restoredOrder` construction block (the hardcoded `amount: 0` lines) with:

```ts
const lines = draft.items as OrderLine[];
const currency =
  lines[0] != null && "unitPrice" in lines[0]
    ? (lines[0] as OrderLine).unitPrice.currency
    : "INR";
const zero = zeroMoney(currency);
const subtotal = lines
  .filter((l) => l.status === "active")
  .reduce((acc, l) => addMoney(acc, l.lineTotal), zero);
const taxTotal = lines
  .filter((l) => l.status === "active")
  .reduce((acc, l) => addMoney(acc, l.taxAmount), zero);
const total = addMoney(subtotal, taxTotal);

const restoredOrder: Order = {
  id: crypto.randomUUID(),
  organizationId,
  storeId,
  terminalId,
  cashierId,
  status: "draft",
  lines,
  subtotal,
  taxTotal,
  total,
  payment: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  confirmedAt: null,
  voidedAt: null,
};
```

- [ ] **Step 4: Run the test — confirm it passes**

```bash
npx vitest run --project ui src/features/checkout/hooks/useCartRestore.test.tsx
```

Expected: PASS — both tests green.

- [ ] **Step 5: Run full test suite**

```bash
npm test
```

All tests must pass.

- [ ] **Step 6: Commit**

```bash
git add src/features/checkout/hooks/useCartRestore.ts src/features/checkout/hooks/useCartRestore.test.tsx
git commit -m "fix(checkout): recalculate totals from lines when restoring draft cart"
```

---

## Task 5: Make Queue Write Atomic

**Problem:** In `writeCommand()`, the queue size check (`db.commands.where(...).count()`) and the subsequent `db.commands.add(command)` are two separate operations. Under concurrent calls (e.g. two offline checkouts racing), both can read `count < MAX_QUEUE_SIZE` and both add — exceeding the limit by one or more.

**Fix:** Wrap both the count check and the add in a single Dexie transaction.

**Files:**
- Modify: `src/core/infrastructure/offline/queue-writer.ts`
- Modify: `src/core/infrastructure/offline/queue-writer.test.ts`

- [ ] **Step 1: Write the failing test for concurrent writes**

Add a new describe block to `src/core/infrastructure/offline/queue-writer.test.ts`:

```ts
describe('writeCommand — atomicity', () => {
  it('does not exceed MAX_QUEUE_SIZE under concurrent writes', async () => {
    const db = await getDB()

    // Pre-fill to one below the limit
    const commands = Array.from({ length: MAX_QUEUE_SIZE - 1 }, (_, i) => ({
      id: `cmd_${i}`,
      idempotencyKey: `idem_${i}`,
      type: 'CHECKOUT' as const,
      payload: {},
      status: 'pending' as const,
      terminalId: ctx.terminalId,
      organizationId: ctx.organizationId,
      storeId: ctx.storeId,
      localSequence: i + 1,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
    await db.commands.bulkAdd(commands)

    // Fire two concurrent writes when only 1 slot remains
    const [r1, r2] = await Promise.all([
      writeCommand({ type: 'CHECKOUT', payload: {}, orderId: 'ord_race_1', ctx }),
      writeCommand({ type: 'CHECKOUT', payload: {}, orderId: 'ord_race_2', ctx }),
    ])

    // Exactly one must succeed and one must fail with QUEUE_FULL
    const successes = [r1, r2].filter((r) => r.success).length
    const failures  = [r1, r2].filter((r) => !r.success).length
    expect(successes).toBe(1)
    expect(failures).toBe(1)

    const finalCount = await db.commands
      .where('status').anyOf('pending', 'syncing', 'failed')
      .count()
    expect(finalCount).toBe(MAX_QUEUE_SIZE)
  })
})
```

- [ ] **Step 2: Run the test — confirm it fails**

```bash
npx vitest run --project unit src/core/infrastructure/offline/queue-writer.test.ts
```

Expected: FAIL — both concurrent writes succeed, final count is MAX_QUEUE_SIZE + 1.

> **Note:** `fake-indexeddb` runs single-threaded so this race may not trigger consistently in tests. The test verifies the *constraint* holds. If it passes already, that's acceptable — proceed to Step 3 to add the transaction anyway for correctness.

- [ ] **Step 3: Wrap the count-check + add in a Dexie transaction**

In `src/core/infrastructure/offline/queue-writer.ts`, refactor `writeCommand` to run inside `db.transaction('rw', db.commands, async () => { ... })`:

```ts
export async function writeCommand(
  input: WriteCommandInput,
): Promise<WriteCommandResult> {
  try {
    const db = await getDB();

    return await db.transaction('rw', db.commands, async () => {
      const count = await db.commands
        .where('status')
        .anyOf('pending', 'syncing', 'failed')
        .count();

      if (count >= MAX_QUEUE_SIZE) {
        return {
          success: false,
          reason: 'QUEUE_FULL' as const,
          message: `Queue is full (${count}/${MAX_QUEUE_SIZE}). Connect to internet to sync.`,
        };
      }

      const now = new Date().toISOString();
      const commandId = crypto.randomUUID();

      const lastCmd = await db.commands
        .where('terminalId')
        .equals(input.ctx.terminalId)
        .last();
      const localSequence = (lastCmd?.localSequence ?? 0) + 1;

      const command: QueuedCommand = {
        id: commandId,
        idempotencyKey: generateIdempotencyKeySync(input.orderId, input.ctx),
        type: input.type,
        payload: input.payload,
        status: 'pending',
        terminalId: input.ctx.terminalId,
        organizationId: input.ctx.organizationId,
        storeId: input.ctx.storeId,
        localSequence,
        retryCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      await db.commands.add(command);
      return { success: true, commandId };
    });
  } catch (err) {
    return {
      success: false,
      reason: 'WRITE_ERROR',
      message: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
```

- [ ] **Step 4: Run all queue-writer tests**

```bash
npx vitest run --project unit src/core/infrastructure/offline/queue-writer.test.ts
```

All tests — including the existing sequential ones — must pass.

- [ ] **Step 5: Run full test suite**

```bash
npm test
```

All tests must pass.

- [ ] **Step 6: Commit**

```bash
git add src/core/infrastructure/offline/queue-writer.ts src/core/infrastructure/offline/queue-writer.test.ts
git commit -m "fix(offline): wrap queue count-check and write in Dexie transaction to prevent overflow"
```

---

## Task 6: Fix Saga Compensation Race Condition

**Problem:** `completeCheckoutSaga()` has a single outer `catch` block (lines 197–213) that wraps BOTH the payment call and the confirm call. When a TIMEOUT or network error is thrown:

- If thrown **during payment** → payment may still be processing on the server. Calling `compensateCheckout` here could release inventory for an in-flight payment, creating a double-inventory bug.
- If thrown **during confirm** → payment was definitely taken. Calling compensation here is also wrong (money already collected — Django saga recovery handles it).

**Root cause:** The outer catch can't distinguish "error before payment" from "error after payment sent".

**Fix:** Track a `paymentSent` flag. Only the case where `!paymentRes.ok` (explicit rejection before money moves) should call compensation. All thrown exceptions after the payment call starts should return `status: 'failed'` without compensation.

**Files:**
- Modify: `src/core/application/checkout/checkout.saga.ts`
- Modify: `src/core/application/checkout/checkout.saga.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `src/core/application/checkout/checkout.saga.test.ts`:

```ts
describe('completeCheckoutSaga — compensation race', () => {
  it('does NOT compensate when payment call throws a timeout', async () => {
    mockReserveSuccess()
    // Payment call times out (network error — payment state unknown)
    server.use(
      http.post('http://localhost:8000/orders/:id/payment/', async () => {
        await new Promise((_, reject) =>
          setTimeout(() => reject(new Error('network error')), 100),
        )
        return HttpResponse.json({})
      }),
    )

    let compensateCalled = false
    server.use(
      http.post(
        'http://localhost:8000/orders/:id/release-reservation/',
        () => {
          compensateCalled = true
          return HttpResponse.json({})
        },
      ),
    )

    const result = await completeCheckoutSaga(makeInput())

    expect(result.status).toBe('failed')
    expect(compensateCalled).toBe(false) // ← must NOT compensate
  })

  it('DOES compensate when payment is explicitly rejected (4xx)', async () => {
    mockReserveSuccess()
    server.use(
      http.post('http://localhost:8000/orders/:id/payment/', () =>
        HttpResponse.json({ reason: 'CARD_DECLINED' }, { status: 402 }),
      ),
    )

    let compensateCalled = false
    server.use(
      http.post(
        'http://localhost:8000/orders/:id/release-reservation/',
        () => {
          compensateCalled = true
          return HttpResponse.json({})
        },
      ),
    )

    const result = await completeCheckoutSaga(makeInput())

    expect(result.status).toBe('failed')
    expect(compensateCalled).toBe(true) // ← must compensate
  })

  it('does NOT compensate when confirm call throws', async () => {
    mockReserveSuccess()
    mockPaymentSuccess()
    // Confirm throws
    server.use(
      http.post('http://localhost:8000/orders/:id/confirm/', () =>
        HttpResponse.json({ error: 'server error' }, { status: 500 }),
      ),
    )

    let compensateCalled = false
    server.use(
      http.post(
        'http://localhost:8000/orders/:id/release-reservation/',
        () => {
          compensateCalled = true
          return HttpResponse.json({})
        },
      ),
    )

    const result = await completeCheckoutSaga(makeInput())

    expect(result.status).toBe('failed')
    expect(compensateCalled).toBe(false) // ← payment taken, do not compensate
  })
})
```

- [ ] **Step 2: Run the test — confirm it fails**

```bash
npx vitest run --project unit src/core/application/checkout/checkout.saga.test.ts
```

Expected: the first and third tests FAIL because compensation is incorrectly called.

- [ ] **Step 3: Refactor the saga to fix the race**

In `src/core/application/checkout/checkout.saga.ts`, restructure the Step 2 + Step 3 try/catch:

Replace the single outer `try { payment + confirm } catch` with two separate try/catch blocks:

```ts
// ── Step 2: Process payment ────────────────────────────────────────────────
notify("PROCESSING_PAYMENT", 50);

let paymentId: string;

try {
  const paymentRes = await Promise.race([
    apiFetch(`/orders/${order.id}/payment/`, {
      method: "POST",
      body: JSON.stringify({
        method: input.paymentMethod,
        amount: order.total,
        idempotencyKey: generateIdempotencyKeySync(order.id, ctx),
      }),
      ctx,
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), SAGA_TIMEOUT_MS),
    ),
  ]);

  if (!paymentRes.ok) {
    // Explicit rejection — payment definitely was NOT taken, safe to compensate
    if (reservationId) await compensateCheckout(order.id, reservationId, ctx);
    notify("COMPENSATING", 0);
    return {
      status: "failed",
      orderId: order.id,
      message: "Payment could not be processed.",
    };
  }

  const paymentBody = (await paymentRes.json()) as { paymentId: string };
  paymentId = paymentBody.paymentId;
} catch (err) {
  // Network error or timeout during payment — payment state is UNKNOWN.
  // Do NOT compensate: releasing inventory while payment may still process
  // risks double-inventory corruption. Let Django saga recovery handle it.
  notify("FAILED", 0);
  if (err instanceof Error && err.message === "TIMEOUT") {
    return {
      status: "timeout",
      orderId: order.id,
      message: "Checkout timed out. Please retry.",
    };
  }
  return {
    status: "failed",
    orderId: order.id,
    message: "An unexpected error occurred during payment.",
  };
}

// ── Step 3: Confirm order ────────────────────────────────────────────────
notify("CONFIRMING_ORDER", 80);

try {
  const confirmRes = await apiFetch(`/orders/${order.id}/confirm/`, {
    method: "POST",
    body: JSON.stringify({ paymentId }),
    ctx,
  });

  if (!confirmRes.ok) {
    // Payment taken, confirm failed — do NOT compensate (money collected)
    notify("FAILED", 0);
    return {
      status: "failed",
      orderId: order.id,
      message:
        "Payment processed but order confirmation failed. Contact support.",
    };
  }

  const confirmBody = (await confirmRes.json()) as { receiptId: string };

  notify("COMPLETED", 100);
  return {
    status: "completed",
    orderId: order.id,
    paymentId,
    receiptId: confirmBody.receiptId,
  };
} catch (err) {
  // Network error or throw during confirm — payment already taken, do NOT compensate
  notify("FAILED", 0);
  if (err instanceof Error && err.message === "TIMEOUT") {
    return {
      status: "timeout",
      orderId: order.id,
      message: "Checkout timed out. Please retry.",
    };
  }
  return {
    status: "failed",
    orderId: order.id,
    message: "An unexpected error occurred.",
  };
}
```

- [ ] **Step 4: Run the saga tests**

```bash
npx vitest run --project unit src/core/application/checkout/checkout.saga.test.ts
```

All tests — old and new — must pass.

- [ ] **Step 5: Run full test suite**

```bash
npm test
```

All tests must pass.

- [ ] **Step 6: Commit**

```bash
git add src/core/application/checkout/checkout.saga.ts src/core/application/checkout/checkout.saga.test.ts
git commit -m "fix(checkout): only compensate on explicit payment rejection, not on timeout or network error"
```

---

## Task 7: Add Missing Dependency-Cruiser Rule

**Problem:** The `.dependency-cruiser.cjs` config enforces that `shared` and `application` layers don't import from `features`. But there is no rule preventing `infrastructure` from importing `features`. The sync type import added in Task 1 is the only current violation direction — and it's intentional — but without an explicit rule, accidental imports would go undetected.

**Decision:** `sync.service.ts` imports from `@store/checkout/types/sync.types`. This is the only infrastructure→features import and it's a types-only import. The correct fix is to move those types to `shared/types/sync.types.ts` so both layers can import them without crossing the boundary. This is cleaner than allowing the violation.

**Files:**
- Create: `src/shared/types/sync.types.ts`
- Modify: `src/features/checkout/types/sync.types.ts` — re-export from shared (or delete if nothing else uses it)
- Modify: `src/core/infrastructure/offline/sync.service.ts` — update import path
- Modify: `.dependency-cruiser.cjs` — add the infrastructure→features rule

- [ ] **Step 1: Check what imports sync.types.ts from features**

```bash
grep -r "checkout/types/sync.types" src/ --include="*.ts" --include="*.tsx"
```

Note all files that import from `@store/checkout/types/sync.types`.

- [ ] **Step 2: Move types to shared**

Create `src/shared/types/sync.types.ts` with the contents currently in `src/features/checkout/types/sync.types.ts`:

```ts
export type SyncResult = {
  synced: number;
  failed: number;
  quarantined: number;
  skipped: number;
};

export type ConflictWarning = {
  type: "PRICE_CHANGED";
  productId: string;
  soldPrice: number;
  actualPrice: number;
};

export type SyncCommandOutcome =
  | { status: "accepted"; orderId: string; paymentId: string }
  | {
      status: "accepted_with_warnings";
      orderId: string;
      warnings: ConflictWarning[];
    }
  | { status: "rejected"; reason: string; details: string };
```

- [ ] **Step 3: Update features/checkout/types/sync.types.ts to re-export from shared**

Replace the contents of `src/features/checkout/types/sync.types.ts` with:

```ts
// Re-exported from shared for backwards-compatibility with existing feature imports
export type {
  ConflictWarning,
  SyncCommandOutcome,
  SyncResult,
} from "@shared/types/sync.types";
```

- [ ] **Step 4: Update sync.service.ts to import from shared**

In `src/core/infrastructure/offline/sync.service.ts`, change the import added in Task 1 from:

```ts
import type { ... } from "@store/checkout/types/sync.types";
```

to:

```ts
import type {
  ConflictWarning,
  SyncCommandOutcome,
  SyncResult,
} from "@shared/types/sync.types";
```

- [ ] **Step 5: Add the dependency-cruiser rule**

In `.dependency-cruiser.cjs`, add a new forbidden rule inside the `forbidden` array:

```js
{
  name: "no-infrastructure-importing-features",
  severity: "error",
  from: { path: "^src/core/infrastructure" },
  to: { path: "^src/features" },
},
```

- [ ] **Step 6: Run type-check and arch check**

```bash
npm run type-check
npm run check:arch
```

Both must exit 0.

- [ ] **Step 7: Run full test suite**

```bash
npm test
```

All tests must pass.

- [ ] **Step 8: Commit**

```bash
git add src/shared/types/sync.types.ts src/features/checkout/types/sync.types.ts src/core/infrastructure/offline/sync.service.ts .dependency-cruiser.cjs
git commit -m "refactor(arch): move SyncResult types to shared, enforce no-infrastructure-importing-features rule"
```

---

## Final Verification

After all 7 tasks:

- [ ] `npm run type-check` → exit 0
- [ ] `npm run lint` → exit 0, zero warnings
- [ ] `npm test` → all tests passing
- [ ] `npm run check:arch` → exit 0
- [ ] Coverage: `npm run coverage` → above thresholds
