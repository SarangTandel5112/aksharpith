# AGENTS.md — POS PWA Development Guide

Every Claude Code session must read this file before
writing a single line of code. It drives every decision.

---

## Stack

| Layer       | Package                     | Version |
|-------------|-----------------------------|---------|
| Framework   | Next.js                     | 15      |
| UI          | React                       | 19      |
| Auth        | next-auth                   | 4.24    |
| State       | Zustand                     | v5      |
| Validation  | Zod                         | v4      |
| Styling     | Tailwind                    | v4      |
| Offline DB  | Dexie                       | v4      |
| API Mocking | MSW                         | v2      |
| Testing     | Vitest + Testing Library    | latest  |

---

## Folder structure

src/
  app/                         Next.js App Router
    (pos)/                     Route group — all POS pages
      checkout/                page.tsx, loading.tsx, error.tsx
      catalog/                 page.tsx, loading.tsx, error.tsx
      receipts/[id]/           page.tsx, loading.tsx, error.tsx
    login/                     page.tsx, loading.tsx, error.tsx
    api/                       BFF route handlers only
  config/                      env.ts — single source of truth
  core/
    domain/                    Pure types + factories — no imports from outside
    application/               Sagas + use cases
    infrastructure/            Dexie, apiFetch, sync, queue
  features/
    checkout/
      components/              UI components
      hooks/                   React hooks
      store/                   Zustand store
      types/                   Feature-specific types
      constants/               Feature-specific constants
      validations/             Zod schemas for forms
      schemas/                 Zod schemas for API contracts
      services/                Orchestration logic
    catalog/                   Same structure
    auth/                      Same structure
  shared/
    components/                Generic UI components
    hooks/                     Truly generic hooks only
    lib/                       Third-party library wrappers
    services/                  Cross-feature orchestration
    constants/                 App-wide constants
    validations/               Shared Zod schemas
    types/                     Shared TypeScript types
    providers/                 React context providers

---

## Absolute rules — enforced by ESLint

1. `type` keyword only — never `interface`
2. Props accessed as `props.foo` — never destructured in signature
3. No `useMemo` or `useCallback` — React Compiler handles it
4. `storeId` + `organizationId` always from session — never from body
5. All TanStack Query keys: `[organizationId, storeId, ...]`
6. All Django calls through `apiFetch()` — never raw `fetch()`
7. No `navigator.onLine` — use `useConnectivity()` only
8. `autocapture: false` in PostHog — all events explicit with `pos_` prefix
9. Domain layer imports nothing from infrastructure or features
10. Shared layer imports nothing from features (`@store`)

---

## lib vs services

`lib/` — wraps one external library. If the library disappears, the file disappears.
Examples: sentry.ts, analytics.ts, query-client.ts

`services/` — orchestrates multiple things with real business logic.
Examples: receipt.service.ts, reporting.service.ts

---

## Type organisation rule

Types used outside their own file go in a dedicated
*.types.ts file in the types/ folder of their layer:

  features/checkout/types/cart.types.ts
  features/checkout/types/saga.types.ts
  features/catalog/types/catalog.types.ts
  shared/types/analytics.types.ts

Types only used inside one file stay in that file.

Infrastructure contracts (WriteCommandInput, ApiFetchOptions)
stay in their implementation file — they are not shared types.

Implementation files import from types files.
Implementation files NEVER re-export types.
The types file is the single source of truth.

WRONG:
  // cart.store.ts
  export type { CartStatus } // ← never do this

RIGHT:
  // cart.store.ts
  import type { CartStatus } from '../types/cart.types'
  // use it internally, do not re-export

---

## Path aliases

@domain        → src/core/domain
@infrastructure → src/core/infrastructure
@shared        → src/shared
@store         → src/features
@config        → src/config
@test          → src/__tests__

---

## Worked example — how to use this file

A new developer needs to add barcode scanning to the checkout page.
They open a new Claude Code session and write:

---
Read AGENTS.md first.

I need to add barcode scanning to the checkout page.
When a cashier scans a barcode with a USB scanner,
the product should be added to the cart automatically.
The scanner fires keyboard events — it types the barcode
digits and then sends Enter.

The feature goes in src/features/checkout/hooks/useBarcodeScanner.ts
---

Claude Code reads AGENTS.md and makes the following decisions
without being told:

- Puts the hook in features/checkout/hooks/ — not shared/hooks/
  because it is checkout-specific
- Uses useProductSearch() to find the product by barcode —
  does not call apiFetch() directly from the hook
- Uses useCartStore.getState().addItem() — does not create a new store
- Gets storeId and organizationId from useSession() —
  never hardcodes or accepts from props
- Writes no useMemo or useCallback — trusts React Compiler
- Accesses props as props.onScan — never destructures in signature
- Creates useBarcodeScanner.test.ts alongside the hook
- Uses vi.mock for useProductSearch and useCartStore in the test

Without AGENTS.md, each of these decisions would be made
differently in every session, producing inconsistent code.

---

## Cursor commands

`.cursor/commands/review.md` — run before every PR
`.cursor/commands/react-compiler-check.md` — run when adding new components

---

## Before raising a PR

1. npm run type-check — must be clean
2. npm run lint — must be clean
3. npm run test — must be 100% passing
4. Run .cursor/commands/review.md in Claude Code
5. Run .cursor/commands/react-compiler-check.md if you added components
