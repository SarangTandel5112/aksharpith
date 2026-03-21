# Phase 2 Implementation Plan — NestJS Migration (Product Catalog + Lot Matrix)

> Spec: `docs/superpowers/specs/2026-03-21-nestjs-migration-design.md`
> Depends on: Phase 1 complete
> Execution: Use `superpowers:subagent-driven-development` — one subagent per task.

---

## Task 1 — ProductGroup Module (Full TDD)

**Entity:** `product_groups` table
```typescript
@Entity('product_groups')
export class ProductGroup {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'name', length: 150 }) name: string;
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @DeleteDateColumn({ name: 'deleted_at', nullable: true }) deletedAt: Date | null;
  @OneToMany(() => GroupField, (f) => f.group, { cascade: true }) fields: GroupField[];
}
```

**GroupField entity:** `group_fields` table
- `id: uuid PK`, `groupId: uuid FK`, `fieldName: varchar(150)`, `fieldType: enum(text|number|select)`, `isRequired: boolean`, `sortOrder: int default 0`
- Index on `groupId`

**GroupFieldOption entity:** `group_field_options` table
- `id: uuid PK`, `fieldId: uuid FK`, `optionValue: varchar(255)`, `sortOrder: int default 0`
- Index on `fieldId`

**DTOs:**
- `create-product-group.dto.ts`: `name`, `fields?: CreateGroupFieldDto[]`
- `update-product-group.dto.ts`: PartialType
- `query-product-group.dto.ts`: extends PaginationDto + `isActive?`
- `product-group-response.dto.ts`: includes nested fields with options

**Repository methods:**
- `findAll(query)` — paginated, search by name
- `findById(id)` — WITHOUT relations
- `findWithFields(id)` — WITH `fields.options` eager-loaded
- `findByName(name)`
- `create(dto)` — creates group + nested fields + options in transaction
- `update(id, dto)` — updates group metadata only
- `softDelete(id)`

**Service:**
- `findAll`, `findOne(id)`, `findWithFields(id)`, `create`, `update`, `remove`
- Validates name uniqueness → 409

**Controller routes:**
- `GET /product-groups` — `@Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])`
- `GET /product-groups/:id` — returns basic info
- `GET /product-groups/:id/fields` — calls `findWithFields`, returns nested fields + options
- `POST /product-groups` — `@Roles([ROLE.ADMIN])`
- `PATCH /product-groups/:id` — `@Roles([ROLE.ADMIN])`
- `DELETE /product-groups/:id` — `@Roles([ROLE.ADMIN])`

**Tests — must cover:**
- `findAll`: pagination, search by name, filter isActive, sort
- `findWithFields`: returns nested fields with options
- `findWithFields`: throws 404 when group not found
- `create`: success with nested fields
- `create`: 409 on duplicate name
- `update`: 404 when not found
- `softDelete`: sets deletedAt, excluded from findAll

**Commit:** `feat(product-group): complete ProductGroup module with GroupField, GroupFieldOption, full TDD`

---

## Task 2 — Product Module (Full TDD)

**Entity:** `products` table
```typescript
@Entity('products')
@Index(['sku'], { unique: true, where: '"deleted_at" IS NULL' })
export class Product {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'name', length: 255 }) name: string;
  @Column({ name: 'sku', length: 100, unique: true }) sku: string;
  @Column({ name: 'description', type: 'text', nullable: true }) description: string | null;
  @Column({ name: 'product_type', type: 'enum', enum: ProductType }) productType: ProductType;
  @Column({ name: 'base_price', type: 'decimal', precision: 12, scale: 2 }) basePrice: number;
  @Column({ name: 'stock_quantity', type: 'int', default: 0 }) stockQuantity: number;
  @Column({ name: 'department_id', nullable: true }) departmentId: string | null;
  @ManyToOne(() => Department, { nullable: true }) @JoinColumn({ name: 'department_id' }) department: Department;
  @Column({ name: 'sub_category_id', nullable: true }) subCategoryId: string | null;
  @ManyToOne(() => SubCategory, { nullable: true }) @JoinColumn({ name: 'sub_category_id' }) subCategory: SubCategory;
  @Column({ name: 'group_id', nullable: true }) groupId: string | null;
  @ManyToOne(() => ProductGroup, { nullable: true }) @JoinColumn({ name: 'group_id' }) group: ProductGroup;
  @Column({ name: 'item_inactive', type: 'boolean', default: false }) itemInactive: boolean;
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @DeleteDateColumn({ name: 'deleted_at', nullable: true }) deletedAt: Date | null;
  // Relations:
  @OneToMany(() => ProductMedia, (m) => m.product) media: ProductMedia[];
  @OneToMany(() => ProductVariant, (v) => v.product) variants: ProductVariant[];
}
```

