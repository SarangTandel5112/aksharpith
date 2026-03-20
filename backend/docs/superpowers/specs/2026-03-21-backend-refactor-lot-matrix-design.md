# Backend Refactor + Lot Matrix — Design Spec

**Date:** 2026-03-21
**Status:** Approved
**Scope:** Backend only (Node.js / TypeScript / TypeORM / Express)

---

## 1. Goals

1. Refactor the existing backend to an interface-driven, testable architecture (Approach B).
2. Set up Jest + ts-jest + testcontainers for unit and integration testing.
3. Write a backend `CLAUDE.md` with `.claude/rules/` enforcing TDD discipline.
4. Align the `products` and `product_categories` entities with the target DBML schema.
5. Implement the full Lot Matrix system (attributes, variants, variant media) on the new foundation.
6. Refactor all existing modules (auth, users, roles, categories, departments, sub-categories, products) to the new structure.

---

## 2. Architecture

### 2.1 Layer Rules

```
Controller  →  Service Interface  →  Repository Interface  →  TypeORM Repository<T>
```

- Controllers are thin HTTP handlers — no business logic.
- Services depend on **repository interfaces**, never concrete classes or `AppDataSource`.
- Repositories extend `BaseRepository<T>` and accept an injected `Repository<T>`.
- No module imports another module's repository directly — only via its service.
- `AppDataSource` is only imported in `*.module.ts` wiring files and integration test setup.

### 2.2 Module Folder Structure

Every module follows this exact layout:

```
src/modules/<feature>/
  interfaces/
    <feature>.repository.interface.ts
    <feature>.service.interface.ts
  dtos/
    create-<feature>.dto.ts
    update-<feature>.dto.ts
    query-<feature>.dto.ts
    index.ts
  <feature>.repository.ts         ← extends BaseRepository, implements IRepository
  <feature>.service.ts            ← depends on IRepository interface
  <feature>.controller.ts         ← thin HTTP handler
  <feature>.routes.ts             ← Express Router wiring
  <feature>.module.ts             ← wires repo → service → controller
  __tests__/
    <feature>.service.test.ts                        ← unit tests (fake repo)
    <feature>.repository.integration.test.ts         ← integration (testcontainers)
    fakes/
      fake-<feature>.repository.ts                   ← in-memory fake for unit tests
```

### 2.3 Shared Infrastructure Changes

```
src/common/
  interfaces/
    repository.interface.ts       ← IRepository<T> base interface
  base.repository.ts              ← refactored to accept injected Repository<T>
  base.controller.ts              ← unchanged
  types.ts                        ← unchanged

src/__tests__/
  factories/                      ← shared entity builders (one file per entity)
  helpers/                        ← shared test utilities
  setup/
    integration.setup.ts          ← testcontainers Postgres bootstrap + DataSource factory
```

### 2.4 Path Aliases (unchanged)

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
```

---

## 3. Testing Setup

### 3.1 Stack

| Layer | Tool |
|-------|------|
| Test runner | Jest + ts-jest |
| Unit environment | Node (jest default) |
| Integration environment | testcontainers-node + PostgreSqlContainer |
| Coverage | Jest `--coverage`, minimum 80% enforced |

### 3.2 Scripts

```bash
npm run test              # runs both unit and integration
npm run test:unit         # fast, no Docker
npm run test:integration  # requires Docker, real Postgres
npm run test:coverage     # generates HTML coverage report
```

### 3.3 Jest Configs

**`jest.config.unit.ts`** — matches `**/__tests__/*.service.test.ts` and `**/__tests__/*.test.ts` (non-integration)
**`jest.config.integration.ts`** — matches `**/__tests__/*.integration.test.ts`

### 3.4 Unit Test Pattern

Services are tested with a hand-written **fake in-memory repository** — no `jest.mock()` needed:

```typescript
// __tests__/fakes/fake-department.repository.ts
export class FakeDepartmentRepository implements IDepartmentRepository {
  private store: Department[] = [];
  async findById(id: number) { return this.store.find(d => d.id === id) ?? null; }
  async create(data: CreateDepartmentDto) { /* push and return */ }
  // ...
}

