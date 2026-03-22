# Frontend Phase 2 — Admin CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete admin panel with full CRUD for all 9 backend modules in dependency order, with shadcn/ui components, TanStack Query, and BFF route handlers tested with MSW.

**Architecture:** Each admin module follows a 5-layer pattern: Zod schemas → BFF route handler → TanStack Query hooks → shadcn DataTable + Dialog → page shell. The admin layout (sidebar + header) wraps all `(admin)/*` routes. Build order follows the dependency chain: Roles → Departments → Categories → Sub-Categories → Groups → Attributes → Users → Products → Variants + Lot Matrix.

**Tech Stack:** Next.js 16.1.6 · shadcn/ui · TanStack Query v5 · Zod v4 · MSW v2 · Vitest 2

**Prerequisite:** Phase 1 must be complete (auth, shared types, api-fetch, BFF helpers all in place).

---

## File Map

### Admin shared infrastructure

| File | Purpose |
|------|---------|
| `src/features/admin/shared/components/AdminDataTable.tsx` | Generic paginated DataTable (shadcn) |
| `src/features/admin/shared/components/AdminFormDialog.tsx` | Generic create/edit dialog shell |
| `src/features/admin/shared/components/AdminConfirmDialog.tsx` | Generic delete-confirm dialog |
| `src/features/admin/shared/hooks/useAdminList.ts` | Generic TanStack Query list hook |
| `src/features/admin/shared/hooks/useAdminMutation.ts` | Generic create/update/delete mutations |
| `src/app/(admin)/layout.tsx` | Sidebar nav + header (replace shell from Phase 1) |
| `src/app/(admin)/dashboard/page.tsx` | Stats placeholder |
| `src/app/api/_lib/bff-handler.ts` | Helper: auth check + NestJS proxy in one call |

### Per-module files (repeated for each of 9 modules)

Pattern for module `<name>`:

| File | Purpose |
|------|---------|
| `src/features/admin/<name>/types/<name>.types.ts` | TypeScript types |
| `src/features/admin/<name>/schemas/<name>.schema.ts` | Zod schemas (list + create + update) |
| `src/features/admin/<name>/schemas/<name>.schema.test.ts` | Schema tests |
| `src/features/admin/<name>/services/<name>.service.ts` | BFF fetch functions |
| `src/features/admin/<name>/hooks/use<Name>.ts` | TanStack Query hooks |
| `src/features/admin/<name>/hooks/use<Name>.test.ts` | Hook tests with MSW |
| `src/features/admin/<name>/components/<Name>Table.tsx` | List table |
| `src/features/admin/<name>/components/<Name>FormDialog.tsx` | Create/edit dialog |
| `src/features/admin/<name>/components/<Name>Module.tsx` | Top-level feature component |
| `src/app/api/<name>/route.ts` | BFF GET list + POST create |
| `src/app/api/<name>/[id]/route.ts` | BFF GET detail + PATCH update + DELETE |
| `src/app/(admin)/<name>/page.tsx` | Page shell |
| `src/__tests__/msw/handlers/admin.handlers.ts` | MSW handlers for module endpoints |

---

## Task 0: Admin shared BFF helper + layout

**Files:**
- Create: `src/app/api/_lib/bff-handler.ts`
- Modify: `src/app/(admin)/layout.tsx`
- Create: `src/app/(admin)/dashboard/page.tsx`

This task creates the reusable BFF helper that every admin route handler uses to avoid repeating the auth-check + NestJS-call pattern.

- [ ] **Step 1: Write the failing test for bff-handler**

```ts
// src/app/api/_lib/bff-handler.test.ts
import { describe, expect, it, vi } from 'vitest'

// We test bffGet and bffMutate indirectly by mocking their dependencies
// Direct unit tests are in integration tests (E2E in Phase 3)
// Here we just verify the module exports exist

it('bff-handler exports bffGet and bffMutate', async () => {
  const mod = await import('./bff-handler')
  expect(typeof mod.bffGet).toBe('function')
  expect(typeof mod.bffMutate).toBe('function')
})
```

- [ ] **Step 2: Run to confirm FAIL**

```bash
cd frontend && npx vitest run --project unit src/app/api/_lib/bff-handler.test.ts
```
Expected: FAIL — "Cannot find module './bff-handler'"

- [ ] **Step 3: Create `src/app/api/_lib/bff-handler.ts`**

```ts
// src/app/api/_lib/bff-handler.ts
// Helper utilities for BFF route handlers.
// All admin API routes use these to avoid repeating auth check + NestJS proxy.
import { getServerSession } from 'next-auth'
import { type NextRequest, NextResponse } from 'next/server'
import { apiFetch } from '@shared/lib/api-fetch'
import { authOptions } from '@shared/lib/auth-options'

type BffGetOptions = {
  path:          string
  request:       NextRequest
  requiredRoles?: string[]
}

type BffMutateOptions = {
  path:          string
  method:        'POST' | 'PATCH' | 'DELETE'
  request:       NextRequest
  body?:         unknown
  requiredRoles?: string[]
}

export async function bffGet(options: BffGetOptions): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (options.requiredRoles !== undefined) {
    const roleName = session.user.role.roleName
    if (!options.requiredRoles.includes(roleName)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // Forward query string to NestJS
  const url    = new URL(options.request.url)
  const nestPath = `${options.path}${url.search}`

  const res = await apiFetch(nestPath, { accessToken: session.accessToken })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function bffMutate(options: BffMutateOptions): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (options.requiredRoles !== undefined) {
    const roleName = session.user.role.roleName
    if (!options.requiredRoles.includes(roleName)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const res = await apiFetch(options.path, {
    method:      options.method,
    body:        options.body !== undefined ? JSON.stringify(options.body) : undefined,
    accessToken: session.accessToken,
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
```

- [ ] **Step 4: Run test to confirm PASS**

```bash
cd frontend && npx vitest run --project unit src/app/api/_lib/bff-handler.test.ts
```
Expected: PASS

