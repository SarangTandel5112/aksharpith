# Dynamic Group System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing ProductGroup module with field management, option management, bulk field values, group-change protection, and EAV-based product filtering — all with full TDD.

**Architecture:** Six independent phases, each committing clean working code. Phases 1–3 extend the product-group module. Phases 4–6 extend the product module. All use the existing repository/service/controller/spec pattern established in the codebase.

**Tech Stack:** NestJS 10, TypeORM 0.3, PostgreSQL 16, Jest, class-validator, class-transformer

**Spec:** `docs/superpowers/specs/2026-03-21-dynamic-group-design.md`

**Working directory:** `nest-backend/`

**Run tests with:** `npm test -- --forceExit`
**Run build with:** `npm run build`

---

## File Map

### Phase 1 — Schema
| File | Action |
|------|--------|
| `src/modules/product-group/entities/group-field.entity.ts` | Modify — add `fieldKey`, `isFilterable`; update `FieldType` enum |
| `src/modules/product-group/entities/group-field-option.entity.ts` | Modify — add `optionLabel` |
| `src/migrations/1742500000000-InitSchema.ts` | Modify — add columns + indexes |

### Phase 2 — Field management
| File | Action |
|------|--------|
| `src/modules/product-group/dto/update-group-field.dto.ts` | Create |
| `src/modules/product-group/product-group.repository.ts` | Modify — add `addField`, `updateField`, `deleteField`, `countFieldValues` |
| `src/modules/product-group/product-group.service.ts` | Modify — add `addField`, `updateField`, `removeField` |
| `src/modules/product-group/product-group.controller.ts` | Modify — add 3 new routes |
| `src/modules/product-group/spec/product-group.repository.spec.ts` | Modify — add tests |
| `src/modules/product-group/spec/product-group.service.spec.ts` | Modify — add tests |
| `src/modules/product-group/spec/product-group.controller.spec.ts` | Modify — add tests |

### Phase 3 — Option management
| File | Action |
|------|--------|
| `src/modules/product-group/dto/create-group-field-option.dto.ts` | Modify — add `optionLabel` |
| `src/modules/product-group/dto/update-group-field-option.dto.ts` | Create |
| `src/modules/product-group/product-group.repository.ts` | Modify — add `addOption`, `updateOption`, `deleteOption`, `countOptionUsage` |
| `src/modules/product-group/product-group.service.ts` | Modify — add `addOption`, `updateOption`, `removeOption` |
| `src/modules/product-group/product-group.controller.ts` | Modify — add 3 new routes |
| `src/modules/product-group/spec/*.spec.ts` | Modify — add tests |

### Phase 4 — Bulk field values
| File | Action |
|------|--------|
| `src/modules/product/dto/bulk-upsert-group-field-values.dto.ts` | Create |
| `src/modules/product/product.repository.ts` | Modify — add `bulkUpsertGroupFieldValues`, `getGroupFieldValues` |
| `src/modules/product/product.service.ts` | Modify — add `bulkUpsertGroupFieldValues`, `getGroupFieldValues` |
| `src/modules/product/product.controller.ts` | Modify — add `PUT` and `GET` routes |
| `src/modules/product/spec/product.repository.spec.ts` | Modify — add tests |
| `src/modules/product/spec/product.service.spec.ts` | Modify — add tests |
| `src/modules/product/spec/product.controller.spec.ts` | Modify — add tests |

### Phase 5 — Group change protection
| File | Action |
|------|--------|
| `src/modules/product/product.service.ts` | Modify — add group change guard in `update` |
| `src/modules/product/spec/product.service.spec.ts` | Modify — add tests |

### Phase 6 — Product filter by group fields
| File | Action |
|------|--------|
| `src/modules/product/dto/query-product.dto.ts` | Modify — add `gf` param |
| `src/modules/product/product.repository.ts` | Modify — add `applyGroupFieldFilters` |
| `src/modules/product/spec/product.repository.spec.ts` | Modify — add filter tests |

---

## Task 1 — Schema: update entities + migration

**Files:**
- Modify: `src/modules/product-group/entities/group-field.entity.ts`
- Modify: `src/modules/product-group/entities/group-field-option.entity.ts`
- Modify: `src/migrations/1742500000000-InitSchema.ts`

- [ ] **Step 1: Update `FieldType` enum and `GroupField` entity**

In `group-field.entity.ts`, replace the `FieldType` enum and add two columns:

```typescript
export enum FieldType {
  TEXT     = 'text',
  TEXTAREA = 'textarea',
  NUMBER   = 'number',
  BOOLEAN  = 'boolean',
  DROPDOWN = 'dropdown',
}
```

Add to `GroupField` class (after `fieldType`):
```typescript
@Column({ name: 'field_key', length: 100 })
@Expose()
fieldKey: string;

@Column({ name: 'is_filterable', type: 'boolean', default: false })
@Expose()
isFilterable: boolean;
```

- [ ] **Step 2: Add `optionLabel` to `GroupFieldOption` entity**

In `group-field-option.entity.ts`, add after `fieldId`:
```typescript
@Column({ name: 'option_label', length: 100 })
@Expose()
optionLabel: string;
```

- [ ] **Step 3: Update migration to add new columns + indexes**

In `src/migrations/1742500000000-InitSchema.ts`, find the `group_fields` table definition and add:
```typescript
{ name: 'field_key', type: 'varchar', length: '100', isNullable: false, default: "''" },
{ name: 'is_filterable', type: 'boolean', isNullable: false, default: false },
```

