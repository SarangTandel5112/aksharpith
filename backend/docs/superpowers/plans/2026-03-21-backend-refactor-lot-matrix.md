# Backend Refactor + Lot Matrix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the backend to an interface-driven, fully-tested architecture and implement the complete Lot Matrix (product variants) and Product Groups systems.

**Architecture:** Services depend on injected repository interfaces, never on concrete classes or the global `AppDataSource`. Unit tests inject in-memory fake repositories; integration tests use real Postgres via testcontainers. All new features are built TDD — test written and confirmed failing before any implementation.

**Tech Stack:** Node.js, TypeScript, Express, TypeORM, PostgreSQL, Jest, ts-jest, testcontainers-node, lefthook

**Spec:** `docs/superpowers/specs/2026-03-21-backend-refactor-lot-matrix-design.md`

---

## Join Table Exception

`ProductVariantAttribute` is a pure join table (no `id` PK, no `isActive`). It is managed directly via TypeORM `save()` and `delete()` — not via `BaseRepository`. This is the only exception to the `isActive` rule.

---

## Phase 0 — Foundation

### Task 1: Install test dependencies and add npm scripts

**Files:**
- Modify: `package.json`

- [ ] Run install:

```bash
cd backend
npm install --save-dev jest ts-jest @types/jest @testcontainers/postgresql lefthook
```

- [ ] Add scripts to `package.json`:

```json
"test": "npm run test:unit && npm run test:integration",
"test:unit": "jest --config jest.config.unit.ts",
"test:integration": "jest --config jest.config.integration.ts",
"test:coverage": "jest --config jest.config.unit.ts --coverage"
```

- [ ] Commit:

```bash
git add package.json package-lock.json
git commit -m "chore: install jest, ts-jest, testcontainers, lefthook"
```

---

### Task 2: Create Jest configs

**Files:**
- Create: `backend/jest.config.unit.ts`
- Create: `backend/jest.config.integration.ts`

- [ ] Create `jest.config.unit.ts`:

```typescript
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['\\.integration\\.test\\.ts$', '/node_modules/'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  collectCoverageFrom: ['src/modules/**/*.service.ts'],
  coverageThreshold: { global: { lines: 80 } },
};

export default config;
```

- [ ] Create `jest.config.integration.ts`:

```typescript
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.integration.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  testTimeout: 60000,
};

export default config;
```

- [ ] Verify unit config excludes integration tests:

```bash
cd backend
npx jest --config jest.config.unit.ts --listTests
```

Expected: no `*.integration.test.ts` files listed.

- [ ] Commit:

```bash
git add jest.config.unit.ts jest.config.integration.ts
git commit -m "chore: add jest unit and integration configs"
```

---

### Task 3: Create integration test setup

**Files:**
- Create: `backend/src/__tests__/setup/integration.setup.ts`

- [ ] Create directory:

```bash
mkdir -p backend/src/__tests__/setup backend/src/__tests__/factories
```

- [ ] Create `src/__tests__/setup/integration.setup.ts`:

```typescript
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource, DataSourceOptions } from 'typeorm';

export async function startPostgresContainer(): Promise<StartedPostgreSqlContainer> {
  return new PostgreSqlContainer('postgres:16-alpine').start();
}

export async function createTestDataSource(
  container: StartedPostgreSqlContainer,
): Promise<DataSource> {
  const options: DataSourceOptions = {
    type: 'postgres',
    host: container.getHost(),
    port: container.getMappedPort(5432),
    username: container.getUsername(),
    password: container.getPassword(),
    database: container.getDatabase(),
    entities: [__dirname + '/../../entities/**/*.entity.ts'],
    synchronize: true,
    logging: false,
  };
  const ds = new DataSource(options);
  await ds.initialize();
  return ds;
}
```

- [ ] Commit:

```bash
git add src/__tests__/
git commit -m "chore: add integration test setup with testcontainers"
```

---

### Task 4: Create IRepository interface and refactor BaseRepository

**Files:**
- Create: `backend/src/common/interfaces/repository.interface.ts`
- Modify: `backend/src/common/base.repository.ts`

- [ ] Create `src/common/interfaces/repository.interface.ts`:

```typescript
export interface IRepository<T> {
  findById(id: number, relations?: string[]): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T | null>;
  delete(id: number): Promise<boolean>;
  count(where?: Partial<T>): Promise<number>;
}
```

- [ ] Update `BaseRepository` class declaration to implement the interface:

In `src/common/base.repository.ts`, change:
```typescript
export abstract class BaseRepository<T extends ObjectLiteral> {
```
to:
```typescript
import { IRepository } from './interfaces/repository.interface';
// ...
export abstract class BaseRepository<T extends ObjectLiteral> implements IRepository<T> {
```

Also update `findById` signature to match the interface:
```typescript
async findById(id: number, relations?: string[]): Promise<T | null> {
  return this.repository.findOne({
    where: { id, isActive: true } as any,
    relations,
  });
}
```

- [ ] Verify type-check passes:

```bash
cd backend && npm run type-check
```

- [ ] Commit:

```bash
git add src/common/interfaces/ src/common/base.repository.ts
git commit -m "refactor: add IRepository interface and update BaseRepository"
```

---

### Task 5: Write CLAUDE.md and all rule files

**Files:**
- Create: `backend/CLAUDE.md`
- Create: `backend/.claude/rules/01-architecture.md`
- Create: `backend/.claude/rules/02-typescript.md`
- Create: `backend/.claude/rules/03-testing.md`
- Create: `backend/.claude/rules/04-modules.md`
- Create: `backend/.claude/rules/05-repositories.md`
- Create: `backend/.claude/rules/06-services.md`
- Create: `backend/.claude/rules/07-entities.md`
- Create: `backend/.claude/rules/08-controllers-routes.md`
- Create: `backend/.claude/rules/09-error-handling.md`
- Create: `backend/.claude/rules/10-pr-checklist.md`

- [ ] Create `backend/CLAUDE.md`:

```markdown
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
```
```

- [ ] Create `backend/.claude/rules/01-architecture.md`:

```markdown
# 01 — Architecture

Read this on every session before writing any code.

## Layer Map

```
src/
  entities/          TypeORM entity files (one per table)
  modules/<feature>/ Feature module (service, repo, controller, routes, DTOs, interfaces, tests)
  common/            Shared base classes and interfaces
  helpers/           Pure utility functions (no I/O side effects)
  middlewares/       Express middleware
  config/            Database and app config
  routes/            Top-level Express router (wires module routes)
  setup/             DI container, logger
  migrations/        TypeORM migration files
  __tests__/         Shared test utilities and factories
```

## Layer Rules (strict)

```
Controller  →  Service (via interface)  →  Repository (via interface)  →  TypeORM
```

- Controllers: thin HTTP adapters only. No business logic.
- Services: depend on IRepository interfaces, never concrete classes or AppDataSource.
- Repositories: extend BaseRepository, accept injected Repository<T>.
- AppDataSource: only imported in *.module.ts and integration test setup.
- No module imports another module's repository. Cross-module data goes through services.

## Folder Decision

When creating a file, ask:
1. Is it a TypeORM entity? → `src/entities/`
2. Is it part of a feature? → `src/modules/<feature>/`
3. Is it reused across features (pure function, no state)? → `src/helpers/`
4. Is it Express middleware? → `src/middlewares/`
5. Is it a shared base class or interface? → `src/common/`
```

- [ ] Create `backend/.claude/rules/02-typescript.md`:

```markdown
# 02 — TypeScript Rules

## Non-Negotiable Rules

### No `any`
```typescript
// ✅ RIGHT
const body = req.body as CreateDepartmentDto;

// ❌ WRONG
const body: any = req.body;
```

### No `enum` — use `as const`
```typescript
// ✅ RIGHT
export const PRODUCT_TYPE = { STANDARD: 'Standard', LOT_MATRIX: 'Lot Matrix' } as const;
export type ProductType = typeof PRODUCT_TYPE[keyof typeof PRODUCT_TYPE];

// ❌ WRONG
export enum ProductType { Standard = 'Standard', LotMatrix = 'Lot Matrix' }
```

### `type` preferred over `interface` for data shapes
```typescript
// ✅ RIGHT
export type CreateDepartmentDto = { departmentName: string; departmentCode?: string; };

// Interfaces are acceptable only for service/repository contracts
export interface IDepartmentRepository extends IRepository<Department> { ... }
```

### No `!` without a comment
```typescript
// ✅ RIGHT
// Safe: validated above that product exists
const product = maybeProduct!;

// ❌ WRONG
const product = maybeProduct!; // silent crash risk
```

