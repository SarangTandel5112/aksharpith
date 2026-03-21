# SYSTEM_GUIDE.md — The Claude Code Configuration System

A guide for human developers working in this repository.

---

## Table of Contents

1. [What is this `.claude/` system?](#1-what-is-this-claude-system)
2. [How Claude Code discovers and uses these files](#2-how-claude-code-discovers-and-uses-these-files)
3. [Rule files — what each one covers](#3-rule-files--what-each-one-covers)
4. [Command files — what each one does](#4-command-files--what-each-one-does)
5. [The full developer workflow — a real example](#5-the-full-developer-workflow--a-real-example)
6. [Rules enforced automatically vs by Claude](#6-rules-enforced-automatically-vs-by-claude)
7. [Quick reference card](#7-quick-reference-card)

---

## 1. What is this `.claude/` system?

This project uses **Claude Code** (Anthropic's AI coding assistant) as a first-class development tool. To make Claude produce consistent, correct code across every session and every developer's machine, the project ships a set of configuration files that tell Claude exactly how this codebase works.

The system has three parts:

```
CLAUDE.md               ← Claude reads this automatically at the start of every session
.claude/rules/          ← Detailed rule files Claude reads when working in a specific area
.claude/commands/       ← Slash commands that trigger structured multi-step workflows
```

Think of it this way:
- **`CLAUDE.md`** is the project brief. It gives Claude the big picture: what stack we use, where files live, which commands exist, and what the current build status is.
- **Rule files** are specialist references. Claude reads the relevant one before writing code in a particular area — the same way a developer would check the team style guide before working in unfamiliar territory.
- **Command files** are workflow scripts. When you type `/tdd` or `/pr-ready`, Claude follows a structured checklist instead of improvising.

**Why does this system exist?** Without it, each Claude session starts fresh with no context. Claude might use `interface` instead of `type`, forget to check for session auth in a BFF route, or put a file in the wrong layer. The rule files prevent this by giving every session the same shared context — the same decisions, the same conventions, the same boundaries.

---

## 2. How Claude Code discovers and uses these files

### `CLAUDE.md` — loaded automatically

Claude Code reads `CLAUDE.md` at the start of every conversation in this project, before you type anything. You do not need to ask for it. This is why the file starts with the current project state, the commands table, and the quick-reference routing table — that's what Claude needs to orient itself immediately.

### Rule files — loaded on request (or by instruction)

Rule files in `.claude/rules/` are **not loaded automatically**. Claude loads them when:

1. You explicitly ask: *"Read `.claude/rules/04-react.md` before doing this."*
2. A command file instructs Claude to read one: every command file starts with `Read .claude/rules/...`
3. The `CLAUDE.md` quick-reference table tells Claude which rule applies to your task.

The CLAUDE.md quick-reference table is the bridge:

```
| I am working on...    | Read this rule file       |
| A React component     | 04-react.md               |
| A Zustand store       | 08-zustand.md             |
| An API route / BFF    | 05-api-and-security.md    |
```

When you describe what you're building, Claude looks up the right rule file and reads it before writing a line of code.

### Slash commands — how they work

Slash commands in Claude Code are triggered by typing `/commandname` in the chat. Claude Code looks for a file called `commandname.md` inside `.claude/commands/` and executes the instructions inside it as a structured multi-step task.

```
You type: /tdd useLogin hook
Claude reads: .claude/commands/tdd.md
Claude follows: the 3-phase TDD process described in that file
```

Available commands: `/tdd`, `/new-feature`, `/coverage`, `/setup`, `/pr-ready`, `/react-check`

> **Cursor IDE users:** Two additional commands live in `.cursor/commands/` (`review.md`, `react-compiler-check.md`). These are Cursor-only and cannot be invoked in Claude Code — see the files directly.

### Rule file vs command file — the difference

| | Rule file | Command file |
|---|---|---|
| Location | `.claude/rules/` | `.claude/commands/` |
| Purpose | Reference — tells Claude how things work | Workflow — tells Claude what to do step by step |
| When loaded | Before writing code in a specific area | When you invoke `/commandname` |
| Analogous to | A team style guide or architecture decision record | A runbook or checklist |
| Contains | Conventions, examples, patterns, constraints | Ordered steps, bash commands to run, things to check |

---

## 3. Rule files — what each one covers

### `01-architecture.md` — Layer structure and dependency rules

**Purpose:** Defines where every file in the project lives, and which layers can import from which.

**What it covers:**
- The 5-layer architecture: `core/domain`, `core/application`, `core/infrastructure`, `features`, `shared`
- Dependency direction: domain imports nothing; features can import everything; shared cannot import from features
- A decision tree for placing any new file ("Is it a pure type? → domain. Is it a saga? → application.")
- The `lib/` vs `services/` distinction in `shared/`
- Naming conventions for every file type

**Read this when you are about to:** Create any new file and are unsure where it belongs, or when you hit an architecture boundary violation from `npm run check:arch`.

**Real example from this project:**

```ts
// checkout.saga.ts lives in core/application/ because it orchestrates
// domain objects (Order) and infrastructure (writeCommand, apiFetch)
// but contains no UI code.

// ✅ CORRECT: core/application/checkout/checkout.saga.ts
import { writeCommand } from '@infrastructure/offline/queue-writer'  // ← infra
import type { Order }   from '@domain/order/order.types'             // ← domain

// ❌ WRONG: would have been features/checkout/checkout.saga.ts
// (sagas don't belong in the features/UI layer)
```

---

### `02-typescript.md` — TypeScript conventions

**Purpose:** Enforces consistent TypeScript patterns that keep the codebase type-safe and React-Compiler-compatible.

**What it covers:**
- `type` keyword only — never `interface` (interfaces can be augmented, which breaks the React Compiler)
- No `any`, no `!` assertions without an explanatory comment
- No `enum` — use `const` objects with `as const` instead
- Where types live: same file if private, `*.types.ts` if shared across files, `shared/types/` if app-wide
- The four core shared types: `TenantContext`, `Money`, `PaginatedResponse`, `Result`
- Money is always stored as integer paise (₹1 = 100), never as decimals

**Read this when you are about to:** Define a new type, add a new field to an existing type, or write any TypeScript that touches money amounts.

**Real example from this project:**

```ts
// ✅ Cart status uses as const — no runtime overhead, fully tree-shakeable
// features/checkout/types/cart.types.ts
export type CartStatus =
  | 'idle'
  | 'checkout_pending'
  | 'checkout_processing'
  | 'checkout_complete'
  | 'checkout_failed'

// ❌ WRONG — TypeScript enums emit runtime JS code
export enum CartStatus { Idle = 'idle', CheckoutPending = 'checkout_pending' }

// ✅ Money stored as paise in cart.store.ts
const price: Money = { amount: 5250, currency: 'INR' }  // = ₹52.50
// ❌ WRONG
const price = { amount: 52.50, currency: 'INR' }
```

---

### `03-testing.md` — Test structure, MSW, and TDD

**Purpose:** Defines where tests live, how HTTP is mocked, how IndexedDB is handled in tests, and enforces the TDD workflow.

**What it covers:**
- Every implementation file gets a `.test.ts` alongside it in the same folder
- Two Vitest projects: `unit` (Node, covers `core/` and `shared/lib/`) and `ui` (happy-dom, covers `features/` and `shared/hooks/`)
- All HTTP in tests goes through MSW — never mock `fetch` directly
- IndexedDB tests must import `fake-indexeddb/auto` and call `resetDBForTesting()` in `beforeEach`/`afterEach`
- The MSW handler files and the base URL they intercept (`http://localhost:8000`)
- Test structure: constants → factories → describe blocks → Arrange/Act/Assert

**Read this when you are about to:** Write any test file, add a new HTTP endpoint that needs an MSW handler, or work with IndexedDB in a test.

**Real example from this project:**

```ts
// catalog-sync.service.test.ts — per-test MSW handler override
// Uses server.use() to simulate different API responses per test case
import { server } from '@test/msw/server'
import { http, HttpResponse } from 'msw'

it('syncs products from Django into local catalog', async () => {
  server.use(
    http.get('http://localhost:8000/catalog/', () =>
      HttpResponse.json({ data: [fakeProduct()], hasMore: false })
    ),
  )
  await syncCatalog(ctx)
  const count = await getCatalogCount()
  expect(count).toBe(1)
})
// After each test, server.resetHandlers() restores the defaults automatically
```

---

### `04-react.md` — Component and hook patterns

**Purpose:** Defines how React components and hooks must be written to work correctly with the React 19 Compiler (built into Next.js 16).

**What it covers:**
- Props must be accessed as `props.foo` — never destructured in the function signature (React Compiler requirement)
- No `useMemo` or `useCallback` — the compiler handles memoisation automatically
- Every component must have an explicit `React.JSX.Element` return type
- Every `<Suspense>` must be paired with a sibling `<ErrorBoundary>`
- Zustand: always use selector functions, never select the whole store
- TanStack Query: always use `useSuspenseQuery` inside Suspense-wrapped components
- Money display: always use `formatMoney()` from `@domain/shared/value-objects`, never divide by 100 manually
- Connectivity: always use `useConnectivity()` hook, never `navigator.onLine`

**Read this when you are about to:** Write or modify any React component or hook.

**Real example from this project:**

```tsx
// OfflineBanner.tsx — correct props access pattern
// ✅ RIGHT: props.isOnline (not destructured)
function OfflineBanner(props: OfflineBannerProps): React.JSX.Element {
  if (props.isOnline) return <></>
  return <div className="bg-amber-500">You are offline</div>
}

// ❌ WRONG: destructured in signature — prevents React Compiler optimisation
function OfflineBanner({ isOnline }: OfflineBannerProps) { ... }
```

---

### `05-api-and-security.md` — BFF routes and tenant isolation

**Purpose:** Prevents security vulnerabilities in API routes — specifically tenant data leakage and authentication bypass.

**What it covers:**
- All calls to Django go through `apiFetch()` — never raw `fetch()` — which attaches auth headers automatically
- BFF routes must call `getServerSession()` **before** reading the request body
- `storeId` and `organizationId` come from the session — never from the request body (tenant injection attack)
- All TanStack Query keys must start with `[organizationId, storeId]` to prevent cache cross-contamination
- All Dexie queries must filter by `terminalId` or `storeId` — never return all terminals' data
- Idempotency keys must be deterministic — never use `Date.now()` or `randomUUID()` (double-charge risk)

**Read this when you are about to:** Write a BFF route handler, add a TanStack Query call, or write any code that touches payment or order data.

**Real example from this project:**

```ts
// src/app/api/orders/route.ts — correct BFF route structure
export async function POST(request: Request): Promise<Response> {
  // Step 1: auth FIRST, before touching the body
  const session = await getServerSession()
  if (!session?.user) return Response.json({ code: 'UNAUTHORIZED' }, { status: 401 })

  // Step 2: validate body
  const { data, error } = await validateBody(request, CreateOrderSchema)
  if (error) return error

  // Step 3: tenant context FROM SESSION, not from body
  const ctx = { organizationId: user.organizationId, storeId: user.storeId, ... }

  // Step 4: call Django through apiFetch()
  const response = await apiFetch('/orders/', { method: 'POST', ctx })
}
```

---

### `06-offline.md` — Offline-first checkout and sync queue

**Purpose:** Ensures the POS can process transactions with no internet connection, and that the sync queue is used correctly.

**What it covers:**
- Every checkout path must explicitly handle all 5 result statuses: `completed`, `offline`, `timeout`, `conflict`, `failed`
- The checkout saga flow: reserve → payment → confirm (online) or `writeCommand()` (offline)
- Queue writes must go through `writeCommand()` — never directly to Dexie
- `MAX_QUEUE_SIZE = 100`: if full, show a message — never drop commands silently
- Sync service: batches of 20, max 3 retries before quarantine
- Catalog is always searched from local IndexedDB — never fetches from Django at search time

**Read this when you are about to:** Touch any checkout flow, write to the IndexedDB command queue, work on the sync service, or add offline handling to a feature.

**Real example from this project:**

```ts
// checkout.saga.ts — all 5 outcomes must be handled by the caller
const result = await completeCheckoutSaga(input)

switch (result.status) {
  case 'completed': showReceipt(result.receiptId); break
  case 'offline':   showProvisionalReceipt(result.commandId); break
  case 'timeout':   showRetryPrompt(result.message); break
  case 'conflict':  showInventoryError(result.reason); break
  case 'failed':    showError(result.message); break
}
// ❌ WRONG: if (result.status === 'completed') showReceipt() — ignores 4 of 5 cases
```

---

### `07-pr-checklist.md` — Pre-PR quality gate

**Purpose:** A comprehensive checklist to run before raising any pull request, covering all the rules in one place.

**What it covers:**
- 4 quality gate commands that must exit 0: `type-check`, `lint`, `test`, `check:arch`
- Architecture boundary checks (domain imports nothing, shared imports nothing from features)
- TypeScript rule checks (no `any`, no `interface`, no `enum`, no bare `!`)
- React rule checks (no destructured props, no `useMemo`/`useCallback`, return types present)
- Tenant security checks (session-only tenant IDs, scoped query keys, filtered Dexie queries)
- Offline safety checks (all checkout outcomes handled, `writeCommand()` used, queue full handled)
- Test completeness checks (every new file has a test, no `vi.mock('fetch')`, MSW handlers added)
- Commit message format: `type(scope): description`

**Read this when you are about to:** Raise a pull request, or do a self-review of your changes.

**Real example from this project:**

```bash
# The 4 gates — all must be green before you push
npm run type-check   # TypeScript: 0 errors
npm run lint         # ESLint: 0 warnings
npm test             # 122/122 passing (or more)
npm run check:arch   # 0 boundary violations
```

---

### `08-zustand.md` — Zustand store patterns

**Purpose:** Defines how to create and use Zustand stores consistently, including when to use a store versus component state or TanStack Query.

**What it covers:**
- When to create a store: state shared across 3+ components, persists across route changes, drives multi-step UI
- One store per feature — never split into micro-stores unless it exceeds ~10 actions
- Store file structure: state first, actions grouped with comments, selectors exported at the bottom
- Selector rule: always use a selector function — never select the whole store (causes unnecessary re-renders)
- Action naming: `verbNoun` for mutations, `setNoun` for field updates, `clearNoun` for resets
- Types always in a separate `*.types.ts` file — never inline in the store
- Test pattern: stores are singletons — call `.getState()` directly, reset in `beforeEach`

**Read this when you are about to:** Create a new Zustand store, add actions or selectors to an existing store, or use a store in a component.

**Real example from this project:**

```ts
// cart.store.ts — selectors exported at the bottom, never inline
export const selectOrder       = (s: CartStore): Order | null => s.order
export const selectCartStatus  = (s: CartStore): CartStatus   => s.status
export const selectActiveLines = (s: CartStore): OrderLine[]  =>
  s.order?.lines.filter(l => l.status === 'active') ?? []

// ✅ In a component: precise selector
const order = useCartStore(selectOrder)   // only re-renders when order changes

// ❌ In a component: whole store
const { order, status } = useCartStore()  // re-renders on ANY store change
```

---

### `09-tanstack-query.md` — TanStack Query patterns

**Purpose:** Defines how to structure queries and mutations so cached data is tenant-isolated, fresh, and consistent.

**What it covers:**
- Query keys always start with `[organizationId, storeId]` — no exceptions
- All query key factories live in `src/shared/lib/query-keys.ts` — never inline keys
- `useSuspenseQuery` inside Suspense-wrapped components, `useQuery` when handling states manually
- `staleTime` must be set explicitly on every query (never leave at 0 which refetches on every focus)
- Recommended stale times: catalog 5 min, orders 30s, sync status 10s
- Mutations: use `onSettled` for invalidation (runs on success AND error)
- Logout must call `queryClient.clear()` to prevent data leakage between sessions

**Read this when you are about to:** Add a `useQuery` or `useMutation` call, add a new entry to `query-keys.ts`, or write a component that fetches server data.

**Real example from this project:**

```ts
// useQueueStatus.ts — all query key rules followed
const { data: depth = 0 } = useQuery({
  queryKey:        queryKeys.sync.status(orgId, storeId, terminalId),
  // ↑ expands to [orgId, storeId, 'sync', 'status', terminalId]
  queryFn:         () => getQueueDepth(terminalId),
  refetchInterval: 5_000,
  // staleTime not set here because refetchInterval provides freshness
})
```

---

### `10-zod-schemas.md` — Zod schema location and patterns

**Purpose:** Defines where Zod schemas live and how they should be written, distinguishing between form validation and API response validation.

**What it covers:**
- `validations/` folder: form schemas that validate user input (`login-form.schema.ts`)
- `schemas/` folder: API schemas that validate Django response shapes (`order-response.schema.ts`)
- Schema naming: `PascalCaseSchema`, inferred type: `PascalCaseValues` (forms) or `PascalCase` (API)
- Always export both the schema AND the inferred type from the same file
- Forms use `react-hook-form` + `zodResolver` — never write manual validation logic
- API responses are validated at the infrastructure boundary (in `core/infrastructure/`), not in features
- BFF routes use `validateBody()` from `src/app/api/_lib/validate-request.ts` — already implemented

**Read this when you are about to:** Add a form, validate an API response, or write a BFF route that accepts a request body.

**Real example from this project:**

```ts
// src/app/api/orders/route.ts — BFF body validation
// Schema defined inline (small) or imported from features/<f>/schemas/
const CreateOrderSchema = z.object({
  lines: z.array(z.object({
    productId: z.string().uuid(),
    quantity:  z.number().int().positive().max(999),
    // storeId and organizationId are NOT here — they come from session
  })).min(1).max(100),
})

const { data, error } = await validateBody(request, CreateOrderSchema)
if (error) return error  // returns 422 automatically
// data is fully typed as z.infer<typeof CreateOrderSchema>
```

---

## 4. Command files — what each one does

### `/tdd` — Enforce strict TDD for a single file

**Purpose:** Guides you through the Red → Green → Refactor cycle before writing implementation code.

**Steps Claude follows:**
1. Asks you what you are building and identifies the target file path
2. Reads `03-testing.md` and any relevant rule files for the area
3. Writes the **test file first** — importing from the implementation path even though it does not exist yet
4. Runs the test: `npx vitest run src/path/to/file.test.ts` — confirms it **fails**
5. Creates the implementation file with the minimum code to pass the tests
6. Runs tests again — confirms they **pass**
7. Refactors if needed — runs tests a final time to confirm still green
8. Runs the full suite (`npm test`) to check for regressions

**Use this when:** You are about to implement anything new — a hook, a store action, a domain function, a saga, or an API route.

**What it will NOT do:**
- Write implementation before the test exists and fails
- Add tests after the fact to existing untested code (that is not TDD)
- Skip the failing-test confirmation step

```
/tdd useLogin hook for auth feature
/tdd LoginFormSchema validation
/tdd createOrder saga step
```

---

### `/new-feature` — Scaffold a complete feature vertical

**Purpose:** Creates the full folder structure for a new feature, matching the pattern used by `auth`, `catalog`, and `checkout`.

**Steps Claude follows:**
1. Reads `01-architecture.md`
2. Creates `src/features/<name>/` with all sub-folders: `components/`, `hooks/`, `store/`, `types/`, `constants/`, `validations/`, `schemas/`, `services/`
3. Adds `.gitkeep` files so git tracks the empty folders
4. Creates `src/features/<name>/types/<name>.types.ts` with a placeholder comment
5. Adds the new feature to the folder structure section of `01-architecture.md`
6. Adds a row to the Current Project State table in `CLAUDE.md`
7. Reports every folder and file created

**Use this when:** Starting a brand new feature from scratch before writing any code.

**What it will NOT do:**
- Write any implementation code
- Create files in `core/application/` or `core/infrastructure/` (those come later, when domain logic is defined)
- Modify any existing feature

```
/new-feature receipts
/new-feature shifts
/new-feature returns
```

---

### `/coverage` — Find and fix test coverage gaps

**Purpose:** Runs the coverage report, identifies the most impactful untested code, and offers to write the missing tests.

**Steps Claude follows:**
1. Runs `npm run coverage`
2. Parses the output into a table sorted by line coverage ascending (skipping type files and empty files)
3. Identifies the 3 files with the lowest coverage that contain real business logic
4. For each: explains which lines are uncovered, what scenario they represent, and what test would cover them
5. Asks "Should I write the test for `<filename>` now?"
6. If yes: follows strict TDD from `03-testing.md` (write test → confirm fail → implementation passes)
7. Re-runs `npm run coverage` and shows a before/after comparison

**Use this when:** Coverage has dropped below thresholds, before a PR, or when you want to improve confidence in a specific area.

**What it will NOT do:**
- Write tests that only cover lines mechanically without testing real behaviour
- Fail the session if thresholds are already above minimums (lines ≥ 50%, functions ≥ 50%, branches ≥ 40%)

```
/coverage
```

---

### `/setup` — New developer onboarding

**Purpose:** Guides a developer through getting the project running on a new machine from zero to `npm test` passing.

**Steps Claude follows:**
1. Clones the repo and runs `npm install`
2. Copies `.env.example` → `.env.local` and explains each required variable (including how to generate `NEXTAUTH_SECRET`)
3. Runs `npx lefthook install` to wire up pre-commit hooks
4. Verifies the setup: `npm run dev`, `npm run type-check`, `npm run lint`, `npm test`, `npm run check:arch`
5. Provides troubleshooting steps for the most common failures (Node version, missing env vars, type errors)
6. Recommends which rule files to read first before writing code

**Use this when:** You have just cloned the repo and are setting it up for the first time.

**What it will NOT do:**
- Set up Django (the backend) — that is a separate project
- Install or configure the database
- Create accounts or credentials

```
/setup
```

---

### `/pr-ready` — Final pre-PR quality gate

**Purpose:** Runs every quality check in sequence and produces a pass/fail table before you push.

**Steps Claude follows:**
1. **Gate 1 — TypeScript:** `npm run type-check` — must exit 0; fixes all errors if not
2. **Gate 2 — Lint:** `npm run lint` — must exit 0 with zero warnings; fixes all if not
3. **Gate 3 — Tests:** `npm test` — must be 100% passing; diagnoses failures if not
4. **Gate 4 — Architecture:** `npm run check:arch` — must exit 0; identifies which import violates which rule
5. **Gate 5 — Dead code:** `npx knip` — informational; only fails if new unused exports were introduced
6. **Gate 6 — Review checklist:** Works through `07-pr-checklist.md` item by item, reporting PASS/FAIL/N/A
7. **Gate 7 — React Compiler:** Runs the checks from `react-check.md`
8. Prints a final summary table and states either "✅ Ready to raise PR" or "❌ Fix the issues above"

**Use this when:** You are done with a feature and about to open a pull request.

**What it will NOT do:**
- Create the pull request (it only validates readiness)
- Push to the remote branch
- Merge anything

```
/pr-ready
```

---

### `/react-check` — React Compiler compliance audit

**Purpose:** Scans all components and hooks for patterns that prevent the React 19 Compiler from optimising them.

**Steps Claude follows:**
1. Scans for `useMemo`/`useCallback` without a documented exception comment — reports violations
2. Searches for compiler bail-out causes: direct prop mutation, `ref.current` during render, conditional hook calls
3. Searches for the `interface` keyword — every result is a violation, replaced with `type`
4. Searches for props destructuring in component signatures — every result is a violation
5. Produces a table: checks run × violations found × violations fixed

**Use this when:** You have added new React components or hooks, or the React Compiler audit hasn't been run recently.

**What it will NOT do:**
- Modify logic — only checks code style and Compiler-compatibility patterns
- Fail on the documented `useCallback` exception in `useConnectivity.ts`

```
/react-check
```

---

## 5. The full developer workflow — a real example

> **Scenario:** Amara joins the team on Monday. Her first task is to build the auth feature: a login form, a session guard hook, and the BFF route that authenticates against Django.

---

### Day 1 morning — Getting set up

Amara opens Claude Code in the project root and types:

```
/setup
```

Claude reads `.claude/commands/setup.md` and walks her through:

```bash
npm install
cp .env.example .env.local
# Claude tells her to run: openssl rand -base64 32 and paste as NEXTAUTH_SECRET
npx lefthook install
npm run dev          # ✅ starts on :3000
npm test             # ✅ 122/122 passing
npm run check:arch   # ✅ 0 violations
```

She's running. Before writing any code, Claude tells her to read:
- `CLAUDE.md` — already loaded automatically
- `.claude/rules/01-architecture.md` — where files go
- `.claude/rules/02-typescript.md` — TypeScript conventions

---

### Day 1 afternoon — Scaffolding the feature

Amara types:

```
/new-feature auth
```

Claude reads `.claude/commands/new-feature.md`, then `01-architecture.md`, and creates:

```
src/features/auth/
  components/    (.gitkeep)
  hooks/         (.gitkeep)
  store/         (.gitkeep — auth probably won't need this, but scaffold it)
  types/         auth.types.ts  ← placeholder created
  constants/     (.gitkeep)
  validations/   (.gitkeep)
  schemas/       (.gitkeep)
  services/      (.gitkeep)
```

It also adds a row to `CLAUDE.md`:
```
| Auth feature | 🔲 In progress | Login form, session guard, BFF route |
```

---

### Day 1 late afternoon — The login form schema

Amara says:

```
I need to build the login form schema first. The form has email and password fields.
```

Claude sees "Zod schema" → looks up CLAUDE.md quick reference → reads `.claude/rules/10-zod-schemas.md`. It also reads `03-testing.md` because any new file needs a test.

Amara then types:

```
/tdd LoginFormSchema in features/auth/validations/
```

Claude follows the 3-phase TDD process:

**RED** — writes the test first:
```ts
// features/auth/validations/login-form.schema.test.ts
describe('LoginFormSchema', () => {
  it('rejects empty email', ...)
  it('rejects invalid email format', ...)
  it('rejects short password', ...)
  it('accepts valid credentials', ...)
})
```

Runs: `npx vitest run src/features/auth/validations/login-form.schema.test.ts`
→ **Fails** (file doesn't exist yet) ✅

**GREEN** — creates the schema:
```ts
// features/auth/validations/login-form.schema.ts
export const LoginFormSchema = z.object({
  email:    z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
export type LoginFormValues = z.infer<typeof LoginFormSchema>
```

Runs tests again → **4/4 passing** ✅

**REFACTOR** — nothing to clean up. Runs `npm test` → still 126/126 ✅

---

### Day 2 morning — The login form component

Amara says:

```
Now I need to build the LoginForm component that uses this schema.
```

Claude sees "React component" → reads `04-react.md` (props pattern, return type, no `useMemo`, Tailwind) and `10-zod-schemas.md` (react-hook-form + zodResolver).

Amara types:

```
/tdd LoginForm component in features/auth/components/
```

TDD cycle again. Claude writes the test first, confirms it fails, then writes the component:

```tsx
// ✅ Props accessed as props.onSubmit — not destructured
function LoginForm(props: LoginFormProps): React.JSX.Element {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { email: '', password: '' },
  })
  return (
    <form onSubmit={form.handleSubmit(props.onSubmit)}>
      ...
    </form>
  )
}
```

---

### Day 2 afternoon — The BFF route

Amara says:

```
I need a POST /api/auth/login route that forwards credentials to Django.
```

Claude sees "API route" → reads `05-api-and-security.md` (auth check first, validate body, tenant from session, `apiFetch` only).

```
/tdd POST /api/auth/login route
```

Claude writes the test, checks auth → validate → apiFetch pattern, runs TDD cycle. Route ends up as:

```ts
export async function POST(request: Request): Promise<Response> {
  // No session check here — this IS the login route
  const { data, error } = await validateBody(request, LoginBodySchema)
  if (error) return error
  const res = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) })
  ...
}
```

---

### Day 2 end — PR check

Amara types:

```
/pr-ready
```

Claude runs all 7 gates:

```
Gate 1 — TypeScript    ✅  exit 0
Gate 2 — Lint          ✅  exit 0, 0 warnings
Gate 3 — Tests         ✅  134/134 passing
Gate 4 — Architecture  ✅  0 violations
Gate 5 — Dead code     ✅  no new unused exports
Gate 6 — Checklist     ✅  all items PASS or N/A
Gate 7 — React         ✅  0 violations

✅ Ready to raise PR. All 7 gates passed.
```

Amara opens the PR with confidence.

---

## 6. Rules enforced automatically vs by Claude

### Automatically enforced (fail the commit or CI)

These run on every `git commit` (via lefthook) or in CI and cannot be bypassed:

| Rule | What it catches | Command | What happens if violated |
|---|---|---|---|
| TypeScript compilation | Type errors, invalid imports, missing return types | `npm run type-check` | Pre-commit hook blocks the commit |
| ESLint rules | `any` type, `interface` keyword, missing return types on functions, `explicit-function-return-type` | `npm run lint` | Pre-commit hook blocks the commit |
| All tests passing | Regressions in existing behaviour | `npm test` | Pre-commit hook blocks the commit |
| Architecture boundaries | Imports across forbidden layer boundaries | `npm run check:arch` | CI fails; pre-commit does not run this (it's slow) |
| Conventional commit format | Commit message must match `type(scope): description` | lefthook commit-msg hook | Commit is rejected with an error message |

### Enforced by Claude Code rules (Claude checks these when you ask)

These cannot be caught by static analysis — they require understanding intent:

| Rule | What it catches | Rule file | When Claude checks it |
|---|---|---|---|
| Props never destructured | `function Card({ name })` instead of `function Card(props)` | `04-react.md` | Before writing any component; during `/react-check` |
| No `useMemo`/`useCallback` | Manual memoisation fighting the Compiler | `04-react.md` | During `/react-check`; during `/pr-ready` Gate 7 |
| Tenant IDs from session only | `storeId` read from request body | `05-api-and-security.md` | During `/pr-ready` Gate 6 |
| Query keys tenant-scoped | `queryKey: ['orders']` missing org/store prefix | `05-api-and-security.md` | During `/pr-ready` Gate 6 |
| All checkout outcomes handled | Missing `case 'offline':` in saga result switch | `06-offline.md` | When writing checkout code; during `/pr-ready` Gate 6 |
| `writeCommand()` not direct Dexie | `db.commands.add(...)` bypassing queue safety | `06-offline.md` | When writing queue code; during `/pr-ready` Gate 6 |
| Money stored as paise integer | `amount: 52.50` instead of `amount: 5250` | `02-typescript.md` | When writing any money-related code |
| `formatMoney()` for display | Manual `price / 100` in templates | `04-react.md` | When writing any UI that shows prices |
| File in correct layer | New saga put in `features/` instead of `core/application/` | `01-architecture.md` | Whenever creating a new file; during `/pr-ready` Gate 6 |
| One store per feature | Multiple micro-stores for one feature | `08-zustand.md` | When creating a new store |
| `staleTime` on every query | Missing `staleTime` causing excessive refetches | `09-tanstack-query.md` | When reviewing TanStack Query calls |
| Form schemas in `validations/`, API schemas in `schemas/` | Schema in wrong folder | `10-zod-schemas.md` | When creating any new Zod schema |

---

## 7. Quick reference card

| Situation | Read rule file | Run command |
|---|---|---|
| Starting a new project on a new machine | `01-architecture.md`, `02-typescript.md` | `/setup` |
| Creating a new feature from scratch | `01-architecture.md` | `/new-feature <name>` |
| Building anything new (any file) | `01-architecture.md` + area-specific rule | `/tdd <what>` |
| Writing a React component | `04-react.md` | `/tdd` then `/react-check` |
| Writing a Zustand store | `08-zustand.md` | `/tdd` |
| Adding a TanStack Query call | `09-tanstack-query.md` | `/tdd` |
| Adding a Zod schema or form | `10-zod-schemas.md` | `/tdd` |
| Writing a BFF API route | `05-api-and-security.md` | `/tdd` |
| Writing a test | `03-testing.md` | `/tdd` |
| Working on offline / sync / queue | `06-offline.md` | `/tdd` |
| Defining or moving a type | `02-typescript.md` | — |
| Unsure where a file goes | `01-architecture.md` | — |
| Coverage dropped or threshold warning | — | `/coverage` |
| About to open a pull request | `07-pr-checklist.md` | `/pr-ready` |
| Added new React components | `04-react.md` | `/react-check` |
| Hit an `npm run check:arch` violation | `01-architecture.md` (dependency rules) | — |
| Hit a pre-commit hook failure | Depends on which hook failed | — |
| New developer joining the team | All rule files, in order | `/setup` |
