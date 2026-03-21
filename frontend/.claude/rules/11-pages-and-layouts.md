# 11 — Pages & Layouts

Verified against Next.js 16.1.6 official documentation.

---

## The Rule: Pages Are Shells, Not Features

A page file (`page.tsx`) has one job: **auth check → optional data fetch → render one feature component**.
A layout file (`layout.tsx`) has one job: **arrange structural slots + auth guard**.

Neither should contain UI state, types, constants, or event handlers.

---

## Page Budget

| Allowed in a page | NOT allowed in a page |
|-------------------|-----------------------|
| `getServerSession()` for auth guard | `useState` / `useReducer` |
| `await props.params` for route params | `useEffect` / `useCallback` |
| `async` data fetch → pass as serializable props | Type definitions |
| `redirect()` / `notFound()` | Inline constants or sample data |
| Rendering one feature component | Event handlers (`handleXxx`) |
| | Business logic of any kind |
| | `'use client'` — pages must be Server Components |

**Line budget:**
- Pure shell page (no data fetch): **under 15 lines**
- Page that fetches data: **under 30 lines**

If a page exceeds these, logic has leaked in.

---

## Three Valid Page Patterns

### Pattern 1 — Pure shell (most common in this project)

The page does nothing except auth guard + render a self-contained feature component.
All state and data fetching live inside the feature component (via Zustand or TanStack Query).

```tsx
// src/app/[storeName]/(pos)/checkout/@left/page.tsx
import { CheckoutLeftPanel } from '@features/checkout/components/CheckoutLeftPanel'

export default function CheckoutLeftPage(): React.JSX.Element {
  return <CheckoutLeftPanel />
}
```

### Pattern 2 — Page fetches data, passes to Client Component

The page fetches server-side data (e.g. from Django via infrastructure layer) and passes
the **serializable** result down as props. The Client Component handles interactivity.

```tsx
// src/app/[storeName]/(pos)/receipts/[id]/page.tsx
import { ReceiptView } from '@features/checkout/components/ReceiptView'
import { fetchReceipt } from '@infrastructure/api/repositories/receipts.repository'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/auth-options'
import { redirect } from 'next/navigation'

export default async function ReceiptPage(props: {
  params: Promise<{ storeName: string; id: string }>
}): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { id } = await props.params
  const ctx = buildTenantContext(session)
  const receipt = await fetchReceipt(id, ctx)   // ← serializable data only

  return <ReceiptView receipt={receipt} />       // ← props are plain objects/strings/numbers
}
```

### Pattern 3 — Streaming (Next.js 16+ / React 19)

Pass an **unawaited** Promise to a Client Component wrapped in `<Suspense>`.
The Client Component resolves it with `React.use()`. This streams data without a waterfall.

```tsx
// src/app/[storeName]/(pos)/catalog/page.tsx
import { CatalogPanel } from '@features/catalog/components/CatalogPanel'
import { fetchCatalogSummary } from '@infrastructure/api/repositories/catalog.repository'
import { Suspense } from 'react'
import { CatalogSkeleton } from '@features/catalog/components/CatalogSkeleton'

export default function CatalogPage(): React.JSX.Element {
  const catalogPromise = fetchCatalogSummary()  // ← NOT awaited

  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogPanel catalog={catalogPromise} />  {/* Client Component resolves with use() */}
    </Suspense>
  )
}
```

---

## The Serialization Rule — The Most Important Constraint

> **Functions cannot cross the Server → Client boundary as props.**

When a Server Component passes props to a Client Component, React serializes those props
over the wire. Serializable = strings, numbers, plain objects, arrays, Promises.
Non-serializable = functions, class instances, custom objects with methods.

```tsx
// ❌ WRONG — Server Component cannot pass a function to a Client Component
// CheckoutRightPanel is a Server Component
export default function CheckoutRightPanel(): React.JSX.Element {
  function handleCheckout() { /* ... */ }       // ← function defined server-side

  return (
    <PaymentPanel onCheckout={handleCheckout} />  // ← FAILS: function not serializable
  )
}

// ✅ RIGHT — Client Component owns its own handlers
// PaymentPanel.tsx
'use client'
export function PaymentPanel(props: PaymentPanelProps): React.JSX.Element {
  function handleCheckout(): void {             // ← handler lives inside the Client Component
    void completeCheckoutSaga(...)
  }

  return <button onClick={handleCheckout}>Pay</button>
}
```

**Consequence for this project:**
Client Components (`OrderTable`, `PaymentPanel`, etc.) must be **self-contained**.
They define their own event handlers internally. Server Component parents pass only data,
never callbacks.

---

## Incorrect Pattern — What To Fix

```tsx
// ❌ WRONG — page doing feature work
'use client'

type PaymentMethod = 'cash' | 'card'      // ← type in page
const SAMPLE_ITEMS = [...]                 // ← data in page

export default function CheckoutRightPage() {
  const [selected, setSelected] = useState<PaymentMethod>('cash')  // ← state in page
  function handleCheckout() { ... }        // ← handler in page
  return <OrderTable items={SAMPLE_ITEMS} onCheckout={handleCheckout} />
}
```