### Strict null checks — always handle null
```typescript
const dept = await repo.findById(id);
if (!dept) throw new Error('Department not found'); // handle before use
```
```

- [ ] Create `backend/.claude/rules/03-testing.md`:

```markdown
# 03 — Testing Rules

## TDD is Non-Negotiable

```
RED    → Write the failing test. Run it. Confirm FAIL.
GREEN  → Write minimal code to pass. Run it. Confirm PASS.
REFACTOR → Clean up. Run tests. Still green.
```

Never write implementation before the test exists and fails.

## Two Test Types

| Type | File pattern | What it tests | Needs Docker |
|------|-------------|---------------|--------------|
| Unit | `*.test.ts` | Service business logic (fake repo) | No |
| Integration | `*.integration.test.ts` | Repository SQL queries (real Postgres) | Yes |

## Unit Test — Fake Repository Pattern

Never use `jest.mock()` for repositories. Write a simple in-memory fake:

```typescript
// src/modules/department/__tests__/fakes/fake-department.repository.ts
export class FakeDepartmentRepository implements IDepartmentRepository {
  public store: Department[] = [];
  private nextId = 1;

  async findById(id: number): Promise<Department | null> {
    return this.store.find(d => d.id === id && d.isActive) ?? null;
  }
  async create(data: Partial<Department>): Promise<Department> {
    const entity = { id: this.nextId++, isActive: true, createdAt: new Date(), ...data } as Department;
    this.store.push(entity);
    return entity;
  }
  async findAll(options: QueryDepartmentDto): Promise<PaginatedResult<Department>> {
    return { data: this.store.filter(d => d.isActive), total: this.store.length, page: 1, limit: 10, totalPages: 1 };
  }
  async update(id: number, data: Partial<Department>): Promise<Department | null> {
    const idx = this.store.findIndex(d => d.id === id);
    if (idx === -1) return null;
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }
  async delete(id: number): Promise<boolean> {
    const idx = this.store.findIndex(d => d.id === id);
    if (idx === -1) return false;
    this.store[idx].isActive = false;
    return true;
  }
  async count(): Promise<number> { return this.store.filter(d => d.isActive).length; }
  async findByCode(code: string): Promise<Department | null> {
    return this.store.find(d => d.departmentCode === code && d.isActive) ?? null;
  }
}
```

## Integration Test — Testcontainers Pattern

```typescript
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import { startPostgresContainer, createTestDataSource } from '@test/setup/integration.setup';

let container: StartedPostgreSqlContainer;
let dataSource: DataSource;

beforeAll(async () => {
  container = await startPostgresContainer();
  dataSource = await createTestDataSource(container);
});

afterAll(async () => {
  await dataSource.destroy();
  await container.stop();
});

beforeEach(async () => {
  await dataSource.query('TRUNCATE departments RESTART IDENTITY CASCADE');
});
```

## Test File Location

Every service has a unit test. Every repository has an integration test. Both live alongside the implementation:

```
src/modules/department/
  __tests__/
    department.service.test.ts
    department.repository.integration.test.ts
    fakes/
      fake-department.repository.ts
```
```

- [ ] Create `backend/.claude/rules/04-modules.md`:

```markdown
# 04 — Creating a Module

Follow these steps in order. Do not skip steps.

## Step-by-Step Checklist

