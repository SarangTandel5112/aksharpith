# Backend Refactor + Lot Matrix — Design Spec

**Date:** 2026-03-21
**Status:** Approved
**Scope:** Backend only (Node.js / TypeScript / TypeORM / Express)

---

## 1. Goals

1. Refactor the existing backend to an interface-driven, testable architecture.
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
- Static helpers (`BcryptHelper`, `TokenHelper`, `GSTHelper`) are pure utilities — they are **not injected** and are imported directly by services. Unit tests that involve these helpers test them as real implementations (they have no I/O side effects). Only repository dependencies are injected via interfaces.

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

### 2.3 Repository Interface Design

`IRepository<T>` is the base interface containing only operations all repositories share:

```typescript
// src/common/interfaces/repository.interface.ts
export interface IRepository<T> {
  findById(id: number, relations?: string[]): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T | null>;
  delete(id: number): Promise<boolean>;
  count(where?: Partial<T>): Promise<number>;
}
```

The `relations` parameter is optional — modules that need eager-loading pass relation names (e.g. `['department', 'subCategory']`); others omit it. Fake repositories in unit tests accept and ignore this parameter.

Pagination is **not** part of the base interface because it uses TypeORM-specific query builder callbacks. Each module defines its own extended interface:

```typescript
// src/modules/department/interfaces/department.repository.interface.ts
export interface IDepartmentRepository extends IRepository<Department> {
  findAll(options: QueryDepartmentDto): Promise<PaginatedResult<Department>>;
  findByCode(code: string): Promise<Department | null>;
}
```

This keeps unit test fakes free of TypeORM dependencies.

### 2.4 `isActive` Convention

All entities **must** include an `isActive boolean` column. `BaseRepository.findById` filters by `isActive = true`. If an entity conceptually has no active/inactive state, it still carries `isActive = true` as a soft-delete flag. There are no exceptions.

### 2.5 Shared Infrastructure Changes

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

### 2.6 Path Aliases (unchanged)

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
| Coverage | Jest `--coverage`, minimum 80% on service layer |

### 3.2 Scripts

```bash
npm run test              # runs both unit and integration
npm run test:unit         # fast, no Docker
npm run test:integration  # requires Docker, real Postgres
npm run test:coverage     # generates HTML coverage report
```

### 3.3 Jest Configs

**`jest.config.unit.ts`:**
```typescript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['.*\\.integration\\.test\\.ts$'],
};
```

**`jest.config.integration.ts`:**
```typescript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.integration.test.ts'],
  testTimeout: 30000,
};
```

The unit config **explicitly excludes** `*.integration.test.ts` via `testPathIgnorePatterns`.

### 3.4 Unit Test Pattern

Services are tested with a hand-written **fake in-memory repository** — no `jest.mock()` needed:

```typescript
// __tests__/fakes/fake-department.repository.ts
export class FakeDepartmentRepository implements IDepartmentRepository {
  private store: Department[] = [];
  async findById(id: number) { return this.store.find(d => d.id === id) ?? null; }
  async create(data: Partial<Department>) { /* push and return */ }
  async findAll(options: QueryDepartmentDto) { /* filter store */ }
  // ...
}

// department.service.test.ts — RED → GREEN → REFACTOR
it('throws when department does not exist', async () => {
  const service = new DepartmentService(new FakeDepartmentRepository());
  await expect(service.getDepartmentById(999)).rejects.toThrow('Department not found');
});
```

### 3.5 Integration Test Pattern

Integration tests use **one container per test file** with a **`beforeEach` TRUNCATE** for row isolation:

```typescript
// department.repository.integration.test.ts
let container: StartedPostgreSqlContainer;
let dataSource: DataSource;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:16').start();
  // createTestDataSource uses synchronize: true against the container schema
  dataSource = await createTestDataSource(container);
});

afterAll(async () => {
  await dataSource.destroy();
  await container.stop();
});

beforeEach(async () => {
  // Truncate all tables to isolate each test
  await dataSource.query('TRUNCATE departments RESTART IDENTITY CASCADE');
});

it('persists and retrieves a department', async () => {
  const repo = new DepartmentRepository(dataSource.getRepository(Department));
  const dept = await repo.create({ departmentName: 'Electronics', isActive: true });
  const found = await repo.findById(dept.id);
  expect(found?.departmentName).toBe('Electronics');
});
```

