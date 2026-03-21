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
