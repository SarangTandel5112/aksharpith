# 07 — PR Checklist

Run this before every pull request. Report each item as ✅ PASS, ❌ FAIL, or ➖ N/A.
For every FAIL: show exactly what is wrong + the corrected code.

---

## Step 1 — Run Quality Gates

```bash
npm run type-check    # must exit 0
npm run lint          # must exit 0, zero warnings
npm test              # must be 100% passing
npm run check:arch    # must exit 0
npm run check:colors  # must exit 0 — no hardcoded hex/rgb in source files
```

All five must be green. Do not raise a PR with any failures.

---

## Step 2 — Architecture Boundaries

- [ ] Domain files (`core/domain/`) import nothing from `@infrastructure`, `@features`, `@shared/hooks`
- [ ] Shared files import nothing from `@features` (features layer)
- [ ] Infrastructure files import nothing from `@features`
- [ ] New hooks placed in `features/<f>/hooks/` not `shared/hooks/` unless truly generic
- [ ] No new `services/` folder inside `features/` — business logic belongs in `core/application/`

---

## Step 3 — TypeScript Rules

- [ ] All new types use `type` keyword — no `interface` anywhere
- [ ] No `any` type in implementation or test files
- [ ] No `!` non-null assertion without an explanatory comment above it
- [ ] No `enum` keyword — `as const` used instead
- [ ] Repository contracts use `I` prefix (`IOrderRepository`)
- [ ] Shared types in `*.types.ts` files — not inline in implementation files
- [ ] Implementation files do not re-export types

---

## Step 4 — React Rules

- [ ] Props accessed as `props.foo` — no destructuring in function signature
- [ ] No `useMemo` or `useCallback` without a documented exception comment
- [ ] All new components have explicit `React.JSX.Element` return type
- [ ] Every `<Suspense>` is paired with a sibling `<ErrorBoundary>`
- [ ] `useConnectivity()` used instead of `navigator.onLine`
- [ ] `formatMoney()` used for all money display — no manual `/100` division

---

## Step 5 — Tenant Security

- [ ] `storeId` and `organizationId` come from `getServerSession()` or `useSession()` — never from request body or props
- [ ] All TanStack Query keys start with `[organizationId, storeId, ...]`
- [ ] All Dexie queries filter by `terminalId` or `storeId`
- [ ] No secrets in `NEXT_PUBLIC_` variables

---

## Step 6 — API & BFF Routes

- [ ] All Django calls go through `apiFetch()` — no raw `fetch()` to `DJANGO_API`
- [ ] All BFF route handlers call `getServerSession()` **before** reading the body
- [ ] All BFF route handlers call `validateBody()` **before** using request data
- [ ] Idempotency keys are deterministic — no `Date.now()`, no `randomUUID()`

---

## Step 7 — Offline Safety

- [ ] Checkout path explicitly handles `status: 'offline'` case
- [ ] Queue writes go through `writeCommand()` — not directly to Dexie
- [ ] `QUEUE_FULL` and `WRITE_ERROR` results from `writeCommand()` are handled
- [ ] New Dexie writes have queue integrity considered (does it need a sequence number?)

---

## Step 8 — Tests

- [ ] Every new implementation file has a matching `.test.ts` or `.test.tsx`
- [ ] No test uses `any` type
- [ ] No `vi.mock` on `fetch` — MSW handlers used for all HTTP in tests
- [ ] IndexedDB tests import `fake-indexeddb/auto` and call `resetDBForTesting()`
- [ ] New MSW handlers added if new endpoints were introduced
- [ ] Tests follow Red → Green → Refactor — test was failing before implementation

---

## Step 9 — React Compiler (only if new components added)

Run these checks directly in the terminal:

```bash
# 1. Manual memoisation violations
grep -r "useMemo\|useCallback" src/ --include="*.ts" --include="*.tsx"
# Each result needs a // useCallback exception: or // useMemo exception: comment above it

# 2. interface keyword violations
grep -r "^interface \|^export interface " src/ --include="*.ts" --include="*.tsx"
# All results are violations — replace with type keyword

# 3. Props destructuring violations
grep -rn "function [A-Z].*({" src/features src/shared --include="*.tsx"
# Any match is a violation — props must be accessed as props.foo
```

> Full walkthrough also available in `.cursor/commands/react-compiler-check.md` (Cursor IDE only).

---

## Step 10 — Commit Message

Follows conventional commit format:
```
type(scope): description
```
Valid types: `feat fix chore docs test refactor style perf ci`
Valid scopes: `cart order payment terminal auth offline sync infra ui ci deps`

---

## Final Sign-off

Before marking PR ready for review, confirm:

```
[ ] npm run type-check  → exit 0
[ ] npm run lint        → exit 0, zero warnings
[ ] npm test            → all passing
[ ] npm run check:arch  → exit 0
[ ] All checklist items above are ✅ PASS or ➖ N/A
[ ] No new 'any' types introduced
[ ] Payment-related changes flagged for senior review
```
