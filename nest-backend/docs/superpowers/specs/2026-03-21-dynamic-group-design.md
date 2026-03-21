# Dynamic Group System — Design Spec

> **Date:** 2026-03-21
> **Branch:** feature/backend-refactor-lot-matrix
> **Status:** Approved for implementation

---

## Overview

The Dynamic Group System allows admins to define custom metadata fields per product category group (e.g., "Books", "Agarbatti", "Clothing"). When a product is assigned to a group, the UI dynamically renders that group's field definitions and lets staff fill in values. This enables category-specific product information without schema changes.

**Separation from Lot Matrix:**
- Lot Matrix = sellable variation system (affects SKU, price, stock)
- Dynamic Group = metadata extension system (descriptive fields only, no effect on inventory)

They are fully independent and can be combined: a "Lot Matrix + Books" product has both variants (e.g., Cover Type: Hardback/Paperback) and dynamic metadata (Author, ISBN, Language).

---

## Current State (already built)

| Entity | Status |
|--------|--------|
| `product_groups` | ✅ Complete |
| `group_fields` (partial) | ⚠️ Missing `field_key`, `is_filterable`; wrong `field_type` values |
| `group_field_options` (partial) | ⚠️ Missing `option_label` |
| `product_group_field_values` | ✅ Complete |
| `GET/POST/PATCH/DELETE /product-groups` | ✅ Complete |
| `GET /product-groups/:id/fields` | ✅ Complete |
| `PUT /products/:id/group-field-values/:fieldId` | ✅ Exists (single field) |

---

## Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Field key generation | Auto-slugified from name, admin-overridable, immutable after creation | Prevents frontend breakage from key changes |
| Field type enum | `text \| textarea \| number \| boolean \| dropdown` | Matches original schema; `textarea` = multiline text, same storage |
| Field deletion protection | Block with 409 if any product has values for that field | Prevents silent data loss |
| Option deletion protection | Block with 409 if any product has selected that option | Same |
| `field_type` change protection | Block with 409 if any product has values for that field | Type mismatch would corrupt stored values |
| `field_key` immutability | Locked immediately after creation (not just after first value) | Filter URLs break silently if key changes |
| Group change on product | `clearFieldValues: true` flag required if old field values exist; auto-deletes orphans | Explicit intent, no silent data loss |
| Bulk field values | `PUT /products/:id/group-field-values` (all fields at once via upsert) | One round-trip for entire form save |
| Filter error handling | Unknown/non-filterable keys → silently ignore; invalid syntax/type → 400 | Prevents saved filter URLs from breaking |
| Filter syntax | `?gf[field_key]=value`, `?gf[pages]=$btw:100,500`, `?gf[author]=$ilike:tolkien` | Consistent with nestjs-paginate conventions |
| Filter value for dropdown | Uses `option_value` (machine key), resolved to `option_id` in EXISTS subquery | `option_label` may change; `option_value` is stable |
| Filter implementation | `WHERE EXISTS` subquery per `gf[key]` param | Standard EAV pattern, efficient with indexes |

---

## Schema Changes Required

### `group_fields` table

```sql
ALTER TABLE group_fields
  ADD COLUMN field_key varchar(100) NOT NULL,
  ADD COLUMN is_filterable boolean NOT NULL DEFAULT false;

-- field_key must be unique per group
CREATE UNIQUE INDEX uq_group_fields_key ON group_fields (group_id, field_key)
  WHERE deleted_at IS NULL;

-- index for filter subquery performance
CREATE INDEX idx_group_fields_key ON group_fields (field_key);
```

**Updated `FieldType` enum:**
```typescript
export enum FieldType {
  TEXT     = 'text',
  TEXTAREA = 'textarea',
  NUMBER   = 'number',
  BOOLEAN  = 'boolean',
  DROPDOWN = 'dropdown',
}
```

> Note: old `select` enum value must be renamed to `dropdown` in migration.

### `group_field_options` table

```sql
ALTER TABLE group_field_options
  ADD COLUMN option_label varchar(100) NOT NULL DEFAULT '';
```

`option_label` = display name (e.g., "Hindi"); `option_value` = machine key (e.g., `"hi"`).

---

## Entity Definitions (final)

### `GroupField`

```typescript
@Entity('group_fields')
@Index(['groupId'])
@Index(['fieldKey'])  // for filter subquery
@Index(['groupId', 'fieldKey'], { unique: true, where: '"deleted_at" IS NULL' })
export class GroupField {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'group_id' }) groupId: string;
  @Column({ name: 'field_name', length: 150 }) fieldName: string;
  @Column({ name: 'field_key', length: 100 }) fieldKey: string;  // NEW — immutable after creation
  @Column({ name: 'field_type', type: 'enum', enum: FieldType, default: FieldType.TEXT }) fieldType: FieldType;
  @Column({ name: 'is_required', type: 'boolean', default: false }) isRequired: boolean;
  @Column({ name: 'is_filterable', type: 'boolean', default: false }) isFilterable: boolean;  // NEW
  @Column({ name: 'sort_order', type: 'int', default: 0 }) sortOrder: number;
  // ... timestamps, options relation
}
```

### `GroupFieldOption`

```typescript
@Entity('group_field_options')
export class GroupFieldOption {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'field_id' }) fieldId: string;
  @Column({ name: 'option_label', length: 100 }) optionLabel: string;  // NEW — display name
  @Column({ name: 'option_value', length: 255 }) optionValue: string;  // machine key
  @Column({ name: 'sort_order', type: 'int', default: 0 }) sortOrder: number;
  // ... timestamps
}
```

---

## API Endpoints

