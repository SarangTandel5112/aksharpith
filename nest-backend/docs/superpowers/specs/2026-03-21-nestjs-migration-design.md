# NestJS Migration Design Spec

> **For agentic workers:** Use `superpowers:subagent-driven-development` to implement this spec via the implementation plan.

**Goal:** Migrate the existing Express.js backend to NestJS using the existing boilerplate, with UUID PKs, soft deletes (`isActive` + `deletedAt`), full RBAC, request/response DTOs, and in-depth test coverage.

**Architecture:** Port all 10 Express modules into NestJS DI/module system following boilerplate patterns. Reuse all business logic, validation, and Lot Matrix generation. Split into two phases: Phase 1 (core infra + auth/role/user/department/category/sub-category) and Phase 2 (product/product-group/product-attribute/product-variant).

**Tech Stack:** NestJS 10, TypeORM 0.3, PostgreSQL 16, Passport JWT + Local, class-validator, class-transformer, Winston, Swagger, Jest

**Verified against:** NestJS official docs via Context7 (2026-03-21)

---

## Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| PK type | `uuid` (`@PrimaryGeneratedColumn('uuid')`) | Boilerplate already uses uuid, globally unique, no sequential leak |
| Soft delete | `@DeleteDateColumn` (`deletedAt`) | TypeORM native, automatic exclusion from queries |
| Business deactivation | `isActive: boolean` | Separate from deletion — products/departments can be inactive without being deleted |
| Schema management | Single migration file, `synchronize: false` always | Safe, verified, production-ready |
| RBAC | `@Roles()` decorator + `RolesGuard` + `JwtAuthGuard` | Full role-based access control per endpoint |
| Response shape | `DataResponse<T>` / `MessageResponse` via `ResponseTransformer` interceptor | Consistent response envelope from boilerplate |
| Request validation | Global `ValidationPipe` (transform, whitelist, forbidNonWhitelisted) | Already in CoreModule |
| Serialization | Global `ClassSerializerInterceptor` + Response DTOs with `@Expose()` | NestJS recommended pattern |
| Testing | Jest unit tests per module (repository + service + controller) | Fast, no Docker needed |

---

## Folder Structure

