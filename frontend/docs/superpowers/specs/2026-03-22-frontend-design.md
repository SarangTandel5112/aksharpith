# Aksharpith Digital Catalog — Frontend Design Spec

**Date:** 2026-03-22
**Status:** Approved
**Branch:** feature/backend-refactor-lot-matrix

---

## What We're Building

A production-grade Next.js 16 application with two surfaces:

1. **Customer Catalog** — login-required product browsing with filters, search, and product detail pages. Aceternity UI dark theme with premium blue accents.
2. **Admin Panel** — full CRUD management for all 10 backend modules. shadcn/ui clean interface.

---

## Tech Stack (Exact Versions — Already Installed)

| Package | Version | Notes |
|---------|---------|-------|
| Next.js | 16.1.6 | App Router |
| React | 19.2.3 | React Compiler enabled |
| next-auth | 4.24.13 | CredentialsProvider → NestJS |
| TanStack Query | 5.90.21 | SSR + HydrationBoundary |
| Zustand | 5.0.11 | UI state only |
| Zod | 4.3.6 | All schema validation |
| Tailwind | v4 | PostCSS plugin |
| shadcn/ui | configured | Admin + base components |
| Aceternity UI | copy-paste | Catalog pages only |
| Biome | 2.4.6 | Lint + format |
| Vitest | 2.1.9 | unit + ui workspaces |
| Playwright | 1.58.2 | E2E browser tests |
| MSW | 2.12.10 | All HTTP mocking in tests |

---

## Architecture

### Single Next.js App — Option A

One codebase, three route groups, full BFF proxy layer.

### Why BFF is mandatory

The NestJS backend sets `access_token` as `SameSite=strict` HttpOnly cookie on port 3001. The frontend runs on port 3000. `SameSite=strict` means the browser will NOT send the cookie cross-origin. Therefore: **all API calls from the browser must go through Next.js route handlers** which proxy to NestJS server-side (where the cookie is explicitly forwarded).

### Auth Flow

Backend global prefix is `/api` (confirmed in `nest-backend/src/main.ts` line 43: `app.setGlobalPrefix('api')`). All NestJS endpoints are at `/api/...`.

```
Browser POST /api/auth/callback/credentials
  → next-auth CredentialsProvider authorize()
  → Step 1: calls NestJS POST http://localhost:3001/api/auth/login
            { email, password } body
            Response: { message: "Login successful" } + Set-Cookie: access_token=<JWT>; HttpOnly; SameSite=strict
  → Step 2: Extract Set-Cookie header from login response to get raw JWT value
            const setCookie = loginRes.headers.get('set-cookie')
            const token = setCookie?.match(/access_token=([^;]+)/)?.[1]
  → Step 3: calls NestJS GET http://localhost:3001/api/users/me (BACKEND CHANGE REQUIRED)
            with Cookie: access_token=<token> header
            Response: { id, email, firstName, lastName, role: { id, roleName } }
  → Step 4: return user object from authorize() — stored in next-auth session JWT
  → next-auth sets __Secure-next-auth.session-token cookie

Browser subsequent requests:
  → BFF route handler calls getServerSession(authOptions) to get { id, email, role }
  → Extracts access_token from next-auth JWT to forward to NestJS
  → Calls NestJS server-to-server with Cookie: access_token=<token>
  → Returns data to browser
```

**Important:** No next.config.ts rewrites needed. BFF route handlers call NestJS directly server-to-server (`http://localhost:3001/api/...`). The browser never talks to port 3001.

### Middleware (src/proxy.ts — Phase 4 guard)

```ts
// Reads next-auth session token
// PUBLIC: /login, /api/auth, /_next, /favicon.ico
// ALL other routes: require valid session
// /admin/* — require role Admin or Staff
// /admin/roles, /admin/users — require role Admin only
// Role mismatch → redirect to /unauthorized
// Unauthenticated → redirect to /login
```

---

## Route Structure