1. **Create interfaces/** folder with `<feature>.repository.interface.ts` and `<feature>.service.interface.ts`
2. **Create `__tests__/fakes/fake-<feature>.repository.ts`** — implements the repository interface in memory
3. **Write `<feature>.service.test.ts`** — tests all service methods using the fake repo (RED first)
4. **Create `<feature>.service.ts`** — depends on the repository interface, not the concrete class (GREEN)
5. **Run unit tests** — confirm all pass
6. **Create `<feature>.repository.ts`** — extends BaseRepository, accepts injected `Repository<T>`
7. **Write `<feature>.repository.integration.test.ts`** — tests repository SQL using testcontainers
8. **Run integration tests** — confirm all pass
9. **Create `<feature>.controller.ts`** — extends BaseController, no business logic
10. **Create `<feature>.routes.ts`** — Express router
11. **Create `<feature>.module.ts`** — wires repo (inject DataSource) → service → controller
12. **Register route in `src/routes/index.ts`**
13. **Commit**

## Interface Example

```typescript
// interfaces/department.repository.interface.ts
import { IRepository } from '@common/interfaces/repository.interface';
import { Department } from '@entities/department.entity';
import { PaginatedResult } from '@common/types';
import { QueryDepartmentDto } from '../dtos';

export interface IDepartmentRepository extends IRepository<Department> {
  findAll(options: QueryDepartmentDto): Promise<PaginatedResult<Department>>;
  findByCode(code: string): Promise<Department | null>;
}
```

## Module Wiring Example

```typescript
// department.module.ts
import { AppDataSource } from '@config/database.config';
import { Department } from '@entities/department.entity';
import { DepartmentRepository } from './department.repository';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { createDepartmentRoutes } from './department.routes';

export class DepartmentModule {
  private repository: DepartmentRepository;
  private service: DepartmentService;
  private controller: DepartmentController;

  constructor() {
    this.repository = new DepartmentRepository(AppDataSource.getRepository(Department));
    this.service = new DepartmentService(this.repository);
    this.controller = new DepartmentController(this.service);
  }

  getRoutes() {
    return createDepartmentRoutes(this.controller);
  }
}
```
```

- [ ] Create `backend/.claude/rules/05-repositories.md`:

```markdown
# 05 — Repository Rules

## Constructor Pattern

Repositories accept an injected `Repository<T>` from TypeORM. They never import `AppDataSource` directly.

```typescript
// ✅ RIGHT
export class DepartmentRepository extends BaseRepository<Department> implements IDepartmentRepository {
  constructor(repo: Repository<Department>) {
    super(repo);
  }
}

// ❌ WRONG — hardcodes the data source, untestable
export class DepartmentRepository extends BaseRepository<Department> {
  constructor() {
    super(AppDataSource.getRepository(Department)); // ← never do this
  }
}
```

## isActive Convention

Every entity has `isActive: boolean` (default `true`). `BaseRepository.findById` filters by `isActive = true`. Deletion is soft (sets `isActive = false`), not a hard DELETE.

**Exception:** Pure join tables with no `id` PK (e.g., `ProductVariantAttribute`) are managed directly via TypeORM and do not use BaseRepository.

## Per-Module Interface

Every repository has a corresponding interface in `interfaces/`:

```typescript
export interface IDepartmentRepository extends IRepository<Department> {
  findAll(options: QueryDepartmentDto): Promise<PaginatedResult<Department>>;
  findByCode(code: string): Promise<Department | null>;
}
```

Services depend on the interface, never the concrete class.
```

- [ ] Create `backend/.claude/rules/06-services.md`:

```markdown
# 06 — Service Rules

## Depend on Interfaces, Not Concrete Classes

```typescript
// ✅ RIGHT
export class DepartmentService {
  constructor(private repo: IDepartmentRepository) {}
}

// ❌ WRONG — couples service to a specific class, breaks unit testing
export class DepartmentService {
  constructor(private repo: DepartmentRepository) {}
}
```

## Static Helpers Are Not Injected

`BcryptHelper`, `TokenHelper` — these are pure utilities with no I/O. Import them directly. Do not inject them. Unit tests use them as real implementations.

```typescript
import { BcryptHelper } from '@helpers/bcrypt.helper'; // ✅ direct import, not injected
```

## Validation Patterns

Use the entity helpers from `@helpers/entity.helper`:

```typescript
import { validateEntityExists, validateUniqueness, validateDeletion } from '@helpers/entity.helper';

// Check entity exists
const dept = await this.repo.findById(id);
validateEntityExists(dept, 'Department'); // throws "Department not found" if null

// Check uniqueness before create/update
const existing = await this.repo.findByCode(data.departmentCode);
validateUniqueness(existing, undefined, 'department code', data.departmentCode);
// second param is currentId (undefined on create, id on update)

// Check soft-delete succeeded
const deleted = await this.repo.delete(id);
validateDeletion(deleted, 'Department');
```

## No Business Logic in Controllers

If you find yourself writing `if` statements or calling multiple service methods in a controller, it belongs in the service layer.
```

- [ ] Create `backend/.claude/rules/07-entities.md`:

```markdown
# 07 — Entity Rules

## Required Columns on All Entities

Every entity (except pure join tables) must have:

```typescript
@Column({ name: 'is_active', type: 'boolean', default: true })
isActive!: boolean;

@CreateDateColumn({ name: 'created_at' })
createdAt!: Date;

@UpdateDateColumn({ name: 'updated_at', nullable: true })
updatedAt!: Date | null;
```

## Naming Convention

- TypeScript property: `camelCase`
- Database column: `snake_case` (use `{ name: 'column_name' }`)
- Entity class: `PascalCase`
- Table: `snake_case` (use `@Entity('table_name')`)

## Indexes

Add `@Index` for all FK columns and frequently-filtered columns:

```typescript
@Column({ name: 'department_id', type: 'int' })
@Index('idx_product_department')
departmentId!: number;
```

## No `synchronize: true` in Production

Dev uses `synchronize: true`. Production uses migrations. Never skip a migration when adding a NOT NULL column to a table with existing data — always:
1. Add column as nullable
2. Backfill
3. Set NOT NULL

## Join Tables (Exception)

Pure join tables (no `id` PK, no `isActive`) are TypeORM `@ManyToMany` join entities. They do not extend BaseRepository. Example: `ProductVariantAttribute`.
```

- [ ] Create `backend/.claude/rules/08-controllers-routes.md`:

```markdown
# 08 — Controllers & Routes

## Controller: Thin HTTP Adapters

Controllers extend `BaseController` and use its helper methods. No business logic.

```typescript
export class DepartmentController extends BaseController {
  constructor(private service: DepartmentService) { super(); }

  getAll = this.handleGetAll(
    (query) => this.service.getAllDepartments(query),
    'Departments retrieved successfully'
  );

  getById = this.handleGetById(
    (id) => this.service.getDepartmentById(id),
    'Department retrieved successfully'
  );

  create = this.handleCreate(
    (data) => this.service.createDepartment(data),
    'Department created successfully'
  );

  update = this.handleUpdate(
    (id, data) => this.service.updateDepartment(id, data),
    'Department updated successfully'
  );

  delete = this.handleDelete(
    (id) => this.service.deleteDepartment(id),
    'Department deleted successfully'
  );
}
```

## Route File

```typescript
export function createDepartmentRoutes(controller: DepartmentController): Router {
  const router = Router();
  router.get('/', authMiddleware, controller.getAll);
  router.get('/:id', authMiddleware, controller.getById);
  router.post('/', authMiddleware, controller.create);
  router.put('/:id', authMiddleware, controller.update);
  router.delete('/:id', authMiddleware, controller.delete);
  return router;
}
```

## Route Naming

- `GET /resource` — list
- `GET /resource/:id` — get one
- `POST /resource` — create
- `PUT /resource/:id` — update
- `DELETE /resource/:id` — delete (soft)
- `GET /resource/:id/sub-resource` — nested resource list
- `POST /resource/:id/sub-resource/action` — specific action
```

- [ ] Create `backend/.claude/rules/09-error-handling.md`:

```markdown
# 09 — Error Handling

## HTTP Status Mapping (handled by BaseController.asyncHandler)

| Message contains          | HTTP Status |
|---------------------------|-------------|
| "not found"               | 404         |
| "already exists"          | 400         |
| "Invalid" / "Validation"  | 400         |
| "Unauthorized"            | 401         |
| "Forbidden"               | 403         |
| (default)                 | 500         |

## Throw Pattern in Services

```typescript
// ✅ RIGHT — clear, consistent messages
throw new Error('Department not found');
throw new Error(`Department code '${code}' already exists`);
throw new Error('Invalid GST configuration: SGST and CGST must both be enabled together');

// ❌ WRONG — vague
throw new Error('Error');
throw new Error('Something went wrong');
```

## Use Entity Helpers

```typescript
import { validateEntityExists, validateUniqueness, validateDeletion } from '@helpers/entity.helper';

validateEntityExists(entity, 'Department');         // throws "Department not found"
validateUniqueness(existing, currentId, 'name', v); // throws "Name 'X' already exists"
validateDeletion(deleted, 'Department');            // throws "Failed to delete Department"
```

Never throw raw HTTP-specific errors from services. Services throw Error with meaningful messages; BaseController maps them to HTTP codes.
```

- [ ] Create `backend/.claude/rules/10-pr-checklist.md`:

```markdown
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
```

- [ ] Commit everything:

```bash
cd backend
mkdir -p .claude/rules
git add CLAUDE.md .claude/rules/
git commit -m "docs: add backend CLAUDE.md and all rule files"
```

---

### Task 6: Configure lefthook pre-commit hooks

**Files:**
- Create: `backend/lefthook.yml`

- [ ] Create `backend/lefthook.yml`:

```yaml
pre-commit:
  parallel: false
  commands:
    type-check:
      run: npm run type-check
    lint:
      run: npm run lint
    test-unit:
      run: npm run test:unit
    build:
      run: npm run build
```

- [ ] Install lefthook hooks:

```bash
cd backend
npx lefthook install
```

- [ ] Verify hooks are installed:

```bash
ls .git/hooks/pre-commit
```

Expected: file exists.

- [ ] Commit:

```bash
git add lefthook.yml
git commit -m "chore: configure lefthook pre-commit hooks"
```

---

## Phase 1 — Refactor Existing Modules

> **Pattern established by Task 7 (role module). Tasks 8-13 follow the same pattern with module-specific differences called out.**

---

### Task 7: Refactor `role` module — establishes the full TDD pattern

**Files:**
- Create: `src/modules/role/interfaces/role.repository.interface.ts`
- Create: `src/modules/role/__tests__/fakes/fake-role.repository.ts`
- Create: `src/modules/role/__tests__/role.service.test.ts`
- Modify: `src/modules/role/role.repository.ts` (constructor change)
- Modify: `src/modules/role/role.service.ts` (depend on interface)
- Create: `src/modules/role/__tests__/role.repository.integration.test.ts`
- Modify: `src/modules/role/role.module.ts` (inject DataSource)

- [ ] Create `src/modules/role/interfaces/role.repository.interface.ts`:

```typescript
import { IRepository } from '@common/interfaces/repository.interface';
import { UserRole } from '@entities/user-role.entity';

export interface IRoleRepository extends IRepository<UserRole> {
  findAll(): Promise<UserRole[]>;
  findByName(name: string): Promise<UserRole | null>;
}
```

- [ ] Create `src/modules/role/__tests__/fakes/fake-role.repository.ts`:

```typescript
import { UserRole } from '@entities/user-role.entity';
import { IRoleRepository } from '../../interfaces/role.repository.interface';

export class FakeRoleRepository implements IRoleRepository {
  public store: UserRole[] = [];
  private nextId = 1;

  async findAll(): Promise<UserRole[]> {
    return this.store.filter(r => r.isActive);
  }

  async findById(id: number): Promise<UserRole | null> {
    return this.store.find(r => r.id === id && r.isActive) ?? null;
  }

  async findByName(name: string): Promise<UserRole | null> {
    return this.store.find(r => r.roleName === name && r.isActive) ?? null;
  }

  async create(data: Partial<UserRole>): Promise<UserRole> {
    const role = { id: this.nextId++, isActive: true, createdAt: new Date(), updatedAt: null, ...data } as UserRole;
    this.store.push(role);
    return role;
  }

  async update(id: number, data: Partial<UserRole>): Promise<UserRole | null> {
    const idx = this.store.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }

  async delete(id: number): Promise<boolean> {
    const idx = this.store.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.store[idx].isActive = false;
    return true;
  }

  async count(): Promise<number> {
    return this.store.filter(r => r.isActive).length;
  }
}
```

- [ ] Write failing unit tests — `src/modules/role/__tests__/role.service.test.ts`:

```typescript
import { RoleService } from '../role.service';
import { FakeRoleRepository } from './fakes/fake-role.repository';

describe('RoleService', () => {
  let service: RoleService;
  let repo: FakeRoleRepository;

  beforeEach(() => {
    repo = new FakeRoleRepository();
    service = new RoleService(repo);
  });

  describe('getAllRoles', () => {
    it('returns all active roles', async () => {
      await repo.create({ roleName: 'Admin' });
      await repo.create({ roleName: 'Cashier' });
      const result = await service.getAllRoles();
      expect(result).toHaveLength(2);
    });

    it('excludes soft-deleted roles', async () => {
      const role = await repo.create({ roleName: 'Admin' });
      await repo.delete(role.id);
      const result = await service.getAllRoles();
      expect(result).toHaveLength(0);
    });
  });

  describe('getRoleById', () => {
    it('returns role when found', async () => {
      const created = await repo.create({ roleName: 'Admin' });
      const found = await service.getRoleById(created.id);
      expect(found.roleName).toBe('Admin');
    });

    it('throws when role not found', async () => {
      await expect(service.getRoleById(999)).rejects.toThrow('Role not found');
    });
  });
});
```

- [ ] Run tests — confirm they fail:

```bash
cd backend && npm run test:unit -- --testPathPattern=role.service
```

Expected: FAIL (RoleService constructor type mismatch or method not found).

- [ ] Update `src/modules/role/role.service.ts` to depend on interface:

```typescript
import { IRoleRepository } from './interfaces/role.repository.interface';
import { UserRole } from '@entities';
import { validateEntityExists } from '@helpers/entity.helper';

export class RoleService {
  constructor(private repo: IRoleRepository) {}

  async getAllRoles(): Promise<UserRole[]> {
    return this.repo.findAll();
  }

  async getRoleById(id: number): Promise<UserRole> {
    const role = await this.repo.findById(id);
    validateEntityExists(role, 'Role');
    return role;
  }
}
```

- [ ] Run tests — confirm they pass:

```bash
cd backend && npm run test:unit -- --testPathPattern=role.service
```

Expected: PASS.

- [ ] Update `src/modules/role/role.repository.ts` to accept injected repo:

```typescript
import { Repository } from 'typeorm';
import { UserRole } from '@entities/user-role.entity';
import { BaseRepository } from '@common/base.repository';
import { IRoleRepository } from './interfaces/role.repository.interface';

export class RoleRepository extends BaseRepository<UserRole> implements IRoleRepository {
  constructor(repo: Repository<UserRole>) {
    super(repo);
  }

  protected getEntityName(): string { return 'userRole'; }
  protected getAllowedSortFields(): string[] { return ['id', 'roleName', 'createdAt']; }
  protected applySearchFilter(qb: any, search: string): void {
    qb.andWhere('userRole.roleName LIKE :search', { search: `%${search}%` });
  }

  async findAll(): Promise<UserRole[]> {
    return this.repository.find({ where: { isActive: true } });
  }

  async findByName(name: string): Promise<UserRole | null> {
    return this.repository.findOne({ where: { roleName: name, isActive: true } });
  }
}
```

- [ ] Write integration test — `src/modules/role/__tests__/role.repository.integration.test.ts`:

```typescript
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import { startPostgresContainer, createTestDataSource } from '../../../__tests__/setup/integration.setup';
import { RoleRepository } from '../role.repository';
import { UserRole } from '@entities/user-role.entity';

let container: StartedPostgreSqlContainer;
let dataSource: DataSource;

beforeAll(async () => {
  container = await startPostgresContainer();
  dataSource = await createTestDataSource(container);
});

afterAll(async () => {
  await dataSource.destroy();
  await container.stop();
});

beforeEach(async () => {
  await dataSource.query('TRUNCATE user_roles RESTART IDENTITY CASCADE');
});

describe('RoleRepository', () => {
  it('creates and retrieves a role', async () => {
    const repo = new RoleRepository(dataSource.getRepository(UserRole));
    const created = await repo.create({ roleName: 'Admin', isActive: true });
    const found = await repo.findById(created.id);
    expect(found?.roleName).toBe('Admin');
  });

  it('soft deletes a role', async () => {
    const repo = new RoleRepository(dataSource.getRepository(UserRole));
    const created = await repo.create({ roleName: 'Cashier', isActive: true });
    await repo.delete(created.id);
    const found = await repo.findById(created.id);
    expect(found).toBeNull();
  });

  it('finds role by name', async () => {
    const repo = new RoleRepository(dataSource.getRepository(UserRole));
    await repo.create({ roleName: 'Manager', isActive: true });
    const found = await repo.findByName('Manager');
    expect(found?.roleName).toBe('Manager');
  });
});
```

- [ ] Run integration test:

```bash
cd backend && npm run test:integration -- --testPathPattern=role.repository
```

Expected: PASS (Docker must be running).

- [ ] Update `src/modules/role/role.module.ts` to inject DataSource:

```typescript
import { AppDataSource } from '@config/database.config';
import { UserRole } from '@entities/user-role.entity';
import { RoleRepository } from './role.repository';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { createRoleRoutes } from './role.routes';

export class RoleModule {
  private repository: RoleRepository;
  private service: RoleService;
  private controller: RoleController;

  constructor() {
    this.repository = new RoleRepository(AppDataSource.getRepository(UserRole));
    this.service = new RoleService(this.repository);
    this.controller = new RoleController(this.service);
  }

  getRoutes() { return createRoleRoutes(this.controller); }
}
```

- [ ] Run type-check and unit tests:

```bash
cd backend && npm run type-check && npm run test:unit
```

Expected: both clean.

- [ ] Commit:

```bash
git add src/modules/role/
git commit -m "refactor(role): interface-driven architecture with unit and integration tests"
```

---

### Task 8: Refactor `department` module

**Same pattern as Task 7. Key differences:**
- Repository has `findAll(options: QueryDepartmentDto)` and `findByCode(code: string)` methods
- Service has `createDepartment`, `updateDepartment`, `deleteDepartment` with `validateUniqueness` calls
- Constructor change: `constructor() { super(AppDataSource.getRepository(Department)); }` → `constructor(repo: Repository<Department>) { super(repo); }`
- Module: `new DepartmentRepository(AppDataSource.getRepository(Department))`

**Files to create/modify:**
- Create: `src/modules/department/interfaces/department.repository.interface.ts`
- Create: `src/modules/department/__tests__/fakes/fake-department.repository.ts`
- Create: `src/modules/department/__tests__/department.service.test.ts`
- Modify: `src/modules/department/department.repository.ts`
- Modify: `src/modules/department/department.service.ts`
- Create: `src/modules/department/__tests__/department.repository.integration.test.ts`
- Modify: `src/modules/department/department.module.ts`

- [ ] Create interfaces and fake (follow role module pattern, with `findAll` + `findByCode`)
- [ ] Write service tests covering: `getAllDepartments`, `getDepartmentById` (not found), `createDepartment` (success + duplicate name), `updateDepartment`, `deleteDepartment`
- [ ] Confirm tests fail → implement service → confirm pass
- [ ] Refactor repository constructor to accept `Repository<Department>`
- [ ] Write integration tests: create, findById, findByCode, soft delete
- [ ] Update module wiring
- [ ] Run `npm run type-check && npm run test:unit`
- [ ] Commit: `refactor(dept): interface-driven architecture with tests`

---

### Task 9: Refactor `category` module

**Same pattern as Task 7. Key differences:**
- `ProductCategory` entity will need a `departmentId` FK column added in Phase 2 — for now, add the TypeORM `@ManyToOne` relation to `Department` on the entity but make `departmentId` optional (`nullable: true`) to avoid breaking existing data
- Service has `createCategory`, `updateCategory`, `deleteCategory` with uniqueness validation
- Repository: `findAll(options)`, `findByDepartmentId(departmentId)`, `findByName(name)`

- [ ] Follow same pattern as Task 7/8
- [ ] Add to `ProductCategory` entity (but leave nullable until migration in Phase 2c):
```typescript
@Column({ name: 'department_id', type: 'int', nullable: true })
departmentId!: number | null;

@ManyToOne(() => Department, { onDelete: 'RESTRICT', nullable: true })
@JoinColumn({ name: 'department_id' })
department!: Department | null;
```
- [ ] Commit: `refactor(category): interface-driven architecture with tests`

---

### Task 10: Refactor `sub-category` module

**Same pattern as Task 7. No schema changes needed.**

- [ ] Follow same pattern as Task 7/8
- [ ] Repository: `findAll(options)`, `findByCategoryId(categoryId)`, `findByNameAndCategory(name, categoryId)`
- [ ] Service tests cover: list, get by id, create (unique per category), update, delete
- [ ] Commit: `refactor(sub-category): interface-driven architecture with tests`

---

### Task 11: Refactor `user` module

**Same pattern as Task 7. Key difference:** `User` entity has `passwordHash` — always strip it from service return values using `removePasswordHash` from `@helpers/entity.helper`.

- [ ] Follow same pattern as Task 7/8
- [ ] Repository: `findAll(options)`, `findByEmail(email)`, `findByUsername(username)`
- [ ] Service: strip `passwordHash` from all return values
- [ ] Service tests: create user (duplicate email), get by id, update, delete
- [ ] Commit: `refactor(user): interface-driven architecture with tests`

---

### Task 12: Refactor `auth` module

**Same pattern — key differences for auth:**
- `AuthService` depends on `IUserRepository` (not `UserRepository`)
- `BcryptHelper` and `TokenHelper` are imported directly (not injected)
- No repository of its own — `AuthModule` injects `UserRepository` into `AuthService`

- [ ] Create `src/modules/auth/interfaces/auth.service.interface.ts`:

```typescript
export interface IAuthService {
  register(dto: RegisterDto): Promise<AuthResponse>;
  login(dto: LoginDto): Promise<AuthResponse>;
  refreshToken(dto: RefreshTokenDto): Promise<{ token: string }>;
}
```

- [ ] Update `auth.service.ts` to depend on `IUserRepository`:

```typescript
import { IUserRepository } from '@modules/user/interfaces/user.repository.interface';

export class AuthService {
  constructor(private userRepository: IUserRepository) {}
  // BcryptHelper and TokenHelper imported directly — not injected
```

- [ ] Write service tests using `FakeUserRepository` (reuse from Task 11):

```typescript
// auth.service.test.ts
it('throws when registering duplicate email', async () => {
  const repo = new FakeUserRepository();
  const service = new AuthService(repo);
  await service.register({ email: 'a@b.com', password: 'pass123', username: 'abc' });
  await expect(
    service.register({ email: 'a@b.com', password: 'pass456', username: 'xyz' })
  ).rejects.toThrow('User with this email already exists');
});
```

- [ ] Update `auth.module.ts` to inject user repository:

```typescript
constructor() {
  this.userRepository = new UserRepository(AppDataSource.getRepository(User));
  this.service = new AuthService(this.userRepository);
  // ...
}
```

- [ ] Commit: `refactor(auth): depend on IUserRepository interface`

---

### Task 13: Refactor `product` module + delete gst.helper.ts

**This is the most invasive Phase 1 task. GST fields removed from entity, DTO, service. gst.helper.ts deleted.**

**Files:**
- Modify: `src/entities/product.entity.ts` (remove 6 GST columns, make `productType` NOT NULL, add `groupId` as optional)
- Modify: `src/modules/product/dtos/create-product.dto.ts` (remove GST fields, add `groupId` optional)
- Modify: `src/modules/product/dtos/update-product.dto.ts` (remove GST fields)
- Delete: `src/helpers/gst.helper.ts`
- Modify: `src/modules/product/product.service.ts` (remove GST validation, depend on interfaces)
- Modify: `src/modules/product/product.repository.ts` (constructor injection)
- Create: interfaces, fake, tests following established pattern

- [ ] Delete `src/helpers/gst.helper.ts`:

```bash
rm backend/src/helpers/gst.helper.ts
```

- [ ] Remove `gst.helper.ts` import from `product.service.ts` and any other file:

```bash
cd backend && grep -r "gst.helper" src/ --include="*.ts"
```

Remove all found imports.

- [ ] Remove GST columns from `src/entities/product.entity.ts`:

Delete the 6 `@Column` decorators and properties: `gst1Sgst`, `gst1Slab`, `gst2Cgst`, `gst2Slab`, `gst3Igst`, `gst3Slab`.

Change `productType` from `nullable: true` to required:
```typescript
@Column({ name: 'product_type', type: 'varchar', length: 20 })
productType!: string; // 'Standard' | 'Lot Matrix'
```

Add `groupId` as optional (will become required after Phase 2c migration):
```typescript
@Column({ name: 'group_id', type: 'int', nullable: true })
groupId!: number | null;
```

- [ ] Update `create-product.dto.ts` — remove all GST fields, add `groupId`:

```typescript
@IsOptional()
@IsInt()
groupId?: number;
```

- [ ] Follow same TDD pattern for product service:
  - Create `interfaces/product.repository.interface.ts`
  - Create `__tests__/fakes/fake-product.repository.ts`
  - Write `__tests__/product.service.test.ts` (create, list, getById, delete)
  - Update service to depend on `IProductRepository`
  - Update repository constructor to accept `Repository<Product>`
  - Write integration tests
  - Update module wiring

- [ ] Run type-check — must be clean:

```bash
cd backend && npm run type-check
```

- [ ] Run all unit tests:

```bash
cd backend && npm run test:unit
```

- [ ] Commit:

```bash
git add src/
git commit -m "refactor(product): remove GST fields, delete gst.helper.ts, interface-driven architecture"
```

---

## Phase 2 — New Entities + Migrations

### Task 14: Create new TypeORM entities (Phase 2a)

**Files (all in `src/entities/`):**
- Create: `product-group.entity.ts`
- Create: `group-field.entity.ts`
- Create: `group-field-option.entity.ts`
- Create: `product-group-field-value.entity.ts`
- Create: `product-attribute.entity.ts`
- Create: `product-attribute-value.entity.ts`
- Create: `product-variant.entity.ts`
- Create: `product-variant-attribute.entity.ts` (join table — no BaseRepository)
- Create: `product-variant-media.entity.ts`
- Modify: `src/entities/index.ts` (export all new entities)

- [ ] Create `src/entities/product-group.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { GroupField } from './group-field.entity';
import { Product } from './product.entity';

@Entity('product_groups')
export class ProductGroup {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'group_name', type: 'varchar', length: 100, unique: true })
  groupName!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;

  @OneToMany(() => GroupField, (field) => field.group)
  fields!: GroupField[];

  @OneToMany(() => Product, (product) => product.group)
  products!: Product[];
}
```

- [ ] Create `src/entities/group-field.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProductGroup } from './product-group.entity';
import { GroupFieldOption } from './group-field-option.entity';
import { ProductGroupFieldValue } from './product-group-field-value.entity';

export const FIELD_TYPE = {
  TEXT: 'text', NUMBER: 'number', TEXTAREA: 'textarea',
  BOOLEAN: 'boolean', DROPDOWN: 'dropdown',
} as const;

@Entity('group_fields')
@Index('uq_group_field_key', ['groupId', 'fieldKey'], { unique: true })
export class GroupField {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'group_id', type: 'int' })
  @Index()
  groupId!: number;

  @Column({ name: 'field_name', type: 'varchar', length: 100 })
  fieldName!: string;

  @Column({ name: 'field_key', type: 'varchar', length: 100 })
  fieldKey!: string;

  @Column({ name: 'field_type', type: 'varchar', length: 30 })
  fieldType!: string;

  @Column({ name: 'is_required', type: 'boolean', default: false })
  isRequired!: boolean;

  @Column({ name: 'is_filterable', type: 'boolean', default: false })
  isFilterable!: boolean;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;

  @ManyToOne(() => ProductGroup, (group) => group.fields, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'group_id' })
  group!: ProductGroup;

  @OneToMany(() => GroupFieldOption, (opt) => opt.field)
  options!: GroupFieldOption[];

  @OneToMany(() => ProductGroupFieldValue, (v) => v.field)
  values!: ProductGroupFieldValue[];
}
```

- [ ] Create `src/entities/group-field-option.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { GroupField } from './group-field.entity';

@Entity('group_field_options')
@Index('uq_field_option_value', ['fieldId', 'optionValue'], { unique: true })
export class GroupFieldOption {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'field_id', type: 'int' })
  @Index()
  fieldId!: number;

  @Column({ name: 'option_label', type: 'varchar', length: 100 })
  optionLabel!: string;

  @Column({ name: 'option_value', type: 'varchar', length: 100 })
  optionValue!: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @ManyToOne(() => GroupField, (field) => field.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'field_id' })
  field!: GroupField;
}
```

- [ ] Create `src/entities/product-group-field-value.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './product.entity';
import { GroupField } from './group-field.entity';
import { GroupFieldOption } from './group-field-option.entity';

@Entity('product_group_field_values')
@Index('uq_product_field_value', ['productId', 'fieldId'], { unique: true })
export class ProductGroupFieldValue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id', type: 'int' })
  @Index()
  productId!: number;

  @Column({ name: 'field_id', type: 'int' })
  @Index()
  fieldId!: number;

  @Column({ name: 'value_text', type: 'text', nullable: true })
  valueText!: string | null;

  @Column({ name: 'value_number', type: 'decimal', precision: 12, scale: 2, nullable: true })
  valueNumber!: number | null;

  @Column({ name: 'value_boolean', type: 'boolean', nullable: true })
  valueBoolean!: boolean | null;

  @Column({ name: 'value_option_id', type: 'int', nullable: true })
  valueOptionId!: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => GroupField, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'field_id' })
  field!: GroupField;

  @ManyToOne(() => GroupFieldOption, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'value_option_id' })
  valueOption!: GroupFieldOption | null;
}
```

- [ ] Create `src/entities/product-attribute.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Index, CreateDateColumn } from 'typeorm';
import { Product } from './product.entity';
import { ProductAttributeValue } from './product-attribute-value.entity';

@Entity('product_attributes')
@Index('uq_product_attribute_code', ['productId', 'attributeCode'], { unique: true })
export class ProductAttribute {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id', type: 'int' })
  @Index()
  productId!: number;

  @Column({ name: 'attribute_name', type: 'varchar', length: 50 })
  attributeName!: string;

  @Column({ name: 'attribute_code', type: 'varchar', length: 30 })
  attributeCode!: string;

  @Column({ name: 'display_order', type: 'int', nullable: true })
  displayOrder!: number | null;

  @Column({ name: 'is_required', type: 'boolean', default: true })
  isRequired!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Product, (product) => product.attributes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @OneToMany(() => ProductAttributeValue, (v) => v.attribute)
  values!: ProductAttributeValue[];
}
```

- [ ] Create `src/entities/product-attribute-value.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn } from 'typeorm';
import { ProductAttribute } from './product-attribute.entity';

@Entity('product_attribute_values')
@Index('uq_attribute_value_code', ['attributeId', 'valueCode'], { unique: true })
export class ProductAttributeValue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'attribute_id', type: 'int' })
  @Index()
  attributeId!: number;

  @Column({ name: 'value_label', type: 'varchar', length: 50 })
  valueLabel!: string;

  @Column({ name: 'value_code', type: 'varchar', length: 30 })
  valueCode!: string;

  @Column({ name: 'display_order', type: 'int', nullable: true })
  displayOrder!: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => ProductAttribute, (attr) => attr.values, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute!: ProductAttribute;
}
```

- [ ] Create `src/entities/product-variant.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './product.entity';
import { ProductVariantAttribute } from './product-variant-attribute.entity';
import { ProductVariantMedia } from './product-variant-media.entity';

@Entity('product_variants')
@Index('uq_product_combination_hash', ['productId', 'combinationHash'], { unique: true })
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id', type: 'int' })
  @Index()
  productId!: number;

  @Column({ type: 'varchar', length: 30, unique: true })
  sku!: string;

  @Column({ type: 'varchar', length: 30, unique: true, nullable: true })
  upc!: string | null;

  @Column({ name: 'combination_hash', type: 'varchar', length: 150 })
  combinationHash!: string;

  @Column({ name: 'cost_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  costPrice!: number | null;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  unitPrice!: number | null;

  @Column({ name: 'sale_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  salePrice!: number | null;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  stockQuantity!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @OneToMany(() => ProductVariantAttribute, (va) => va.variant, { cascade: true })
  variantAttributes!: ProductVariantAttribute[];

  @OneToMany(() => ProductVariantMedia, (m) => m.variant)
  media!: ProductVariantMedia[];
}
```

- [ ] Create `src/entities/product-variant-attribute.entity.ts` (join table — no `isActive`, no BaseRepository):

```typescript
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { ProductAttribute } from './product-attribute.entity';
import { ProductAttributeValue } from './product-attribute-value.entity';

@Entity('product_variant_attributes')
@Index('uq_variant_attribute', ['variantId', 'attributeId'], { unique: true })
export class ProductVariantAttribute {
  @Column({ name: 'variant_id', type: 'int', primary: true })
  variantId!: number;

  @Column({ name: 'attribute_id', type: 'int', primary: true })
  attributeId!: number;

  @Column({ name: 'attribute_value_id', type: 'int' })
  attributeValueId!: number;

  @ManyToOne(() => ProductVariant, (v) => v.variantAttributes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant!: ProductVariant;

  @ManyToOne(() => ProductAttribute, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'attribute_id' })
  attribute!: ProductAttribute;

  @ManyToOne(() => ProductAttributeValue, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'attribute_value_id' })
  attributeValue!: ProductAttributeValue;
}
```

- [ ] Create `src/entities/product-variant-media.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ProductVariant } from './product-variant.entity';

@Entity('product_variant_media')
export class ProductVariantMedia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'variant_id', type: 'int' })
  @Index()
  variantId!: number;

  @Column({ name: 'media_url', type: 'varchar', length: 500 })
  mediaUrl!: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary!: boolean;

  @Column({ name: 'display_order', type: 'int', nullable: true })
  displayOrder!: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @ManyToOne(() => ProductVariant, (v) => v.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant!: ProductVariant;
}
```

- [ ] Add `group`, `attributes`, and `variants` relations to `Product` entity:

```typescript
// In product.entity.ts, add:
@ManyToOne(() => ProductGroup, { onDelete: 'RESTRICT', nullable: true })
@JoinColumn({ name: 'group_id' })
group!: ProductGroup | null;

@OneToMany(() => ProductAttribute, (attr) => attr.product)
attributes!: ProductAttribute[];

@OneToMany(() => ProductVariant, (variant) => variant.product)
variants!: ProductVariant[];
```

- [ ] Update `src/entities/index.ts` to export all new entities

- [ ] Run type-check:

```bash
cd backend && npm run type-check
```

- [ ] Commit:

```bash
git add src/entities/
git commit -m "feat: add product groups and lot matrix TypeORM entities"
```

---

### Task 15: Write and run migration — create new tables (Phase 2b)

**Files:**
- Create: `src/migrations/<timestamp>-CreateProductGroupsAndLotMatrixTables.ts`

- [ ] Generate migration using TypeORM CLI:

```bash
cd backend
npm run migrate:generate -- src/migrations/CreateProductGroupsAndLotMatrixTables
```

- [ ] Review the generated migration — confirm it creates all expected tables:
  - `product_groups`, `group_fields`, `group_field_options`, `product_group_field_values`
  - `product_attributes`, `product_attribute_values`
  - `product_variants`, `product_variant_attributes`, `product_variant_media`

- [ ] Also add `is_active DEFAULT true` to existing satellite tables in the migration:

Add to the `up()` method:
```typescript
await queryRunner.query(`ALTER TABLE product_media ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true`);
await queryRunner.query(`ALTER TABLE product_marketing_media ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true`);
await queryRunner.query(`ALTER TABLE product_physical_attributes ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true`);
```

And to `down()`:
```typescript
await queryRunner.query(`ALTER TABLE product_physical_attributes DROP COLUMN IF EXISTS is_active`);
await queryRunner.query(`ALTER TABLE product_marketing_media DROP COLUMN IF EXISTS is_active`);
await queryRunner.query(`ALTER TABLE product_media DROP COLUMN IF EXISTS is_active`);
```

- [ ] Run migration:

```bash
cd backend && npm run migrate
```

Expected: all new tables created, no errors.

- [ ] Commit:

```bash
git add src/migrations/
git commit -m "feat: migration to create product groups and lot matrix tables"
```

---

### Task 16: Write and run migration — FK columns with backfill (Phase 2c)

**Files:**
- Create: `src/migrations/<timestamp>-AddGroupIdAndDepartmentIdFKs.ts`

- [ ] Create migration manually (not generated — it's a data migration):

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupIdAndDepartmentIdFKs implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Seed default ProductGroup if none exists
    await queryRunner.query(`
      INSERT INTO product_groups (group_name, is_active, created_at)
      VALUES ('General', true, NOW())
      ON CONFLICT (group_name) DO NOTHING
    `);

    // 2. Seed default Department if none exists
    await queryRunner.query(`
      INSERT INTO departments (department_name, is_active, created_at)
      VALUES ('General', true, NOW())
      ON CONFLICT (department_name) DO NOTHING
    `);

    // 3. Add group_id to products (nullable first)
    await queryRunner.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS group_id int REFERENCES product_groups(id)
    `);

    // 4. Backfill products.group_id
    await queryRunner.query(`
      UPDATE products
      SET group_id = (SELECT id FROM product_groups WHERE group_name = 'General' LIMIT 1)
      WHERE group_id IS NULL
    `);

    // 5. Set NOT NULL on products.group_id
    await queryRunner.query(`
      ALTER TABLE products ALTER COLUMN group_id SET NOT NULL
    `);

    // 6. Add department_id to product_categories (nullable first)
    await queryRunner.query(`
      ALTER TABLE product_categories
      ADD COLUMN IF NOT EXISTS department_id int REFERENCES departments(id)
    `);

    // 7. Backfill product_categories.department_id
    await queryRunner.query(`
      UPDATE product_categories
      SET department_id = (SELECT id FROM departments LIMIT 1)
      WHERE department_id IS NULL
    `);

    // 8. Set NOT NULL on product_categories.department_id
    await queryRunner.query(`
      ALTER TABLE product_categories ALTER COLUMN department_id SET NOT NULL
    `);

    // 9. Remove GST columns from products
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS gst_1_sgst`);
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS gst_1_slab`);
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS gst_2_cgst`);
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS gst_2_slab`);
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS gst_3_igst`);
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS gst_3_slab`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse: restore GST columns, drop FK columns
    await queryRunner.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_3_slab varchar(10)`);
    await queryRunner.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_3_igst boolean DEFAULT false`);
    await queryRunner.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_2_slab varchar(10)`);
    await queryRunner.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_2_cgst boolean DEFAULT false`);
    await queryRunner.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_1_slab varchar(10)`);
    await queryRunner.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_1_sgst boolean DEFAULT false`);
    await queryRunner.query(`ALTER TABLE product_categories DROP COLUMN IF EXISTS department_id`);
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS group_id`);
  }
}
```

- [ ] Run migration:

```bash
cd backend && npm run migrate
```

Expected: no errors. Verify via psql or DB tool that `products.group_id` is NOT NULL.

- [ ] Commit:

```bash
git add src/migrations/
git commit -m "feat: migration to add group_id and department_id FKs with backfill"
```

---

### Task 17: Update entities post-migration (Phase 2d)

**Files:**
- Modify: `src/entities/product.entity.ts` (make `groupId` NOT NULL)
- Modify: `src/entities/product-category.entity.ts` (make `departmentId` NOT NULL)

- [ ] In `product.entity.ts`, update `groupId` column:

```typescript
// Change from nullable: true to required
@Column({ name: 'group_id', type: 'int' })
groupId!: number;
```

- [ ] In `product-category.entity.ts`, update `departmentId`:

```typescript
@Column({ name: 'department_id', type: 'int' })
departmentId!: number;

@ManyToOne(() => Department, { onDelete: 'RESTRICT' })
@JoinColumn({ name: 'department_id' })
department!: Department;
```

- [ ] Update `CreateProductDto` to require `groupId`:

```typescript
@IsInt()
@IsNotEmpty()
groupId!: number;
```

- [ ] Run type-check:

```bash
cd backend && npm run type-check
```

- [ ] Commit:

```bash
git add src/entities/ src/modules/product/
git commit -m "feat: make group_id and department_id required after migration"
```

---

## Phase 3 — New Modules (TDD Throughout)

### Task 18: `product-group` module

**Files:**
- Create: `src/modules/product-group/interfaces/product-group.repository.interface.ts`
- Create: `src/modules/product-group/__tests__/fakes/fake-product-group.repository.ts`
- Create: `src/modules/product-group/__tests__/product-group.service.test.ts`
- Create: `src/modules/product-group/product-group.repository.ts`
- Create: `src/modules/product-group/__tests__/product-group.repository.integration.test.ts`
- Create: `src/modules/product-group/product-group.service.ts`
- Create: `src/modules/product-group/product-group.controller.ts`
- Create: `src/modules/product-group/product-group.routes.ts`
- Create: `src/modules/product-group/product-group.module.ts`
- Create: `src/modules/product-group/dtos/` (create, update, query DTOs)
- Modify: `src/routes/index.ts`

- [ ] Create `interfaces/product-group.repository.interface.ts`:

```typescript
import { IRepository } from '@common/interfaces/repository.interface';
import { ProductGroup } from '@entities/product-group.entity';
import { PaginatedResult } from '@common/types';

export interface IProductGroupRepository extends IRepository<ProductGroup> {
  findAll(options: { search?: string; page?: number; limit?: number }): Promise<PaginatedResult<ProductGroup>>;
  findByName(name: string): Promise<ProductGroup | null>;
  findWithFields(id: number): Promise<ProductGroup | null>;
  countProductsByGroup(groupId: number): Promise<number>;
}
```

- [ ] Create `__tests__/fakes/fake-product-group.repository.ts`:

```typescript
export class FakeProductGroupRepository implements IProductGroupRepository {
  public store: ProductGroup[] = [];
  public hasProducts = false;
  private nextId = 1;

  async findById(id: number): Promise<ProductGroup | null> {
    return this.store.find(g => g.id === id && g.isActive) ?? null;
  }
  async create(data: Partial<ProductGroup>): Promise<ProductGroup> {
    const entity = { id: this.nextId++, isActive: true, createdAt: new Date(), ...data } as ProductGroup;
    this.store.push(entity);
    return entity;
  }
  async update(id: number, data: Partial<ProductGroup>): Promise<ProductGroup | null> {
    const idx = this.store.findIndex(g => g.id === id);
    if (idx === -1) return null;
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }
  async delete(id: number): Promise<boolean> {
    const idx = this.store.findIndex(g => g.id === id);
    if (idx === -1) return false;
    this.store[idx].isActive = false;
    return true;
  }
  async count(): Promise<number> { return this.store.filter(g => g.isActive).length; }
  async findAll(): Promise<PaginatedResult<ProductGroup>> {
    return { data: this.store.filter(g => g.isActive), total: this.store.length, page: 1, limit: 10, totalPages: 1 };
  }
  async findByName(name: string): Promise<ProductGroup | null> {
    return this.store.find(g => g.groupName === name && g.isActive) ?? null;
  }
  async findWithFields(id: number): Promise<ProductGroup | null> {
    return this.findById(id);
  }
  async countProductsByGroup(_groupId: number): Promise<number> {
    return this.hasProducts ? 1 : 0;
  }
}
```

- [ ] Write failing unit tests first (RED):

```typescript
// __tests__/product-group.service.test.ts
it('throws when creating a group with a duplicate name', async () => {
  const repo = new FakeProductGroupRepository();
  const service = new ProductGroupService(repo);
  await service.createGroup({ groupName: 'Books' });
  await expect(service.createGroup({ groupName: 'Books' }))
    .rejects.toThrow("Group name 'Books' already exists");
});

it('throws when group not found', async () => {
  const repo = new FakeProductGroupRepository();
  const service = new ProductGroupService(repo);
  await expect(service.getGroupById(999)).rejects.toThrow('Product group not found');
});

it('throws when deleting a group that has products', async () => {
  const repo = new FakeProductGroupRepository();
  repo.hasProducts = true; // fake flag
  const service = new ProductGroupService(repo);
  const group = await service.createGroup({ groupName: 'Agarbatti' });
  await expect(service.deleteGroup(group.id))
    .rejects.toThrow('Cannot delete group with existing products');
});
```

- [ ] Run tests — confirm FAIL:

```bash
cd backend && npm run test:unit -- --testPathPattern=product-group.service
```

- [ ] Implement `ProductGroupService` (GREEN):

```typescript
export class ProductGroupService {
  constructor(private repo: IProductGroupRepository) {}

  async getAllGroups(query: QueryProductGroupDto) {
    return this.repo.findAll(query);
  }

  async getGroupById(id: number): Promise<ProductGroup> {
    const group = await this.repo.findWithFields(id);
    validateEntityExists(group, 'Product group');
    return group;
  }

  async createGroup(data: CreateProductGroupDto): Promise<ProductGroup> {
    const existing = await this.repo.findByName(data.groupName);
    validateUniqueness(existing, undefined, 'Group name', data.groupName);
    return this.repo.create(data);
  }

  async updateGroup(id: number, data: UpdateProductGroupDto): Promise<ProductGroup> {
    const group = await this.repo.findById(id);
    validateEntityExists(group, 'Product group');
    if (data.groupName && data.groupName !== group.groupName) {
      const existing = await this.repo.findByName(data.groupName);
      validateUniqueness(existing, id, 'Group name', data.groupName);
    }
    const updated = await this.repo.update(id, data);
    validateEntityExists(updated, 'Product group');
    return updated;
  }

  async deleteGroup(id: number): Promise<void> {
    const group = await this.repo.findById(id);
    validateEntityExists(group, 'Product group');
    const productCount = await this.repo.countProductsByGroup(id);
    if (productCount > 0) {
      throw new Error('Cannot delete group with existing products');
    }
    const deleted = await this.repo.delete(id);
    validateDeletion(deleted, 'Product group');
  }
}
```

- [ ] Run tests — confirm PASS
- [ ] Implement repository, integration tests, controller, routes, module
- [ ] Register route in `src/routes/index.ts`: `router.use('/product-groups', productGroupModule.getRoutes())`
- [ ] Run `npm run type-check && npm run test:unit`
- [ ] Commit: `feat(product-group): CRUD module with TDD`

---

### Task 19: Product sub-resources (media, marketing-media, physical-attributes, zones, vendors)

**Add to existing `product` module as nested route groups.**

**Files:**
- Modify: `src/modules/product/product.service.ts` (add sub-resource methods)
- Modify: `src/modules/product/product.routes.ts` (add nested routes)
- Create: separate repository files for each sub-resource inside `src/modules/product/`

- [ ] For each sub-resource (`media`, `marketing-media`, `physical-attributes`, `zones`, `vendors`):

  - Create `src/modules/product/interfaces/<sub-resource>.repository.interface.ts`
  - Create `src/modules/product/<sub-resource>.repository.ts` (accept injected repo)
  - Add service methods in `product.service.ts`
  - Add routes in `product.routes.ts`

- [ ] Example for media — add to `product.routes.ts`:

```typescript
router.get('/:productId/media', authMiddleware, controller.getMedia);
router.post('/:productId/media', authMiddleware, controller.addMedia);
router.delete('/:productId/media/:mediaId', authMiddleware, controller.deleteMedia);
```

- [ ] Write unit tests for service methods before implementing them (TDD)

- [ ] Commit: `feat(product): add media, marketing-media, physical-attributes, zones, vendors sub-resources`

---

### Task 20: Product group field values

**Add bulk upsert endpoint to `product` module.**

- [ ] Add to `product.routes.ts`:

```typescript
router.get('/:productId/group-field-values', authMiddleware, controller.getGroupFieldValues);
router.put('/:productId/group-field-values', authMiddleware, controller.upsertGroupFieldValues);
```

- [ ] Implement `upsertGroupFieldValues` in `ProductService`:

```typescript
async upsertGroupFieldValues(productId: number, values: UpsertGroupFieldValuesDto[]): Promise<ProductGroupFieldValue[]> {
  const product = await this.productRepo.findById(productId);
  validateEntityExists(product, 'Product');
  // Delete existing values and insert new ones atomically
  await this.groupFieldValueRepo.deleteByProductId(productId);
  return this.groupFieldValueRepo.createMany(productId, values);
}
```

- [ ] Write unit tests before implementing (RED → GREEN)
- [ ] Commit: `feat(product): add group-field-values bulk upsert endpoint`

---

### Task 21: `product-attribute` module

**Files:**
- Create: `src/modules/product-attribute/` (full module following established pattern)

- [ ] Write failing unit tests first:

```typescript
it('throws when creating attribute on a Standard product', async () => {
  const productRepo = new FakeProductRepository();
  const attrRepo = new FakeProductAttributeRepository();
  const product = await productRepo.create({ productType: 'Standard', isActive: true });
  const service = new ProductAttributeService(attrRepo, productRepo);
  await expect(
    service.createAttribute(product.id, { attributeName: 'Color', attributeCode: 'color' })
  ).rejects.toThrow('Cannot add attributes to a Standard product');
});

it('throws when duplicate attribute code on same product', async () => {
  const productRepo = new FakeProductRepository();
  const attrRepo = new FakeProductAttributeRepository();
  const product = await productRepo.create({ productType: 'Lot Matrix', isActive: true });
  const service = new ProductAttributeService(attrRepo, productRepo);
  await service.createAttribute(product.id, { attributeName: 'Color', attributeCode: 'color' });
  await expect(
    service.createAttribute(product.id, { attributeName: 'Colour', attributeCode: 'color' })
  ).rejects.toThrow("Attribute code 'color' already exists");
});
```

- [ ] Run tests — confirm FAIL
- [ ] Implement service (GREEN), then repository, integration tests, controller, routes, module
- [ ] Register: `router.use('/products', productAttributeModule.getRoutes())` — routes are nested under `/products/:productId/attributes`
- [ ] Commit: `feat(product-attribute): CRUD module with TDD`

---

### Task 22: `product-variant` module — Lot Matrix core

**This is the most complex module. The combination hash and variant generation logic require especially careful TDD.**

**Files:**
- Create: `src/modules/product-variant/` (full module)
- Create: `src/modules/product-variant/combination-hash.ts` (pure utility)

- [ ] Create `src/modules/product-variant/combination-hash.ts`:

```typescript
/**
 * Builds a deterministic combination hash from attribute value IDs.
 * Sort is ascending by attribute_value_id (numeric).
 * Example: [3, 1] → "1_3"
 */