**Schema creation strategy:** `createTestDataSource` uses `synchronize: true`. Integration tests validate query correctness against the actual entity schema. Migration correctness is validated separately via `npm run migrate` in a dedicated migration test or CI step.

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

**`products` table — 3 changes:**
- Add `group_id int` (FK → `product_groups`, RESTRICT delete) — see migration strategy below
- Remove: `gst_1_sgst`, `gst_1_slab`, `gst_2_cgst`, `gst_2_slab`, `gst_3_igst`, `gst_3_slab`
- Change: `product_type varchar(20)` → NOT NULL (was nullable)
- Delete `src/helpers/gst.helper.ts` entirely — this file contains `validateGSTConfiguration`, `calculatePriceWithGST`, `getStockStatus`, `canDisplayProduct`, and `generateProductCode`. All of these are confirmed dead code (no callers outside the helper itself after GST removal). Delete the file and remove its import from `product.service.ts`. Do not relocate any of these methods.

**`product_categories` table — 1 change:**
- Add `department_id int` (FK → `departments`, RESTRICT delete) — see migration strategy below

### 4.2 Migration Strategy for NOT NULL Foreign Keys

Both new FK columns (`group_id` on products, `department_id` on categories) are NOT NULL but existing rows have no value. The migration must follow this sequence:

**Step 1 — Create new tables first** (product_groups, and ensure departments exist)
**Step 2 — Seed a default row:**
```sql
INSERT INTO product_groups (group_name, is_active, created_at)
VALUES ('General', true, NOW())
ON CONFLICT DO NOTHING;

-- (departments table already has data from prior work)
-- If empty: INSERT INTO departments (department_name, is_active) VALUES ('General', true)
```
**Step 3 — Add columns as nullable:**
```sql
ALTER TABLE products ADD COLUMN group_id int REFERENCES product_groups(id);
ALTER TABLE product_categories ADD COLUMN department_id int REFERENCES departments(id);
```
**Step 4 — Backfill existing rows:**
```sql
UPDATE products SET group_id = (SELECT id FROM product_groups WHERE group_name = 'General' LIMIT 1);
UPDATE product_categories SET department_id = (SELECT id FROM departments LIMIT 1);
```
**Step 5 — Apply NOT NULL constraint:**
```sql
ALTER TABLE products ALTER COLUMN group_id SET NOT NULL;
ALTER TABLE product_categories ALTER COLUMN department_id SET NOT NULL;
```

### 4.3 New Entities — Product Groups System

| Entity | Table | Purpose |
|--------|-------|---------|
| `ProductGroup` | `product_groups` | Named metadata templates (Book, Agarbatti) |
| `GroupField` | `group_fields` | Field definitions per group (Author, ISBN) |
| `GroupFieldOption` | `group_field_options` | Dropdown values per field |
| `ProductGroupFieldValue` | `product_group_field_values` | Actual values per product |

### 4.4 New Entities — Lot Matrix System

| Entity | Table | Purpose |
|--------|-------|---------|
| `ProductAttribute` | `product_attributes` | Variation dimensions per product (Color, Size) |
| `ProductAttributeValue` | `product_attribute_values` | Possible values per attribute (Red, Blue, S, M) |
| `ProductVariant` | `product_variants` | One sellable SKU per combination |
| `ProductVariantAttribute` | `product_variant_attributes` | Maps variant → attribute values |
| `ProductVariantMedia` | `product_variant_media` | Images per variant |

### 4.5 Combination Hash

A `combination_hash` is stored on each `ProductVariant`. It is computed by:
1. Collecting all `attribute_value_id` values for the variant
2. **Sorting them ascending by `attribute_value_id` (numeric)**
3. Joining with underscores

```
Color=Red (attribute_value_id: 1) + Size=S (attribute_value_id: 3)  →  "1_3"
Color=Red (attribute_value_id: 1) + Size=M (attribute_value_id: 4)  →  "1_4"
Size=S    (attribute_value_id: 3) + Color=Red (attribute_value_id: 1) →  "1_3"  ← same hash
```

The sort is always by `attribute_value_id` numerically, regardless of attribute order. The DB has a UNIQUE constraint on `(product_id, combination_hash)`.