```
nest-backend/src/
  config/                         # server, database, token, authkey (existing)
  core/
    core.module.ts                # Add ClassSerializerInterceptor to APP_INTERCEPTOR
    decorators/
      user.decorator.ts           # @GetUser() (existing)
      roles.decorator.ts          # @Roles() using Reflector.createDecorator<string[]>()
    guards/
      roles.guard.ts              # RolesGuard — reads @Roles() metadata, checks user.role.roleName
    http/
      response.ts                 # StatusCode, MessageResponse, DataResponse (existing)
      request.ts                  # (existing)
      header.ts                   # (existing)
    interceptors/                 # (existing)
  security/                       # JWT + Local strategies, guards (existing)
  setup/                          # DatabaseFactory, WinstonLogger (existing)
  utils/
    constants.ts                  # PostgresErrorCode (existing) + ROLE const
    helpers.ts                    # (existing)

  common/
    dto/
      pagination.dto.ts           # PaginationDto base (page, limit, sortBy, order, search)
      paginated-response.dto.ts   # PaginatedResponseDto<T> (items, total, page, limit, totalPages)

  modules/
    role/
      entities/role.entity.ts
      dto/
        create-role.dto.ts
        update-role.dto.ts
        query-role.dto.ts
        role-response.dto.ts
      spec/
        role.repository.spec.ts
        role.service.spec.ts
        role.controller.spec.ts
      role.repository.ts
      role.service.ts
      role.controller.ts
      role.module.ts

    user/                         # Extend existing boilerplate
      entities/user.entity.ts     # Extend: add isActive, deletedAt, Firstname, Middlename, Lastname, roleId FK
      dto/
        create-user.dto.ts
        update-user.dto.ts
        query-user.dto.ts
        user-response.dto.ts      # @Exclude() on password
      spec/
        user.repository.spec.ts   # Extend existing (currently placeholder)
        user.service.spec.ts      # Extend existing (currently placeholder)
        user.controller.spec.ts   # Extend existing (currently placeholder)
      user.repository.ts          # Extend: add findAll (paginated), softDelete
      user.service.ts             # Extend: add findAll, remove
      user.controller.ts          # Extend: add pagination, RBAC guards
      user.module.ts              # (existing, extend imports)

    auth/
      entities/
        password-reset-token.entity.ts  # uuid PK, userId: uuid FK → users
      dto/
        signup.dto.ts             # IMPORTANT: rename Firstname/Middlename/Lastname → firstName/middleName/lastName to match User entity
        signin.dto.ts             # (existing, extend)
        auth-response.dto.ts      # accessToken response shape
      spec/
        auth.service.spec.ts      # Extend existing (currently placeholder)
        auth.controller.spec.ts
      auth.service.ts             # (existing, extend)
      auth.controller.ts          # (existing, extend)
      auth.module.ts              # (existing)

    department/
      entities/department.entity.ts
      dto/
        create-department.dto.ts
        update-department.dto.ts
        query-department.dto.ts
        department-response.dto.ts
      spec/
        department.repository.spec.ts
        department.service.spec.ts
        department.controller.spec.ts
      department.repository.ts
      department.service.ts
      department.controller.ts
      department.module.ts

    category/
      entities/product-category.entity.ts
      dto/
        create-category.dto.ts
        update-category.dto.ts
        query-category.dto.ts
        category-response.dto.ts
      spec/ ...
      category.repository.ts
      category.service.ts
      category.controller.ts
      category.module.ts

    sub-category/
      entities/sub-category.entity.ts
      dto/ ...
      spec/ ...
      sub-category.repository.ts
      sub-category.service.ts
      sub-category.controller.ts
      sub-category.module.ts

    # Phase 2
    product-group/
      entities/
        product-group.entity.ts
        group-field.entity.ts
        group-field-option.entity.ts
      dto/ ...
      spec/ ...
      product-group.repository.ts
      product-group.service.ts
      product-group.controller.ts
      product-group.module.ts

    product/
      entities/
        product.entity.ts
        product-media.entity.ts
        product-marketing-media.entity.ts
        product-physical-attributes.entity.ts
        product-zone.entity.ts
        product-vendor.entity.ts
        product-group-field-value.entity.ts
      dto/
        create-product.dto.ts
        update-product.dto.ts
        query-product.dto.ts
        product-response.dto.ts
        # sub-resource DTOs inline
      spec/ ...
      product.repository.ts
      product-media.repository.ts
      product-marketing-media.repository.ts
      product-physical-attributes.repository.ts
      product-zone.repository.ts
      product-vendor.repository.ts
      product-group-field-value.repository.ts
      product.service.ts
      product.controller.ts
      product.module.ts

    product-attribute/
      entities/
        product-attribute.entity.ts
        product-attribute-value.entity.ts
      dto/ ...
      spec/ ...
      product-attribute.repository.ts
      product-attribute-value.repository.ts
      product-attribute.service.ts
      product-attribute.controller.ts
      product-attribute.module.ts

    product-variant/
      entities/
        product-variant.entity.ts
        product-variant-attribute.entity.ts
        product-variant-media.entity.ts
      dto/ ...
      spec/ ...
      combination-hash.ts
      product-variant.repository.ts
      product-variant.service.ts
      product-variant.controller.ts
      product-variant.module.ts

  migrations/
    1_init_schema.ts              # Single migration — full schema, all tables, all indexes

  app.module.ts                   # Register all modules
  main.ts                         # (existing)
```

---

## Entities

### Soft Delete + isActive Convention (all entities except join tables)
```typescript
@Column({ name: 'is_active', type: 'boolean', default: true })
isActive: boolean;

@DeleteDateColumn({ name: 'deleted_at', nullable: true })
deletedAt: Date | null;
```
- `softDelete({ id })` → sets `deletedAt`, auto-excluded from all future queries
- `update({ id }, { isActive: false })` → business deactivation
- `withDeleted()` → include soft-deleted in admin queries if needed

### UUID FK Convention
All `id` columns: `@PrimaryGeneratedColumn('uuid')` → TypeScript type `string`
All FK columns: `@Column({ name: '...', type: 'uuid' })` + `@Index()`

### Entity Definitions

#### `UserRole`
```typescript
@Entity('user_roles')
@Index('idx_role_active', ['isActive'])
export class UserRole {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'role_name', type: 'varchar', length: 50, unique: true })
  @Index('uq_role_name', { unique: true }) roleName: string;
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', nullable: true }) updatedAt: Date | null;
  @DeleteDateColumn({ name: 'deleted_at', nullable: true }) deletedAt: Date | null;
  @OneToMany(() => User, (user) => user.role) users: User[];
}
```

