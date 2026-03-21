# 01 — Architecture

Read this file on every session, before writing any code.

---

## Layer Map

```
__tests__/            Test infrastructure (not deployed)
  fixtures/           Shared test data factories
  helpers/            Shared test helper functions
  msw/
    handlers/         MSW handler files (one per domain area)
    server.ts         MSW server setup used by all tests

app/                  Next.js pages + BFF API routes
  login/              page.tsx  loading.tsx  error.tsx
  dashboard/          page.tsx  (placeholder — replace with real feature)
  api/                BFF only -- auth check -> validate -> call feature services

features/             UI layer -- hooks, stores, components
  auth/               Login, session management (stub — build this first)
  Each feature has:   components/  hooks/  store/  types/
                      constants/   validations/  schemas/

shared/               Generic, cross-feature utilities
  components/         Generic UI only -- no feature logic
  hooks/              Truly generic hooks (useConnectivity, etc.)
  lib/                One-library wrappers + generic HTTP client
  services/           Cross-feature orchestration (empty until needed)
  types/              Shared TypeScript types (core.ts, validation.types.ts, etc.)
  providers/          React context providers

config/               env.ts only -- imported by any layer
```

---

## Dependency Rules (enforced by ESLint + dependency-cruiser)

```
features    →  shared, config
shared      →  config  (NEVER @features)
app/api     →  shared, config
app/pages   →  features, shared, config
```

**Violations fail CI and pre-commit hooks. No exceptions.**

---

## Folder Decision Tree

When you need to create a new file, answer these in order:

1. **Is it a React hook, Zustand store, or component for ONE feature?**
   → `features/<feature>/hooks|store|components/`

2. **Is it a React hook or component used by MORE THAN ONE feature?**
   → `shared/hooks/` or `shared/components/`

3. **Does it wrap exactly one external library?**
   → `shared/lib/<library>.ts`

4. **Is it a Next.js page, layout, or BFF route handler?**
   → `app/`

5. **Is it a shared TypeScript type used across features?**
   → `shared/types/<name>.types.ts`

---

## `lib/` vs `services/`

| Folder | Rule | Examples |
|--------|------|----------|
| `lib/` | Wraps ONE library. File disappears if library disappears. | `sentry.ts`, `analytics.ts`, `query-client.ts`, `api-fetch.ts` |
| `services/` | Orchestrates multiple things with real business logic. | None built yet — `shared/services/` is empty until needed |

---

## Naming Conventions

| Thing | Pattern | Example |
|-------|---------|---------|
| React component | `PascalCase.tsx` | `UserCard.tsx` |
| Hook | `useCamelCase.ts` | `useUserProfile.ts` |
| Zustand store | `camelCase.store.ts` | `auth.store.ts` |
| Types file | `camelCase.types.ts` | `auth.types.ts` |
| Test file | alongside impl | `auth.store.test.ts` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_COUNT = 3` |
| Enum-like values | `as const` object | `const STATUS = { ACTIVE: 'active' } as const` |

**Never use the `enum` keyword.** Use `const` object + `as const`.

---

## Decisions Log

| Decision | Why |
|----------|-----|
| `vitest.config.mts` (not `.ts`) | `vite-tsconfig-paths` is ESM-only — CJS `require()` breaks it |
| `@features/*` alias for `features/` | Separates feature-layer UI from shared infrastructure |
| No `navigator.onLine` | Unreliable on mobile — replaced by fetch-based probe in `useConnectivity` |
| `type` not `interface` | React Compiler needs stable type identities; interfaces can be augmented |
| Props as `props.foo` | Required for React Compiler optimisation |
| No `useMemo`/`useCallback` | React 19 Compiler handles this automatically in Next.js 16 |
| BFF pattern (Next.js API routes) | Backend API is not exposed to the browser — all calls go through Next.js BFF which validates, attaches auth, and forwards |
| next-auth v4 (not v5) | next-auth v5 was still in beta when this project was started — v4 is stable and production-ready |
| `autocapture: false` in PostHog | Must not auto-capture sensitive UI interactions — all events are explicit |
