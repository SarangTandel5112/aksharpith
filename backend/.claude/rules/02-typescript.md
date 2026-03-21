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