```
src/app/
├── (auth)/
│   └── login/
│       ├── page.tsx            Login form (LoginForm component)
│       ├── loading.tsx         Skeleton
│       └── error.tsx           Error boundary
│
├── (catalog)/                  All authenticated users
│   ├── layout.tsx              FloatingNav (Aceternity), ThemeToggle
│   ├── page.tsx                Home hero (BackgroundBeams + SpotlightEffect)
│   ├── loading.tsx             Page skeleton
│   ├── error.tsx               Error boundary
│   ├── products/
│   │   ├── page.tsx            Catalog listing (filters sidebar + product grid)
│   │   ├── loading.tsx         Grid skeleton
│   │   └── [id]/
│   │       ├── page.tsx        Product detail
│   │       └── loading.tsx     Detail skeleton
│   └── not-found.tsx           Product not found
│
├── (admin)/                    Admin + Staff only
│   ├── layout.tsx              Sidebar nav (shadcn), header
│   ├── loading.tsx             Page skeleton
│   ├── error.tsx               Error boundary
│   ├── dashboard/page.tsx      Stats overview
│   ├── products/
│   │   ├── page.tsx            Products list + CRUD
│   │   └── [id]/
│   │       ├── page.tsx        Product edit + sub-resources
│   │       └── variants/
│   │           ├── page.tsx            Variants list
│   │           └── lot-matrix/page.tsx Multi-step lot matrix wizard
│   ├── categories/page.tsx
│   ├── sub-categories/page.tsx
│   ├── departments/page.tsx
│   ├── groups/
│   │   ├── page.tsx            Groups list
│   │   └── [id]/page.tsx       Group fields + options
│   ├── attributes/page.tsx
│   ├── roles/page.tsx          Admin only
│   └── users/page.tsx          Admin only
│
├── api/                        BFF route handlers (Next.js server → NestJS port 3001)
│   ├── auth/[...nextauth]/route.ts
│   ├── products/route.ts       GET (list), POST
│   ├── products/[id]/route.ts  GET, PATCH, DELETE
│   ├── products/[id]/variants/route.ts
│   ├── products/[id]/lot-matrix/route.ts
│   ├── categories/route.ts
│   ├── sub-categories/route.ts
│   ├── departments/route.ts
│   ├── groups/route.ts
│   ├── groups/[id]/fields/route.ts
│   ├── attributes/route.ts
│   ├── roles/route.ts
│   └── users/route.ts

All BFF handlers follow this 4-step pattern (enforced by 05-api-and-security.md):
  1. Auth check: const session = await getServerSession(authOptions) → 401 if null
  2. Role check: if required role not met → 403
  3. Body validation: validateRequest(req, schema) → 400 if invalid
  4. Call NestJS: apiFetch('/api/products', { method, body, accessToken: session.accessToken })

Sample BFF handler:
```ts
// app/api/categories/route.ts
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await apiFetch('/api/categories', { method: 'GET', accessToken: session.accessToken })
  return NextResponse.json(data)
}
```
│
├── unauthorized/page.tsx       Role access denied
├── not-found.tsx               Global 404
└── error.tsx                   Global error boundary
```

---

## Feature Structure

```
src/features/
├── auth/
│   ├── schemas/login.schema.ts         Zod: LoginInput
│   ├── services/auth.service.ts        Server actions: login(), logout()
│   ├── hooks/useSession.ts             Client hook: current user from session
│   └── components/LoginForm.tsx        Login form (react-hook-form + Zod)
│
├── catalog/
│   ├── types/catalog.types.ts
│   ├── schemas/                        Zod schemas for API responses
│   ├── services/catalog.service.ts     BFF fetch functions
│   ├── hooks/useProducts.ts            TanStack Query hooks
│   ├── stores/catalog-filters.store.ts Zustand: active filters state
│   └── components/
│       ├── ProductGrid.tsx
│       ├── ProductCard.tsx             Aceternity CardHoverEffect
│       ├── FilterSidebar.tsx
│       ├── ProductDetail.tsx
│       └── HeroSection.tsx             Aceternity BackgroundBeams
│
└── admin/
    ├── products/
    ├── categories/
    ├── sub-categories/
    ├── departments/
    ├── groups/
    ├── attributes/
    ├── variants/
    │   └── stores/lot-matrix.store.ts  Zustand: wizard state
    ├── roles/
    └── users/
    (each has: types, schemas, services, hooks, components)
```

