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
