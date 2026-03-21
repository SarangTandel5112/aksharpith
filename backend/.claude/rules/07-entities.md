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