#### `User`
```typescript
@Entity('users')
@Index('idx_user_active_role', ['isActive', 'roleId'])
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', unique: true })
  @Index('uq_username', { unique: true }) username: string;
  @Column({ name: 'first_name', type: 'varchar' }) firstName: string;
  @Column({ name: 'middle_name', type: 'varchar', nullable: true }) middleName: string | null;
  @Column({ name: 'last_name', type: 'varchar' }) lastName: string;
  @Column({ type: 'varchar', unique: true })
  @Index('uq_email', { unique: true }) email: string;
  @Column({ type: 'varchar' }) @Exclude() password: string;
  @Column({ name: 'is_temp_password', type: 'boolean', default: true }) isTempPassword: boolean;
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive: boolean;
  @Column({ name: 'role_id', type: 'uuid' })
  @Index('idx_user_role') roleId: string;
  @ManyToOne(() => UserRole, (role) => role.users) @JoinColumn({ name: 'role_id' }) role: UserRole;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', nullable: true }) updatedAt: Date | null;
  @DeleteDateColumn({ name: 'deleted_at', nullable: true }) deletedAt: Date | null;
}
```

#### `Department`
```typescript
@Entity('departments')
@Index('idx_dept_active', ['isActive', 'deletedAt'])
export class Department {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'department_name', type: 'varchar', length: 100, unique: true })
  @Index('uq_department_name', { unique: true }) departmentName: string;
  @Column({ name: 'department_code', type: 'varchar', length: 10, unique: true, nullable: true })
  @Index('uq_department_code', { unique: true }) departmentCode: string | null;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' })
  @Index('idx_dept_created') createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', nullable: true }) updatedAt: Date | null;
  @DeleteDateColumn({ name: 'deleted_at', nullable: true }) deletedAt: Date | null;
  @OneToMany(() => ProductCategory, (category) => category.department) categories: ProductCategory[];
}
```

#### `ProductCategory`
```typescript
@Entity('product_categories')
@Index('idx_cat_dept_active', ['departmentId', 'isActive'])
export class ProductCategory {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'category_name', type: 'varchar', length: 100, unique: true })
  @Index('uq_category_name', { unique: true }) categoryName: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ type: 'varchar', length: 255, nullable: true }) photo: string | null;
  @Column({ name: 'department_id', type: 'uuid' })
  @Index('idx_category_department') departmentId: string;
  @ManyToOne(() => Department, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'department_id' }) department: Department;
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', nullable: true }) updatedAt: Date | null;
  @DeleteDateColumn({ name: 'deleted_at', nullable: true }) deletedAt: Date | null;
  @OneToMany(() => SubCategory, (sub) => sub.category) subCategories: SubCategory[];
}
```

#### `SubCategory`
```typescript
@Entity('sub_categories')
@Index('uq_cat_subcat_name', ['categoryId', 'subCategoryName'], { unique: true })
@Index('idx_subcat_cat_active_order', ['categoryId', 'isActive', 'displayOrder'])
export class SubCategory {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'sub_category_name', type: 'varchar', length: 100 }) subCategoryName: string;
  @Column({ name: 'category_id', type: 'uuid' })
  @Index('idx_subcat_category') categoryId: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ type: 'varchar', length: 255, nullable: true }) photo: string | null;
  @Column({ name: 'display_order', type: 'int', default: 0 }) displayOrder: number;
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive: boolean;
  @ManyToOne(() => ProductCategory, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }) @JoinColumn({ name: 'category_id' }) category: ProductCategory;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', nullable: true }) updatedAt: Date | null;
  @DeleteDateColumn({ name: 'deleted_at', nullable: true }) deletedAt: Date | null;
  @OneToMany(() => Product, (product) => product.subCategory) products: Product[];
}
```

#### `PasswordResetToken`
Belongs in the `auth` module. uuid PK, `userId: uuid FK → users`, `token: varchar`, `expiresAt: timestamp`. No `isActive` / `deletedAt` — tokens are hard-deleted on use or expiry.
```typescript
@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id', type: 'uuid' })
  @Index('idx_prt_user') userId: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'user_id' }) user: User;
  @Column({ type: 'varchar' }) token: string;
  @Column({ name: 'expires_at', type: 'timestamp' }) expiresAt: Date;
  @Index('idx_prt_token') // for token lookup during reset
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
```

