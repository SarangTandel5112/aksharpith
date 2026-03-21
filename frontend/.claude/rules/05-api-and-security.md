# 05 — API & Security Rules

---

## All Django Calls via `apiFetch()` — Never Raw `fetch()`

```ts
// ✅ RIGHT — apiFetch attaches auth headers, trace ID, tenant context
import { apiFetch } from '@infrastructure/api/api-fetch'

const res = await apiFetch(`/orders/${orderId}/reserve/`, {
  method: 'POST',
  body:   JSON.stringify({ lines }),
  ctx,   // TenantContext + accessToken
})

// ❌ WRONG — bypasses auth, headers, error normalisation
const res = await fetch('http://localhost:8000/orders/1/reserve/', {
  headers: { Authorization: `Bearer ${token}` }
})
```

`apiFetch` automatically attaches:
- `Authorization: Bearer <accessToken>`
- `X-Organization-ID`
- `X-Store-ID`
- `X-Terminal-ID`
- `x-trace-id` (for distributed tracing)

---

## Tenant Security — `storeId` and `organizationId` from Session Only

```ts
// ✅ RIGHT — server-side: from getServerSession()
import { getServerSession } from 'next-auth'
const session = await getServerSession(authOptions)
const { storeId, organizationId } = session.user

// ✅ RIGHT — client-side: from useSession()
import { useSession } from 'next-auth/react'
const { data: session } = useSession()
const { storeId, organizationId } = session.user

// ❌ WRONG — from request body (tenant injection attack vector)
const { storeId } = await req.json()

// ❌ WRONG — from props (could be faked by caller)
function OrderList(props: { storeId: string }) { }
```

---

## BFF Route Handler Pattern

Every `app/api/` route handler must follow this exact order:

```ts
// src/app/api/orders/route.ts

import { getServerSession }    from 'next-auth'
import { authOptions }         from '@shared/lib/auth-options'
import { validateBody }        from '@app/api/_lib/validate-request'
import { CreateOrderSchema }   from '@features/checkout/schemas/order.schema'

export async function POST(req: Request): Promise<Response> {
  // Step 1 — Auth check FIRST, before reading body
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  }

  // Step 2 — Validate body with Zod
  const validation = await validateBody(req, CreateOrderSchema)
  if (!validation.success) {
    return Response.json(
      { code: 'VALIDATION_ERROR', errors: validation.errors },
      { status: 422 },
    )
  }

  // Step 3 — Tenant context from session (NEVER from body)
  const ctx = {
    organizationId: session.user.organizationId,
    storeId:        session.user.storeId,
    terminalId:     session.user.terminalId,
    userId:         session.user.id,
    accessToken:    session.accessToken,
  }

  // Step 4 — Call application layer
  const result = await createOrder({ ...validation.data, ctx })

  return Response.json(result, { status: 201 })
}
```

**Never skip steps 1 or 2. Never swap their order.**

---

## Idempotency Keys

Payment and order operations must use deterministic idempotency keys.
Never use `Date.now()` or `Math.random()` as idempotency keys.

```ts
// ✅ RIGHT — deterministic, same inputs always produce same key
// Uses generateIdempotencyKeySync() from infrastructure/offline/idempotency.ts
const key = generateIdempotencyKeySync(orderId, ctx)

// ❌ WRONG — different key on every retry = double charge risk
const key = `${orderId}-${Date.now()}`
const key = crypto.randomUUID()
```

---

## Headers That Must Be Present on Every Django Request

These are added automatically by `apiFetch()`. If you ever call `fetch()` directly
(in a non-standard context), you must add all of them manually:

```ts
headers: {
  'Content-Type':       'application/json',
  'Authorization':      `Bearer ${ctx.accessToken}`,
  'X-Organization-ID':  ctx.organizationId,  // tenant isolation
  'X-Store-ID':         ctx.storeId,          // tenant isolation
  'X-Terminal-ID':      ctx.terminalId,        // terminal identification
  'x-trace-id':         traceId,              // distributed tracing
}
```

---

## TanStack Query Keys — Tenant-Scoped

```ts
// ✅ RIGHT — organizationId + storeId are the first two elements
queryKey: [ctx.organizationId, ctx.storeId, 'orders', filters]
queryKey: [ctx.organizationId, ctx.storeId, 'catalog', { query }]

// ❌ WRONG — one tenant's data would leak into another's cache
queryKey: ['orders', filters]
```

---

## Dexie Queries — Always Filter by terminalId or storeId

```ts
// ✅ RIGHT — filtered by terminal
const commands = await db.commands
  .where('terminalId')
  .equals(ctx.terminalId)
  .toArray()

// ❌ WRONG — returns ALL terminals' data
const commands = await db.commands.toArray()
```

---

## Environment Variables

Client-accessible vars must be prefixed `NEXT_PUBLIC_`.
Never put secrets in `NEXT_PUBLIC_` vars — they are embedded in the JS bundle.

```ts
// ✅ RIGHT — secret stays server-side
env.DJANGO_API_SECRET  // server only, never NEXT_PUBLIC_

// ❌ WRONG — secret exposed to browser
NEXT_PUBLIC_DJANGO_API_SECRET=...
```