| What was in the page | Move it to |
|----------------------|-----------|
| `type PaymentMethod` | `features/checkout/types/cart.types.ts` |
| `SAMPLE_ITEMS` | `features/checkout/constants/checkout.constants.ts` |
| `useState(selected)` | `features/checkout/store/cart.store.ts` or inside `PaymentPanel` |
| `handleCheckout()` | Inside `PaymentPanel.tsx` (`'use client'` component) |

The page becomes:
```tsx
import { CheckoutRightPanel } from '@features/checkout/components/CheckoutRightPanel'

export default function CheckoutRightPage(): React.JSX.Element {
  return <CheckoutRightPanel />
}
```

---

## Server vs Client — Decision Tree

Answer these in order for every component you are writing:

```
Does it use useState / useEffect / onClick / onChange / browser events?
  YES → 'use client'  (must be a Client Component)
  NO  ↓

Does it use React Context (useContext)?
  YES → 'use client'  (context is not supported in Server Components)
  NO  ↓

Does it read from Zustand store?
  YES → 'use client'  (Zustand is client-only)
  NO  ↓

Does it fetch data from Django (apiFetch) or the database?
  YES → Server Component  (no 'use client', make it async)
  NO  ↓

Default → Server Component  (no 'use client')
```

---

## Where `'use client'` Goes

Never add `'use client'` to a page or layout.
Push it as deep (as close to the leaves) as possible.

```
app/[storeName]/(pos)/checkout/@right/page.tsx   ← Server Component (no 'use client')
  └── features/checkout/components/
        CheckoutRightPanel.tsx                   ← Server Component (layout only, no handlers)
          ├── OrderTable.tsx      'use client'   ← owns search state + qty handlers
          └── PaymentPanel.tsx    'use client'   ← owns payment selection state + checkout handler
```

The `'use client'` boundary makes everything below it — including all imports — part of the
client JS bundle. Keeping it deep means less JavaScript is sent to the browser.

---

## Context Providers Must Be Client Components

React context is not supported in Server Components.
Any component that uses `createContext` / `useContext` must be a Client Component.

```tsx
// ✅ RIGHT — wrap provider in a Client Component, render as deep as possible
// src/shared/providers/ThemeProvider.tsx
'use client'
import { createContext, useContext } from 'react'
export function ThemeProvider(props: { children: React.ReactNode }) { ... }

// Layout imports it — but ThemeProvider itself is 'use client'
// The layout file stays a Server Component
export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ThemeProvider>   {/* Client Component — only wraps what needs it */}
          {props.children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

Render providers **as deep as possible** in the tree, not at the root —
this lets Next.js keep the static parts of the tree as Server Components.

---

## Layout Budget

Layouts arrange structure — nothing else.

```tsx
// ✅ RIGHT — layout is an auth guard + structural shell
export default async function PosLayout(props: {
  children: React.ReactNode
  params: Promise<{ storeName: string }>
}): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { storeName } = await props.params

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <PosTopNav
        storeName={storeName}
        userName={session.user.name}
        userInitials={getInitials(session.user.name)}
      />
      <div className="flex flex-1 overflow-hidden pb-4 pr-4">
        <PosSideNav storeName={storeName} />
        <main className="flex-1 bg-white rounded-3xl overflow-hidden shadow-lg">
          {props.children}
        </main>
      </div>
    </div>
  )
}

// ❌ WRONG — hardcoded data (must come from session)
<PosTopNav
  shiftTime="08:42 AM"       // ← hardcoded
  userName="Alex Johnson"    // ← hardcoded — use session.user.name
  registerNumber={4}         // ← hardcoded
/>
```

---

## Parallel Routes (`@left` / `@right` slots)

Parallel route slot pages follow the same rules — they are pure shells.

```tsx
// src/app/[storeName]/(pos)/checkout/@left/page.tsx
import { CheckoutLeftPanel } from '@features/checkout/components/CheckoutLeftPanel'
export default function CheckoutLeftPage(): React.JSX.Element {
  return <CheckoutLeftPanel />
}

// src/app/[storeName]/(pos)/checkout/@right/page.tsx
import { CheckoutRightPanel } from '@features/checkout/components/CheckoutRightPanel'
export default function CheckoutRightPage(): React.JSX.Element {
  return <CheckoutRightPanel />
}
```

---

## Summary — Where Things Live

| Thing | Lives in |
|-------|----------|
| Auth guard | `layout.tsx` for the whole route group (once, not repeated per page) |
| Route params | `page.tsx` (`await props.params`) |
| Session data for nav | `layout.tsx` → pass as serializable props to nav component |
| Async data fetch (server) | `page.tsx` (Pattern 2) or `core/infrastructure/` repository |
| UI state (tabs, toggles) | Inside the `'use client'` component that owns the interaction |
| Shared UI state (cart) | `features/checkout/store/cart.store.ts` (Zustand) |
| Event handlers | Inside the `'use client'` component — never passed as props from server |
| Feature constants | `features/<f>/constants/<f>.constants.ts` |
| Types | `features/<f>/types/<name>.types.ts` |
| Context providers | `shared/providers/` — always `'use client'`, render as deep as possible |