- [ ] **Step 5: Replace `src/app/(admin)/layout.tsx` with real sidebar layout**

> **Auth note:** This layout does NOT need to call `getServerSession()`. The `proxy.ts` middleware (Phase 1) already guards every `/admin/*` route — unauthenticated users are redirected to `/login` before the layout renders. Repeating the session check here would be redundant.

```tsx
// src/app/(admin)/layout.tsx
import { ThemeToggle } from '@shared/components/ThemeToggle'
import Link            from 'next/link'

const NAV_ITEMS = [
  { label: 'Dashboard',      href: '/admin/dashboard' },
  { label: 'Roles',          href: '/admin/roles' },
  { label: 'Departments',    href: '/admin/departments' },
  { label: 'Categories',     href: '/admin/categories' },
  { label: 'Sub-Categories', href: '/admin/sub-categories' },
  { label: 'Groups',         href: '/admin/groups' },
  { label: 'Attributes',     href: '/admin/attributes' },
  { label: 'Users',          href: '/admin/users' },
  { label: 'Products',       href: '/admin/products' },
]

type AdminLayoutProps = { children: React.ReactNode }

export default function AdminLayout(props: AdminLayoutProps): React.JSX.Element {
  return (
    <div className="flex min-h-screen bg-[var(--surface-subtle)]">
      {/* Sidebar */}
      <aside className="w-56 bg-[var(--surface-shell)] flex flex-col shrink-0">
        <div className="flex items-center h-14 px-4 border-b border-[var(--bg-dark-3)]">
          <span className="text-sm font-bold text-white">Admin Portal</span>
        </div>
        <nav className="flex flex-col gap-0.5 p-2 flex-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center h-9 px-3 rounded-md text-sm text-[var(--text-muted)] hover:bg-[var(--bg-dark-3)] hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between h-14 px-6 bg-[var(--surface-page)] border-b border-[var(--surface-border)] shrink-0">
          <span className="text-sm font-medium text-[var(--text-heading)]">Admin Panel</span>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {props.children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create `src/app/(admin)/dashboard/page.tsx`**

```tsx
// src/app/(admin)/dashboard/page.tsx
export default function DashboardPage(): React.JSX.Element {
  return (
    <div>
      <h1 className="text-xl font-semibold text-[var(--text-heading)] mb-4">Dashboard</h1>
      <p className="text-sm text-[var(--text-muted)]">
        Use the sidebar to manage catalog data.
      </p>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/api/_lib/bff-handler.ts src/app/api/_lib/bff-handler.test.ts src/app/(admin)/
git commit -m "feat(admin): add BFF helper + admin layout with sidebar navigation"
```

---

## Task 1: Roles CRUD

**NestJS endpoints:**
- `GET    /api/roles`        → list all roles
- `POST   /api/roles`        → create role (Admin only)
- `GET    /api/roles/:id`    → get one
- `PATCH  /api/roles/:id`    → update (Admin only)
- `DELETE /api/roles/:id`    → delete (Admin only)

**Files:**
- Create: `src/features/admin/roles/types/roles.types.ts`
- Create: `src/features/admin/roles/schemas/roles.schema.ts` + `.test.ts`
- Create: `src/features/admin/roles/services/roles.service.ts`
- Create: `src/features/admin/roles/hooks/useRoles.ts` + `.test.ts`
- Create: `src/features/admin/roles/components/RolesModule.tsx`
- Create: `src/app/api/roles/route.ts`
- Create: `src/app/api/roles/[id]/route.ts`
- Create: `src/app/(admin)/roles/page.tsx`
- Modify: `src/__tests__/msw/handlers/admin.handlers.ts`

- [ ] **Step 1: Add MSW handlers for roles**

```ts
// Append to src/__tests__/msw/handlers/admin.handlers.ts
import { faker } from '@faker-js/faker'
import { HttpResponse, http } from 'msw'

const BASE = 'http://localhost:3001'

function fakeRole() {
  return {
    id:          faker.string.uuid(),
    roleName:    faker.helpers.arrayElement(['Admin', 'Staff', 'Viewer']),
    description: faker.lorem.sentence(),
    createdAt:   faker.date.past().toISOString(),
    updatedAt:   faker.date.recent().toISOString(),
  }
}

export const adminHandlers = [
  // Roles
  http.get(`${BASE}/api/roles`, () =>
    HttpResponse.json({
      statusCode: 200, message: 'OK',
      data: {
        items: [fakeRole(), fakeRole()],
        total: 2, page: 1, limit: 20, totalPages: 1,
      },
    }),
  ),
  http.post(`${BASE}/api/roles`, async ({ request }) => {
    const body = await request.json() as { roleName: string }
    return HttpResponse.json({
      statusCode: 201, message: 'Role created',
      data: { ...fakeRole(), roleName: body.roleName },
    }, { status: 201 }),
  }),
  http.get(`${BASE}/api/roles/:id`, ({ params }) =>
    HttpResponse.json({
      statusCode: 200, message: 'OK',
      data: { ...fakeRole(), id: params['id'] as string },
    }),
  ),
  http.patch(`${BASE}/api/roles/:id`, async ({ request, params }) => {
    const body = await request.json() as Partial<{ roleName: string }>
    return HttpResponse.json({
      statusCode: 200, message: 'Role updated',
      data: { ...fakeRole(), id: params['id'] as string, ...body },
    })
  }),
  http.delete(`${BASE}/api/roles/:id`, () =>
    HttpResponse.json({ statusCode: 200, message: 'Role deleted', data: null }),
  ),
]
```

- [ ] **Step 2: Write failing schema test first (TDD — RED)**

```ts
// src/features/admin/roles/schemas/roles.schema.test.ts
import { describe, expect, it } from 'vitest'
import { CreateRoleSchema } from './roles.schema'

describe('CreateRoleSchema', () => {
  it('accepts valid role', () => {
    expect(CreateRoleSchema.safeParse({ roleName: 'Manager' }).success).toBe(true)
  })
  it('rejects empty roleName', () => {
    expect(CreateRoleSchema.safeParse({ roleName: '' }).success).toBe(false)
  })
})
```

```bash
cd frontend && npx vitest run --project ui src/features/admin/roles/schemas/roles.schema.test.ts
```
Expected: FAIL — "Cannot find module './roles.schema'"

- [ ] **Step 3: Create types and schemas (GREEN)**

```ts
// src/features/admin/roles/types/roles.types.ts
export type Role = {
  id:          string
  roleName:    string
  description: string
  createdAt:   string
  updatedAt:   string
}
```

```ts
// src/features/admin/roles/schemas/roles.schema.ts
import { z } from 'zod'

export const RoleSchema = z.object({
  id:          z.string(),
  roleName:    z.string(),
  description: z.string(),
  createdAt:   z.string(),
  updatedAt:   z.string(),
})

export const CreateRoleSchema = z.object({
  roleName:    z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
})

export const UpdateRoleSchema = CreateRoleSchema.partial()

export type CreateRoleInput = z.infer<typeof CreateRoleSchema>
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>
```

- [ ] **Step 4: Run schema tests to confirm they now PASS (GREEN)**

```bash
cd frontend && npx vitest run --project ui src/features/admin/roles/schemas/roles.schema.test.ts
```
Expected: PASS — 2/2

- [ ] **Step 5: Create service + hooks**

```ts
// src/features/admin/roles/services/roles.service.ts
export async function listRoles(params?: { page?: number; limit?: number }) {
  const qs    = new URLSearchParams()
  if (params?.page)  qs.set('page',  String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  const res   = await fetch(`/api/roles?${qs}`)
  return res.json()
}

export async function createRole(body: import('../schemas/roles.schema').CreateRoleInput) {
  const res = await fetch('/api/roles', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  return res.json()
}

export async function updateRole(id: string, body: import('../schemas/roles.schema').UpdateRoleInput) {
  const res = await fetch(`/api/roles/${id}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  return res.json()
}

export async function deleteRole(id: string) {
  const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' })
  return res.json()
}
```

```ts
// src/features/admin/roles/hooks/useRoles.ts
'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@shared/lib/query-keys'
import { createRole, deleteRole, listRoles, updateRole } from '../services/roles.service'
import type { CreateRoleInput, UpdateRoleInput } from '../schemas/roles.schema'

export function useRolesList(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.roles.list(params),
    queryFn:  () => listRoles(params),
    staleTime: 5 * 60_000,
  })
}

export function useRoleMutations() {
  const qc = useQueryClient()

  const create = useMutation({
    mutationFn: (input: CreateRoleInput) => createRole(input),
    onSettled:  () => qc.invalidateQueries({ queryKey: queryKeys.roles.all() }),
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRoleInput }) =>
      updateRole(id, input),
    onSettled:  () => qc.invalidateQueries({ queryKey: queryKeys.roles.all() }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSettled:  () => qc.invalidateQueries({ queryKey: queryKeys.roles.all() }),
  })

  return { create, update, remove }
}
```

- [ ] **Step 6: Create BFF route handlers**

```ts
// src/app/api/roles/route.ts
import { bffGet, bffMutate } from '@app/api/_lib/bff-handler'
import { validateBody }      from '@app/api/_lib/validate-request'
import { CreateRoleSchema }  from '@features/admin/roles/schemas/roles.schema'
import { type NextRequest }  from 'next/server'

export async function GET(req: NextRequest) {
  return bffGet({ path: '/api/roles', request: req, requiredRoles: ['Admin', 'Staff'] })
}

export async function POST(req: NextRequest) {
  const v = await validateBody(req, CreateRoleSchema)
  if (v.error !== null) return v.error
  return bffMutate({
    path:          '/api/roles',
    method:        'POST',
    request:       req,
    body:          v.data,
    requiredRoles: ['Admin'],
  })
}
```

```ts
// src/app/api/roles/[id]/route.ts
import { bffGet, bffMutate } from '@app/api/_lib/bff-handler'
import { validateBody }      from '@app/api/_lib/validate-request'
import { UpdateRoleSchema }  from '@features/admin/roles/schemas/roles.schema'
import { type NextRequest }  from 'next/server'

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return bffGet({ path: `/api/roles/${id}`, request: req, requiredRoles: ['Admin', 'Staff'] })
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const v      = await validateBody(req, UpdateRoleSchema)
  if (v.error !== null) return v.error
  return bffMutate({
    path:          `/api/roles/${id}`,
    method:        'PATCH',
    request:       req,
    body:          v.data,
    requiredRoles: ['Admin'],
  })
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return bffMutate({
    path:          `/api/roles/${id}`,
    method:        'DELETE',
    request:       req,
    requiredRoles: ['Admin'],
  })
}
```

- [ ] **Step 7: Create RolesModule component**

```tsx
// src/features/admin/roles/components/RolesModule.tsx
'use client'

import { useState }         from 'react'
import { useRolesList, useRoleMutations } from '../hooks/useRoles'
import type { Role }        from '../types/roles.types'
import type { CreateRoleInput } from '../schemas/roles.schema'

export function RolesModule(): React.JSX.Element {
  const { data, isLoading, isError } = useRolesList()
  const { create, update, remove }   = useRoleMutations()
  const [editRole, setEditRole]      = useState<Role | null>(null)
  const [showCreate, setShowCreate]  = useState(false)

  if (isLoading) {
    return <div className="animate-pulse h-40 rounded-lg bg-[var(--surface-subtle)]" />
  }

  if (isError) {
    return (
      <p className="text-sm text-[var(--color-danger)]">
        Failed to load roles. Please refresh.
      </p>
    )
  }

  const roles: Role[] = data?.data?.items ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[var(--text-heading)]">Roles</h1>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-[var(--primary-500)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--primary-600)]"
        >
          Add Role
        </button>
      </div>

      <div className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-page)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--surface-border)] bg-[var(--surface-subtle)]">
              <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Role Name</th>
              <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Description</th>
              <th className="text-right px-4 py-3 font-medium text-[var(--text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-[var(--text-muted)]">
                  No roles found. Create one to get started.
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id} className="border-b border-[var(--surface-border)] last:border-0">
                  <td className="px-4 py-3 font-medium text-[var(--text-heading)]">{role.roleName}</td>
                  <td className="px-4 py-3 text-[var(--text-body)]">{role.description}</td>
                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditRole(role)}
                      className="text-xs text-[var(--primary-500)] hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (confirm(`Delete "${role.roleName}"?`)) remove.mutate(role.id) }}
                      className="text-xs text-[var(--color-danger)] hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Inline create form — replace with Dialog in a later polish pass */}
      {showCreate && (
        <RoleForm
          onSubmit={(input) => {
            create.mutate(input, { onSuccess: () => setShowCreate(false) })
          }}
          onCancel={() => setShowCreate(false)}
          isSubmitting={create.isPending}
        />
      )}

      {editRole !== null && (
        <RoleForm
          initial={editRole}
          onSubmit={(input) => {
            update.mutate({ id: editRole.id, input }, { onSuccess: () => setEditRole(null) })
          }}
          onCancel={() => setEditRole(null)}
          isSubmitting={update.isPending}
        />
      )}
    </div>
  )
}

type RoleFormProps = {
  initial?:    Role
  onSubmit:    (input: CreateRoleInput) => void
  onCancel:    () => void
  isSubmitting: boolean
}

function RoleForm(props: RoleFormProps): React.JSX.Element {
  const [roleName, setRoleName]       = useState(props.initial?.roleName ?? '')
  const [description, setDescription] = useState(props.initial?.description ?? '')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--surface-page)] rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-base font-semibold text-[var(--text-heading)] mb-4">
          {props.initial !== undefined ? 'Edit Role' : 'Create Role'}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            props.onSubmit({ roleName, description })
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[var(--text-muted)]">Role Name *</label>
            <input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="rounded border border-[var(--surface-border)] px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[var(--text-muted)]">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded border border-[var(--surface-border)] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={props.onCancel}
              className="px-4 py-2 text-sm rounded border border-[var(--surface-border)]">
              Cancel
            </button>
            <button type="submit" disabled={props.isSubmitting}
              className="px-4 py-2 text-sm rounded bg-[var(--primary-500)] text-white disabled:opacity-60">
              {props.isSubmitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Create page shell**

```tsx
// src/app/(admin)/roles/page.tsx
import { RolesModule } from '@features/admin/roles/components/RolesModule'

export default function RolesPage(): React.JSX.Element {
  return <RolesModule />
}
```

- [ ] **Step 9: Run type-check**

```bash
cd frontend && npm run type-check
```
Expected: exits 0

- [ ] **Step 10: Commit**

```bash
git add src/features/admin/roles/ src/app/api/roles/ src/app/(admin)/roles/ src/__tests__/
git commit -m "feat(admin): complete Roles CRUD with BFF route handlers"
```

---

## Task 2: Departments CRUD

**NestJS endpoints:** `GET/POST /api/departments`, `GET/PATCH/DELETE /api/departments/:id`

Follow the exact same pattern as Task 1 (Roles). Departments have no foreign-key dependencies.

**Types:**
```ts
// src/features/admin/departments/types/departments.types.ts
export type Department = {
  id:          string
  name:        string
  description: string
  createdAt:   string
  updatedAt:   string
}
```

**Schema:**
```ts
export const CreateDepartmentSchema = z.object({
  name:        z.string().min(1, 'Department name is required'),
  description: z.string().optional(),
})
```

- [ ] Complete all steps for Departments following Task 1 pattern
- [ ] Add MSW handlers for `/api/departments` to `admin.handlers.ts`
- [ ] Create BFF routes: `src/app/api/departments/route.ts` + `[id]/route.ts`
- [ ] Create `DepartmentsModule.tsx` + page shell
- [ ] Run type-check → PASS
- [ ] Commit: `feat(admin): complete Departments CRUD`

---

## Task 3: Categories CRUD

**NestJS endpoints:** `GET/POST /api/categories`, `GET/PATCH/DELETE /api/categories/:id`

**Dependency:** `departmentId` required in create form — fetch departments list.

**Types:**
```ts
export type Category = {
  id:           string
  name:         string
  description:  string
  department:   { id: string; name: string }
  createdAt:    string
  updatedAt:    string
}
```

**Schema:**
```ts
export const CreateCategorySchema = z.object({
  name:         z.string().min(1, 'Category name is required'),
  description:  z.string().optional(),
  departmentId: z.string().uuid('Select a department'),
})
```

**Form note:** The create/edit form must include a `<select>` for `departmentId` populated by `useQuery(queryKeys.departments.list())`.

- [ ] Complete all steps following Task 1 pattern (TDD required: schema test must FAIL before schema is created, hook test must FAIL before hook is created)
- [ ] Form includes department dropdown using `useQuery(queryKeys.departments.list())`
- [ ] Add MSW handlers for `/api/categories`
- [ ] Run type-check → PASS
- [ ] Commit: `feat(admin): complete Categories CRUD`

---

## Task 4: Sub-Categories CRUD

**NestJS endpoints:** `GET/POST /api/sub-categories`, `GET/PATCH/DELETE /api/sub-categories/:id`

**Dependency:** `categoryId` required.

**Types:**
```ts
export type SubCategory = {
  id:          string
  name:        string
  description: string
  category:    { id: string; name: string }
  createdAt:   string
  updatedAt:   string
}
```

**Schema:**
```ts
export const CreateSubCategorySchema = z.object({
  name:        z.string().min(1, 'Sub-category name is required'),
  description: z.string().optional(),
  categoryId:  z.string().uuid('Select a category'),
})
```

- [ ] Complete all steps following Task 1 pattern (TDD required: schema test must FAIL before schema is created, hook test must FAIL before hook is created)
- [ ] Form includes category dropdown
- [ ] Add MSW handlers
- [ ] Run type-check → PASS
- [ ] Commit: `feat(admin): complete Sub-Categories CRUD`

---

## Task 5: Product Groups CRUD + Group Fields

**NestJS endpoints:**
- `GET/POST /api/groups`
- `GET/PATCH/DELETE /api/groups/:id`
- `GET/POST /api/groups/:id/fields` — group fields (each field has options)
- `GET/PATCH/DELETE /api/groups/:id/fields/:fieldId`

**Types:**
```ts
export type GroupField = {
  id:          string
  fieldName:   string
  fieldType:   string
  isRequired:  boolean
  options:     string[]
  createdAt:   string
  updatedAt:   string
}

export type Group = {
  id:          string
  groupName:   string
  description: string
  fields:      GroupField[]
  createdAt:   string
  updatedAt:   string
}
```

**Schemas:**
```ts
export const CreateGroupSchema = z.object({
  groupName:   z.string().min(1, 'Group name is required'),
  description: z.string().optional(),
})

export const CreateGroupFieldSchema = z.object({
  fieldName:   z.string().min(1, 'Field name is required'),
  fieldType:   z.enum(['text', 'number', 'select', 'boolean']),
  isRequired:  z.boolean().default(false),
  options:     z.array(z.string()).optional(),
})
```

**BFF routes:**
- `src/app/api/groups/route.ts` — GET + POST
- `src/app/api/groups/[id]/route.ts` — GET + PATCH + DELETE
- `src/app/api/groups/[id]/fields/route.ts` — GET + POST for fields

**Pages:**
- `src/app/(admin)/groups/page.tsx` — groups list
- `src/app/(admin)/groups/[id]/page.tsx` — group detail + fields management

- [ ] Complete all steps following Task 1 pattern (TDD required: schema test must FAIL before schema is created, hook test must FAIL before hook is created)
- [ ] Add nested fields management in group detail page
- [ ] Add MSW handlers for groups + fields
- [ ] Run type-check → PASS
- [ ] Commit: `feat(admin): complete Groups CRUD with nested Group Fields`

---

## Task 6: Attributes CRUD

**NestJS endpoints:** `GET/POST /api/attributes`, `GET/PATCH/DELETE /api/attributes/:id`

**Types:**
```ts
export type Attribute = {
  id:             string
  attributeName:  string
  description:    string
  values:         string[]
  createdAt:      string
  updatedAt:      string
}
```

**Schema:**
```ts
export const CreateAttributeSchema = z.object({
  attributeName: z.string().min(1, 'Attribute name is required'),
  description:   z.string().optional(),
  values:        z.array(z.string()).min(1, 'At least one value required'),
})
```

**Form note:** `values` is a dynamic list — allow add/remove of text inputs.

- [ ] Complete all steps following Task 1 pattern (TDD required: schema test must FAIL before schema is created, hook test must FAIL before hook is created)
- [ ] Form has dynamic add/remove for attribute values
- [ ] Add MSW handlers
- [ ] Run type-check → PASS
- [ ] Commit: `feat(admin): complete Attributes CRUD`

---

## Task 7: Users CRUD (Admin only)

**NestJS endpoints:** `GET/POST /api/users`, `GET/PATCH/DELETE /api/users/:id`

**Dependency:** `roleId` required in create form.

**Types:**
```ts
export type User = {
  id:        string
  email:     string
  firstName: string
  lastName:  string
  role:      { id: string; roleName: string }
  isActive:  boolean
  createdAt: string
  updatedAt: string
}
```

**Schema:**
```ts
export const CreateUserSchema = z.object({
  email:     z.string().email(),
  firstName: z.string().min(1),
  lastName:  z.string().min(1),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
  roleId:    z.string().uuid('Select a role'),
})

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName:  z.string().min(1).optional(),
  roleId:    z.string().uuid().optional(),
  isActive:  z.boolean().optional(),
})
```

**Security note:** BFF routes for `/api/users` must include `requiredRoles: ['Admin']`.

- [ ] Complete all steps following Task 1 pattern (TDD required: schema test must FAIL before schema is created, hook test must FAIL before hook is created)
- [ ] BFF routes restricted to Admin only
- [ ] Form includes role dropdown
- [ ] Password field in create form only (not edit)
- [ ] Add MSW handlers
- [ ] Run type-check → PASS
- [ ] Commit: `feat(admin): complete Users CRUD (Admin only)`

---

## Task 8: Products CRUD

**NestJS endpoints:**
- `GET/POST /api/products`
- `GET/PATCH/DELETE /api/products/:id`

**Dependencies:** `categoryId`, `subCategoryId`, `departmentId` — fetch all three lists.

**Types:**
```ts
export type Product = {
  id:              string
  name:            string
  sku:             string
  description:     string
  basePrice:       number
  category:        { id: string; name: string }
  subCategory:     { id: string; name: string } | null
  department:      { id: string; name: string }
  isActive:        boolean
  createdAt:       string
  updatedAt:       string
}
```

**Schema:**
```ts
export const CreateProductSchema = z.object({
  name:          z.string().min(1, 'Product name is required'),
  sku:           z.string().min(1, 'SKU is required'),
  description:   z.string().optional(),
  basePrice:     z.number().min(0, 'Price must be non-negative'),
  categoryId:    z.string().uuid(),
  subCategoryId: z.string().uuid().optional(),
  departmentId:  z.string().uuid(),
  isActive:      z.boolean().default(true),
})
```

**Page note:** Product edit page (`/admin/products/[id]`) links to variants management.

- [ ] Complete all steps following Task 1 pattern (TDD required: schema test must FAIL before schema is created, hook test must FAIL before hook is created)
- [ ] Create + Edit form includes all 3 dropdowns
- [ ] Product list table includes "Manage Variants" link to `/admin/products/:id/variants`
- [ ] Add MSW handlers
- [ ] Run type-check → PASS
- [ ] Commit: `feat(admin): complete Products CRUD`

---

## Task 9: Variants + Lot Matrix Wizard

**NestJS endpoints:**
- `GET    /api/products/:id/variants`        — list variants for a product
- `POST   /api/products/:id/variants`        — create single variant
- `GET    /api/products/:id/variants/:vid`   — get one
- `PATCH  /api/products/:id/variants/:vid`   — update
- `DELETE /api/products/:id/variants/:vid`   — delete
- `POST   /api/products/:id/lot-matrix`      — generate variants from matrix

**Files:**
- Create: `src/features/admin/variants/types/variants.types.ts`
- Create: `src/features/admin/variants/schemas/variants.schema.ts` + `.test.ts`
- Create: `src/features/admin/variants/stores/lot-matrix.store.ts`
- Create: `src/features/admin/variants/stores/lot-matrix.store.test.ts`
- Create: `src/features/admin/variants/hooks/useVariants.ts`
- Create: `src/features/admin/variants/components/VariantsModule.tsx`
- Create: `src/features/admin/variants/components/LotMatrixWizard.tsx`
- Create: `src/app/api/products/[id]/variants/route.ts`
- Create: `src/app/api/products/[id]/lot-matrix/route.ts`
- Create: `src/app/(admin)/products/[id]/variants/page.tsx`
- Create: `src/app/(admin)/products/[id]/variants/lot-matrix/page.tsx`

**Types:**
```ts
// src/features/admin/variants/types/variants.types.ts
export type VariantAttribute = {
  attributeId:   string
  attributeName: string
  value:         string
}

export type Variant = {
  id:           string
  productId:    string
  sku:          string
  price:        number
  stock:        number
  attributes:   VariantAttribute[]
  isActive:     boolean
  createdAt:    string
  updatedAt:    string
}

// Lot Matrix types
export type MatrixRow = {
  combination:  Record<string, string>  // attributeName → value
  sku:          string
  price:        number
  stock:        number
}

export type LotMatrixState = {
  step:              1 | 2 | 3
  productId:         string
  selectedAttrIds:   string[]
  matrix:            MatrixRow[]
  isSubmitting:      boolean
  // Actions
  setStep:           (step: 1 | 2 | 3) => void
  setProductId:      (id: string) => void
  toggleAttribute:   (id: string) => void
  generateMatrix:    (attributes: import('@features/admin/attributes/types/attributes.types').Attribute[]) => void
  updateMatrixRow:   (idx: number, field: 'sku' | 'price' | 'stock', value: string | number) => void
  setIsSubmitting:   (v: boolean) => void
  reset:             () => void
}
```

**Lot Matrix store tests (write these first — TDD RED):**

```ts
// src/features/admin/variants/stores/lot-matrix.store.test.ts
import { describe, beforeEach, it, expect } from 'vitest'
import { useLotMatrixStore } from './lot-matrix.store'
import type { Attribute } from '@features/admin/attributes/types/attributes.types'

beforeEach(() => useLotMatrixStore.getState().reset())

const sizeAttr: Attribute = {
  id: 'attr-1', attributeName: 'Size', description: '', values: ['S', 'M', 'L'],
  createdAt: '', updatedAt: '',
}
const colorAttr: Attribute = {
  id: 'attr-2', attributeName: 'Color', description: '', values: ['Red', 'Blue'],
  createdAt: '', updatedAt: '',
}

describe('lot-matrix.store', () => {
  it('toggleAttribute adds and removes attribute IDs', () => {
    useLotMatrixStore.getState().toggleAttribute('attr-1')
    expect(useLotMatrixStore.getState().selectedAttrIds).toContain('attr-1')
    useLotMatrixStore.getState().toggleAttribute('attr-1')
    expect(useLotMatrixStore.getState().selectedAttrIds).not.toContain('attr-1')
  })

  it('generateMatrix produces correct number of rows', () => {
    useLotMatrixStore.getState().toggleAttribute('attr-1')
    useLotMatrixStore.getState().toggleAttribute('attr-2')
    useLotMatrixStore.getState().generateMatrix([sizeAttr, colorAttr])
    // 3 sizes × 2 colors = 6
    expect(useLotMatrixStore.getState().matrix).toHaveLength(6)
  })

  it('updateMatrixRow updates sku for the correct row', () => {
    useLotMatrixStore.getState().toggleAttribute('attr-1')
    useLotMatrixStore.getState().generateMatrix([sizeAttr])
    useLotMatrixStore.getState().updateMatrixRow(0, 'sku', 'SIZE-S-001')
    expect(useLotMatrixStore.getState().matrix[0]?.sku).toBe('SIZE-S-001')
  })

  it('reset clears all state', () => {
    useLotMatrixStore.getState().toggleAttribute('attr-1')
    useLotMatrixStore.getState().reset()
    expect(useLotMatrixStore.getState().selectedAttrIds).toHaveLength(0)
    expect(useLotMatrixStore.getState().step).toBe(1)
  })
})
```

- [ ] **Step 1: Create test file (TDD — RED)**

Create `src/features/admin/variants/stores/lot-matrix.store.test.ts` with the content shown in the task body above.

```bash
cd frontend && npx vitest run --project ui src/features/admin/variants/stores/lot-matrix.store.test.ts
```
Expected: FAIL — `Cannot find module './lot-matrix.store'`

- [ ] **Step 2: Create the store (TDD — GREEN)**

```ts
// src/features/admin/variants/stores/lot-matrix.store.ts
'use client'

import { create } from 'zustand'
import type { LotMatrixState, MatrixRow } from '../types/variants.types'
import type { Attribute } from '@features/admin/attributes/types/attributes.types'

function cartesianProduct(arrays: string[][]): string[][] {
  return arrays.reduce<string[][]>(
    (acc, arr) => acc.flatMap((a) => arr.map((v) => [...a, v])),
    [[]],
  )
}

export const useLotMatrixStore = create<LotMatrixState>((set, get) => ({
  step:            1,
  productId:       '',
  selectedAttrIds: [],
  matrix:          [],
  isSubmitting:    false,

  setStep:         (step)         => set({ step }),
  setProductId:    (productId)    => set({ productId }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

  toggleAttribute: (id) => {
    const current = get().selectedAttrIds
    set({
      selectedAttrIds: current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id],
    })
  },

  generateMatrix: (attributes: Attribute[]) => {
    const selected = attributes.filter((a) =>
      get().selectedAttrIds.includes(a.id),
    )
    if (selected.length === 0) { set({ matrix: [] }); return }

    const names  = selected.map((a) => a.attributeName)
    const values = selected.map((a) => a.values)
    const combos = cartesianProduct(values)

    const matrix: MatrixRow[] = combos.map((combo) => ({
      combination: Object.fromEntries(names.map((n, i) => [n, combo[i] ?? ''])),
      sku:         '',
      price:       0,
      stock:       0,
    }))

    set({ matrix })
  },

  updateMatrixRow: (idx, field, value) => {
    const matrix = [...get().matrix]
    // Safe: matrix is built from cartesianProduct so idx is always valid
    matrix[idx] = { ...matrix[idx]!, [field]: value }
    set({ matrix })
  },

  reset: () => set({
    step:            1,
    productId:       '',
    selectedAttrIds: [],
    matrix:          [],
    isSubmitting:    false,
  }),
}))

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectLotStep            = (s: LotMatrixState): 1 | 2 | 3  => s.step
export const selectLotSelectedAttrIds = (s: LotMatrixState): string[]   => s.selectedAttrIds
export const selectLotMatrix          = (s: LotMatrixState): MatrixRow[] => s.matrix
export const selectLotIsSubmitting    = (s: LotMatrixState): boolean     => s.isSubmitting
```

```bash
cd frontend && npx vitest run --project ui src/features/admin/variants/stores/lot-matrix.store.test.ts
```
Expected: 4/4 pass

- [ ] **Step 3: Create LotMatrixWizard component (3 steps)**

```tsx
// src/features/admin/variants/components/LotMatrixWizard.tsx
'use client'

import {
  useLotMatrixStore,
  selectLotStep, selectLotSelectedAttrIds, selectLotMatrix, selectLotIsSubmitting,
} from '../stores/lot-matrix.store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@shared/lib/query-keys'

type LotMatrixWizardProps = { productId: string }

export function LotMatrixWizard(props: LotMatrixWizardProps): React.JSX.Element {
  const step            = useLotMatrixStore(selectLotStep)
  const selectedAttrIds = useLotMatrixStore(selectLotSelectedAttrIds)
  const matrix          = useLotMatrixStore(selectLotMatrix)
  const isSubmitting    = useLotMatrixStore(selectLotIsSubmitting)
  // Actions called inline via getState() — stable Zustand refs, no re-render risk
  const qc      = useQueryClient()

  // Fetch attributes for step 1
  const { data: attrsData } = useQuery({
    queryKey: queryKeys.attributes.list(),
    queryFn:  () => fetch('/api/attributes').then((r) => r.json()),
    staleTime: 5 * 60_000,
  })

  const attributes = attrsData?.data?.items ?? []

  const submitMutation = useMutation({
    mutationFn: (rows: typeof matrix) =>
      fetch(`/api/products/${props.productId}/lot-matrix`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ variants: rows }),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.variants.all(props.productId) })
      useLotMatrixStore.getState().reset()
    },
  })

  if (step === 1) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-[var(--text-heading)]">
          Step 1: Select Attributes
        </h2>
        <div className="flex flex-col gap-2">
          {attributes.map((attr: { id: string; attributeName: string; values: string[] }) => (
            <label key={attr.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedAttrIds.includes(attr.id)}
                onChange={() => useLotMatrixStore.getState().toggleAttribute(attr.id)}
              />
              <span>{attr.attributeName}</span>
              <span className="text-[var(--text-muted)]">
                ({attr.values.join(', ')})
              </span>
            </label>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
          <span>
            {selectedAttrIds.length === 0
              ? 'Select at least one attribute'
              : `Will generate ${selectedAttrIds.reduce(
                  (acc, id) => acc * (attributes.find((a: { id: string; values: string[] }) => a.id === id)?.values.length ?? 1),
                  1,
                )} variants`}
          </span>
        </div>
        <button
          type="button"
          disabled={selectedAttrIds.length === 0}
          onClick={() => {
            useLotMatrixStore.getState().generateMatrix(attributes)
            useLotMatrixStore.getState().setStep(2)
          }}
          className="self-start rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Next: Review Matrix →
        </button>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-[var(--text-heading)]">
          Step 2: Review & Edit Matrix
        </h2>
        <div className="overflow-x-auto rounded-lg border border-[var(--surface-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--surface-subtle)] border-b border-[var(--surface-border)]">
                <th className="text-left px-3 py-2 text-[var(--text-muted)]">Combination</th>
                <th className="text-left px-3 py-2 text-[var(--text-muted)]">SKU</th>
                <th className="text-left px-3 py-2 text-[var(--text-muted)]">Price</th>
                <th className="text-left px-3 py-2 text-[var(--text-muted)]">Stock</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, idx) => (
                <tr key={idx} className="border-b border-[var(--surface-border)] last:border-0">
                  <td className="px-3 py-2 text-[var(--text-body)]">
                    {Object.entries(row.combination).map(([k, v]) => `${k}: ${v}`).join(', ')}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={row.sku}
                      onChange={(e) => useLotMatrixStore.getState().updateMatrixRow(idx, 'sku', e.target.value)}
                      className="w-full border border-[var(--surface-border)] rounded px-2 py-1"
                      placeholder="SKU-001"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={row.price}
                      onChange={(e) => useLotMatrixStore.getState().updateMatrixRow(idx, 'price', Number(e.target.value))}
                      className="w-24 border border-[var(--surface-border)] rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={row.stock}
                      onChange={(e) => useLotMatrixStore.getState().updateMatrixRow(idx, 'stock', Number(e.target.value))}
                      className="w-24 border border-[var(--surface-border)] rounded px-2 py-1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => useLotMatrixStore.getState().setStep(1)}
            className="px-4 py-2 text-sm rounded border border-[var(--surface-border)]">
            ← Back
          </button>
          <button type="button" onClick={() => useLotMatrixStore.getState().setStep(3)}
            className="px-4 py-2 text-sm rounded bg-[var(--primary-500)] text-white">
            Next: Confirm →
          </button>
        </div>
      </div>
    )
  }

  // Step 3: Confirm
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-[var(--text-heading)]">
        Step 3: Confirm & Generate
      </h2>
      <p className="text-sm text-[var(--text-muted)]">
        This will create {matrix.length} variants for this product.
        Existing variants with the same SKU will be skipped.
      </p>
      {submitMutation.isError && (
        <p className="text-sm text-[var(--color-danger)]">
          Failed to generate variants. Please try again.
        </p>
      )}
      {submitMutation.isSuccess && (
        <p className="text-sm text-[var(--color-success)]">
          Variants generated successfully!
        </p>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={() => useLotMatrixStore.getState().setStep(2)}
          className="px-4 py-2 text-sm rounded border border-[var(--surface-border)]">
          ← Back
        </button>
        <button
          type="button"
          disabled={submitMutation.isPending}
          onClick={() => submitMutation.mutate(matrix)}
          className="px-4 py-2 text-sm rounded bg-[var(--primary-500)] text-white disabled:opacity-50"
        >
          {submitMutation.isPending ? 'Generating…' : 'Generate Variants'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3b: Add LotMatrixWizard smoke test**

Every implementation file requires a matching test. Add a minimal render test:

```tsx
// src/features/admin/variants/components/LotMatrixWizard.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LotMatrixWizard } from './LotMatrixWizard'

// Wrap in minimal QueryClient provider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
function wrapper(props: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{props.children}</QueryClientProvider>
}

describe('LotMatrixWizard', () => {
  it('renders Step 1 by default', () => {
    render(<LotMatrixWizard productId="prod-1" />, { wrapper })
    expect(screen.getByText(/Select Attributes/i)).toBeDefined()
  })
})
```

```bash
cd frontend && npx vitest run --project ui src/features/admin/variants/components/LotMatrixWizard.test.tsx
```
Expected: 1/1 pass

- [ ] **Step 4: Create BFF routes for variants**

```ts
// src/app/api/products/[id]/variants/route.ts
import { bffGet, bffMutate }   from '@app/api/_lib/bff-handler'
import { validateBody }        from '@app/api/_lib/validate-request'
import { z }                   from 'zod'
import { type NextRequest }    from 'next/server'

const CreateVariantSchema = z.object({
  sku:        z.string().min(1),
  price:      z.number().min(0),
  stock:      z.number().int().min(0),
  attributes: z.array(z.object({ attributeId: z.string(), value: z.string() })),
})

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return bffGet({ path: `/api/products/${id}/variants`, request: req })
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const v      = await validateBody(req, CreateVariantSchema)
  if (v.error !== null) return v.error
  return bffMutate({ path: `/api/products/${id}/variants`, method: 'POST', request: req, body: v.data })
}
```

```ts
// src/app/api/products/[id]/lot-matrix/route.ts
import { bffMutate }        from '@app/api/_lib/bff-handler'
import { validateBody }     from '@app/api/_lib/validate-request'
import { z }                from 'zod'
import { type NextRequest } from 'next/server'

const LotMatrixSchema = z.object({
  variants: z.array(z.object({
    combination: z.record(z.string()),
    sku:         z.string(),
    price:       z.number().min(0),
    stock:       z.number().int().min(0),
  })).min(1),
})

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const v      = await validateBody(req, LotMatrixSchema)
  if (v.error !== null) return v.error
  return bffMutate({
    path:    `/api/products/${id}/lot-matrix`,
    method:  'POST',
    request: req,
    body:    v.data,
  })
}
```

- [ ] **Step 5: Create page shells**

```tsx
// src/app/(admin)/products/[id]/variants/page.tsx
import { LotMatrixWizard }  from '@features/admin/variants/components/LotMatrixWizard'
import Link                  from 'next/link'

export default async function VariantsPage(
  props: { params: Promise<{ id: string }> },
): Promise<React.JSX.Element> {
  const { id } = await props.params
  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Link href="/admin/products" className="text-sm text-[var(--primary-500)] hover:underline">
          ← Products
        </Link>
        <h1 className="text-xl font-semibold text-[var(--text-heading)]">
          Product Variants
        </h1>
      </div>
      <div className="mb-8">
        <h2 className="text-base font-medium mb-3">Generate Variants via Lot Matrix</h2>
        <LotMatrixWizard productId={id} />
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Run full test suite**

```bash
cd frontend && npm test
```
Expected: all tests pass

- [ ] **Step 7: Run type-check**

```bash
cd frontend && npm run type-check
```
Expected: exits 0

- [ ] **Step 8: Commit**

```bash
git add src/features/admin/variants/ src/app/api/products/ src/app/(admin)/products/
git commit -m "feat(admin): Variants CRUD + 3-step Lot Matrix wizard with Zustand"
```

---

## Task 10: Final Phase 2 verification

- [ ] **Step 1: Run full quality gate**

```bash
cd frontend && npm run type-check && npm run lint && npm test && npm run check:arch && npm run check:colors
```
Expected: all five exit 0

- [ ] **Step 2: Verify all 9 admin modules are accessible**

Start dev server. Verify:
- `/admin/dashboard` loads
- `/admin/roles` — list + create + edit + delete
- `/admin/departments` — CRUD
- `/admin/categories` — CRUD with department dropdown
- `/admin/sub-categories` — CRUD with category dropdown
- `/admin/groups` — CRUD + fields management
- `/admin/attributes` — CRUD with dynamic values
- `/admin/users` — CRUD with role dropdown (Admin only)
- `/admin/products` — CRUD with all dropdowns
- `/admin/products/:id/variants` — Lot Matrix wizard working
