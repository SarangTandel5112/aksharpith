# 10 — PR Checklist

Run all checks before every PR. All must be green.

## Step 1 — Quality Gates

```bash
npm run type-check    # must exit 0
npm run lint          # must exit 0, zero warnings
npm run test:unit     # must be 100% passing
npm run build         # must exit 0
```

## Step 2 — Layer Boundaries

- [ ] Controllers contain zero business logic
- [ ] Services depend on interfaces only (grep `new XRepository` in services — should be zero)
- [ ] AppDataSource only imported in `*.module.ts` and `__tests__/setup/`
- [ ] No module imports another module's repository

## Step 3 — Testing

- [ ] Every new service method has a unit test
- [ ] Every new repository method has an integration test
- [ ] TDD was followed — test written before implementation

## Step 4 — Entities

- [ ] Every new entity has `isActive`, `createdAt`, `updatedAt`
- [ ] All FK columns are indexed
- [ ] Column names use `snake_case`, TypeScript properties use `camelCase`
- [ ] Migration written for any schema changes to existing tables

## Step 5 — Commit Message

```
type(scope): description
```

Valid types: `feat fix chore docs test refactor style perf`
Valid scopes: `role dept category sub-category user auth product product-group product-variant`