#### Phase 2 Entities (Product Group / Product / Variants / Attributes)
All follow the same UUID + `isActive` + `deletedAt` pattern unless noted below.

- `ProductGroup`: uuid PK, `groupName` unique, `isActive`, `deletedAt`
- `GroupField`: uuid PK, `groupId: uuid FK`, composite unique `[groupId, fieldKey]`
- `GroupFieldOption`: uuid PK, `fieldId: uuid FK`, composite unique `[fieldId, optionValue]`
- `Product`: uuid PK, all FK columns uuid, `productCode` unique, `upcCode` unique, `productType` varchar default 'Standard', `isActive`, `deletedAt`; composite indexes: `[departmentId, subCategoryId]`, `[productType, isActive]`, `[subCategoryId, isActive]`
- `ProductAttribute`: uuid PK, `productId: uuid FK`, composite unique `[productId, attributeCode]`, has `isActive` and `deletedAt`
- `ProductAttributeValue`: uuid PK, `attributeId: uuid FK`, composite unique `[attributeId, valueCode]`, has `isActive` and `deletedAt`
- `ProductVariant`: uuid PK, `productId: uuid FK`, `sku` unique, `combinationHash varchar(500)` (enlarged for UUID-based hashes — UUID IDs produce ~73 chars per 2-attr combo vs integers), **EXCEPTION to soft-delete convention**: uses `isDeleted: boolean` (business flag to hide variant from inventory without removing its combination hash from the matrix) AND `@DeleteDateColumn deletedAt` for audit. `isActive: boolean` for business activation. Composite unique `[productId, combinationHash]`.
- `ProductVariantAttribute`: join table, composite PK **`[variantId, attributeId]`** (NOT attributeValueId), `attributeValueId` is a regular FK column. NO `isActive`, NO `deletedAt`.
- `ProductGroupFieldValue`: uuid PK, `productId: uuid FK`, `fieldId: uuid FK`, `valueOptionId: uuid FK → group_field_options (nullable, SET NULL on delete)`, `valueText`, `valueNumber`, `valueBoolean` columns, composite unique `[productId, fieldId]`, `isActive`, `updatedAt`. **Three FK columns total.**
- `ProductPhysicalAttributes`: uuid PK, `productId: uuid FK`. **EXCEPTION**: no `isActive` column (this is a 1-to-many detail record, not a business entity that gets deactivated). Still gets `deletedAt`.
- Sub-resource entities (media, marketing-media, zones, vendors, variant-media): uuid PKs, `productId: uuid FK`, no `isActive`/`deletedAt` (replaced/recreated on update).

#### Combination Hash UUID Awareness
The Express `buildCombinationHash` sorts IDs and joins with `_`. With UUID PKs, IDs are 36-char strings. Three attributes = `36+1+36+1+36 = 110` chars, four = 147. To be safe, `combinationHash` column uses `varchar(500)`. Alternatively, use SHA-256 of sorted UUIDs for a fixed 64-char hash — implementor may choose either but must document the choice. The `combination-hash.ts` utility stays the same code, works lexicographically on UUID strings.

---

## QueryProductDto (explicit — more complex than other modules)

```typescript
export class QueryProductDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() subCategoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() groupId?: string;
  @ApiPropertyOptional({ enum: ['Standard', 'Lot Matrix'] })
  @IsOptional() @IsIn(['Standard', 'Lot Matrix']) productType?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === 'true') @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === 'true') @IsBoolean() itemInactive?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) minPrice?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) maxPrice?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) minStock?: number;
}
```

## Common DTOs

### `PaginationDto` (shared base)
```typescript
// common/dto/pagination.dto.ts
export class PaginationDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @ApiPropertyOptional({ default: 1 })
  page: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) @ApiPropertyOptional({ default: 10 })
  limit: number = 10;

  @IsOptional() @IsString() @ApiPropertyOptional({ default: 'createdAt' })
  sortBy: string = 'createdAt';

  @IsOptional() @IsIn(['ASC', 'DESC']) @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  order: 'ASC' | 'DESC' = 'DESC';

  @IsOptional() @IsString() @ApiPropertyOptional()
  search?: string;
}
```

