# Frontend Phase 1 — Foundation & Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Django-wired boilerplate with a working NestJS-connected authentication system — typed shared layer, next-auth CredentialsProvider with cookie-threading, role-based middleware, login UI, and route group scaffolding.

**Architecture:** All browser API calls go through Next.js BFF route handlers (SameSite=strict prevents direct cross-origin cookie use). next-auth CredentialsProvider extracts the NestJS `access_token` cookie from the login response and stores it in the next-auth session JWT, which BFF handlers then forward as a `Cookie` header to NestJS. Route groups `(auth)`, `(catalog)`, `(admin)` separate surfaces.

**Tech Stack:** Next.js 16.1.6 · next-auth 4.24 · Zod v4 · react-hook-form v7 · @hookform/resolvers · next-themes · MSW v2 · Vitest 2 · TanStack Query v5

---

## File Map

Files to **modify** (already exist):

| File | Change |
|------|--------|
| `src/shared/types/core.ts` | Remove `TenantContext`, update `PaginatedResponse`, add `ApiResponse` + `SessionUser` |
| `src/shared/types/next-auth.d.ts` | Replace `organizationId/storeId/terminalId` with `role/firstName/lastName` |
| `src/shared/lib/api-fetch.ts` | Accept `accessToken: string`, send `Cookie: access_token=<token>` to NestJS |
| `src/shared/lib/api-fetch.test.ts` | Rewrite tests for new Cookie-based auth |
| `src/shared/lib/query-keys.ts` | Add all key factories (no tenant scoping — intentional) |
| `src/shared/lib/query-keys.test.ts` | Replace trivial test with real key-shape assertions |
| `src/config/env.ts` | Replace `DJANGO_API`/`DJANGO_API_SECRET` with `NEST_API` |
| `src/__tests__/msw/handlers/auth.handlers.ts` | Fix BASE to `localhost:3001`, NestJS response shapes |
| `src/app/globals.css` | Swap Burgundy tokens for Premium Blue |
| `src/proxy.ts` | Add next-auth session guard + role-based redirect |
| `src/proxy.test.ts` | Add tests for auth redirect and role guard |
| `src/app/layout.tsx` | Add SessionProvider + ThemeProvider |
| `.env.example` | Replace Django vars with `NEST_API` |
| `CLAUDE.md` | Update env table |

Files to **create** (new):

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Re-exports `proxy as middleware` + `config` for Next.js |
| `src/shared/lib/api-schemas.ts` | Zod helpers to unwrap NestJS `{ statusCode, message, data }` envelope |
| `src/shared/lib/auth-options.ts` | next-auth CredentialsProvider — cookie threading to NestJS |
| `src/app/api/auth/[...nextauth]/route.ts` | Thin next-auth route handler |
| `src/features/auth/schemas/login.schema.ts` | Zod: `LoginFormSchema` + `LoginFormValues` |
| `src/features/auth/schemas/login.schema.test.ts` | Schema validation tests |
| `src/features/auth/components/LoginForm.tsx` | react-hook-form + Zod login form |
| `src/features/auth/components/LoginForm.test.tsx` | Render + submission tests |
| `src/features/auth/components/LoginPageClient.tsx` | `'use client'` container — `signIn` call, loading/error state |
| `src/features/auth/hooks/useSession.ts` | Typed wrapper for next-auth `useSession` |
| `src/shared/providers/ThemeProvider.tsx` | next-themes `ThemeProvider` wrapper (`'use client'`) |
| `src/shared/components/ThemeToggle.tsx` | Dark/light toggle button (`'use client'`) |
| `src/app/(auth)/layout.tsx` | Minimal auth layout (no nav) |
| `src/app/(auth)/login/page.tsx` | Renders `<LoginForm>` — replaces old `src/app/login/page.tsx` |
| `src/app/(auth)/login/loading.tsx` | Skeleton |
| `src/app/(auth)/login/error.tsx` | Error boundary |
| `src/app/(catalog)/layout.tsx` | Shell with ThemeToggle (populated in Phase 3) |
| `src/app/(admin)/layout.tsx` | Shell (populated in Phase 2) |
| `src/app/unauthorized/page.tsx` | Role-mismatch page |

Files to **delete**:

| File | Reason |
|------|--------|
| `src/app/login/page.tsx` | Moved into `(auth)/login/page.tsx` |
| `src/app/login/loading.tsx` | Moved |
| `src/app/login/error.tsx` | Moved |

---

## Task 1: Update shared types

**Files:**
- Modify: `src/shared/types/core.ts`
- Modify: `src/shared/types/next-auth.d.ts`

- [ ] **Step 1: Rewrite `src/shared/types/core.ts`**

```ts
// src/shared/types/core.ts

// NestJS response envelope — all NestJS endpoints wrap responses in this shape
export type ApiResponse<T> = {
  statusCode: number
  message: string
  data: T
}

// NestJS pagination shape — matches PaginatedResponseDto in nest-backend
export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Session user — shape returned by GET /api/users/me, stored in next-auth JWT
export type SessionUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: { id: string; roleName: string }
}

// Generic result type — used by services that can fail
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }
```

- [ ] **Step 2: Rewrite `src/shared/types/next-auth.d.ts`**

```ts
// src/shared/types/next-auth.d.ts
import 'next-auth'

declare module 'next-auth' {
  // Required: TypeScript declaration merging requires the interface keyword for
  // module augmentation — this is a language-level constraint, not a style choice.
  // next-auth v4 declares Session/JWT as interfaces; you must use interface to
  // extend them. See: https://www.typescriptlang.org/docs/handbook/declaration-merging.html
  interface Session {
    accessToken: string
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      role: { id: string; roleName: string }
    }
  }
}

declare module 'next-auth/jwt' {
  // Required: TypeScript declaration merging requires interface keyword (see above)
  interface JWT {
    accessToken: string
    id: string
    firstName: string
    lastName: string
    role: { id: string; roleName: string }
  }
}
```

- [ ] **Step 3: Run type-check to verify no regressions**

```bash
cd frontend && npm run type-check
```
Expected: exits 0 (any errors must be fixed before proceeding)

- [ ] **Step 4: Commit**

```bash
git add src/shared/types/core.ts src/shared/types/next-auth.d.ts
git commit -m "refactor(types): replace Django tenant types with NestJS session types"
```

---

## Task 2: Update env.ts and .env.example

**Files:**
- Modify: `src/config/env.ts`
- Modify: `.env.example`

- [ ] **Step 1: Rewrite `src/config/env.ts`**