// department.service.test.ts — RED → GREEN → REFACTOR
it('throws when department does not exist', async () => {
  const service = new DepartmentService(new FakeDepartmentRepository());
  await expect(service.getDepartmentById(999)).rejects.toThrow('Department not found');
});
```

### 3.5 Integration Test Pattern

```typescript
// department.repository.integration.test.ts
let container: StartedPostgreSqlContainer;
let dataSource: DataSource;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:16').start();
  dataSource = await createTestDataSource(container);
});

afterAll(async () => {
  await dataSource.destroy();
  await container.stop();
});

it('persists and retrieves a department', async () => {
  const repo = new DepartmentRepository(dataSource.getRepository(Department));
  const dept = await repo.create({ departmentName: 'Electronics', isActive: true });
  const found = await repo.findById(dept.id);
  expect(found?.departmentName).toBe('Electronics');
});
```

### 3.6 TDD Discipline

```
RED    → Write the failing test first. Run it. Confirm failure.
GREEN  → Write the minimum code to pass. Nothing extra.
REFACTOR → Clean up. Tests must remain green.
```

Never write implementation before the test exists and is red.

---

## 4. Schema Changes

### 4.1 Existing Entities — Changes Required

**`products` table:**
- Add `group_id int NOT NULL` (FK → `product_groups`, RESTRICT delete)
- Remove: `gst_1_sgst`, `gst_1_slab`, `gst_2_cgst`, `gst_2_slab`, `gst_3_igst`, `gst_3_slab`
- Change: `product_type varchar(20)` → NOT NULL (was nullable)

**`product_categories` table:**
- Add `department_id int NOT NULL` (FK → `departments`, RESTRICT delete)

**Migration required:** Both changes add NOT NULL columns to tables that may have existing rows. Migration script must set default values before applying constraints.

### 4.2 New Entities — Product Groups System

| Entity | Table | Purpose |
|--------|-------|---------|
| `ProductGroup` | `product_groups` | Named metadata templates (Book, Agarbatti) |
| `GroupField` | `group_fields` | Field definitions per group (Author, ISBN) |
| `GroupFieldOption` | `group_field_options` | Dropdown values per field |
| `ProductGroupFieldValue` | `product_group_field_values` | Actual values per product |

### 4.3 New Entities — Lot Matrix System

| Entity | Table | Purpose |
|--------|-------|---------|
| `ProductAttribute` | `product_attributes` | Variation dimensions per product (Color, Size) |
| `ProductAttributeValue` | `product_attribute_values` | Possible values per attribute (Red, Blue, S, M) |
| `ProductVariant` | `product_variants` | One sellable SKU per combination |
| `ProductVariantAttribute` | `product_variant_attributes` | Maps variant → attribute values |
| `ProductVariantMedia` | `product_variant_media` | Images per variant |

### 4.4 Combination Hash

A `combination_hash` is stored on each `ProductVariant` as a deterministic string of sorted attribute value IDs joined by underscores:

```
Color=Red(id:1) + Size=S(id:3)  →  "1_3"
Color=Red(id:1) + Size=M(id:4)  →  "1_4"
```

This has a unique DB constraint — duplicate combinations are rejected at the database level. The service generates all permutations at variant creation time and validates no duplicates exist.

### 4.5 Validation Rules

1. A `Standard` product cannot have `ProductAttribute` or `ProductVariant` records.
2. A `Lot Matrix` product must define at least one attribute with at least two values.
3. Each variant must contain exactly one value per attribute defined on the product.
4. `combination_hash` must be unique per product.
5. Cannot delete a `ProductGroup` if products reference it.
6. Cannot delete an `ProductAttribute` if variants reference it.

---

## 5. New Modules

### 5.1 `product-group` module

- CRUD for `ProductGroup`, `GroupField`, `GroupFieldOption`
- `GroupField` managed as nested resource under group
- `GroupFieldOption` managed as nested resource under field
- Routes: `/product-groups`, `/product-groups/:id/fields`, `/product-groups/:id/fields/:fieldId/options`

### 5.2 `product-attribute` module

- CRUD for `ProductAttribute` and `ProductAttributeValue` per product
- Routes: `/products/:productId/attributes`, `/products/:productId/attributes/:id/values`

### 5.3 `product-variant` module

- Generate variants from attribute combinations
- CRUD for individual variants (price, stock, active flag)
- Manage variant media
- Routes: `/products/:productId/variants`, `/products/:productId/variants/:id/media`

### 5.4 Updated `product` module

- Remove GST fields from DTOs, entity, service
- Add `groupId` as required field
- Update `productType` to be required enum: `Standard | Lot Matrix`
- Service validates: Standard products reject variant-related operations

---

## 6. CLAUDE.md Structure

### 6.1 File Layout

```
backend/
  CLAUDE.md                         ← quick reference index
  .claude/
    rules/
      01-architecture.md            ← folder map, layer rules, aliases
      02-typescript.md              ← strict TS, no any, no enum, type keyword
      03-testing.md                 ← TDD discipline, unit vs integration
      04-modules.md                 ← step-by-step module creation guide
      05-repositories.md            ← IRepository pattern, injection rules
      06-services.md                ← service layer, validation patterns
      07-entities.md                ← TypeORM conventions, migration rules
      08-controllers-routes.md      ← thin controller rules, route conventions
      09-error-handling.md          ← error types, HTTP status mapping
      10-pr-checklist.md            ← gates before every PR
