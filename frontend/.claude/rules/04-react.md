# 04 — React & Component Rules

---

## Props — Access as `props.foo`, Never Destructure

React Compiler requires non-destructured props to optimise correctly.

```tsx
// ✅ RIGHT
function ProductCard(props: ProductCardProps): React.JSX.Element {
  return (
    <div onClick={() => props.onSelect(props.product)}>
      <span>{props.product.name}</span>
    </div>
  )
}

// ❌ WRONG — destructuring prevents React Compiler optimisation
function ProductCard({ product, onSelect }: ProductCardProps) {
  return <div onClick={() => onSelect(product)}>{product.name}</div>
}
```

---

## No `useMemo` or `useCallback`

React 19 Compiler (enabled in Next.js 16) handles memoisation automatically.
Manual memoisation fights the compiler and produces worse results.

```tsx
// ✅ RIGHT — compiler handles it
function CartSummary(props: CartSummaryProps): React.JSX.Element {
  const total = calculateTotal(props.lines)  // compiler memoises this
  return <span>{formatMoney(total)}</span>
}

// ❌ WRONG — manual memoisation
function CartSummary(props: CartSummaryProps): React.JSX.Element {
  const total = useMemo(() => calculateTotal(props.lines), [props.lines])
  return <span>{formatMoney(total)}</span>
}
```

**Documented exception:** `useConnectivity.ts` uses `useCallback` because
the function is a `useEffect` dependency and must have a stable reference.
Any new exception must have a comment: `// useCallback exception: <reason>`

---

## Return Type — Always Explicit

```tsx
// ✅ RIGHT
function LoginForm(props: LoginFormProps): React.JSX.Element { ... }

// ❌ WRONG — implicit return type
function LoginForm(props: LoginFormProps) { ... }
```

---

## Component File Structure

```tsx
'use client'  // only if needed — prefer Server Components

import type { ... } from '...'
import { ... } from '...'

// ── Types ─────────────────────────────────────────────────────────────────────

type ProductCardProps = {
  product:  CatalogProduct
  onSelect: (product: CatalogProduct) => void
  disabled?: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ProductCard(props: ProductCardProps): React.JSX.Element {
  return (
    <button
      onClick={() => props.onSelect(props.product)}
      disabled={props.disabled}
      className="..."
    >
      {props.product.name}
    </button>
  )
}
```

---

## Suspense + Error Boundary — Always Paired

Every `<Suspense>` must have a sibling `<ErrorBoundary>`. Never add one without the other.

```tsx
// ✅ RIGHT
<ErrorBoundary fallback={<PanelError />}>
  <Suspense fallback={<ProductGridSkeleton />}>
    <ProductGrid />
  </Suspense>
</ErrorBoundary>

// ❌ WRONG — Suspense without ErrorBoundary
<Suspense fallback={<ProductGridSkeleton />}>
  <ProductGrid />
</Suspense>
```

Place Suspense at **feature panel level** — not on individual leaf components.

---

## Tailwind — Utility Classes Only, No Hardcoded Colors

```tsx
// ✅ RIGHT — utility classes, cn() for conditionals
// First: create src/shared/lib/cn.ts if it doesn't exist (see below)
import { cn } from '@shared/lib/cn'

<div className={cn(
  'flex items-center gap-3 p-2 rounded',
  props.isPending && 'opacity-60 animate-pulse',
)}>

// ❌ WRONG — inline styles
<div style={{ display: 'flex', gap: 12 }}>
```

### No hardcoded colors — enforced by pre-commit hook

All colors must come from CSS custom properties defined in `globals.css`.
Never use raw hex, rgb, or rgba values in className or style props.

```tsx
// ✅ RIGHT — use Tailwind tokens that map to CSS variables
<span className="text-primary-500">Label</span>
<div className="bg-surface-subtle border-surface-border">...</div>
<nav className="bg-[var(--surface-sidebar)]">...</nav>  // if no Tailwind token yet

// ❌ WRONG — hardcoded colors are blocked by the pre-commit hook
<span className="text-[#57243b]">Label</span>
<div className="bg-[#f0f0f0]">...</div>
<div className="hover:bg-[rgba(87,36,59,0.04)]">...</div>
<p style={{ color: '#6f6b7d' }}>...</p>
```

The `npm run check:colors` script (run automatically on every commit) will fail
if any of these patterns are found in `.ts` / `.tsx` source files.

### Creating `cn.ts` (required before using conditional classes)

`src/shared/lib/cn.ts` does not exist yet in the project.
Create it when you first need conditional Tailwind classes:

```ts
// src/shared/lib/cn.ts
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

Then install the dependencies:
```bash
npm install clsx tailwind-merge
```

---

## Zustand Store — Selector Pattern

Use precise selectors — never select the whole store.

```ts
// ✅ RIGHT — precise selector prevents unnecessary re-renders
const order = useCartStore(selectOrder)
const lines = useCartStore(selectActiveLines)

// ❌ WRONG — re-renders on any store change
const { order, lines, status } = useCartStore()
```

Available selectors (already in `cart.store.ts`):
- `selectOrder` — the current Order or null
- `selectCartStatus` — CartStatus string
- `selectActiveLines` — non-voided OrderLines
- `selectCartTotal` — Money or null
- `selectLineCount` — number of active lines

---

## TanStack Query — Key Structure

```ts
// ✅ RIGHT — always start with [organizationId, storeId]
queryKey: [ctx.organizationId, ctx.storeId, 'orders', { status: 'draft' }]

// ❌ WRONG — missing tenant context in key
queryKey: ['orders']
```

Use `useSuspenseQuery` (not `useQuery`) inside components wrapped by Suspense.
It eliminates loading/error state handling inside the component.

---

## Connectivity — Never `navigator.onLine`

```ts
// ✅ RIGHT
import { useConnectivity } from '@shared/hooks/useConnectivity'
const { isOnline } = useConnectivity()

// ❌ WRONG — unreliable on mobile networks
if (navigator.onLine) { ... }
```

---

## Formatting Money in UI

```tsx
// ✅ RIGHT — formatMoney handles en-IN locale + paise conversion
import { formatMoney } from '@domain/shared/value-objects'
<span>{formatMoney(props.product.price)}</span>
// Renders: "₹52.50"

// ❌ WRONG — manual division is error-prone and not localised
<span>₹{props.product.price.amount / 100}</span>
```