**ProductType enum:** `simple | variable | digital | service`

**Sub-resource entities (same file or separate):**
- `ProductMedia`: `id, productId FK, url, mediaType enum(image|video), sortOrder, isPrimary`
- `ProductMarketingMedia`: `id, productId FK, url, mediaType, sortOrder`
- `ProductPhysicalAttributes`: `id, productId FK unique, weight, length, width, height`
- `ProductZone`: `id, productId FK, zoneId, zoneName`
- `ProductVendor`: `id, productId FK, vendorId, vendorName, costPrice`
- `ProductGroupFieldValue`: `id, productId FK, fieldId FK, valueText nullable, valueOptionId FK nullable (SET NULL)`

**DTOs:**
- `create-product.dto.ts`: all product fields
- `update-product.dto.ts`: PartialType
- `query-product.dto.ts`: extends PaginationDto + `departmentId?`, `subCategoryId?`, `groupId?`, `productType?`, `isActive?`, `itemInactive?`, `minPrice?`, `maxPrice?`, `minStock?`
- `product-response.dto.ts`: all @Expose() fields

**Repository — `findAll(query)` must apply:**
- `search`: ILike on name + sku
- `departmentId` filter
- `subCategoryId` filter
- `groupId` filter
- `productType` filter
- `isActive` filter
- `itemInactive` filter
- `basePrice BETWEEN minPrice AND maxPrice`
- `stockQuantity >= minStock`
- Pagination + sort

**Controller routes:**
- `GET /products` — list with all filters
- `GET /products/stats/count` — returns count by productType
- `GET /products/:id` — with relations
- `POST /products`
- `PATCH /products/:id`
- `DELETE /products/:id`
- Sub-resources: `POST/GET /products/:id/media`, `DELETE /products/:id/media/:mediaId`
- `POST/GET/DELETE /products/:id/marketing-media`
- `PUT /products/:id/physical-attributes`
- `POST/GET/DELETE /products/:id/zones`
- `POST/GET/DELETE /products/:id/vendors`
- `POST/GET/PATCH/DELETE /products/:id/group-field-values`

**Tests — must cover:**
- All query filters individually and combined
- Price range filter: minPrice only, maxPrice only, both
- Stock filter
- Stats count endpoint
- Sub-resource CRUD
- 404 when productId not found for sub-resource
- 404 when departmentId/subCategoryId not found on create/update
- SKU uniqueness → 409

**Commit:** `feat(product): complete Product module with all sub-resources, full TDD`

---

## Task 3 — ProductAttribute Module (Full TDD)

**Entities:**

```typescript
@Entity('product_attributes')
export class ProductAttribute {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'name', length: 150 }) name: string;
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @DeleteDateColumn({ name: 'deleted_at', nullable: true }) deletedAt: Date | null;
  @OneToMany(() => ProductAttributeValue, (v) => v.attribute) values: ProductAttributeValue[];
}

@Entity('product_attribute_values')
export class ProductAttributeValue {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'attribute_id' }) attributeId: string;
  @ManyToOne(() => ProductAttribute, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'attribute_id' }) attribute: ProductAttribute;
  @Column({ name: 'value', length: 255 }) value: string;
  @Column({ name: 'sort_order', type: 'int', default: 0 }) sortOrder: number;
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @DeleteDateColumn({ name: 'deleted_at', nullable: true }) deletedAt: Date | null;
}
```