export function buildCombinationHash(attributeValueIds: number[]): string {
  return [...attributeValueIds].sort((a, b) => a - b).join('_');
}
```

- [ ] Write failing unit tests for `combination-hash.ts`:

```typescript
// __tests__/combination-hash.test.ts
import { buildCombinationHash } from '../combination-hash';

describe('buildCombinationHash', () => {
  it('sorts ids ascending and joins with underscore', () => {
    expect(buildCombinationHash([3, 1])).toBe('1_3');
  });

  it('is order-independent (same result regardless of input order)', () => {
    expect(buildCombinationHash([1, 3])).toBe(buildCombinationHash([3, 1]));
  });

  it('handles single attribute value', () => {
    expect(buildCombinationHash([5])).toBe('5');
  });

  it('handles three values', () => {
    expect(buildCombinationHash([10, 2, 7])).toBe('2_7_10');
  });
});
```

- [ ] Run tests — confirm FAIL
- [ ] Implement `buildCombinationHash` (already done above) — confirm PASS
- [ ] Write failing unit tests for `ProductVariantService`:

```typescript
it('throws when generating variants for a Standard product', async () => {
  // Standard products cannot have variants
});

it('throws when product has no attributes defined', async () => {
  // Need at least one attribute with two values
});

it('generates correct number of variants for 2 attributes with 2 values each', async () => {
  // 2 * 2 = 4 variants
  const result = await service.generateVariants(productId);
  expect(result).toHaveLength(4);
});