```ts
// src/config/env.ts
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NEXTAUTH_SECRET: z.string().min(32),
    NEXTAUTH_URL:    z.string().url(),
    NEST_API:        z.string().url(),
  },
  client: {
    NEXT_PUBLIC_POSTHOG_KEY:       z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN:        z.string().url().optional(),
    NEXT_PUBLIC_TERMINAL_ENV:      z.enum(['development', 'staging', 'production']),
    NEXT_PUBLIC_CHAOS_MODE:        z.enum(['true', 'false']).optional(),
    NEXT_PUBLIC_SENTRY_DISABLED:   z.enum(['true', 'false']).optional(),
  },
  runtimeEnv: {
    NEXTAUTH_SECRET:               process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL:                  process.env.NEXTAUTH_URL,
    NEST_API:                      process.env.NEST_API,
    NEXT_PUBLIC_POSTHOG_KEY:       process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_SENTRY_DSN:        process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_TERMINAL_ENV:      process.env.NEXT_PUBLIC_TERMINAL_ENV,
    NEXT_PUBLIC_CHAOS_MODE:        process.env.NEXT_PUBLIC_CHAOS_MODE,
    NEXT_PUBLIC_SENTRY_DISABLED:   process.env.NEXT_PUBLIC_SENTRY_DISABLED,
  },
})
```

- [ ] **Step 2: Rewrite `.env.example`**

```
# ── Auth ──────────────────────────────────────────────────────────────────────

# Secret used to sign NextAuth JWTs and session cookies.
# Must be at least 32 characters. Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=

# Canonical URL of this Next.js app — used by NextAuth for callbacks.
# In production set to your public domain, e.g. https://catalog.example.com
NEXTAUTH_URL=http://localhost:3000

# ── NestJS backend ────────────────────────────────────────────────────────────

# Base URL of the NestJS API (no trailing slash).
# Local dev: http://localhost:3001
NEST_API=http://localhost:3001

# ── Public runtime config ─────────────────────────────────────────────────────

NEXT_PUBLIC_TERMINAL_ENV=development
NEXT_PUBLIC_CHAOS_MODE=false
NEXT_PUBLIC_SENTRY_DISABLED=true

# ── Optional third-party services ────────────────────────────────────────────
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_SENTRY_DSN=
```

