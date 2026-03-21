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