---

## Shared Layer Changes

### 1. `src/shared/types/core.ts` — Update to match NestJS

Remove: `TenantContext`, `organizationId`, `storeId`, `terminalId`
Add NestJS-specific types:

```ts
// NestJS response envelope
type ApiResponse<T> = {
  statusCode: number
  message: string
  data: T
}

// NestJS pagination shape (matches PaginatedResponseDto)
type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Session user (from next-auth after /api/users/me)
type SessionUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: { id: string; roleName: string }
}
```

### 2. `src/shared/types/next-auth.d.ts` — Update session shape

Remove: `organizationId`, `storeId`, `terminalId`
Add: `role`, `firstName`, `lastName`

### 3. `src/shared/lib/api-fetch.ts` — Cookie forwarding for BFF

The BFF route handlers call NestJS server-side. Update `apiFetch` to:
- Accept `accessToken` directly (not via TenantContext)
- Pass it as `Cookie: access_token=<token>` header to NestJS
- Remove `X-Organization-ID`, `X-Store-ID`, `X-Terminal-ID` headers

### 4. `src/config/env.ts` — Replace Django vars with NestJS

Remove: `DJANGO_API`, `DJANGO_API_SECRET`
Add: `NEST_API` (internal URL, e.g. `http://localhost:3001`)

### 5. `src/shared/lib/query-keys.ts` — Populate all factories

**Deliberate deviation from AGENTS.md rule 5**: AGENTS.md requires `[organizationId, storeId, ...]` prefix on all query keys. This project intentionally omits tenant scoping because the NestJS backend has no multi-tenancy — user isolation is handled server-side via JWT. This decision is documented here to prevent future engineers from re-adding tenant scoping.

```ts
export const queryKeys = {
  products: { all: ['products'], list: (q) => ['products', 'list', q], detail: (id) => ['products', id] },
  categories: { all: ['categories'], list: (q) => ['categories', 'list', q], detail: (id) => ['categories', id] },
  // departments, subCategories, groups, attributes, roles, users — same pattern
}
```

### 6. `src/app/globals.css` — Update brand tokens to Premium Blue

Replace Burgundy (`#57243b`) with Premium Blue:
```css
--primary: #3b82f6;          /* blue-500 */
--primary-dark: #1d4ed8;     /* blue-700 */
--accent: #06b6d4;           /* cyan-500 */
--background: #030712;       /* dark bg */
--background-light: #ffffff; /* light bg */
```

### 7. `next.config.ts` — Security only (no rewrites needed)

No URL rewrites needed — BFF route handlers call NestJS directly server-to-server.

```ts
serverActions: { allowedOrigins: ['localhost:3000'] }
```

### 8. `vitest.workspace.ts` — Consolidate coverage config

Move coverage thresholds from `vitest.config.mts` into the workspace file.

---

## Zod Response Schema Pattern

Every API call must unwrap the NestJS envelope:

```ts
// shared/lib/api-schemas.ts
const apiEnvelope = <T>(dataSchema: z.ZodType<T>) => z.object({
  statusCode: z.number(),
  message: z.string(),
  data: dataSchema,
})

const paginatedEnvelope = <T>(itemSchema: z.ZodType<T>) =>
  apiEnvelope(z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }))
```

---

## Design System

### Color Palette
- Background: `#030712` (dark) / `#ffffff` (light)
- Primary: `#3b82f6` (blue-500)
- Accent: `#06b6d4` (cyan-500)
- Border: `#1f2937`
- Text: `#f1f5f9` (dark mode) / `#111827` (light mode)

### Component Strategy
- **Admin pages**: shadcn/ui exclusively (DataTable, Dialog, Form, Select, etc.)
- **Catalog pages**: Aceternity UI components (BackgroundBeams, CardHoverEffect, SpotlightEffect, FloatingNav, HoverBorderGradient) — all in `'use client'` boundaries
- **Shared**: shadcn Button, Input, Badge, Skeleton