### Phase 2 — Field management sub-resource

```
POST   /product-groups/:id/fields                       Add field to existing group
PATCH  /product-groups/:id/fields/:fieldId              Update field (name, filterable, required, sortOrder)
DELETE /product-groups/:id/fields/:fieldId              409 if any product has a value for this field
```

**PATCH restrictions:**
- `field_key` → immutable after creation → always ignored in PATCH body
- `field_type` → blocked with 409 if any `product_group_field_values` exist for this field

**DELETE response when blocked:**
```json
{ "statusCode": 409, "message": "Cannot delete: 23 products have values for this field" }
```

### Phase 3 — Option management sub-resource

```
POST   /product-groups/:id/fields/:fieldId/options           Add option to dropdown field
PATCH  /product-groups/:id/fields/:fieldId/options/:optId   Update option label or value
DELETE /product-groups/:id/fields/:fieldId/options/:optId   409 if any product selected this option
```

**DELETE response when blocked:**
```json
{ "statusCode": 409, "message": "Cannot delete: 8 products have selected this option" }
```

### Phase 4 — Bulk group field values

```
PUT  /products/:id/group-field-values          Upsert all field values at once
GET  /products/:id/group-field-values          Get field definitions merged with current values
```

**PUT request body:**
```json
{
  "values": [
    { "fieldId": "uuid-1", "valueText": "Tolkien" },
    { "fieldId": "uuid-2", "valueNumber": 450 },
    { "fieldId": "uuid-3", "valueOptionId": "option-uuid" },
    { "fieldId": "uuid-4", "valueBoolean": true }
  ]
}
```

**GET response shape:**
```json
[
  {
    "fieldId": "uuid-1",
    "fieldName": "Author",
    "fieldKey": "author",
    "fieldType": "text",
    "isRequired": true,
    "isFilterable": false,
    "value": "Tolkien",
    "options": null
  },
  {
    "fieldId": "uuid-3",
    "fieldName": "Language",
    "fieldKey": "language",
    "fieldType": "dropdown",
    "isRequired": true,
    "isFilterable": true,
    "value": null,
    "selectedOption": { "id": "opt-uuid", "label": "Hindi", "value": "hi" },
    "options": [
      { "id": "opt-1", "label": "English", "value": "en" },
      { "id": "opt-2", "label": "Hindi", "value": "hi" }
    ]
  }
]
```

Implementation: TypeORM `repository.upsert(values, { conflictPaths: ['productId', 'fieldId'] })`.

**Validation on PUT:**
1. Product must exist and have a `groupId` set
2. Each `fieldId` must belong to the product's group
3. Value type must match `field_type` (text → `valueText`, number → `valueNumber`, etc.)
4. For `dropdown`: `valueOptionId` must belong to that field
5. For `isRequired = true` field: `value` may not be null/empty

### Phase 5 — Group change protection

Existing `PATCH /products/:id` with `groupId` change:

- If no existing field values → change freely
- If field values exist:
  - Without `clearFieldValues: true` in body → `409` with count of values
  - With `clearFieldValues: true` → delete values for fields not in new group, then update `groupId`

### Phase 6 — Product filter by group fields

Extended `GET /products` query params:

```
?gf[author]=$ilike:tolkien           text search (text/textarea fields)
?gf[language]=hi                     equality by option_value (dropdown fields)
?gf[pages]=$btw:100,500              range (number fields only)
?gf[pages]=$gte:100                  min only
?gf[pages]=$lte:500                  max only
?gf[is_vegan]=true                   boolean field
```

**Filter rules:**
- Only fields with `is_filterable = true` are processed
- Unknown keys → silently ignored
- `is_filterable = false` keys → silently ignored
- Invalid operator syntax (`$btw:abc` for number) → `400 Bad Request`
- Type mismatch (number operator on text field) → `400 Bad Request`
- Multiple `gf` params are AND'd together

**SQL pattern (one EXISTS per filter key):**
```sql
AND EXISTS (
  SELECT 1 FROM product_group_field_values v
  JOIN group_fields f ON f.id = v.field_id
  WHERE v.product_id = p.id
    AND f.field_key = :key
    AND f.is_filterable = true
    AND [value condition based on field_type and operator]
)
```

---

## Validation Rules Summary

| Rule | Where enforced |
|------|---------------|
| `field_key` unique per group | DB unique partial index + service 409 check |
| `field_key` immutable after creation | Service ignores it in PATCH |
| `field_type` immutable if values exist | Service 409 before update |
| Field deletion blocked if values exist | Service 409 with count |
| Option deletion blocked if values reference it | Service 409 with count |
| Field value type must match `field_type` | Service validation on bulk upsert |
| Required field cannot be cleared | Service validation on bulk upsert |
| Group change requires `clearFieldValues: true` if values exist | Service 409 without flag |

---

## Performance

| Index | Purpose |
|-------|---------|
| `group_fields (field_key)` | Filter subquery lookup by key |
| `group_fields (group_id, field_key) WHERE deleted_at IS NULL` | Uniqueness + group-scoped lookup |
| `product_group_field_values (product_id, field_id)` | Already exists — conflict detection for upsert |
| `product_group_field_values (field_id)` | Already exists — checking value existence before delete |

---

## Testing Strategy

All tests are Jest unit tests (no real DB). Each phase has:
- Repository spec: mock TypeORM repo methods, test query logic
- Service spec: mock repository, test business rules (protection logic, validation)
- Controller spec: mock service, test HTTP routing and error propagation

Phase 6 filter tests use snapshot testing on the WHERE clause generated by `applyGroupFieldFilters()`.