### 4.6 Validation Rules

1. A `Standard` product cannot have `ProductAttribute` or `ProductVariant` records.
2. A `Lot Matrix` product must define at least one attribute with at least two values.
3. Each variant must contain exactly one value per attribute defined on the product.
4. `combination_hash` must be unique per product.
5. Cannot delete a `ProductGroup` if products reference it (RESTRICT).
6. Cannot delete a `ProductAttribute` if variants reference it (RESTRICT).

---

## 5. New and Updated Modules

### 5.1 `product-group` module

- CRUD for `ProductGroup`
- `GroupField` managed as nested sub-resource under group
- `GroupFieldOption` managed as nested sub-resource under field
- Routes:
  - `GET/POST /product-groups`
  - `GET/PUT/DELETE /product-groups/:id`
  - `GET/POST /product-groups/:id/fields`
  - `GET/PUT/DELETE /product-groups/:id/fields/:fieldId`
  - `GET/POST /product-groups/:id/fields/:fieldId/options`
  - `DELETE /product-groups/:id/fields/:fieldId/options/:optionId`

### 5.2 `product-attribute` module

- CRUD for `ProductAttribute` and `ProductAttributeValue` per product
- Routes:
  - `GET/POST /products/:productId/attributes`
  - `GET/PUT/DELETE /products/:productId/attributes/:id`
  - `GET/POST /products/:productId/attributes/:id/values`
  - `PUT/DELETE /products/:productId/attributes/:id/values/:valueId`

### 5.3 `product-variant` module

- Generate all permutations of variants from existing attributes
- CRUD for individual variants (price, stock, active flag)
- Manage variant media
- Routes:
  - `POST /products/:productId/variants/generate` — generates all combinations
  - `GET /products/:productId/variants`
  - `GET/PUT /products/:productId/variants/:id`
  - `GET/POST /products/:productId/variants/:id/media`
  - `DELETE /products/:productId/variants/:id/media/:mediaId`

### 5.4 `product` module — updated

- Remove GST fields from entity, all DTOs, service, repository
- Add `groupId` as required field in `CreateProductDto`
- Update `productType` to required enum: `Standard | Lot Matrix`
- Service validates: `Standard` products reject attribute/variant operations
- Delete `gst.helper.ts` — remove all imports of it

### 5.5 Product sub-resources (satellite modules)

These five existing entities are managed as **sub-resources inside the product module** (not standalone modules). Each gets its own repository interface, service method group, and routes:

| Entity | Routes prefix | isActive column |
|--------|--------------|-----------------|
| `ProductMedia` | `/products/:productId/media` | Add via migration (default true) |
| `ProductMarketingMedia` | `/products/:productId/marketing-media` | Add via migration (default true) |
| `ProductPhysicalAttributes` | `/products/:productId/physical-attributes` (1:1) | Add via migration (default true) |
| `ProductZone` | `/products/:productId/zones` | Already present |
| `ProductVendor` | `/products/:productId/vendors` | Already present |

**Migration note:** `ProductMedia`, `ProductMarketingMedia`, and `ProductPhysicalAttributes` do not currently have an `isActive` column. The Phase 2b migration must add `ALTER TABLE product_media ADD COLUMN is_active boolean NOT NULL DEFAULT true`, and similarly for `product_marketing_media` and `product_physical_attributes`.

### 5.6 `product-group-field-values` — managed via product module

`ProductGroupFieldValue` records are managed as a sub-resource of the product:

- `GET /products/:productId/group-field-values` — returns all field values for the product
- `PUT /products/:productId/group-field-values` — bulk upsert (replaces all values for the product in one call)

The bulk upsert pattern is used because group field values are always set together (when a user fills out the group metadata form for a product, they submit all fields at once).

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
      05-repositories.md            ← IRepository pattern, interface rules, isActive convention
      06-services.md                ← service layer, validation, static helpers rule
      07-entities.md                ← TypeORM conventions, isActive mandatory, migration rules
      08-controllers-routes.md      ← thin controller rules, route conventions
      09-error-handling.md          ← error types, HTTP status mapping
      10-pr-checklist.md            ← gates before every PR