```

### 6.2 Pre-commit Gates (via lefthook)

```bash
npm run type-check    # tsc --noEmit — must exit 0
npm run lint          # ESLint — zero warnings
npm run test:unit     # all unit tests pass
npm run build         # dist compiles cleanly
```

Integration tests run in CI only (require Docker).

---

## 7. Implementation Order

### Phase 0 — Foundation (do first, everything else builds on this)
1. Install Jest + ts-jest + testcontainers + lefthook
2. Create `jest.config.unit.ts` and `jest.config.integration.ts`
3. Create `src/__tests__/setup/integration.setup.ts`
4. Refactor `BaseRepository` to accept injected `Repository<T>`
5. Create `IRepository<T>` base interface in `src/common/interfaces/`
6. Write `CLAUDE.md` and all `.claude/rules/` files
7. Install and configure lefthook pre-commit hooks

### Phase 1 — Refactor Existing Modules
Refactor each existing module to the new structure in this order:
1. `role` (simplest — no relations)
2. `department`
3. `category` (add `department_id`)
4. `sub-category`
5. `user`
6. `auth`
7. `product` (most complex — schema changes + remove GST)

Each module: add interfaces → add fake → write unit tests (RED) → refactor service to pass tests (GREEN) → add integration tests for repository.

### Phase 2 — New Entities + Migrations
1. Create all new TypeORM entities (product_groups system + lot matrix system)
2. Write migration for: `products.group_id`, `products.product_type NOT NULL`, `product_categories.department_id`, remove GST columns
3. Run migration against dev DB

### Phase 3 — New Modules (TDD)
1. `product-group` module (full TDD)
2. `product-attribute` module (full TDD)
3. `product-variant` module (full TDD — most complex)

---

## 8. Success Criteria

- [ ] `npm run type-check` exits 0
- [ ] `npm run lint` exits 0, zero warnings
- [ ] `npm run test:unit` — all passing, ≥80% coverage on service layer
- [ ] `npm run test:integration` — all passing against real Postgres
- [ ] `npm run build` — dist compiles cleanly
- [ ] All existing modules refactored to interface-driven structure
- [ ] Lot Matrix CRUD fully functional with combination hash validation
- [ ] CLAUDE.md + all 10 rule files written and accurate
- [ ] Migration script handles existing data without data loss
