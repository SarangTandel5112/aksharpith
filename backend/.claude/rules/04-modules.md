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

## GET Endpoint Filter Requirements

Every GET list endpoint MUST include these query parameters at minimum:
- `search` — searches relevant text fields
- `page` — pagination (default: 1)
- `limit` — page size (default: 10)
- `sortBy` — sort field (default: 'createdAt')
- `order` — 'ASC' | 'DESC' (default: 'DESC')

Plus any entity-specific filters relevant to the domain (e.g., `departmentId` for categories, `categoryId` for sub-categories, `isActive` for products, `productType` for products, etc.).
