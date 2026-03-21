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