### `PaginatedResponseDto<T>` (shared response)
```typescript
// common/dto/paginated-response.dto.ts
export class PaginatedResponseDto<T> {
  @ApiProperty() items: T[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
}
```

---

## DTO Pattern Per Module

Each module has exactly 4 DTO files:

### Request DTOs
```typescript
// create-department.dto.ts
export class CreateDepartmentDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(100) departmentName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(10) departmentCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

// update-department.dto.ts
export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}

// query-department.dto.ts
export class QueryDepartmentDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === 'true') @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsString()
  departmentCode?: string;
}
```

### Response DTOs
```typescript
// department-response.dto.ts
export class DepartmentResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() departmentName: string;
  @ApiProperty() @Expose() departmentCode: string | null;
  @ApiProperty() @Expose() description: string | null;
  @ApiProperty() @Expose() isActive: boolean;
  @ApiProperty() @Expose() createdAt: Date;
  @ApiProperty() @Expose() updatedAt: Date | null;

  constructor(partial: Partial<DepartmentResponseDto>) {
    Object.assign(this, partial);
  }
}
// Note: deletedAt is NOT @Expose() — never included in response
```

---

## Repository Pattern

```typescript
@Injectable()
export class DepartmentRepository {
  private readonly logger = new Logger(DepartmentRepository.name);

  constructor(
    @InjectRepository(Department)
    private readonly repo: Repository<Department>,
  ) {}

  async findAll(query: QueryDepartmentDto): Promise<PaginatedResponseDto<DepartmentResponseDto>> {
    const { page, limit, sortBy, order, search, isActive, departmentCode } = query;
    const where: FindOptionsWhere<Department> = {};
    if (search) where.departmentName = ILike(`%${search}%`);
    if (isActive !== undefined) where.isActive = isActive;
    if (departmentCode) where.departmentCode = departmentCode;

    try {
      const [items, total] = await this.repo.findAndCount({
        where,
        order: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      });
      return {
        items: items.map(e => new DepartmentResponseDto(e)),
        total, page, limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error('Failed to fetch departments', error.stack);
      throw new InternalServerErrorException('Failed to fetch departments');
    }
  }

  async findById(id: string): Promise<Department> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException(`Department not found`);
      return entity;
    } catch (error) {
      throw error instanceof NotFoundException ? error : new InternalServerErrorException(error.message);
    }
  }

  async create(dto: CreateDepartmentDto): Promise<Department> {
    try {
      const entity = this.repo.create(dto);
      return await this.repo.save(entity);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async update(id: string, dto: UpdateDepartmentDto): Promise<Department> {
    try {
      await this.repo.update({ id }, dto);
      return this.findById(id);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      const result = await this.repo.softDelete({ id });
      if (!result.affected) throw new NotFoundException(`Department not found`);
    } catch (error) {
      throw error instanceof NotFoundException ? error : new InternalServerErrorException(error.message);
    }
  }

  async findByName(name: string): Promise<Department | null> {
    return this.repo.findOne({ where: { departmentName: name } });
  }

  async findByCode(code: string): Promise<Department | null> {
    return this.repo.findOne({ where: { departmentCode: code } });
  }

  private handleDbError(error: any): never {
    if (error?.code === PostgresErrorCode.UNIQUE_VIOLATION) {
      const detail = error.detail?.toLowerCase() || '';
      if (detail.includes('department_name')) throw new ConflictException('Department name already exists');
      if (detail.includes('department_code')) throw new ConflictException('Department code already exists');
      throw new ConflictException('Duplicate value violates unique constraint');
    }
    if (error?.code === PostgresErrorCode.FOREIGN_KEY_VIOLATION) {
      throw new ConflictException('Cannot delete: referenced by other records');
    }
    throw new InternalServerErrorException(error.message);
  }
}
```

---

## Service Pattern