- [ ] **Step 3: Update `.env.local`** (developer's own copy — add NEST_API, remove DJANGO_API vars)

```bash
# In your .env.local, replace:
# DJANGO_API=...
# DJANGO_API_SECRET=...
# with:
# NEST_API=http://localhost:3001
```

- [ ] **Step 4: Run type-check**

```bash
cd frontend && npm run type-check
```
Expected: exits 0

- [ ] **Step 5: Commit**

```bash
git add src/config/env.ts .env.example
git commit -m "refactor(config): replace Django env vars with NEST_API"
```

---

## Task 3: Update api-fetch.ts (Cookie forwarding for NestJS)

**Files:**
- Modify: `src/shared/lib/api-fetch.ts`
- Modify: `src/shared/lib/api-fetch.test.ts`

The existing tests assert on `X-Organization-ID` headers. Rewrite them first (TDD: tests fail, then fix implementation, then tests pass).

- [ ] **Step 1: Rewrite `api-fetch.test.ts` (tests will FAIL until Step 3)**

```ts
// src/shared/lib/api-fetch.test.ts
import { server } from '@test/msw/server'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { apiFetch, parseApiError } from './api-fetch'

const BASE = 'http://localhost:3001'
const ACCESS_TOKEN = 'test-jwt-token'

describe('apiFetch', () => {
  it('sends Cookie header with access_token', async () => {
    let capturedHeaders: Record<string, string> = {}

    server.use(
      http.get(`${BASE}/api/test`, ({ request }) => {
        capturedHeaders = Object.fromEntries(request.headers)
        return HttpResponse.json({ ok: true })
      }),
    )

    await apiFetch('/api/test', { accessToken: ACCESS_TOKEN })

    expect(capturedHeaders['cookie']).toBe(`access_token=${ACCESS_TOKEN}`)
  })

  it('does NOT send tenant headers (no X-Organization-ID)', async () => {
    let capturedHeaders: Record<string, string> = {}

    server.use(
      http.get(`${BASE}/api/test`, ({ request }) => {
        capturedHeaders = Object.fromEntries(request.headers)
        return HttpResponse.json({ ok: true })
      }),
    )

    await apiFetch('/api/test', { accessToken: ACCESS_TOKEN })

    expect(capturedHeaders['x-organization-id']).toBeUndefined()
    expect(capturedHeaders['x-store-id']).toBeUndefined()
    expect(capturedHeaders['x-terminal-id']).toBeUndefined()
  })

  it('always sends x-trace-id header', async () => {
    let capturedTraceId = ''

    server.use(
      http.get(`${BASE}/api/test`, ({ request }) => {
        capturedTraceId = request.headers.get('x-trace-id') ?? ''
        return HttpResponse.json({ ok: true })
      }),
    )

    await apiFetch('/api/test', { accessToken: ACCESS_TOKEN })
    expect(capturedTraceId).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('uses provided traceId when given', async () => {
    let capturedTraceId = ''

    server.use(
      http.get(`${BASE}/api/test`, ({ request }) => {
        capturedTraceId = request.headers.get('x-trace-id') ?? ''
        return HttpResponse.json({ ok: true })
      }),
    )

    await apiFetch('/api/test', { accessToken: ACCESS_TOKEN, traceId: 'my-trace-123' })
    expect(capturedTraceId).toBe('my-trace-123')
  })

  it('forwards POST body', async () => {
    let capturedBody: unknown = null

    server.use(
      http.post(`${BASE}/api/test`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ ok: true })
      }),
    )

    await apiFetch('/api/test', {
      method: 'POST',
      body: JSON.stringify({ name: 'test' }),
      accessToken: ACCESS_TOKEN,
    })

    expect(capturedBody).toEqual({ name: 'test' })
  })
})

describe('parseApiError', () => {
  it('parses structured error response', async () => {
    const response = new Response(
      JSON.stringify({ code: 'NOT_FOUND', message: 'Resource not found' }),
      { status: 404 },
    )
    const error = await parseApiError(response)
    expect(error.code).toBe('NOT_FOUND')
    expect(error.status).toBe(404)
  })

  it('handles unparseable response gracefully', async () => {
    const response = new Response('not json', { status: 500 })
    const error = await parseApiError(response)
    expect(error.code).toBe('PARSE_ERROR')
    expect(error.status).toBe(500)
  })
})
```

- [ ] **Step 2: Run tests to confirm they FAIL**

```bash
cd frontend && npx vitest run --project unit src/shared/lib/api-fetch.test.ts
```
Expected: FAIL — "expected 'Bearer test-jwt-token' to be 'access_token=...'" or similar

- [ ] **Step 3: Rewrite `src/shared/lib/api-fetch.ts`**

```ts
// src/shared/lib/api-fetch.ts
import { env } from '@config/env'

export const TRACE_ID_HEADER = 'x-trace-id'

export type ApiFetchOptions = {
  method?:      'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?:        string
  headers?:     Record<string, string>
  accessToken:  string
  traceId?:     string
}

export type ApiFetchError = {
  code:     string
  message:  string
  status:   number
  errors?:  Record<string, string[]>
}

export async function apiFetch(
  path: string,
  options: ApiFetchOptions,
): Promise<Response> {
  const traceId = options.traceId ?? crypto.randomUUID()

  return fetch(`${env.NEST_API}${path}`, {
    method: options.method ?? 'GET',
    ...(options.body !== undefined ? { body: options.body } : {}),
    headers: {
      'Content-Type':    'application/json',
      'Cookie':          `access_token=${options.accessToken}`,
      [TRACE_ID_HEADER]: traceId,
      ...options.headers,
    },
  })
}

export async function parseApiError(response: Response): Promise<ApiFetchError> {
  try {
    const body = await response.json()
    return {
      code:    body.code    ?? 'UNKNOWN_ERROR',
      message: body.message ?? 'An unexpected error occurred',
      status:  response.status,
      errors:  body.errors,
    }
  } catch {
    return {
      code:    'PARSE_ERROR',
      message: 'Could not parse error response',
      status:  response.status,
    }
  }
}
```

- [ ] **Step 4: Run tests to confirm they PASS**

```bash
cd frontend && npx vitest run --project unit src/shared/lib/api-fetch.test.ts
```
Expected: PASS — 5/5 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/api-fetch.ts src/shared/lib/api-fetch.test.ts
git commit -m "refactor(api-fetch): replace tenant headers with NestJS cookie forwarding"
```

---

## Task 4: Create api-schemas.ts (Zod envelope helpers)

**Files:**
- Create: `src/shared/lib/api-schemas.ts`
- Create: `src/shared/lib/api-schemas.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/shared/lib/api-schemas.test.ts
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { apiEnvelope, paginatedEnvelope } from './api-schemas'

describe('apiEnvelope', () => {
  it('parses a valid NestJS response envelope', () => {
    const schema = apiEnvelope(z.object({ name: z.string() }))
    const result = schema.safeParse({
      statusCode: 200,
      message: 'OK',
      data: { name: 'test' },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data.name).toBe('test')
    }
  })

  it('rejects missing data field', () => {
    const schema = apiEnvelope(z.object({ name: z.string() }))
    const result = schema.safeParse({ statusCode: 200, message: 'OK' })
    expect(result.success).toBe(false)
  })
})

describe('paginatedEnvelope', () => {
  it('parses a valid paginated response', () => {
    const schema = paginatedEnvelope(z.object({ id: z.string() }))
    const result = schema.safeParse({
      statusCode: 200,
      message: 'OK',
      data: {
        items: [{ id: 'abc' }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data.items[0]?.id).toBe('abc')
    }
  })

  it('rejects when items array contains wrong shape', () => {
    const schema = paginatedEnvelope(z.object({ id: z.string() }))
    const result = schema.safeParse({
      statusCode: 200,
      message: 'OK',
      data: {
        items: [{ notId: 'wrong' }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Run to confirm FAIL**

```bash
cd frontend && npx vitest run --project unit src/shared/lib/api-schemas.test.ts
```
Expected: FAIL — "Cannot find module './api-schemas'"

- [ ] **Step 3: Create `src/shared/lib/api-schemas.ts`**

```ts
// src/shared/lib/api-schemas.ts
import { z } from 'zod'

// Wraps any schema in the NestJS response envelope: { statusCode, message, data }
export function apiEnvelope<T>(dataSchema: z.ZodType<T>) {
  return z.object({
    statusCode: z.number(),
    message:    z.string(),
    data:       dataSchema,
  })
}

// Wraps any schema in a paginated NestJS envelope
// Matches PaginatedResponseDto from nest-backend
export function paginatedEnvelope<T>(itemSchema: z.ZodType<T>) {
  return apiEnvelope(
    z.object({
      items:      z.array(itemSchema),
      total:      z.number(),
      page:       z.number(),
      limit:      z.number(),
      totalPages: z.number(),
    }),
  )
}
```

- [ ] **Step 4: Run to confirm PASS**

```bash
cd frontend && npx vitest run --project unit src/shared/lib/api-schemas.test.ts
```
Expected: PASS — 4/4 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/api-schemas.ts src/shared/lib/api-schemas.test.ts
git commit -m "feat(shared): add Zod helpers to unwrap NestJS response envelope"
```

---

## Task 5: Populate query-keys.ts

**Files:**
- Modify: `src/shared/lib/query-keys.ts`
- Modify: `src/shared/lib/query-keys.test.ts`

No tenant scoping — intentional because NestJS has no multi-tenancy (documented in spec).

- [ ] **Step 1: Rewrite `query-keys.test.ts` with real assertions**

```ts
// src/shared/lib/query-keys.test.ts
import { describe, expect, it } from 'vitest'
import { queryKeys } from './query-keys'

describe('queryKeys', () => {
  describe('products', () => {
    it('all() returns ["products"]', () => {
      expect(queryKeys.products.all()).toEqual(['products'])
    })
    it('list() includes filters', () => {
      const key = queryKeys.products.list({ page: 1 })
      expect(key[0]).toBe('products')
      expect(key).toContain('list')
    })
    it('detail() includes id', () => {
      const key = queryKeys.products.detail('prod-1')
      expect(key).toContain('prod-1')
    })
  })

  describe('categories', () => {
    it('all() returns ["categories"]', () => {
      expect(queryKeys.categories.all()).toEqual(['categories'])
    })
  })

  describe('roles', () => {
    it('all() returns ["roles"]', () => {
      expect(queryKeys.roles.all()).toEqual(['roles'])
    })
  })
})
```

- [ ] **Step 2: Run to confirm FAIL**

```bash
cd frontend && npx vitest run --project unit src/shared/lib/query-keys.test.ts
```
Expected: FAIL — "queryKeys.products is undefined"

- [ ] **Step 3: Rewrite `src/shared/lib/query-keys.ts`**

```ts
// src/shared/lib/query-keys.ts
// No tenant scoping: NestJS handles user isolation server-side via JWT.
// See frontend/docs/superpowers/specs/2026-03-22-frontend-design.md for rationale.

export const queryKeys = {
  products: {
    all:    ()                    => ['products'] as const,
    list:   (q?: object)          => ['products', 'list', q] as const,
    detail: (id: string)          => ['products', id] as const,
  },
  categories: {
    all:    ()                    => ['categories'] as const,
    list:   (q?: object)          => ['categories', 'list', q] as const,
    detail: (id: string)          => ['categories', id] as const,
  },
  subCategories: {
    all:    ()                    => ['sub-categories'] as const,
    list:   (q?: object)          => ['sub-categories', 'list', q] as const,
    detail: (id: string)          => ['sub-categories', id] as const,
  },
  departments: {
    all:    ()                    => ['departments'] as const,
    list:   (q?: object)          => ['departments', 'list', q] as const,
    detail: (id: string)          => ['departments', id] as const,
  },
  groups: {
    all:    ()                    => ['groups'] as const,
    list:   (q?: object)          => ['groups', 'list', q] as const,
    detail: (id: string)          => ['groups', id] as const,
    fields: (groupId: string)     => ['groups', groupId, 'fields'] as const,
  },
  attributes: {
    all:    ()                    => ['attributes'] as const,
    list:   (q?: object)          => ['attributes', 'list', q] as const,
    detail: (id: string)          => ['attributes', id] as const,
  },
  roles: {
    all:    ()                    => ['roles'] as const,
    list:   (q?: object)          => ['roles', 'list', q] as const,
    detail: (id: string)          => ['roles', id] as const,
  },
  users: {
    all:    ()                    => ['users'] as const,
    list:   (q?: object)          => ['users', 'list', q] as const,
    detail: (id: string)          => ['users', id] as const,
  },
  variants: {
    all:    (productId: string)   => ['products', productId, 'variants'] as const,
    list:   (productId: string, q?: object) =>
              ['products', productId, 'variants', 'list', q] as const,
    detail: (productId: string, variantId: string) =>
              ['products', productId, 'variants', variantId] as const,
  },
} as const
```

- [ ] **Step 4: Run to confirm PASS**

```bash
cd frontend && npx vitest run --project unit src/shared/lib/query-keys.test.ts
```
Expected: PASS — all tests passing

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/query-keys.ts src/shared/lib/query-keys.test.ts
git commit -m "feat(shared): populate query key factories for all 9 admin modules"
```

---

## Task 6: Update MSW auth handlers (NestJS response shapes)

**Files:**
- Modify: `src/__tests__/msw/handlers/auth.handlers.ts`
- Create: `src/__tests__/msw/handlers/products.handlers.ts`
- Create: `src/__tests__/msw/handlers/admin.handlers.ts`
- Modify: `src/__tests__/msw/handlers/index.ts`

- [ ] **Step 1: Rewrite `auth.handlers.ts` for NestJS response shapes**

```ts
// src/__tests__/msw/handlers/auth.handlers.ts
import { faker } from '@faker-js/faker'
import { HttpResponse, http } from 'msw'

const BASE = 'http://localhost:3001'

type FakeRole = { id: string; roleName: string }
type FakeUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: FakeRole
}

function fakeRole(roleName = 'Viewer'): FakeRole {
  return { id: faker.string.uuid(), roleName }
}

function fakeUser(role?: FakeRole): FakeUser {
  return {
    id:        faker.string.uuid(),
    email:     faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName:  faker.person.lastName(),
    role:      role ?? fakeRole(),
  }
}

// Shared user so GET /api/users/me returns same user as POST /api/auth/login
let currentUser = fakeUser()

export const authHandlers = [
  // POST /api/auth/login → NestJS returns { message } + Set-Cookie header
  http.post(`${BASE}/api/auth/login`, () => {
    currentUser = fakeUser()
    return new HttpResponse(
      JSON.stringify({ statusCode: 200, message: 'Login successful', data: null }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie':   `access_token=fake-jwt-token; HttpOnly; SameSite=Strict`,
        },
      },
    )
  }),

  // POST /api/auth/logout
  http.post(`${BASE}/api/auth/logout`, () => {
    return HttpResponse.json({ statusCode: 200, message: 'Logout successful', data: null })
  }),

  // GET /api/users/me → called by next-auth authorize() after login
  http.get(`${BASE}/api/users/me`, () => {
    return HttpResponse.json({
      statusCode: 200,
      message:    'OK',
      data:       currentUser,
    })
  }),
]
```

- [ ] **Step 2: Create `src/__tests__/msw/handlers/admin.handlers.ts`** — empty handlers for admin modules (filled out in Phase 2):

```ts
// src/__tests__/msw/handlers/admin.handlers.ts
// Handlers for admin CRUD endpoints — populated in Phase 2
// Each Phase 2 task adds handlers here.
export const adminHandlers: ReturnType<typeof import('msw').http.get>[] = []
```

- [ ] **Step 3: Update `src/__tests__/msw/handlers/index.ts`**

```ts
// src/__tests__/msw/handlers/index.ts
import { adminHandlers } from './admin.handlers'
import { authHandlers }  from './auth.handlers'

export const handlers = [
  ...authHandlers,
  ...adminHandlers,
]
```

- [ ] **Step 4: Run all existing tests to confirm nothing is broken**

```bash
cd frontend && npm test
```
Expected: all existing tests still pass

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/msw/handlers/
git commit -m "fix(msw): update auth handlers to NestJS response shapes and localhost:3001"
```

---

## Task 7: Install missing packages + update Premium Blue CSS tokens

**Files:**
- No code files yet — install packages and update `src/app/globals.css`

- [ ] **Step 1: Install missing packages**

```bash
cd frontend && npm install @hookform/resolvers next-themes framer-motion
```
Expected: packages added to package.json

- [ ] **Step 2: Update Premium Blue design tokens in `src/app/globals.css`**

Find the `:root` block that starts with `/* ── Primary Brand Color (Burgundy / Maroon) ── */` and replace the primary color scale:

```css
/* ── Primary Brand Color (Premium Blue) ────────────────────────────────── */
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6; /* ← Main brand color — blue-500 */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
```

Also add accent color and dark mode tokens at the end of `:root`:

```css
/* ── Accent Color (Cyan) ─────────────────────────────────────────────────── */
--accent-500: #06b6d4;
--accent-600: #0891b2;

/* ── Dark mode base backgrounds ─────────────────────────────────────────── */
--bg-dark:    #030712;
--bg-dark-2:  #111827;
--bg-dark-3:  #1f2937;
```

Add dark mode override at the end of globals.css:

```css
/* ── Dark theme ──────────────────────────────────────────────────────────── */
[data-theme="dark"] {
  --surface-page:   var(--bg-dark);
  --surface-subtle: var(--bg-dark-2);
  --surface-border: var(--bg-dark-3);
  --text-heading:   #f1f5f9;
  --text-body:      #cbd5e1;
  --text-muted:     #94a3b8;
}
```

- [ ] **Step 3: Run color check to confirm no hardcoded hex values were introduced in src/ files**

```bash
cd frontend && npm run check:colors
```
Expected: exits 0 (globals.css is excluded from this check)

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css package.json package-lock.json
git commit -m "feat(design): switch to Premium Blue color tokens + install next-themes"
```

---

## Task 8: Create middleware.ts

**Files:**
- Create: `src/middleware.ts`

Next.js looks for `src/middleware.ts` (or root-level `middleware.ts`). Currently, `src/proxy.ts` contains the logic but exports it as `proxy` (not `middleware`). The middleware file is a thin re-export.

- [ ] **Step 1: Create `src/middleware.ts`**

```ts
// src/middleware.ts
// Re-export the proxy function as Next.js middleware.
// Logic lives in proxy.ts so it can be unit-tested independently.
export { proxy as middleware, config } from './proxy'
```

- [ ] **Step 2: Verify dev server starts without errors**

```bash
cd frontend && npm run dev &
sleep 3 && kill %1 2>/dev/null
```
Expected: server starts without compilation errors

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(middleware): wire proxy.ts as Next.js middleware"
```

---

## Task 9: Create auth-options.ts (CredentialsProvider with cookie threading)

**Files:**
- Create: `src/shared/lib/auth-options.ts`
- Create: `src/shared/lib/auth-options.test.ts`

This is the most critical file in Phase 1. The `authorize()` function must:
1. POST to NestJS `/api/auth/login` and extract the `access_token` from the `Set-Cookie` response header
2. Use that token to GET `/api/users/me` to populate session user data
3. Return the user object which next-auth stores in the JWT

**Do not use `apiFetch()` here** — `apiFetch()` requires an `accessToken` to forward, which we don't have yet during the login step. Use raw `fetch()`.

> **Prerequisite — verify backend endpoint exists before proceeding:**
> The `authorize()` flow calls `GET /api/users/me` on NestJS. If this endpoint does not exist, login will appear to succeed but the session will be null (silently broken).
>
> Check: `ls nest-backend/src/modules/` — look for a `users` module. Then verify:
> ```bash
> # Start NestJS dev server first, then:
> curl -s http://localhost:3001/api/users/me
> # Expected: 401 {"statusCode":401,"message":"Unauthorized"} (endpoint exists but no auth token)
> # If you get 404: the endpoint does not exist — add it to the NestJS backend before continuing.
> ```
> The NestJS migration plan (`nest-backend/docs/superpowers/plans/`) may already include this endpoint. Confirm it is implemented.

- [ ] **Step 1: Write the failing test**

```ts
// src/shared/lib/auth-options.test.ts
import { server } from '@test/msw/server'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { authOptions } from './auth-options'

const BASE = 'http://localhost:3001'

// Grab the CredentialsProvider from authOptions
const credentialsProvider = authOptions.providers[0] as {
  authorize: (credentials: Record<string, string>) => Promise<unknown>
}

describe('authOptions CredentialsProvider', () => {
  it('returns user object on valid login', async () => {
    server.use(
      http.post(`${BASE}/api/auth/login`, () =>
        new HttpResponse(
          JSON.stringify({ statusCode: 200, message: 'Login successful', data: null }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Set-Cookie':   'access_token=valid-jwt; HttpOnly; SameSite=Strict',
            },
          },
        ),
      ),
      http.get(`${BASE}/api/users/me`, () =>
        HttpResponse.json({
          statusCode: 200,
          message:    'OK',
          data: {
            id:        'user-1',
            email:     'test@example.com',
            firstName: 'Test',
            lastName:  'User',
            role:      { id: 'role-1', roleName: 'Admin' },
          },
        }),
      ),
    )

    const result = await credentialsProvider.authorize({
      email:    'test@example.com',
      password: 'password123',
    })

    expect(result).toMatchObject({
      id:          'user-1',
      email:       'test@example.com',
      firstName:   'Test',
      role:        { roleName: 'Admin' },
      accessToken: 'valid-jwt',
    })
  })

  it('returns null when NestJS returns 401', async () => {
    server.use(
      http.post(`${BASE}/api/auth/login`, () =>
        HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 }),
      ),
    )

    const result = await credentialsProvider.authorize({
      email:    'bad@example.com',
      password: 'wrong',
    })

    expect(result).toBeNull()
  })

  it('returns null when Set-Cookie header is missing', async () => {
    server.use(
      http.post(`${BASE}/api/auth/login`, () =>
        HttpResponse.json(
          { statusCode: 200, message: 'Login successful', data: null },
          { status: 200 },
        ),
      ),
    )

    const result = await credentialsProvider.authorize({
      email:    'test@example.com',
      password: 'password123',
    })

    expect(result).toBeNull()
  })
})
```

- [ ] **Step 2: Run to confirm FAIL**

```bash
cd frontend && npx vitest run --project unit src/shared/lib/auth-options.test.ts
```
Expected: FAIL — "Cannot find module './auth-options'"

- [ ] **Step 3: Create `src/shared/lib/auth-options.ts`**

```ts
// src/shared/lib/auth-options.ts
import type { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { SessionUser } from '@shared/types/core'

const NEST_API = process.env.NEST_API ?? 'http://localhost:3001'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null

        try {
          // Step 1: Login — extract access_token from Set-Cookie header
          const loginRes = await fetch(`${NEST_API}/api/auth/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              email:    credentials.email,
              password: credentials.password,
            }),
          })

          if (!loginRes.ok) return null

          const setCookie = loginRes.headers.get('set-cookie')
          const token     = setCookie?.match(/access_token=([^;]+)/)?.[1]
          if (!token) return null

          // Step 2: Get user details with the extracted token
          const meRes = await fetch(`${NEST_API}/api/users/me`, {
            headers: { Cookie: `access_token=${token}` },
          })

          if (!meRes.ok) return null

          const meBody  = await meRes.json() as { data: SessionUser }
          const user    = meBody.data

          return {
            id:          user.id,
            email:       user.email,
            firstName:   user.firstName,
            lastName:    user.lastName,
            role:        user.role,
            accessToken: token,
          }
        } catch {
          return null
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, user object is returned from authorize()
      if (user) {
        const u = user as {
          id: string
          email: string
          firstName: string
          lastName: string
          role: { id: string; roleName: string }
          accessToken: string
        }
        token.id          = u.id
        token.email       = u.email
        token.firstName   = u.firstName
        token.lastName    = u.lastName
        token.role        = u.role
        token.accessToken = u.accessToken
      }
      return token
    },

    async session({ session, token }) {
      session.accessToken    = token.accessToken
      session.user.id        = token.id
      session.user.email     = token.email ?? ''
      session.user.firstName = token.firstName
      session.user.lastName  = token.lastName
      session.user.role      = token.role
      return session
    },
  },

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  session: { strategy: 'jwt' },
}
```

- [ ] **Step 4: Run to confirm PASS**

```bash
cd frontend && npx vitest run --project unit src/shared/lib/auth-options.test.ts
```
Expected: PASS — 3/3 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/auth-options.ts src/shared/lib/auth-options.test.ts
git commit -m "feat(auth): add CredentialsProvider with NestJS cookie threading"
```

---

## Task 10: Create next-auth API route

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Create the route handler**

```ts
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authOptions } from '@shared/lib/auth-options'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

- [ ] **Step 2: Run type-check**

```bash
cd frontend && npm run type-check
```
Expected: exits 0

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/
git commit -m "feat(auth): wire next-auth route handler"
```

---

## Task 11: Update proxy.ts — session guard + role check

**Files:**
- Modify: `src/proxy.ts`
- Modify: `src/proxy.test.ts`

The middleware needs to:
- Allow public paths: `/login`, `/api/auth/...`, `/_next`, `/favicon.ico`, `/api/health`
- Redirect unauthenticated users to `/login`
- Redirect users lacking Admin/Staff role away from `/admin/*` to `/unauthorized`
- Redirect non-Admin users away from `/admin/roles` and `/admin/users` to `/unauthorized`

**Important:** The middleware uses `getToken()` from `next-auth/jwt` (not `getServerSession()` — middleware runs in Edge runtime which doesn't support Node.js APIs required by `getServerSession`).

- [ ] **Step 1: Write failing tests**

```ts
// Add to src/proxy.test.ts — below existing tests

import { vi } from 'vitest'

// Mock next-auth/jwt getToken for auth-dependent tests
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}))

import { getToken } from 'next-auth/jwt'
const mockGetToken = vi.mocked(getToken)

describe('proxy — auth guard', () => {
  it('redirects unauthenticated user to /login for protected route', async () => {
    mockGetToken.mockResolvedValueOnce(null)
    const req = makeRequest('/products')
    const response = await proxy(req)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login')
  })

  it('allows authenticated user through to /products', async () => {
    mockGetToken.mockResolvedValueOnce({
      id: 'u1', role: { roleName: 'Viewer' }, accessToken: 'tok',
    } as never)
    const req = makeRequest('/products')
    const response = await proxy(req)
    expect(response.status).not.toBe(307)
  })

  it('redirects non-Admin/Staff to /unauthorized for /admin routes', async () => {
    mockGetToken.mockResolvedValueOnce({
      id: 'u1', role: { roleName: 'Viewer' }, accessToken: 'tok',
    } as never)
    const req = makeRequest('/admin/products')
    const response = await proxy(req)
    expect(response.headers.get('location')).toContain('/unauthorized')
  })

  it('allows Admin through to /admin routes', async () => {
    mockGetToken.mockResolvedValueOnce({
      id: 'u1', role: { roleName: 'Admin' }, accessToken: 'tok',
    } as never)
    const req = makeRequest('/admin/products')
    const response = await proxy(req)
    expect(response.status).not.toBe(307)
  })

  it('allows public /login path without auth', async () => {
    mockGetToken.mockResolvedValueOnce(null)
    const req = makeRequest('/login')
    const response = await proxy(req)
    expect(response.status).not.toBe(307)
  })
})
```

- [ ] **Step 2: Run to confirm new tests FAIL**

```bash
cd frontend && npx vitest run --project unit src/proxy.test.ts
```
Expected: new tests FAIL (existing tests still pass)

- [ ] **Step 3: Update `src/proxy.ts`**

```ts
// src/proxy.ts
import { getToken } from 'next-auth/jwt'
import { type NextRequest, NextResponse } from 'next/server'

export const TRACE_ID_HEADER = 'x-trace-id'
export const NONCE_HEADER    = 'x-nonce'

const PUBLIC_PATHS = [
  '/login',
  '/api/health',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/unauthorized',
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p))
}

function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString('base64')
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname

  if (!isPublicPath(pathname)) {
    const token = await getToken({
      req:    request,
      secret: process.env.NEXTAUTH_SECRET ?? '',
    })

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.url)
      return NextResponse.redirect(loginUrl)
    }

    const roleName = (token.role as { roleName: string } | undefined)?.roleName ?? ''

    // Admin-only routes
    if (pathname.startsWith('/admin/roles') || pathname.startsWith('/admin/users')) {
      if (roleName !== 'Admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    // Admin + Staff routes
    if (pathname.startsWith('/admin')) {
      if (roleName !== 'Admin' && roleName !== 'Staff') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  // Propagate or generate trace ID
  const traceId = request.headers.get(TRACE_ID_HEADER) ?? crypto.randomUUID()
  const nonce   = generateNonce()

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    `connect-src 'self' ${process.env.NEST_API ?? ''} https://app.posthog.com`,
    'font-src \'self\'',
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  const response = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers),
        [TRACE_ID_HEADER]: traceId,
        [NONCE_HEADER]:    nonce,
      }),
    },
  })

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(TRACE_ID_HEADER, traceId)

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 4: Run all proxy tests to confirm PASS**

```bash
cd frontend && npx vitest run --project unit src/proxy.test.ts
```
Expected: all tests pass (both old and new)

- [ ] **Step 5: Commit**

```bash
git add src/proxy.ts src/proxy.test.ts
git commit -m "feat(middleware): add session guard and role-based route protection"
```

---

## Task 12: Create auth feature (schema + LoginForm)

**Files:**
- Create: `src/features/auth/schemas/login.schema.ts`
- Create: `src/features/auth/schemas/login.schema.test.ts`
- Create: `src/features/auth/components/LoginForm.tsx`
- Create: `src/features/auth/components/LoginForm.test.tsx`
- Create: `src/features/auth/hooks/useSession.ts`

- [ ] **Step 1: Write failing schema test**

```ts
// src/features/auth/schemas/login.schema.test.ts
import { describe, expect, it } from 'vitest'
import { LoginFormSchema } from './login.schema'

describe('LoginFormSchema', () => {
  it('accepts valid credentials', () => {
    const result = LoginFormSchema.safeParse({
      email:    'admin@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty email', () => {
    const result = LoginFormSchema.safeParse({ email: '', password: 'password123' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email format', () => {
    const result = LoginFormSchema.safeParse({ email: 'notanemail', password: 'password123' })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 6 chars', () => {
    const result = LoginFormSchema.safeParse({ email: 'a@b.com', password: '12345' })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Run to confirm FAIL**

```bash
cd frontend && npx vitest run --project ui src/features/auth/schemas/login.schema.test.ts
```
Expected: FAIL — "Cannot find module './login.schema'"

- [ ] **Step 3: Create `src/features/auth/schemas/login.schema.ts`**

```ts
// src/features/auth/schemas/login.schema.ts
import { z } from 'zod'

export const LoginFormSchema = z.object({
  email:    z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormValues = z.infer<typeof LoginFormSchema>
```

- [ ] **Step 4: Run to confirm schema tests PASS**

```bash
cd frontend && npx vitest run --project ui src/features/auth/schemas/login.schema.test.ts
```
Expected: PASS — 4/4

- [ ] **Step 5: Write failing LoginForm component test**

```tsx
// src/features/auth/components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<LoginForm onSubmit={vi.fn()} />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('shows validation error for empty email on submit', async () => {
    render(<LoginForm onSubmit={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
  })

  it('calls onSubmit with email and password when valid', async () => {
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@test.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email:    'admin@test.com',
        password: 'password123',
      })
    })
  })

  it('shows error message when errorMessage prop is set', () => {
    render(<LoginForm onSubmit={vi.fn()} errorMessage="Invalid credentials" />)
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
  })

  it('disables submit button while loading', () => {
    render(<LoginForm onSubmit={vi.fn()} isLoading />)
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })
})
```

- [ ] **Step 6: Run to confirm LoginForm tests FAIL**

```bash
cd frontend && npx vitest run --project ui src/features/auth/components/LoginForm.test.tsx
```
Expected: FAIL — "Cannot find module './LoginForm'"

- [ ] **Step 7: Create `src/features/auth/components/LoginForm.tsx`**

```tsx
// src/features/auth/components/LoginForm.tsx
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { LoginFormSchema, type LoginFormValues } from '../schemas/login.schema'

type LoginFormProps = {
  onSubmit:      (values: LoginFormValues) => void | Promise<void>
  isLoading?:    boolean
  errorMessage?: string
}

export function LoginForm(props: LoginFormProps): React.JSX.Element {
  const form = useForm<LoginFormValues>({
    resolver:      zodResolver(LoginFormSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <form
      onSubmit={form.handleSubmit(props.onSubmit)}
      className="flex flex-col gap-4 w-full max-w-sm"
      noValidate
    >
      {props.errorMessage !== undefined && props.errorMessage !== '' && (
        <div
          role="alert"
          className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger)]/10 p-3 text-sm text-[var(--color-danger)]"
        >
          {props.errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-[var(--text-heading)]">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="rounded-md border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm outline-none focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-alpha-2)]"
          {...form.register('email')}
        />
        {form.formState.errors.email !== undefined && (
          <p className="text-xs text-[var(--color-danger)]">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-[var(--text-heading)]">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="rounded-md border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm outline-none focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-alpha-2)]"
          {...form.register('password')}
        />
        {form.formState.errors.password !== undefined && (
          <p className="text-xs text-[var(--color-danger)]">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={props.isLoading === true}
        className="rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-600)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {props.isLoading === true ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
```

- [ ] **Step 8: Create `src/features/auth/hooks/useSession.ts`**

```ts
// src/features/auth/hooks/useSession.ts
'use client'

import { useSession as useNextAuthSession } from 'next-auth/react'
import type { SessionUser } from '@shared/types/core'

export type UseSessionResult =
  | { status: 'loading'; user: null;        accessToken: null }
  | { status: 'unauthenticated'; user: null; accessToken: null }
  | { status: 'authenticated'; user: SessionUser; accessToken: string }

export function useSession(): UseSessionResult {
  const { data, status } = useNextAuthSession()

  if (status === 'loading') {
    return { status: 'loading', user: null, accessToken: null }
  }

  if (status === 'unauthenticated' || data === null || data === undefined) {
    return { status: 'unauthenticated', user: null, accessToken: null }
  }

  return {
    status:      'authenticated',
    user:        data.user as SessionUser,
    accessToken: data.accessToken,
  }
}
```

- [ ] **Step 9: Run all LoginForm tests to confirm PASS**

```bash
cd frontend && npx vitest run --project ui src/features/auth/
```
Expected: all tests pass

- [ ] **Step 10: Commit**

```bash
git add src/features/auth/
git commit -m "feat(auth): login form with Zod validation and useSession hook"
```

---

## Task 13: Create ThemeProvider + ThemeToggle

**Files:**
- Create: `src/shared/providers/ThemeProvider.tsx`
- Create: `src/shared/components/ThemeToggle.tsx`

- [ ] **Step 1: Create `src/shared/providers/ThemeProvider.tsx`**

```tsx
// src/shared/providers/ThemeProvider.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

type ThemeProviderProps = {
  children: React.ReactNode
}

export function ThemeProvider(props: ThemeProviderProps): React.JSX.Element {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {props.children}
    </NextThemesProvider>
  )
}
```

- [ ] **Step 2: Create `src/shared/components/ThemeToggle.tsx`**

```tsx
// src/shared/components/ThemeToggle.tsx
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle(): React.JSX.Element {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted]   = useState(false)

  // Avoid hydration mismatch — only render after mount
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return <div className="h-8 w-8 rounded-md" aria-hidden="true" />
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--surface-border)] text-[var(--text-muted)] hover:text-[var(--text-body)] transition-colors"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
```

- [ ] **Step 3: Update `src/app/layout.tsx` — add SessionProvider + ThemeProvider**

```tsx
// src/app/layout.tsx
import { AnalyticsProvider } from '@shared/providers/AnalyticsProvider'
import { QueryProvider }     from '@shared/providers/QueryProvider'
import { ThemeProvider }     from '@shared/providers/ThemeProvider'
import type { Metadata }     from 'next'
import { DM_Sans }           from 'next/font/google'
import { SessionProvider }   from 'next-auth/react'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets:  ['latin'],
  weight:   ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title:       'Aksharpith Digital Catalog',
  description: 'Product catalog and admin portal',
}

type RootLayoutProps = Readonly<{ children: React.ReactNode }>

export default function RootLayout(props: RootLayoutProps): React.ReactElement {
  return (
    <html lang="en" className={dmSans.variable} suppressHydrationWarning>
      <body className="antialiased">
        <SessionProvider>
          <ThemeProvider>
            <QueryProvider>
              <AnalyticsProvider>
                {props.children}
              </AnalyticsProvider>
            </QueryProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Run type-check**

```bash
cd frontend && npm run type-check
```
Expected: exits 0

- [ ] **Step 5: Commit**

```bash
git add src/shared/providers/ThemeProvider.tsx src/shared/components/ThemeToggle.tsx src/app/layout.tsx
git commit -m "feat(theme): add ThemeProvider and ThemeToggle with next-themes"
```

---

## Task 14: Create route group layouts + login page

**Files:**
- Create: `src/features/auth/components/LoginPageClient.tsx`
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/login/loading.tsx`
- Create: `src/app/(auth)/login/error.tsx`
- Create: `src/app/(catalog)/layout.tsx`
- Create: `src/app/(admin)/layout.tsx`
- Create: `src/app/unauthorized/page.tsx`
- Delete: `src/app/login/` directory

- [ ] **Step 1: Create `src/app/(auth)/layout.tsx`**

```tsx
// src/app/(auth)/layout.tsx
type AuthLayoutProps = { children: React.ReactNode }

export default function AuthLayout(props: AuthLayoutProps): React.JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-dark)]">
      {props.children}
    </main>
  )
}
```

- [ ] **Step 2: Create `LoginPageClient.tsx` + thin page shell**

> **Pages-are-shells rule:** Pages must be Server Components with no `'use client'`. Extract client state and `signIn` logic into a feature component.

```tsx
// src/features/auth/components/LoginPageClient.tsx
'use client'

import { LoginForm }            from './LoginForm'
import type { LoginFormValues } from '../schemas/login.schema'
import { signIn }               from 'next-auth/react'
import { useRouter }            from 'next/navigation'
import { useState }             from 'react'

export function LoginPageClient(): React.JSX.Element {
  const router = useRouter()
  const [isLoading,    setIsLoading]    = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  async function handleLogin(values: LoginFormValues): Promise<void> {
    setIsLoading(true)
    setErrorMessage(undefined)

    const result = await signIn('credentials', {
      email:    values.email,
      password: values.password,
      redirect: false,
    })

    setIsLoading(false)

    if (result?.error !== null && result?.error !== undefined) {
      setErrorMessage('Invalid email or password')
      return
    }

    router.push('/products')
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--text-heading)]">
          Aksharpith Catalog
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Sign in to your account
        </p>
      </div>

      <LoginForm
        onSubmit={handleLogin}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />
    </div>
  )
}
```

```tsx
// src/app/(auth)/login/page.tsx
import { LoginPageClient } from '@features/auth/components/LoginPageClient'

export default function LoginPage(): React.JSX.Element {
  return <LoginPageClient />
}
```

- [ ] **Step 3: Create `src/app/(auth)/login/loading.tsx`**

```tsx
// src/app/(auth)/login/loading.tsx
export default function LoginLoading(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm px-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-[var(--surface-subtle)]" />
      <div className="h-4 w-32 rounded bg-[var(--surface-subtle)]" />
      <div className="h-10 w-full rounded bg-[var(--surface-subtle)]" />
      <div className="h-10 w-full rounded bg-[var(--surface-subtle)]" />
      <div className="h-10 w-full rounded bg-[var(--primary-alpha-2)]" />
    </div>
  )
}
```

- [ ] **Step 4: Create `src/app/(auth)/login/error.tsx`**

```tsx
// src/app/(auth)/login/error.tsx
'use client'

type LoginErrorProps = {
  error:  Error & { digest?: string }
  reset:  () => void
}

export default function LoginError(props: LoginErrorProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-sm text-[var(--color-danger)]">
        Something went wrong loading the login page.
      </p>
      <button
        type="button"
        onClick={props.reset}
        className="text-sm text-[var(--primary-500)] underline"
      >
        Try again
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/app/(catalog)/layout.tsx`** — shell (populated in Phase 3):

```tsx
// src/app/(catalog)/layout.tsx
// Phase 3 will add: FloatingNav, ThemeToggle, auth guard
type CatalogLayoutProps = { children: React.ReactNode }

export default function CatalogLayout(props: CatalogLayoutProps): React.JSX.Element {
  return <>{props.children}</>
}
```

- [ ] **Step 6: Create `src/app/(admin)/layout.tsx`** — shell (populated in Phase 2):

```tsx
// src/app/(admin)/layout.tsx
// Phase 2 will add: Sidebar nav, header, auth guard, session display
type AdminLayoutProps = { children: React.ReactNode }

export default function AdminLayout(props: AdminLayoutProps): React.JSX.Element {
  return <>{props.children}</>
}
```

- [ ] **Step 7: Create `src/app/unauthorized/page.tsx`**

```tsx
// src/app/unauthorized/page.tsx
import Link from 'next/link'

export default function UnauthorizedPage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-2xl font-bold text-[var(--text-heading)]">
        Access Denied
      </h1>
      <p className="text-sm text-[var(--text-muted)] max-w-sm">
        You do not have permission to view this page. Contact an administrator if you need access.
      </p>
      <Link
        href="/products"
        className="text-sm text-[var(--primary-500)] underline"
      >
        Back to catalog
      </Link>
    </main>
  )
}
```

- [ ] **Step 8: Remove old login folder**

```bash
rm -rf /Users/sarangtandel/Documents/Code/Aksharpith/frontend/src/app/login/
```

- [ ] **Step 9: Run type-check and full test suite**

```bash
cd frontend && npm run type-check && npm test
```
Expected: type-check exits 0, all tests pass

- [ ] **Step 10: Commit**

```bash
git add src/app/ && git rm -r src/app/login/
git commit -m "feat(routing): create route groups (auth), (catalog), (admin) + real login page"
```

---

## Task 15: Final Phase 1 verification

- [ ] **Step 1: Run full quality gate**

```bash
cd frontend && npm run type-check && npm run lint && npm test && npm run check:arch && npm run check:colors
```
Expected: all five exit 0

- [ ] **Step 2: Start dev server and test login flow manually**

```bash
cd frontend && npm run dev
# Navigate to http://localhost:3000
# Should redirect to /login
# Sign in with a valid NestJS user (ensure NestJS is running on :3001)
# Should redirect to /products after login
```

- [ ] **Step 3: Commit with clean status**

```bash
git status
# Should show clean working tree or only untracked files
```