```

### 6.2 CLAUDE.md Quick Reference

```
| I am working on...         | Read this rule file           |
|----------------------------|-------------------------------|
| Any code at all            | 01-architecture.md (always)   |
| A new feature/module       | 04-modules.md                 |
| A repository               | 05-repositories.md            |
| A service                  | 06-services.md                |
| A TypeORM entity           | 07-entities.md                |
| A controller or route      | 08-controllers-routes.md      |
| A test file                | 03-testing.md                 |
| Error handling             | 09-error-handling.md          |
| Before raising a PR        | 10-pr-checklist.md            |
```

### 6.3 Pre-commit Gates (via lefthook)

```bash
npm run type-check    # tsc --noEmit — must exit 0
npm run lint          # ESLint — zero warnings
npm run test:unit     # all unit tests pass
npm run build         # dist compiles cleanly
```

Integration tests run in CI only (require Docker).

---

## 7. Implementation Order

### Phase 0 — Foundation (everything else builds on this)

1. Install Jest + ts-jest + testcontainers + lefthook as dev dependencies
2. Create `jest.config.unit.ts` and `jest.config.integration.ts` with correct glob patterns
3. Create `src/__tests__/setup/integration.setup.ts` (`createTestDataSource` factory using testcontainers)
4. Refactor `BaseRepository` to accept injected `Repository<T>` (remove internal `AppDataSource` reference)
5. Create `IRepository<T>` base interface in `src/common/interfaces/repository.interface.ts`
6. Write `backend/CLAUDE.md` and all 10 `.claude/rules/*.md` files
7. Install and configure lefthook pre-commit hooks (`type-check → lint → test:unit → build`)

### Phase 1 — Refactor Existing Modules (TDD for each)

For each module: add interfaces → write fake repository → write service unit tests (RED) → refactor service to pass (GREEN) → write repository integration tests → move on.

Order (simplest to most complex):
1. `role`
2. `department`
3. `category` *(entity change: add `department_id` TypeORM relation — column added in Phase 2b migration)*
4. `sub-category`
5. `user`
6. `auth` *(note: `BcryptHelper` and `TokenHelper` are static utilities, not injected — see Section 2.1)*
7. `product` *(remove GST fields from entity + DTOs + service; delete `gst.helper.ts`; add `groupId` field but mark as optional temporarily until Phase 2c migration completes)*

### Phase 2 — New Entities + Migrations

- **2a** Create new TypeORM entity files: `ProductGroup`, `GroupField`, `GroupFieldOption`, `ProductGroupFieldValue`, `ProductAttribute`, `ProductAttributeValue`, `ProductVariant`, `ProductVariantAttribute`, `ProductVariantMedia`
- **2b** Write and run migration: create all new tables from 2a entities
- **2c** Write and run migration: seed default `ProductGroup` + default `Department` (if none) → add `group_id` nullable to `products` → backfill → set NOT NULL; same pattern for `product_categories.department_id`
- **2d** Update `product` entity and `category` entity to reflect new FK columns as required after migration

### Phase 3 — New Modules (TDD throughout)

1. `product-group` module (groups + fields + options — full TDD)
2. `product` sub-resources (media, marketing-media, physical-attributes, zones, vendors — add to product module)
3. `product-group-field-values` sub-resource (add to product module)
4. `product-attribute` module (attributes + values — full TDD)
5. `product-variant` module (variants + combination generation + media — full TDD, most complex)

---

## 8. Success Criteria

- [ ] `npm run type-check` exits 0
- [ ] `npm run lint` exits 0, zero warnings
- [ ] `npm run test:unit` — all passing, ≥80% coverage on service layer
- [ ] `npm run test:integration` — all passing against real Postgres via testcontainers
- [ ] `npm run build` — dist compiles cleanly
- [ ] All existing modules refactored to interface-driven structure with unit + integration tests
- [ ] `gst.helper.ts` deleted, all references removed
- [ ] Lot Matrix CRUD fully functional with deterministic combination hash validation
- [ ] Product sub-resources (media, marketing-media, zones, vendors, physical-attributes) have routes
- [ ] `ProductGroupFieldValue` bulk upsert endpoint working
- [ ] CLAUDE.md + all 10 rule files written and accurate
- [ ] Migration script handles existing data without data loss (backfill → NOT NULL)