### Dark/Light Theme
- `ThemeProvider` in root layout
- Toggle stored in `localStorage` + `data-theme` on `<html>`
- CSS variables flip between dark/light via `[data-theme="light"]` selector
- Aceternity components work natively dark; light mode overrides

### Every Page Has 4 States
- **Loading**: Skeleton component (shimmer)
- **Error**: Error boundary with retry button
- **Empty**: Empty state illustration + action button
- **Data**: The actual content

---

## Lot Matrix Wizard

Multi-step wizard for generating product variants:

```
Step 1: Select Attributes
  → Pick from product's available attributes
  → Preview count of combinations

Step 2: Review Matrix
  → Generated grid: rows = combinations, cols = attribute values
  → Edit SKU, price, stock per row

Step 3: Confirm
  → Submit all variants to POST /api/products/:id/lot-matrix
  → Progress indicator
```

State: `features/admin/variants/stores/lot-matrix.store.ts` (Zustand)
Wizard state survives route navigation within the flow.

---

## Admin Build Order (Dependency Chain)

```
1. Roles           (no deps)
2. Departments     (no deps)
3. Categories      (depends on: departments)
4. Sub-Categories  (depends on: categories)
5. Product Groups  (no deps) + Group Fields + Options
6. Attributes      (no deps)
7. Users           (depends on: roles)
8. Products        (depends on: categories, sub-categories, departments, groups)
9. Variants        (depends on: products, attributes) + Lot Matrix wizard
```

---

## Testing Strategy

### Per module (TDD, sequential):
1. Write failing tests (Vitest unit + component)
2. Write implementation (make tests pass)
3. Run Playwright E2E after build passes

### MSW handlers
- All BFF route handlers have corresponding MSW mocks
- MSW handlers mirror the exact NestJS response envelope: `{ statusCode, message, data }`
- Update `auth.handlers.ts` base URL from `http://localhost:8000` to `http://localhost:3001` (NestJS port). Handler paths use `/api/...` prefix — e.g. `http://localhost:3001/api/auth/login`, `http://localhost:3001/api/users/me`. Do NOT use `/v1/` — NestJS globalPrefix is `api` with no version segment.

### Coverage
- Thresholds: lines 50%, functions 50%, branches 40%
- Required: every component must have a loading, error, and empty state test

---

## Key AGENTS.md Rules (Must Follow)

1. `type` keyword only — never `interface`
2. Props as `props.foo` — never destructure in function signature
3. No `useMemo` or `useCallback` (React Compiler handles it)
4. All API calls through `apiFetch()` — never raw `fetch()`
5. All colors from CSS variables — never hardcoded hex/rgb
6. All events PostHog explicit with `pos_` prefix, `autocapture: false`
7. Domain layer imports nothing from infrastructure or features
8. Shared layer imports nothing from features

---

## Missing Backend Endpoints (Must Add Before Frontend Build)

- `GET /api/users/me` — needed by next-auth `authorize()` to populate session after login
  - **Current state**: NestJS has `GET /api/users/:id` (requires Admin/Staff role) — no `/me` endpoint
  - **Fix needed**: Add `GET /api/users/me` to `UserController` — uses `JwtAuthGuard` only (no RolesGuard), extracts user id from JWT payload, returns `{ id, email, firstName, lastName, role: { id, roleName } }`
  - **Why no role guard**: The `/me` endpoint must be accessible to ALL authenticated roles including Viewer, because it's called during login session setup

- **CLAUDE.md update required**: Remove `DJANGO_API` and `DJANGO_API_SECRET` env vars, add `NEST_API=http://localhost:3001`
- **AGENTS.md update required**: Stack table shows Next.js 15 — update to 16.1.6. Rule 6 says "Django calls" — update to "NestJS calls"

---

## Out of Scope (Future)

- Forgot password / reset password (backend has `PasswordResetToken` entity, frontend deferred)
- Bulk operations (bulk price update, bulk activate/deactivate)
- File/image upload for product media (S3/CDN integration deferred)
- Public catalog (no login) — can change in future as discussed