**Index:** unique partial on `(attribute_id, value)` where deleted_at IS NULL

**DTOs:**
- `create-product-attribute.dto.ts`: `name`, `values?: CreateAttributeValueDto[]`
- `update-product-attribute.dto.ts`: PartialType
- `query-product-attribute.dto.ts`: extends PaginationDto + `isActive?`
- `attribute-response.dto.ts`: includes nested values

**Repository:**
- `findAll(query)` — paginated
- `findById(id)` — without relations
- `findWithValues(id)` — WITH values relation
- `findByName(name)`
- `create(dto)` — creates attribute + values in transaction
- `update(id, dto)`
- `softDelete(id)`
- `addValue(attributeId, dto)`, `updateValue(valueId, dto)`, `removeValue(valueId)`

**Service:** validates name uniqueness, validates attributeId exists for value operations

**Controller routes:**
- `GET/POST /product-attributes`
- `GET/PATCH/DELETE /product-attributes/:id`
- `GET /product-attributes/:id/values` — returns attribute with all values
- `POST /product-attributes/:id/values` — add value
- `PATCH /product-attributes/:id/values/:valueId`
- `DELETE /product-attributes/:id/values/:valueId`

**Tests — must cover:**
- Paginated list, search, isActive filter
- findWithValues returns nested values
- create with nested values in one transaction
- add/update/delete individual values
- 409 on duplicate (attribute_id, value)
- 404 on missing attribute or value

**Commit:** `feat(product-attribute): complete ProductAttribute module with values CRUD, full TDD`

---

## Task 4 — ProductVariant Module + Lot Matrix (Full TDD)

**Entities:**

```typescript
@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'product_id' }) productId: string;
  @ManyToOne(() => Product, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'product_id' }) product: Product;
  @Column({ name: 'sku', length: 100 }) sku: string;
  @Column({ name: 'price', type: 'decimal', precision: 12, scale: 2 }) price: number;
  @Column({ name: 'stock_quantity', type: 'int', default: 0 }) stockQuantity: number;
  @Column({ name: 'combination_hash', type: 'varchar', length: 500 }) combinationHash: string;
  @Column({ name: 'is_deleted', type: 'boolean', default: false }) isDeleted: boolean;  // business hide
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @DeleteDateColumn({ name: 'deleted_at', nullable: true }) deletedAt: Date | null;
  @OneToMany(() => ProductVariantAttribute, (va) => va.variant, { cascade: true }) variantAttributes: ProductVariantAttribute[];
  @OneToMany(() => ProductVariantMedia, (m) => m.variant) media: ProductVariantMedia[];
}
```

```typescript
@Entity('product_variant_attributes')
export class ProductVariantAttribute {
  @PrimaryColumn({ name: 'variant_id' }) variantId: string;
  @PrimaryColumn({ name: 'attribute_id' }) attributeId: string;
  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'variant_id' }) variant: ProductVariant;
  @ManyToOne(() => ProductAttribute) @JoinColumn({ name: 'attribute_id' }) attribute: ProductAttribute;
  @Column({ name: 'attribute_value_id' }) attributeValueId: string;
  @ManyToOne(() => ProductAttributeValue) @JoinColumn({ name: 'attribute_value_id' }) attributeValue: ProductAttributeValue;
}
```

**`combinationHash` algorithm:**
```typescript
export function buildCombinationHash(attributeValueIds: string[]): string {
  return [...attributeValueIds].sort().join('_');
}
```
Sorts UUIDs lexicographically, joins with `_`. Stored as `varchar(500)`.

**DTOs:**
- `generate-lot-matrix.dto.ts`:
  ```typescript
  export class GenerateLotMatrixDto {
    @IsUUID('4', { each: true }) @ArrayMinSize(1) attributeIds: string[];
  }
  ```