```typescript
@Injectable()
export class DepartmentService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  async findAll(query: QueryDepartmentDto): Promise<PaginatedResponseDto<DepartmentResponseDto>> {
    return this.departmentRepository.findAll(query);
  }

  async findOne(id: string): Promise<DepartmentResponseDto> {
    const entity = await this.departmentRepository.findById(id);
    return new DepartmentResponseDto(entity);
  }

  async create(dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    const byName = await this.departmentRepository.findByName(dto.departmentName);
    if (byName) throw new ConflictException(`Department name '${dto.departmentName}' already exists`);
    if (dto.departmentCode) {
      const byCode = await this.departmentRepository.findByCode(dto.departmentCode);
      if (byCode) throw new ConflictException(`Department code '${dto.departmentCode}' already exists`);
    }
    const entity = await this.departmentRepository.create(dto);
    return new DepartmentResponseDto(entity);
  }

  async update(id: string, dto: UpdateDepartmentDto): Promise<DepartmentResponseDto> {
    const existing = await this.departmentRepository.findById(id);
    if (dto.departmentName && dto.departmentName !== existing.departmentName) {
      const byName = await this.departmentRepository.findByName(dto.departmentName);
      if (byName) throw new ConflictException(`Department name '${dto.departmentName}' already exists`);
    }
    if (dto.departmentCode && dto.departmentCode !== existing.departmentCode) {
      const byCode = await this.departmentRepository.findByCode(dto.departmentCode);
      if (byCode) throw new ConflictException(`Department code '${dto.departmentCode}' already exists`);
    }
    const entity = await this.departmentRepository.update(id, dto);
    return new DepartmentResponseDto(entity);
  }

  async remove(id: string): Promise<MessageResponse> {
    await this.departmentRepository.softDelete(id);
    return new MessageResponse(StatusCode.SUCCESS, 'Department deleted successfully');
  }
}
```

---

## Controller Pattern

```typescript
@ApiBearerAuth()
@ApiTags('Departments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @Roles(['Admin', 'Staff'])
  @ApiOperation({ summary: 'List departments with pagination, search, and filters' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  findAll(@Query() query: QueryDepartmentDto): Promise<PaginatedResponseDto<DepartmentResponseDto>> {
    return this.departmentService.findAll(query);
  }

  @Get(':id')
  @Roles(['Admin', 'Staff'])
  @ApiResponse({ status: 404, description: 'Department not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DepartmentResponseDto> {
    return this.departmentService.findOne(id);
  }

  @Post()
  @Roles(['Admin'])
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 409, description: 'Department name/code already exists' })
  create(@Body() dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    return this.departmentService.create(dto);
  }

  @Patch(':id')
  @Roles(['Admin'])
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    return this.departmentService.update(id, dto);
  }

  @Delete(':id')
  @Roles(['Admin'])
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<MessageResponse> {
    return this.departmentService.remove(id);
  }
}
```

---

## RBAC

### Roles Constant
```typescript
// utils/constants.ts
export const ROLE = {
  ADMIN: 'Admin',
  STAFF: 'Staff',
  VIEWER: 'Viewer',
} as const;
export type RoleType = (typeof ROLE)[keyof typeof ROLE];
```

### Roles Decorator
```typescript
// core/decorators/roles.decorator.ts
import { Reflector } from '@nestjs/core';
export const Roles = Reflector.createDecorator<string[]>();
```

### RolesGuard
```typescript
// core/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles || roles.length === 0) return true; // No roles = public
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user?.role?.roleName) throw new ForbiddenException('Access denied');
    return roles.includes(user.role.roleName);
  }
}
```

### JwtStrategy — load role relation
```typescript
async validate(payload: any) {
  const user = await this.usersRepo.getUserById(payload.id);
  // user loaded with relations: ['role'] so RolesGuard can check user.role.roleName
  if (!user) throw new UnauthorizedException('Unauthorized');
  return user;
}
```

---

## CoreModule Updates

```typescript
@Module({
  imports: [ConfigModule],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformer },
    { provide: APP_INTERCEPTOR, useClass: ResponseValidation },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor }, // NEW
    { provide: APP_FILTER, useClass: ExceptionHandler },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    },
    WinstonLogger,
  ],
  exports: [WinstonLogger],
})
export class CoreModule {}
```

---

## Migration Strategy

Single file: `src/migrations/1_init_schema.ts`

Creation order (respects FK dependencies):
1. `user_roles`
2. `users` (FK → user_roles)
3. `password_reset_tokens` (FK → users, hard-delete table)
4. `departments`
5. `product_categories` (FK → departments)
6. `sub_categories` (FK → product_categories)
7. `product_groups`
8. `group_fields` (FK → product_groups)
9. `group_field_options` (FK → group_fields)
10. `products` (FK → departments, sub_categories, product_groups)
11. `product_media` (FK → products)
12. `product_marketing_media` (FK → products)
13. `product_physical_attributes` (FK → products)
14. `product_zones` (FK → products)
15. `product_vendors` (FK → products)
16. `product_group_field_values` (FK → products, group_fields, group_field_options [nullable SET NULL])
17. `product_attributes` (FK → products)
18. `product_attribute_values` (FK → product_attributes)
19. `product_variants` (FK → products)
20. `product_variant_attributes` join table (FK → product_variants, product_attributes, product_attribute_values) — composite PK `[variant_id, attribute_id]`
21. `product_variant_media` (FK → product_variants)