it('assigns unique combination hashes to each variant', async () => {
  const result = await service.generateVariants(productId);
  const hashes = result.map(v => v.combinationHash);
  expect(new Set(hashes).size).toBe(hashes.length);
});

it('skips combinations that already exist', async () => {
  await service.generateVariants(productId);
  // Call again — should return 0 new variants
  const result = await service.generateVariants(productId);
  expect(result).toHaveLength(0);
});
```

- [ ] Implement `ProductVariantService.generateVariants`:

```typescript
async generateVariants(productId: number): Promise<ProductVariant[]> {
  const product = await this.productRepo.findById(productId, ['attributes', 'attributes.values']);
  validateEntityExists(product, 'Product');

  if (product.productType !== 'Lot Matrix') {
    throw new Error('Cannot generate variants for a Standard product');
  }

  const attributes = product.attributes.filter(a => a.isActive);
  if (attributes.length === 0) {
    throw new Error('Product must have at least one attribute to generate variants');
  }

  const allValues = attributes.map(a => a.values.filter(v => v.isActive));
  if (allValues.some(vals => vals.length < 2)) {
    throw new Error('Each attribute must have at least two values');
  }

  // Cartesian product of all attribute values
  const combinations = cartesianProduct(allValues);
  const created: ProductVariant[] = [];

  for (const combo of combinations) {
    const attributeValueIds = combo.map(v => v.id);
    const hash = buildCombinationHash(attributeValueIds);

    const exists = await this.variantRepo.findByHash(productId, hash);
    if (exists) continue;

    const sku = `${product.productCode}-${hash}`;
    const variant = await this.variantRepo.create({ productId, sku, combinationHash: hash, stockQuantity: 0, isActive: true, isDeleted: false });

    // Save variant-attribute mappings
    for (const value of combo) {
      await this.variantRepo.addAttributeMapping(variant.id, value.attributeId, value.id);
    }
    created.push(variant);
  }
  return created;
}