Find `group_field_options` and add:
```typescript
{ name: 'option_label', type: 'varchar', length: '100', isNullable: false, default: "''" },
```

Add to the indexes array at the bottom of `up()`:
```typescript
await queryRunner.createIndex('group_fields', new TableIndex({
  name: 'idx_group_fields_key',
  columnNames: ['field_key'],
}));
await queryRunner.createIndex('group_fields', new TableIndex({
  name: 'uq_group_fields_group_key',
  columnNames: ['group_id', 'field_key'],
  isUnique: true,
  where: '"deleted_at" IS NULL',
}));
```

Also update the `FieldType` enum type in the migration from `'text,number,select'` to `'text,textarea,number,boolean,dropdown'`:
```typescript
// Find the field_type column in group_fields table and update its enum values:
{ name: 'field_type', type: 'enum', enum: ['text', 'textarea', 'number', 'boolean', 'dropdown'], default: "'text'" },
```

- [ ] **Step 4: Build and verify 0 TypeScript errors**

```bash
npm run build
```
Expected: exit 0, no errors.

- [ ] **Step 5: Verify all existing tests still pass**

```bash
npm test -- --forceExit 2>&1 | tail -5
```
Expected: `438 passed, 0 failed`

- [ ] **Step 6: Commit**

```bash
git add src/modules/product-group/entities/ src/migrations/
git commit -m "feat(product-group): add field_key, is_filterable, option_label, textarea/boolean field types to schema"
```

---

## Task 2 — Field management: repository layer (TDD)

**Files:**
- Modify: `src/modules/product-group/product-group.repository.ts`
- Modify: `src/modules/product-group/spec/product-group.repository.spec.ts`

- [ ] **Step 1: Write failing repository tests**

Add to `product-group.repository.spec.ts` (inside the outer `describe`):

```typescript
describe('addField', () => {
  it('slugifies field name to generate field_key', async () => {
    const dto = { fieldName: 'Burning Time', fieldType: FieldType.NUMBER, isRequired: false, sortOrder: 0 };
    const saved = { id: 'f-1', groupId: 'g-1', fieldKey: 'burning_time', ...dto };
    fieldRepo.create.mockReturnValue(saved);
    fieldRepo.save.mockResolvedValue(saved);
    const result = await repo.addField('g-1', dto);
    expect(result.fieldKey).toBe('burning_time');
  });

  it('uses custom field_key when provided', async () => {
    const dto = { fieldName: 'ISBN Number', fieldKey: 'isbn', fieldType: FieldType.TEXT };
    const saved = { id: 'f-2', groupId: 'g-1', fieldKey: 'isbn', fieldName: 'ISBN Number' };
    fieldRepo.create.mockReturnValue(saved);
    fieldRepo.save.mockResolvedValue(saved);
    const result = await repo.addField('g-1', dto);
    expect(result.fieldKey).toBe('isbn');
  });
});

describe('updateField', () => {
  it('updates allowed fields (name, required, filterable, sortOrder)', async () => {
    fieldRepo.update.mockResolvedValue({ affected: 1 });
    fieldRepo.findOne.mockResolvedValue({ id: 'f-1', fieldName: 'Updated', isFilterable: true });
    const result = await repo.updateField('f-1', { fieldName: 'Updated', isFilterable: true });
    expect(result).toHaveProperty('fieldName', 'Updated');
    expect(fieldRepo.update).toHaveBeenCalledWith('f-1', expect.not.objectContaining({ fieldKey: expect.anything() }));
  });
});

describe('deleteField', () => {
  it('soft-deletes field', async () => {
    fieldRepo.softDelete.mockResolvedValue({ affected: 1 });
    expect(await repo.deleteField('f-1')).toBe(true);
  });

  it('returns false when field not found', async () => {
    fieldRepo.softDelete.mockResolvedValue({ affected: 0 });
    expect(await repo.deleteField('bad')).toBe(false);
  });
});

describe('countFieldValues', () => {
  it('returns count of products with values for field', async () => {
    groupFieldValueRepo.count.mockResolvedValue(23);
    expect(await repo.countFieldValues('f-1')).toBe(23);
  });
});
```

> Note: You will need to add `fieldRepo` and `groupFieldValueRepo` mocks to the outer `beforeEach`. Check current mock setup in the spec file and add:
> ```typescript
> const mockFieldRepo = () => ({ create: jest.fn(), save: jest.fn(), update: jest.fn(), findOne: jest.fn(), softDelete: jest.fn() });
> const mockGroupFieldValueRepo = () => ({ count: jest.fn() });
> ```
> Also add them to `TestingModule` providers and assign in `beforeEach`.

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- --testPathPattern="product-group.repository" --forceExit 2>&1 | tail -15
```
Expected: tests for `addField`, `updateField`, `deleteField`, `countFieldValues` FAIL (methods don't exist yet).

- [ ] **Step 3: Implement repository methods**

In `product-group.repository.ts`, add (import `GroupField`, `GroupFieldOption`, `ProductGroupFieldValue` repos as needed):

```typescript
private slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

async addField(groupId: string, dto: AddGroupFieldDto): Promise<GroupField> {
  const fieldKey = dto.fieldKey ?? this.slugify(dto.fieldName);
  // strip fieldKey from dto before spreading to avoid override
  const { fieldKey: _fk, ...rest } = dto as any;
  const field = this.fieldRepo.create({ ...rest, groupId, fieldKey });
  return this.fieldRepo.save(field);
}

