# CLAUDE.md — Backend

Read this file first on every session. Then read the rule file for the area you are working in. All rule files live in `.claude/rules/`.

---

## Quick Reference

| I am working on...      | Read this rule file          |
|-------------------------|------------------------------|
| Any code at all         | `01-architecture.md` (always)|
| A new feature/module    | `04-modules.md`              |
| A repository            | `05-repositories.md`         |
| A service               | `06-services.md`             |
| A TypeORM entity        | `07-entities.md`             |
| A controller or route   | `08-controllers-routes.md`   |
| A test file             | `03-testing.md`              |
| Error handling          | `09-error-handling.md`       |
| Before raising a PR     | `10-pr-checklist.md`         |

---

## Commands

```bash
npm run dev             # Start dev server
npm run type-check      # tsc --noEmit — must be clean before commit
npm run lint            # ESLint — zero warnings allowed
npm run test:unit       # Fast unit tests (no Docker)
npm run test:integration # Integration tests (requires Docker)
npm run test            # Both
npm run test:coverage   # Coverage report (≥80% on services)
npm run build           # Compile to dist/
npm run migrate         # Run pending migrations
```

**Pre-commit (lefthook runs automatically):** type-check → lint → test:unit → build

---

## Stack

| Layer      | Package      | Version |
|------------|--------------|---------|
| Framework  | Express      | 4.x     |
| ORM        | TypeORM      | 0.3.x   |
| Database   | PostgreSQL   | 16      |
| Validation | class-validator | 0.14 |
| Testing    | Jest + ts-jest | 29.x  |
| Containers | testcontainers | latest |

---

## Path Aliases

```
@modules/*     →  src/modules/*
@middlewares/* →  src/middlewares/*
@config/*      →  src/config/*
@helpers/*     →  src/helpers/*
@common/*      →  src/common/*
@setup/*       →  src/setup/*
@routes/*      →  src/routes/*
@entities      →  src/entities/index
@entities/*    →  src/entities/*
@test/*        →  src/__tests__/*
```
