# CLAUDE.md - Next.js Boilerplate

Read this file first on every session. Then read the specific rule file
for the area you are working in. All rule files live in `.claude/rules/`.

---

## Quick Reference

| I am working on...        | Read this rule file                    |
|---------------------------|----------------------------------------|
| Any code at all           | `01-architecture.md` (always)          |
| A new feature             | `02-typescript.md` + `03-testing.md`   |
| A React component         | `04-react.md`                          |
| A page or layout file     | `11-pages-and-layouts.md`              |
| A Zustand store           | `08-zustand.md`                        |
| TanStack Query / fetching | `09-tanstack-query.md`                 |
| A Zod schema or form      | `10-zod-schemas.md`                    |
| An API route / BFF        | `05-api-and-security.md`               |
| A test file               | `03-testing.md`                        |
| Before raising a PR       | `07-pr-checklist.md`                   |
| Unsure where a file lives | `01-architecture.md` - Folder Tree     |

---

## Current Project State

| Area            | Status         | Notes                                   |
|-----------------|----------------|-----------------------------------------|
| Foundation      | DONE           | Dev server, env, shell, git hooks       |
| Tests           | passing        | Vitest + MSW wired                      |
| Type check      | Clean          | `tsc --noEmit` exits 0                  |
| Lint            | Clean          | ESLint exits 0                          |
| Arch boundaries | Clean          | dependency-cruiser exits 0              |
| Auth feature    | NOT STARTED    | Build this next                         |

---

## Commands (run these, nothing else)

```bash
npm run dev            # Start dev server (~1s)
npm run type-check     # tsc --noEmit -- must be clean before commit
npm run lint           # ESLint -- zero warnings allowed
npm test               # All tests once
npm run test:watch     # Vitest watch mode
npm run coverage       # Coverage report
npm run check:arch     # Layer boundary enforcement
npm run check:colors   # No hardcoded hex/rgb colors in source files

# Run a single test file
npx vitest run src/path/to/file.test.ts

# Run tests for one feature only
npx vitest run src/features/auth

# Run tests by name pattern
npx vitest run -t "test name"

# Run by project
npx vitest run --project unit   # shared/lib/, app/
npx vitest run --project ui     # features/, shared/hooks/
```

**Pre-commit (lefthook runs automatically):** type-check -> lint -> test

---

## Stack

| Layer      | Package                  | Version |
|------------|--------------------------|---------|
| Framework  | Next.js                  | 16.1.6  |
| UI         | React                    | 19.2.3  |
| Auth       | next-auth                | 4.24    |
| State      | Zustand                  | v5      |
| Data fetch | TanStack Query           | v5      |
| Validation | Zod                      | v4      |
| Styling    | Tailwind                 | v4      |
| Forms      | react-hook-form          | v7      |
| Testing    | Vitest + Testing Library | 2.x     |
| API mock   | MSW                      | v2      |
| E2E        | Playwright               | 1.x     |

---

## Path Aliases

```
@features/*  -> src/features/*
@shared/*    -> src/shared/*
@config/*    -> src/config/*
@test/*      -> src/__tests__/*
```

---

## Environment

### New developer setup

```bash
git clone <repo>
npm install
cp .env.example .env.local    # then fill in values below
npx lefthook install          # sets up pre-commit hooks
npm run dev                   # verify it starts
npm test                      # verify tests pass
```

### Required variables

| Variable                    | Value (dev)                |
|-----------------------------|----------------------------|
| NEXTAUTH_SECRET             | any string >= 32 chars     |
| NEXTAUTH_URL                | http://localhost:3000      |
| DJANGO_API                  | http://localhost:8000      |
| DJANGO_API_SECRET           | any string >= 16 chars     |
| NEXT_PUBLIC_TERMINAL_ENV    | development                |
| NEXT_PUBLIC_SENTRY_DISABLED | true                       |

### Adding a new environment variable

1. Add to `src/config/env.ts` with Zod validation
2. Add to `.env.example` with a safe placeholder value
3. Add to `.env.local` with your real dev value
4. Restart the dev server (`npm run dev`)
5. If used in tests, add to the test env block in `vitest.config.mts`
6. Document it in the table above

---

## Cursor IDE Users

If you are using Cursor, two extra commands are available:
- `.cursor/commands/review.md` -- full PR review walkthrough
- `.cursor/commands/react-compiler-check.md` -- React Compiler compliance check

These are Cursor-only and cannot be invoked in Claude Code.
