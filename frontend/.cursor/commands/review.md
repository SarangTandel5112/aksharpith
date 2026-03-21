---
description: Full code review against architecture rules before raising a PR
---

Read AGENTS.md first. Then review every file changed in
this branch against the following checklist. Report each
item as PASS, FAIL, or N/A. For every FAIL explain exactly
what is wrong and show the corrected code.

## Architecture boundaries
- [ ] Domain files import nothing from @infrastructure, @store, or @shared/hooks
- [ ] Shared files import nothing from @store
- [ ] Infrastructure files import nothing from @store
- [ ] New hooks in features/ not in shared/ unless truly generic

## Naming conventions
- [ ] All types use `type` keyword — no `interface`
- [ ] Repository contracts use I-prefix (IOrderRepository)
- [ ] Props accessed as `props.foo` — never destructured in signature
- [ ] No `useMemo` or `useCallback` — React Compiler handles it

## Tenant security
- [ ] storeId and organizationId come from session — never from request body
- [ ] All TanStack Query keys start with [organizationId, storeId, ...]
- [ ] All Dexie queries filter by terminalId or storeId

## API calls
- [ ] All Django calls go through `apiFetch()` — no raw `fetch()` to DJANGO_API
- [ ] All BFF route handlers check `getServerSession()` before anything else
- [ ] All BFF route handlers use `validateBody()` before reading body

## Offline safety
- [ ] No `navigator.onLine` — use `useConnectivity()` only
- [ ] Checkout path handles offline case explicitly
- [ ] New Dexie writes have a corresponding integrity check if needed

## Tests
- [ ] Every new implementation file has a matching .test.ts file
- [ ] No test uses `any` type
- [ ] MSW handlers used for all HTTP calls in tests — no real network

## Type safety
- [ ] No `any` type anywhere
- [ ] No non-null assertions (`!`) without a comment explaining why it is safe
- [ ] `exactOptionalPropertyTypes` pattern used for optional fields

Run at the end:
npm run type-check
npm run lint
npm run test

All three must be clean before the PR is raised.
