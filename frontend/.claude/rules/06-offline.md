# 06 — Offline & Sync Rules

---

## The Golden Rule: Offline-First

The POS must process transactions even with no internet.
Every checkout path must explicitly handle the offline case.

```ts
// ✅ RIGHT — always handle both cases
const result = await completeCheckoutSaga(input)

if (result.status === 'completed') {
  // online — show receipt
} else if (result.status === 'offline') {
  // offline — show provisional receipt, queue synced later
} else if (result.status === 'timeout') {
  // slow network — prompt retry
} else if (result.status === 'conflict') {
  // inventory issue — show details
} else {
  // failed — show error
}

// ❌ WRONG — only handles the happy path
const result = await completeCheckoutSaga(input)
showReceipt(result.receiptId)  // crashes when offline
```

---

## Checkout Saga Flow

```
completeCheckoutSaga()
  ├─ Online path:
  │   ├── Step 1: reserve inventory  → POST /orders/:id/reserve/
  │   │     fail → return { status: 'conflict' }
  │   ├── Step 2: process payment    → POST /orders/:id/payment/
  │   │     fail → compensate (release reservation) → return { status: 'failed' }
  │   ├── Step 3: confirm order      → POST /orders/:id/confirm/
  │   │     fail → DO NOT compensate (payment already taken) → return { status: 'failed' }
  │   └── success → return { status: 'completed', paymentId, receiptId }
  │
  └─ Offline path (useConnectivity().isOnline === false):
      └── handleOfflineCheckout()
            └── writeCommand() → IndexedDB queue → return { status: 'offline', commandId }
```

**Compensation rule:** Only release reservation if payment has NOT been taken.
If payment succeeded but confirm failed — do NOT compensate. Django saga recovery handles it.

---

## Command Queue — IndexedDB via Dexie

```ts
// ✅ RIGHT — write to queue via writeCommand()
import { writeCommand } from '@infrastructure/offline/queue-writer'

const result = await writeCommand({
  type:    'CHECKOUT',
  orderId: order.id,
  payload: { orderId, paymentMethod, lines, total, snapshot },
  ctx,
})

if (!result.success) {
  // Handle QUEUE_FULL or WRITE_ERROR
}

// ❌ WRONG — writing directly to db bypasses queue safety
const db = await getDB()
await db.commands.add({ ... })  // misses sequence numbering, idempotency key
```

Queue limits: `MAX_QUEUE_SIZE = 100` commands per terminal.
If queue is full, show "connect to internet to sync" — do NOT drop commands.

---

## Connectivity Hook

```ts
// ✅ RIGHT — always use this hook
import { useConnectivity } from '@shared/hooks/useConnectivity'
const { isOnline } = useConnectivity()

// ❌ WRONG — unreliable, fires false positives on mobile
if (navigator.onLine) { ... }
```

`useConnectivity` uses a fetch-based probe, not `navigator.onLine`.
It is the only source of truth for connectivity state in the UI.

---

## Sync Service Rules

File: `src/core/infrastructure/offline/sync.service.ts`

```
syncOfflineQueue(ctx)
  ├── Gets pending + failed commands for this terminal (filtered by terminalId)
  ├── Processes in batches of SYNC_BATCH_SIZE = 20
  ├── Per command:
  │     ├── status: 'accepted'               → markCommandSynced()  → result.synced++
  │     ├── status: 'accepted_with_warnings' → markCommandSynced()  → result.synced++
  │     ├── status: 'rejected', reason: 'DUPLICATE_COMMAND'
  │     │                                    → markCommandSynced()  → result.skipped++
  │     └── status: 'rejected' (other)       → markCommandFailed()
  │             retryCount < MAX_RETRY_COUNT (3) → status: 'failed'  → result.failed++
  │             retryCount >= MAX_RETRY_COUNT    → status: 'quarantined' → result.quarantined++
  └── Returns SyncResult { synced, failed, quarantined, skipped }
```

---

## Command Statuses

```
pending      → written to queue, not yet attempted
syncing      → currently being sent (set immediately before POST)
synced       → server accepted, done
failed       → server rejected, retryCount < 3, will retry
quarantined  → server rejected, retryCount >= 3, needs manual review
```

Never read quarantined commands in normal sync — they need human intervention.

---

## Idempotency Keys

```ts
// ✅ RIGHT — deterministic key (same order + terminal always = same key)
import { generateIdempotencyKeySync } from '@infrastructure/offline/idempotency'
const key = generateIdempotencyKeySync(orderId, ctx)

// ❌ WRONG — random key means duplicate commands on retry
const key = crypto.randomUUID()
```

The server uses the idempotency key to detect and reject duplicate commands.
`DUPLICATE_COMMAND` rejection is treated as success (already processed).

---

## Catalog Sync

File: `src/core/infrastructure/offline/catalog-sync.service.ts`

- Delta sync: fetches only products with `updatedAt` after the cursor
- Full sync: first-time only (cursor is null)
- Page size: 100 products per request
- Storage: Dexie `catalog` table, bulk upsert
- Lookup: always from local IndexedDB first — works offline

```ts
// ✅ RIGHT — search local catalog (works offline)
import { useLiveQuery } from 'dexie-react-hooks'
const results = useLiveQuery(async () => {
  const db = await getDB()
  return db.catalog
    .filter(p => p.isActive && p.name.toLowerCase().includes(query))
    .limit(20)
    .toArray()
}, [query])
```

---

## Dexie Table Queries — Always Filter by Tenant

```ts
// ✅ RIGHT
const pending = await db.commands
  .where('status').anyOf('pending', 'failed')
  .and(cmd => cmd.terminalId === ctx.terminalId)
  .sortBy('localSequence')

// ❌ WRONG — returns all terminals' commands
const pending = await db.commands
  .where('status').anyOf('pending', 'failed')
  .toArray()
```