async updateField(fieldId: string, dto: UpdateGroupFieldDto): Promise<GroupField> {
  // never update fieldKey — explicitly exclude it
  const { fieldKey: _ignored, fieldType: _ignoredType, ...safeDto } = dto as any;
  await this.fieldRepo.update(fieldId, safeDto);
  return this.fieldRepo.findOne({ where: { id: fieldId } });
}

async deleteField(fieldId: string): Promise<boolean> {
  const result = await this.fieldRepo.softDelete(fieldId);
  return (result.affected ?? 0) > 0;
}

async countFieldValues(fieldId: string): Promise<number> {
  return this.groupFieldValueRepo.count({ where: { fieldId } });
}
```

> Inject `@InjectRepository(GroupField) private readonly fieldRepo: Repository<GroupField>` and `@InjectRepository(ProductGroupFieldValue) private readonly groupFieldValueRepo: Repository<ProductGroupFieldValue>` in the constructor. Check the existing constructor to avoid duplicates.

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- --testPathPattern="product-group.repository" --forceExit 2>&1 | tail -10
```
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/modules/product-group/
git commit -m "feat(product-group): add field management repository methods with TDD"
```

---

## Task 3 — Field management: service + controller (TDD)

**Files:**
- Create: `src/modules/product-group/dto/update-group-field.dto.ts`
- Create: `src/modules/product-group/dto/add-group-field.dto.ts`
- Modify: `src/modules/product-group/product-group.service.ts`
- Modify: `src/modules/product-group/product-group.controller.ts`
- Modify: `src/modules/product-group/spec/product-group.service.spec.ts`
- Modify: `src/modules/product-group/spec/product-group.controller.spec.ts`

- [ ] **Step 1: Create DTOs**

`src/modules/product-group/dto/add-group-field.dto.ts`:
```typescript
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEnum, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FieldType } from '../entities/group-field.entity';

export class AddGroupFieldDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(150) fieldName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) fieldKey?: string;
  @ApiPropertyOptional({ enum: FieldType }) @IsOptional() @IsEnum(FieldType) fieldType?: FieldType;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isRequired?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFilterable?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
```

`src/modules/product-group/dto/update-group-field.dto.ts`:
```typescript
import { IsString, MaxLength, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGroupFieldDto {
  // NOTE: fieldKey and fieldType are intentionally excluded — immutable after creation
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) fieldName?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isRequired?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFilterable?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
```

- [ ] **Step 2: Write failing service tests**

Add to `product-group.service.spec.ts` mock:
```typescript
// add to mockRepo factory:
addField: jest.fn(),
updateField: jest.fn(),
deleteField: jest.fn(),
countFieldValues: jest.fn(),
```

Add describe blocks:
```typescript
describe('addField', () => {
  it('adds field to existing group', async () => {
    repo.findById.mockResolvedValue({ id: 'g-1', name: 'Books' });
    repo.addField.mockResolvedValue({ id: 'f-1', fieldKey: 'author' });
    const result = await service.addField('g-1', { fieldName: 'Author' });
    expect(result).toHaveProperty('fieldKey', 'author');
  });

  it('throws 404 if group not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.addField('bad', { fieldName: 'X' })).rejects.toThrow(NotFoundException);
  });
});