- `create-product-variant.dto.ts`: `sku`, `price`, `stockQuantity`, `attributeValueIds: string[]`
- `update-product-variant.dto.ts`: PartialType (price, stockQuantity, isActive, isDeleted)
- `query-product-variant.dto.ts`: `productId`, `isActive?`, `isDeleted?`, pagination
- `variant-response.dto.ts`: all @Expose() fields + nested attributes

**Repository:**
- `findAll(query)` — paginated, filter by productId, isActive, isDeleted
- `findById(id)` — with variantAttributes.attributeValue
- `findByCombinationHash(productId, hash)` — check duplicate combination
- `create(dto)` — creates variant + variantAttributes, computes hash
- `update(id, dto)` — price/stock/isActive/isDeleted only
- `softDelete(id)` — sets deletedAt
- `bulkCreate(variants)` — creates all matrix combinations

**Service:**
```typescript
// Lot Matrix generation
async generateMatrix(productId: string, dto: GenerateLotMatrixDto): Promise<VariantResponseDto[]> {
  // 1. Load all ProductAttributeValues for given attributeIds
  // 2. Build cartesian product of value groups
  // 3. For each combination: compute hash, check if exists
  //    - If exists and not deleted: skip (already in matrix)
  //    - If exists and isDeleted: restore (set isDeleted=false)
  //    - If not exists: create new variant
  // 4. Return all variants for this product
}
```

**Controller routes:**
- `GET /products/:productId/variants` — list with isActive/isDeleted filters
- `GET /products/:productId/variants/:id`
- `POST /products/:productId/variants` — create single
- `POST /products/:productId/variants/generate-matrix` — Lot Matrix generation
- `PATCH /products/:productId/variants/:id`
- `DELETE /products/:productId/variants/:id`
- Sub: `POST/GET/DELETE /products/:productId/variants/:id/media`

**Tests — must cover:**

*Repository:*
- `findAll`: pagination, isActive filter, isDeleted filter
- `findByCombinationHash`: returns variant when hash matches
- `create`: saves variant + variantAttributes atomically
- Hash is computed correctly: sorted UUIDs joined with `_`
- Duplicate hash → 409

*Service:*
- `generateMatrix`: creates all cartesian combinations
- `generateMatrix`: skips existing (non-deleted) combinations
- `generateMatrix`: restores soft-deleted combinations
- `generateMatrix`: 2 attributes × 3 values each = 6 variants created
- `generateMatrix`: 3 attributes × 2 values each = 8 variants created
- `generateMatrix`: throws 404 if productId not found
- `generateMatrix`: throws 404 if any attributeId not found

*Controller:*
- Returns variants list for productId
- Generates matrix successfully
- Propagates errors from service

**Commit:** `feat(product-variant): complete ProductVariant module with Lot Matrix generation, full TDD`

---

## Task 5 — AppModule Wiring + Full Build Verification

**Modify** `src/app.module.ts`:
- Import: `ProductGroupModule`, `ProductModule`, `ProductAttributeModule`, `ProductVariantModule`

**Run full test suite:**
```bash
cd nest-backend
npm run test -- --coverage
npm run build
```

**Fix any remaining issues.**

**Commit:** `feat(app): wire Phase 2 modules, verify all tests pass with coverage`

---

## Phase 2 Done Checklist

- [ ] ProductGroup: entity + GroupField + GroupFieldOption — all specs green
- [ ] ProductGroup: `findWithFields` returns nested fields+options
- [ ] Product: entity + all 6 sub-resource entities
- [ ] Product: `findAll` applies all 9 filters correctly
- [ ] Product: stats count endpoint
- [ ] Product: sub-resource CRUD endpoints
- [ ] ProductAttribute: entity + ProductAttributeValue
- [ ] ProductAttribute: values CRUD sub-resource
- [ ] ProductVariant: entity + ProductVariantAttribute + ProductVariantMedia
- [ ] `buildCombinationHash`: sorts UUIDs, joins with `_`
- [ ] Lot Matrix: cartesian product generation
- [ ] Lot Matrix: skip existing, restore deleted
- [ ] `isDeleted` exception documented and implemented
- [ ] `npm run build` passes 0 errors
- [ ] `npm run test --coverage` passes 0 failures