// Helper: cartesian product
function cartesianProduct<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap(a => curr.map(c => [...a, c])),
    [[]]
  );
}
```

- [ ] Run tests — confirm PASS
- [ ] Implement repository (with `findByHash`, `addAttributeMapping`), integration tests, controller, routes, module
- [ ] Register routes:

```typescript
router.use('/products', productVariantModule.getRoutes());
```

Routes nested under `/products/:productId/variants`.

- [ ] Run `npm run type-check && npm run test:unit`:

```bash
cd backend && npm run type-check && npm run test:unit
```

- [ ] Commit:

```bash
git add src/modules/product-variant/
git commit -m "feat(product-variant): Lot Matrix variant generation with TDD"
```

---

## Final Verification

- [ ] Run the full test suite:

```bash
cd backend && npm run test
```

Expected: all unit and integration tests pass.

- [ ] Run type-check and build:

```bash
cd backend && npm run type-check && npm run build
```

Expected: both exit 0.

- [ ] Verify pre-commit hook works:

```bash
cd backend && git commit --allow-empty -m "test: verify pre-commit hooks"
```

Expected: lefthook runs type-check → lint → test:unit → build, all green.

- [ ] Final commit:

```bash
git add .
git commit -m "feat: complete backend refactor + Lot Matrix implementation"
```