describe('updateField', () => {
  it('blocks field_type change if values exist', async () => {
    repo.findById.mockResolvedValue({ id: 'g-1' });
    repo.findFieldById.mockResolvedValue({ id: 'f-1', fieldType: 'text', groupId: 'g-1' });
    repo.countFieldValues.mockResolvedValue(5);
    await expect(
      service.updateField('g-1', 'f-1', { fieldType: 'number' } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('allows field_type change if no values exist', async () => {
    repo.findById.mockResolvedValue({ id: 'g-1' });
    repo.findFieldById.mockResolvedValue({ id: 'f-1', fieldType: 'text', groupId: 'g-1' });
    repo.countFieldValues.mockResolvedValue(0);
    repo.updateField.mockResolvedValue({ id: 'f-1', fieldType: 'number' });
    const result = await service.updateField('g-1', 'f-1', { fieldType: 'number' } as any);
    expect(result).toHaveProperty('fieldType', 'number');
  });
});

describe('removeField', () => {
  it('blocks deletion if values exist', async () => {
    repo.findById.mockResolvedValue({ id: 'g-1' });
    repo.findFieldById.mockResolvedValue({ id: 'f-1', groupId: 'g-1' });
    repo.countFieldValues.mockResolvedValue(3);
    await expect(service.removeField('g-1', 'f-1')).rejects.toThrow(ConflictException);
  });

  it('deletes field when no values exist', async () => {
    repo.findById.mockResolvedValue({ id: 'g-1' });
    repo.findFieldById.mockResolvedValue({ id: 'f-1', groupId: 'g-1' });
    repo.countFieldValues.mockResolvedValue(0);
    repo.deleteField.mockResolvedValue(true);
    await expect(service.removeField('g-1', 'f-1')).resolves.toBeUndefined();
  });

  it('throws 404 if field not found', async () => {
    repo.findById.mockResolvedValue({ id: 'g-1' });
    repo.findFieldById.mockResolvedValue(null);
    await expect(service.removeField('g-1', 'f-1')).rejects.toThrow(NotFoundException);
  });
});
```

- [ ] **Step 3: Run tests — expect FAIL**

```bash
npm test -- --testPathPattern="product-group.service" --forceExit 2>&1 | tail -10
```

- [ ] **Step 4: Implement service methods**

Add to `product-group.service.ts`:
```typescript
async addField(groupId: string, dto: AddGroupFieldDto): Promise<GroupField> {
  const group = await this.repo.findById(groupId);
  if (!group) throw new NotFoundException(`Group ${groupId} not found`);
  return this.repo.addField(groupId, dto);
}

async updateField(groupId: string, fieldId: string, dto: UpdateGroupFieldDto & { fieldType?: FieldType }): Promise<GroupField> {
  const group = await this.repo.findById(groupId);
  if (!group) throw new NotFoundException(`Group ${groupId} not found`);
  const field = await this.repo.findFieldById(fieldId);
  if (!field || field.groupId !== groupId) throw new NotFoundException(`Field ${fieldId} not found`);
  if (dto.fieldType && dto.fieldType !== field.fieldType) {
    const valueCount = await this.repo.countFieldValues(fieldId);
    if (valueCount > 0) throw new ConflictException(`Cannot change field type: ${valueCount} products have values for this field`);
  }
  return this.repo.updateField(fieldId, dto);
}

async removeField(groupId: string, fieldId: string): Promise<void> {
  const group = await this.repo.findById(groupId);
  if (!group) throw new NotFoundException(`Group ${groupId} not found`);
  const field = await this.repo.findFieldById(fieldId);
  if (!field || field.groupId !== groupId) throw new NotFoundException(`Field ${fieldId} not found`);
  const valueCount = await this.repo.countFieldValues(fieldId);
  if (valueCount > 0) throw new ConflictException(`Cannot delete: ${valueCount} products have values for this field`);
  await this.repo.deleteField(fieldId);
}
```

Also add `findFieldById(fieldId: string): Promise<GroupField | null>` to the repository:
```typescript
async findFieldById(fieldId: string): Promise<GroupField | null> {
  return this.fieldRepo.findOne({ where: { id: fieldId } });
}
```

- [ ] **Step 5: Write failing controller tests + implement controller routes**

Add to `product-group.controller.spec.ts` mock service factory:
```typescript
addField: jest.fn(),
updateField: jest.fn(),
removeField: jest.fn(),
```

Add tests:
```typescript
describe('addField', () => {
  it('delegates to service', async () => {
    service.addField.mockResolvedValue({ id: 'f-1', fieldKey: 'author' });
    const result = await controller.addField('g-1', { fieldName: 'Author' });
    expect(result).toHaveProperty('fieldKey', 'author');
    expect(service.addField).toHaveBeenCalledWith('g-1', { fieldName: 'Author' });
  });

  it('propagates 404', async () => {
    service.addField.mockRejectedValue(new NotFoundException());
    await expect(controller.addField('bad', { fieldName: 'X' })).rejects.toThrow(NotFoundException);
  });
});

describe('updateField', () => {
  it('delegates to service', async () => {
    service.updateField.mockResolvedValue({ id: 'f-1', isFilterable: true });
    const result = await controller.updateField('g-1', 'f-1', { isFilterable: true });
    expect(result).toHaveProperty('isFilterable', true);
  });

  it('propagates 409 when type change blocked', async () => {
    service.updateField.mockRejectedValue(new ConflictException());
    await expect(controller.updateField('g-1', 'f-1', {})).rejects.toThrow(ConflictException);
  });
});

describe('removeField', () => {
  it('delegates to service', async () => {
    service.removeField.mockResolvedValue(undefined);
    await expect(controller.removeField('g-1', 'f-1')).resolves.toBeUndefined();
  });

  it('propagates 409 when values exist', async () => {
    service.removeField.mockRejectedValue(new ConflictException());
    await expect(controller.removeField('g-1', 'f-1')).rejects.toThrow(ConflictException);
  });
});
```

Add to `product-group.controller.ts`:
```typescript
@Post(':id/fields')
@Roles([ROLE.ADMIN])
addField(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AddGroupFieldDto) {
  return this.service.addField(id, dto);
}

@Patch(':id/fields/:fieldId')
@Roles([ROLE.ADMIN])
updateField(
  @Param('id', ParseUUIDPipe) id: string,
  @Param('fieldId', ParseUUIDPipe) fieldId: string,
  @Body() dto: UpdateGroupFieldDto,
) {
  return this.service.updateField(id, fieldId, dto);
}

@Delete(':id/fields/:fieldId')
@Roles([ROLE.ADMIN])
@HttpCode(HttpStatus.NO_CONTENT)
removeField(
  @Param('id', ParseUUIDPipe) id: string,
  @Param('fieldId', ParseUUIDPipe) fieldId: string,
) {
  return this.service.removeField(id, fieldId);
}
```

- [ ] **Step 6: Run all product-group tests — expect PASS**

```bash
npm test -- --testPathPattern="product-group" --forceExit 2>&1 | tail -10
```

- [ ] **Step 7: Commit**

```bash
git add src/modules/product-group/
git commit -m "feat(product-group): add field management sub-resource with protected delete/type-change (TDD)"
```

---

## Task 4 — Option management: repository + service + controller (TDD)

**Files:**
- Modify: `src/modules/product-group/dto/create-group-field-option.dto.ts`
- Create: `src/modules/product-group/dto/update-group-field-option.dto.ts`
- Modify: `src/modules/product-group/product-group.repository.ts`
- Modify: `src/modules/product-group/product-group.service.ts`
- Modify: `src/modules/product-group/product-group.controller.ts`
- Modify: `src/modules/product-group/spec/*.spec.ts`

- [ ] **Step 1: Update `CreateGroupFieldOptionDto` to include `optionLabel`**

```typescript
// create-group-field-option.dto.ts — add:
@ApiProperty() @IsString() @IsNotEmpty() @MaxLength(100) optionLabel: string;
// existing optionValue field stays
```

- [ ] **Step 2: Create `UpdateGroupFieldOptionDto`**

```typescript
// update-group-field-option.dto.ts
export class UpdateGroupFieldOptionDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) optionLabel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255) optionValue?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
```

- [ ] **Step 3: Write failing tests for option repository methods**

Add to `product-group.repository.spec.ts`:
```typescript
describe('addOption', () => {
  it('creates and saves option', async () => {
    const dto = { optionLabel: 'Hindi', optionValue: 'hi', sortOrder: 0 };
    const saved = { id: 'o-1', fieldId: 'f-1', ...dto };
    optionRepo.create.mockReturnValue(saved);
    optionRepo.save.mockResolvedValue(saved);
    expect(await repo.addOption('f-1', dto)).toEqual(saved);
  });
});

describe('updateOption', () => {
  it('updates option and returns updated', async () => {
    optionRepo.update.mockResolvedValue({ affected: 1 });
    optionRepo.findOne.mockResolvedValue({ id: 'o-1', optionLabel: 'Updated' });
    const result = await repo.updateOption('o-1', { optionLabel: 'Updated' });
    expect(result.optionLabel).toBe('Updated');
  });
});

describe('deleteOption', () => {
  it('deletes option', async () => {
    optionRepo.delete.mockResolvedValue({ affected: 1 });
    expect(await repo.deleteOption('o-1')).toBe(true);
  });
});

describe('countOptionUsage', () => {
  it('returns count of products using option', async () => {
    groupFieldValueRepo.count.mockResolvedValue(8);
    expect(await repo.countOptionUsage('o-1')).toBe(8);
  });
});
```

> Add `optionRepo` mock to the spec's `beforeEach` — `const mockOptionRepo = () => ({ create: jest.fn(), save: jest.fn(), update: jest.fn(), findOne: jest.fn(), delete: jest.fn() });`

- [ ] **Step 4: Run tests — expect FAIL**

```bash
npm test -- --testPathPattern="product-group.repository" --forceExit 2>&1 | tail -10
```

- [ ] **Step 5: Implement option repository methods**

```typescript
async addOption(fieldId: string, dto: CreateGroupFieldOptionDto): Promise<GroupFieldOption> {
  const option = this.optionRepo.create({ ...dto, fieldId });
  return this.optionRepo.save(option);
}

async updateOption(optionId: string, dto: UpdateGroupFieldOptionDto): Promise<GroupFieldOption> {
  await this.optionRepo.update(optionId, dto);
  return this.optionRepo.findOne({ where: { id: optionId } });
}

async deleteOption(optionId: string): Promise<boolean> {
  const result = await this.optionRepo.delete(optionId);
  return (result.affected ?? 0) > 0;
}

async countOptionUsage(optionId: string): Promise<number> {
  return this.groupFieldValueRepo.count({ where: { valueOptionId: optionId } });
}
```

- [ ] **Step 6: Write failing service + controller tests and implement**

Service (`addOption`, `updateOption`, `removeOption` — same protected-delete pattern as fields):
- `removeOption`: check `countOptionUsage` → 409 if > 0
- `addOption`: validate field exists and belongs to group, then call repo
- Controller: `POST/:id/fields/:fieldId/options`, `PATCH/:id/fields/:fieldId/options/:optId`, `DELETE/:id/fields/:fieldId/options/:optId`

- [ ] **Step 7: Run all product-group tests — expect PASS**

```bash
npm test -- --testPathPattern="product-group" --forceExit 2>&1 | tail -10
```

- [ ] **Step 8: Commit**

```bash
git add src/modules/product-group/
git commit -m "feat(product-group): add option management sub-resource with protected delete (TDD)"
```

---

## Task 5 — Bulk group field values: PUT + GET (TDD)

**Files:**
- Create: `src/modules/product/dto/bulk-upsert-group-field-values.dto.ts`
- Modify: `src/modules/product/product.repository.ts`
- Modify: `src/modules/product/product.service.ts`
- Modify: `src/modules/product/product.controller.ts`
- Modify: `src/modules/product/spec/product.repository.spec.ts`
- Modify: `src/modules/product/spec/product.service.spec.ts`
- Modify: `src/modules/product/spec/product.controller.spec.ts`

- [ ] **Step 1: Create bulk DTO**

```typescript
// bulk-upsert-group-field-values.dto.ts
import { IsArray, ValidateNested, IsUUID, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class FieldValueItemDto {
  @IsUUID('4') fieldId: string;
  @IsOptional() @IsString() valueText?: string | null;
  @IsOptional() @IsNumber() valueNumber?: number | null;
  @IsOptional() @IsBoolean() valueBoolean?: boolean | null;
  @IsOptional() @IsUUID('4') valueOptionId?: string | null;
}

export class BulkUpsertGroupFieldValuesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldValueItemDto)
  values: FieldValueItemDto[];
}
```

- [ ] **Step 2: Write failing repository tests**

Add to `product.repository.spec.ts`:
```typescript
describe('bulkUpsertGroupFieldValues', () => {
  it('upserts all values via ON CONFLICT', async () => {
    groupFieldValueRepo.upsert.mockResolvedValue({ identifiers: [] });
    await productRepo.bulkUpsertGroupFieldValues('prod-1', [
      { fieldId: 'f-1', valueText: 'Tolkien' },
      { fieldId: 'f-2', valueNumber: 450 },
    ]);
    expect(groupFieldValueRepo.upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ productId: 'prod-1', fieldId: 'f-1', valueText: 'Tolkien' }),
      ]),
      { conflictPaths: ['productId', 'fieldId'] },
    );
  });
});

describe('getGroupFieldValues', () => {
  it('returns field values with field + options loaded', async () => {
    groupFieldValueRepo.find.mockResolvedValue([
      { fieldId: 'f-1', valueText: 'Tolkien', field: { fieldName: 'Author', fieldKey: 'author' } },
    ]);
    const result = await productRepo.getGroupFieldValues('prod-1');
    expect(result[0]).toHaveProperty('field');
  });
});
```

> Add `groupFieldValueRepo` mock to the repo spec's `beforeEach` — check if already present, add `upsert: jest.fn()` and `find: jest.fn()` if missing.

- [ ] **Step 3: Run — expect FAIL**

```bash
npm test -- --testPathPattern="product.repository" --forceExit 2>&1 | tail -10
```

- [ ] **Step 4: Implement repository methods**

```typescript
async bulkUpsertGroupFieldValues(productId: string, values: FieldValueItemDto[]): Promise<void> {
  const rows = values.map((v) => ({ ...v, productId }));
  await this.groupFieldValueRepo.upsert(rows, { conflictPaths: ['productId', 'fieldId'] });
}

async getGroupFieldValues(productId: string) {
  return this.groupFieldValueRepo.find({
    where: { productId },
    relations: ['field', 'field.options', 'valueOption'],
    order: { field: { sortOrder: 'ASC' } },
  });
}
```

- [ ] **Step 5: Write failing service tests**

```typescript
describe('bulkUpsertGroupFieldValues', () => {
  it('validates product exists, then delegates', async () => {
    repo.findById.mockResolvedValue({ id: 'prod-1', groupId: 'g-1' });
    repo.bulkUpsertGroupFieldValues.mockResolvedValue(undefined);
    await expect(
      service.bulkUpsertGroupFieldValues('prod-1', { values: [{ fieldId: 'f-1', valueText: 'Tolkien' }] }),
    ).resolves.toBeUndefined();
  });

  it('throws 400 if product has no group', async () => {
    repo.findById.mockResolvedValue({ id: 'prod-1', groupId: null });
    await expect(
      service.bulkUpsertGroupFieldValues('prod-1', { values: [] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws 404 if product not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(
      service.bulkUpsertGroupFieldValues('bad', { values: [] }),
    ).rejects.toThrow(NotFoundException);
  });
});

describe('getGroupFieldValues', () => {
  it('returns merged field values', async () => {
    repo.findById.mockResolvedValue({ id: 'prod-1', groupId: 'g-1' });
    repo.getGroupFieldValues.mockResolvedValue([{ fieldId: 'f-1', valueText: 'Tolkien' }]);
    const result = await service.getGroupFieldValues('prod-1');
    expect(result).toHaveLength(1);
  });
});
```

- [ ] **Step 6: Implement service methods**

```typescript
async bulkUpsertGroupFieldValues(productId: string, dto: BulkUpsertGroupFieldValuesDto): Promise<void> {
  const product = await this.productRepo.findById(productId);
  if (!product) throw new NotFoundException(`Product ${productId} not found`);
  if (!product.groupId) throw new BadRequestException('Product has no group assigned');
  await this.productRepo.bulkUpsertGroupFieldValues(productId, dto.values);
}

async getGroupFieldValues(productId: string) {
  const product = await this.productRepo.findById(productId);
  if (!product) throw new NotFoundException(`Product ${productId} not found`);
  return this.productRepo.getGroupFieldValues(productId);
}
```

- [ ] **Step 7: Add controller routes and tests**

```typescript
// product.controller.ts
@Put(':id/group-field-values')
@Roles([ROLE.ADMIN, ROLE.STAFF])
bulkUpsertGroupFieldValues(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() dto: BulkUpsertGroupFieldValuesDto,
) {
  return this.service.bulkUpsertGroupFieldValues(id, dto);
}

@Get(':id/group-field-values')
@Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])
getGroupFieldValues(@Param('id', ParseUUIDPipe) id: string) {
  return this.service.getGroupFieldValues(id);
}
```

Controller spec tests (add to `product.controller.spec.ts` mock and describe):
```typescript
// mock additions:
bulkUpsertGroupFieldValues: jest.fn(),
getGroupFieldValues: jest.fn(),

// tests:
it('bulkUpsertGroupFieldValues delegates to service', async () => {
  service.bulkUpsertGroupFieldValues.mockResolvedValue(undefined);
  await expect(
    controller.bulkUpsertGroupFieldValues('prod-1', { values: [] }),
  ).resolves.toBeUndefined();
});

it('getGroupFieldValues delegates to service', async () => {
  service.getGroupFieldValues.mockResolvedValue([{ fieldId: 'f-1' }]);
  const result = await controller.getGroupFieldValues('prod-1');
  expect(result).toHaveLength(1);
});
```

- [ ] **Step 8: Run all product tests — expect PASS**

```bash
npm test -- --testPathPattern="product\." --forceExit 2>&1 | tail -10
```

- [ ] **Step 9: Commit**

```bash
git add src/modules/product/
git commit -m "feat(product): add bulk group field values PUT/GET endpoints with TDD"
```

---

## Task 6 — Group change protection (TDD)

**Files:**
- Modify: `src/modules/product/product.service.ts`
- Modify: `src/modules/product/spec/product.service.spec.ts`

- [ ] **Step 1: Write failing service tests**

Add to `product.service.spec.ts`:
```typescript
describe('update with groupId change', () => {
  it('allows group change when no field values exist', async () => {
    repo.findById.mockResolvedValue({ ...mockProduct, groupId: 'old-group' });
    repo.findBySku.mockResolvedValue(null);
    repo.countGroupFieldValues.mockResolvedValue(0);
    repo.update.mockResolvedValue({ ...mockProduct, groupId: 'new-group' });
    const result = await service.update('uuid-1', { groupId: 'new-group' });
    expect(result.groupId).toBe('new-group');
  });

  it('throws 409 when group changes and values exist without clearFieldValues flag', async () => {
    repo.findById.mockResolvedValue({ ...mockProduct, groupId: 'old-group' });
    repo.findBySku.mockResolvedValue(null);
    repo.countGroupFieldValues.mockResolvedValue(5);
    await expect(
      service.update('uuid-1', { groupId: 'new-group' }),
    ).rejects.toThrow(ConflictException);
  });

  it('deletes orphan values and changes group when clearFieldValues=true', async () => {
    repo.findById.mockResolvedValue({ ...mockProduct, groupId: 'old-group' });
    repo.findBySku.mockResolvedValue(null);
    repo.countGroupFieldValues.mockResolvedValue(5);
    repo.deleteGroupFieldValues.mockResolvedValue(undefined);
    repo.update.mockResolvedValue({ ...mockProduct, groupId: 'new-group' });
    const result = await service.update('uuid-1', { groupId: 'new-group', clearFieldValues: true } as any);
    expect(repo.deleteGroupFieldValues).toHaveBeenCalledWith('uuid-1');
    expect(result.groupId).toBe('new-group');
  });
});
```

Also add `countGroupFieldValues: jest.fn()` and `deleteGroupFieldValues: jest.fn()` to the mock repo.

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- --testPathPattern="product.service" --forceExit 2>&1 | tail -10
```

- [ ] **Step 3: Add repository methods**

```typescript
async countGroupFieldValues(productId: string): Promise<number> {
  return this.groupFieldValueRepo.count({ where: { productId } });
}

async deleteGroupFieldValues(productId: string): Promise<void> {
  await this.groupFieldValueRepo.delete({ productId });
}
```

- [ ] **Step 4: Update `update` in service**

In `ProductService.update()`, add before the final `repo.update()` call:
```typescript
if (dto.groupId && dto.groupId !== existing.groupId) {
  const valueCount = await this.productRepo.countGroupFieldValues(id);
  if (valueCount > 0) {
    if (!(dto as any).clearFieldValues) {
      throw new ConflictException(
        `Cannot change group: ${valueCount} field values exist. Pass clearFieldValues: true to delete them.`,
      );
    }
    await this.productRepo.deleteGroupFieldValues(id);
  }
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test -- --testPathPattern="product.service" --forceExit 2>&1 | tail -10
```

- [ ] **Step 6: Commit**

```bash
git add src/modules/product/
git commit -m "feat(product): group change protection — 409 when field values exist, clearFieldValues flag (TDD)"
```

---

## Task 7 — Product filter by group fields (TDD)

**Files:**
- Modify: `src/modules/product/dto/query-product.dto.ts`
- Modify: `src/modules/product/product.repository.ts`
- Modify: `src/modules/product/spec/product.repository.spec.ts`

- [ ] **Step 1: Add `gf` query param to `QueryProductDto`**

```typescript
// query-product.dto.ts — add:
@ApiPropertyOptional({
  description: 'Filter by group field values. E.g. gf[author]=$ilike:tolkien, gf[pages]=$btw:100,500',
  type: 'object',
  additionalProperties: { type: 'string' },
})
@IsOptional()
gf?: Record<string, string>;
```

- [ ] **Step 2: Write failing repository filter tests**

Add to `product.repository.spec.ts`:
```typescript
describe('applyGroupFieldFilters', () => {
  let qb: any;

  beforeEach(() => {
    qb = {
      andWhere: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
    };
  });

  it('adds EXISTS subquery for equality filter', () => {
    productRepo.applyGroupFieldFilters(qb, { language: 'hi' });
    expect(qb.andWhere).toHaveBeenCalledTimes(1);
    const [clause] = qb.andWhere.mock.calls[0];
    expect(clause).toContain('EXISTS');
    expect(clause).toContain('field_key');
  });

  it('adds EXISTS subquery for $btw range filter', () => {
    productRepo.applyGroupFieldFilters(qb, { pages: '$btw:100,500' });
    expect(qb.andWhere).toHaveBeenCalledTimes(1);
    const [clause] = qb.andWhere.mock.calls[0];
    expect(clause).toContain('BETWEEN');
  });

  it('adds EXISTS subquery for $ilike text filter', () => {
    productRepo.applyGroupFieldFilters(qb, { author: '$ilike:tolkien' });
    const [clause] = qb.andWhere.mock.calls[0];
    expect(clause).toContain('ILIKE');
  });

  it('adds EXISTS subquery for $gte filter', () => {
    productRepo.applyGroupFieldFilters(qb, { pages: '$gte:100' });
    const [clause] = qb.andWhere.mock.calls[0];
    expect(clause).toContain('>=');
  });

  it('adds multiple AND-joined EXISTS for multiple keys', () => {
    productRepo.applyGroupFieldFilters(qb, { language: 'hi', pages: '$btw:100,500' });
    expect(qb.andWhere).toHaveBeenCalledTimes(2);
  });

  it('adds no subquery for empty gf object', () => {
    productRepo.applyGroupFieldFilters(qb, {});
    expect(qb.andWhere).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run — expect FAIL**

```bash
npm test -- --testPathPattern="product.repository" --forceExit 2>&1 | tail -10
```

- [ ] **Step 4: Implement `applyGroupFieldFilters`**

```typescript
applyGroupFieldFilters(qb: SelectQueryBuilder<Product>, gf: Record<string, string>): void {
  Object.entries(gf).forEach(([key, rawValue], idx) => {
    const paramPrefix = `gf_${idx}`;
    let condition: string;
    let params: Record<string, unknown> = { [`${paramPrefix}_key`]: key };

    if (rawValue.startsWith('$btw:')) {
      const [min, max] = rawValue.slice(5).split(',').map(Number);
      condition = `v${idx}.value_number BETWEEN :${paramPrefix}_min AND :${paramPrefix}_max`;
      params = { ...params, [`${paramPrefix}_min`]: min, [`${paramPrefix}_max`]: max };
    } else if (rawValue.startsWith('$gte:')) {
      condition = `v${idx}.value_number >= :${paramPrefix}_val`;
      params = { ...params, [`${paramPrefix}_val`]: Number(rawValue.slice(5)) };
    } else if (rawValue.startsWith('$lte:')) {
      condition = `v${idx}.value_number <= :${paramPrefix}_val`;
      params = { ...params, [`${paramPrefix}_val`]: Number(rawValue.slice(5)) };
    } else if (rawValue.startsWith('$ilike:')) {
      condition = `v${idx}.value_text ILIKE :${paramPrefix}_val`;
      params = { ...params, [`${paramPrefix}_val`]: `%${rawValue.slice(7)}%` };
    } else {
      // equality: text, boolean, or dropdown (option_value)
      condition = `(v${idx}.value_text = :${paramPrefix}_val OR v${idx}.value_boolean::text = :${paramPrefix}_val OR EXISTS (SELECT 1 FROM group_field_options o${idx} WHERE o${idx}.id = v${idx}.value_option_id AND o${idx}.option_value = :${paramPrefix}_val))`;
      params = { ...params, [`${paramPrefix}_val`]: rawValue };
    }

    qb.andWhere(
      `EXISTS (
        SELECT 1 FROM product_group_field_values v${idx}
        JOIN group_fields f${idx} ON f${idx}.id = v${idx}.field_id
        WHERE v${idx}.product_id = product.id
          AND f${idx}.field_key = :${paramPrefix}_key
          AND f${idx}.is_filterable = true
          AND ${condition}
      )`,
      params,
    );
  });
}
```

Then call it inside `findAll`:
```typescript
// In findAll(), after building the base qb, before getMany():
if (query.gf && Object.keys(query.gf).length > 0) {
  this.applyGroupFieldFilters(qb, query.gf);
}
```

- [ ] **Step 5: Run all tests — expect PASS**

```bash
npm test -- --forceExit 2>&1 | tail -10
```
Expected: all tests pass (should be 460+ now).

- [ ] **Step 6: Full build check**

```bash
npm run build 2>&1; echo "Exit: $?"
```
Expected: `Exit: 0`

- [ ] **Step 7: Final commit**

```bash
git add src/modules/product/ src/modules/product-group/
git commit -m "feat(product): EAV-based product filter by group field values using WHERE EXISTS subqueries (TDD)"
```

---

## Final Verification

- [ ] **Run complete test suite**

```bash
npm test -- --forceExit 2>&1 | tail -5
```
Expected: `0 failed`

- [ ] **Build clean**

```bash
npm run build 2>&1; echo "Exit: $?"
```
Expected: `Exit: 0`

- [ ] **Commit E2E test files from Phase 5 background agents (if not yet committed)**

```bash
git add nest-backend/test/
git status
git commit -m "test(e2e): add Supertest e2e tests for auth, user, product, product-group modules"
```

---

## Done Checklist

- [ ] `field_key`, `is_filterable` on group_fields + `option_label` on group_field_options
- [ ] `textarea` and `boolean` field types in enum
- [ ] `field_key` immutable after creation
- [ ] `field_type` change blocked if values exist
- [ ] Field deletion blocked if values exist (409 + count)
- [ ] Option deletion blocked if products selected it (409 + count)
- [ ] Bulk upsert: `PUT /products/:id/group-field-values` (all fields, one round-trip)
- [ ] Merged read: `GET /products/:id/group-field-values`
- [ ] Group change protection with `clearFieldValues` flag
- [ ] Product filter `?gf[key]=value` using `WHERE EXISTS` per key
- [ ] All tests passing, build clean