**Indexes in migration** (beyond unique constraints):
- All FK columns: `CREATE INDEX idx_<table>_<col> ON <table>(<col>)`
- Frequently searched: `productName`, `productCode`, `upcCode`, `sku`
- Composite: `(department_id, sub_category_id)`, `(product_type, is_active)`, `(product_id, combination_hash)`
- Soft delete filter: `(is_active, deleted_at)` on high-volume tables (products, users)
- Sort: `created_at` on all tables

---

## Testing Strategy

### Per module: 3 spec files in `spec/` folder

#### `*.repository.spec.ts` — mock TypeORM `Repository<T>`
Test cases for each repository method:
- **findAll**: default pagination (page=1, limit=10), custom page/limit, search matches partial name, search returns empty array when no match, isActive filter true/false, entity-specific FK filter (departmentId, categoryId), sort ASC/DESC by createdAt/name, max limit 100 respected, total/totalPages calculated correctly
- **findById**: returns entity when found, throws `NotFoundException` with correct message when not found, throws `InternalServerErrorException` on DB error
- **create**: saves entity, returns saved entity, throws `ConflictException` on UNIQUE_VIOLATION for each unique field, throws `InternalServerErrorException` on other DB errors
- **update**: updates and returns entity, throws `NotFoundException` when not found, throws `ConflictException` on UNIQUE_VIOLATION, throws `InternalServerErrorException` on DB errors
- **softDelete**: calls `repo.softDelete`, throws `NotFoundException` when affected=0, throws `InternalServerErrorException` on DB error
- **findByName / findByCode**: returns entity when found, returns null when not found

#### `*.service.spec.ts` — mock Repository class
Test cases:
- **findAll**: passes query to repository, returns paginated result
- **findOne**: returns ResponseDto on success, propagates `NotFoundException`
- **create**: succeeds when name/code unique, throws `ConflictException` when name duplicate, throws `ConflictException` when code duplicate, maps entity → ResponseDto
- **update**: succeeds when changing to unique name, throws `ConflictException` when name taken by other entity, does NOT throw when updating to same name (self-update), propagates `NotFoundException`
- **remove**: calls softDelete, returns `MessageResponse` with success message, propagates `NotFoundException`
- **Module-specific logic (e.g., Lot Matrix)**: Standard product → `BadRequestException` on generateVariants, no attributes → `BadRequestException`, attribute with <2 values → `BadRequestException`, correct cartesian product generated, duplicate hash skipped
- **ProductGroup `findWithFields`**: repository must expose a distinct `findWithFields(id)` method that eagerly loads `relations: ['fields', 'fields.options']`. Test: returns group with nested fields+options on success; throws `NotFoundException` when missing. `GET /api/product-groups/:id` calls `findWithFields`, not plain `findById`.

#### `*.controller.spec.ts` — `TestingModule` with mocked service
Test cases:
- **GET /**: calls service.findAll with parsed query, returns paginated response, 200 status
- **GET /:id**: calls service.findOne(id), propagates 404 when service throws, 200 on success
- **GET /:id** with invalid UUID: `ParseUUIDPipe` rejects → 400
- **POST /**: calls service.create(dto), returns 201, missing required field → 400 from ValidationPipe, extra unknown field → 400 (forbidNonWhitelisted)
- **PATCH /:id**: calls service.update(id, dto), invalid UUID → 400, 200 on success
- **DELETE /:id**: calls service.remove(id), 200 on success, 404 propagated
- **Auth**: request without JWT → 401, request with wrong role → 403

---

## Phase Split

### Phase 1 — Core infrastructure + CRUD modules
Tasks:
1. Setup: CoreModule updates (ClassSerializerInterceptor, RolesGuard), common DTOs, RBAC decorator/guard, utils constants (ROLE const: Admin/Staff/Viewer)
2. Role module (entity, repo, service, controller, tests)
3. User module (extend boilerplate: UUID FK to role, isActive, deletedAt, firstName/middleName/lastName, paginated findAll, RBAC, full tests)
4. Auth module (extend boilerplate: signup DTO renames Firstname→firstName/Middlename→middleName/Lastname→lastName, JWT strategy loads role relation for RolesGuard, PasswordResetToken entity, full tests)
5. Department module (entity, repo, service, controller, full tests)
6. Category module (entity, repo, service, controller, full tests)
7. Sub-category module (entity, repo, service, controller, full tests)
8. Single migration file (all 21 tables, all indexes)
9. Seed file for default roles (Admin, Staff, Viewer). **Data compatibility note:** Express backend seeds roles as 'Admin' and 'User'. If migrating existing data, rename 'User' → 'Staff' in a data migration step before seeding. Fresh installs unaffected.
10. AppModule wiring of all Phase 1 modules

### Phase 2 — Product catalog + Lot Matrix
Tasks:
1. ProductGroup module (entity, repo, service, controller, full tests)
2. Product module (entity + all sub-resource entities, repos, service with 18+ methods, controller with nested routes, full tests)
3. ProductAttribute module (entity + value entity, repos, service with guards, controller, full tests)
4. ProductVariant module (entity + join table + media, combination-hash utility, service with Lot Matrix generateVariants, controller, full tests)
5. Phase 2 AppModule wiring

---

## API Route Summary

### Phase 1
```
POST   /api/auth/signup
POST   /api/auth/signin

GET    /api/roles                    [Admin]
POST   /api/roles                    [Admin]
PATCH  /api/roles/:id                [Admin]
DELETE /api/roles/:id                [Admin]

GET    /api/users                    [Admin]
GET    /api/users/:id                [Admin]
POST   /api/users                    [Admin]
PATCH  /api/users/:id                [Admin]
DELETE /api/users/:id                [Admin]

GET    /api/departments              [Admin, Staff]
GET    /api/departments/:id          [Admin, Staff]
POST   /api/departments              [Admin]
PATCH  /api/departments/:id          [Admin]
DELETE /api/departments/:id          [Admin]

GET    /api/categories               [Admin, Staff]
GET    /api/categories/:id           [Admin, Staff]
POST   /api/categories               [Admin]
PATCH  /api/categories/:id           [Admin]
DELETE /api/categories/:id           [Admin]

GET    /api/sub-categories           [Admin, Staff]
GET    /api/sub-categories/:id       [Admin, Staff]
POST   /api/sub-categories           [Admin]
PATCH  /api/sub-categories/:id       [Admin]
DELETE /api/sub-categories/:id       [Admin]
```

### Phase 2
```
GET    /api/product-groups           [Admin, Staff]
GET    /api/product-groups/:id       [Admin, Staff]
POST   /api/product-groups           [Admin]
PATCH  /api/product-groups/:id       [Admin]
DELETE /api/product-groups/:id       [Admin]

GET    /api/products                 [Admin, Staff]
GET    /api/products/stats/count     [Admin, Staff]   ← explicit count endpoint
GET    /api/products/:id             [Admin, Staff]
POST   /api/products                 [Admin]
PATCH  /api/products/:id             [Admin]
DELETE /api/products/:id             [Admin]

GET/POST/DELETE  /api/products/:id/media
GET/POST/DELETE  /api/products/:id/marketing-media
GET/PUT          /api/products/:id/physical-attributes
GET/POST/DELETE  /api/products/:id/zones
GET/POST/DELETE  /api/products/:id/vendors
GET/PUT          /api/products/:id/group-field-values

GET    /api/products/:id/attributes        [Admin, Staff]
POST   /api/products/:id/attributes        [Admin]
PATCH  /api/attributes/:id                 [Admin]
DELETE /api/attributes/:id                 [Admin]
GET    /api/attributes/:id/values          [Admin, Staff]
POST   /api/attributes/:attributeId/values [Admin]
PATCH  /api/attributes/values/:valueId     [Admin]
DELETE /api/attributes/values/:valueId     [Admin]

GET    /api/products/:id/variants          [Admin, Staff]
POST   /api/products/:id/variants          [Admin]
POST   /api/products/:id/variants/generate [Admin]
GET    /api/variants/:id                   [Admin, Staff]
PATCH  /api/variants/:id                   [Admin]
DELETE /api/variants/:id                   [Admin]
```
