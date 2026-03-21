# Phase 1 Implementation Plan — NestJS Migration (Core + CRUD)

> Spec: `docs/superpowers/specs/2026-03-21-nestjs-migration-design.md`
> Execution: Use `superpowers:subagent-driven-development` — one subagent per task.

## Pre-conditions
- `nest-backend/` boilerplate is in place
- PostgreSQL running locally (connection via `.env`)
- `npm install` done in `nest-backend/`

---

## Task 1 — Setup: CoreModule + RBAC + Common DTOs

**Files to create/modify:**

1. **Modify** `src/core/core.module.ts` — add `ClassSerializerInterceptor` as `APP_INTERCEPTOR`
2. **Create** `src/core/decorators/roles.decorator.ts`
3. **Create** `src/core/guards/roles.guard.ts`
4. **Modify** `src/utils/constants.ts` — add `ROLE` const
5. **Create** `src/common/dto/pagination.dto.ts`
6. **Create** `src/common/dto/paginated-response.dto.ts`

**Code:**

```typescript
// src/core/decorators/roles.decorator.ts
import { Reflector } from '@nestjs/core';
export const Roles = Reflector.createDecorator<string[]>();
```

```typescript
// src/core/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) return true;
    const { user } = context.switchToHttp().getRequest();
    return roles.includes(user?.role?.roleName);
  }
}
```

```typescript
// src/utils/constants.ts — add to existing file
export const ROLE = {
  ADMIN: 'Admin',
  STAFF: 'Staff',
  VIEWER: 'Viewer',
} as const;
```

```typescript
// src/common/dto/pagination.dto.ts
import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit: number = 10;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional() @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC' = 'ASC';

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  search?: string;
}
```

```typescript
// src/common/dto/paginated-response.dto.ts
export class PaginatedResponseDto<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  constructor(items: T[], total: number, page: number, limit: number) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}
```

**In `core.module.ts`, add:**
```typescript
import { ClassSerializerInterceptor } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
// Add to providers array:
{ provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
```

**Commit:** `feat(core): add ClassSerializerInterceptor, RolesGuard, ROLE const, PaginationDto`

---

## Task 2 — Role Module (Full TDD)

**Entity:** `src/modules/role/entities/role.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm';
import { Expose } from 'class-transformer';

@Entity('user_roles')
@Index(['roleName'], { unique: true, where: '"deleted_at" IS NULL' })
export class Role {
  @PrimaryGeneratedColumn('uuid') @Expose() id: string;
  @Column({ name: 'role_name', length: 100 }) @Expose() roleName: string;
  @Column({ name: 'is_active', type: 'boolean', default: true }) @Expose() isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) @Expose() createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) @Expose() updatedAt: Date;
  @DeleteDateColumn({ name: 'deleted_at', nullable: true }) deletedAt: Date | null;
}
```

**DTOs:**

```typescript
// create-role.dto.ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
export class CreateRoleDto {
  @IsString() @IsNotEmpty() @MaxLength(100) roleName: string;
}

// update-role.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

// query-role.dto.ts
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
export class QueryRoleDto extends PaginationDto {
  @IsOptional() @Transform(({ value }) => value === 'true') @IsBoolean()
  isActive?: boolean;
}

// role-response.dto.ts
import { Expose } from 'class-transformer';
export class RoleResponseDto {
  @Expose() id: string;
  @Expose() roleName: string;
  @Expose() isActive: boolean;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
  constructor(partial: Partial<RoleResponseDto>) { Object.assign(this, partial); }
}
```

**Repository:** `src/modules/role/role.repository.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { WinstonLogger } from '../../setup/logger.setup';

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(Role) private readonly repo: Repository<Role>,
    private readonly logger: WinstonLogger,
  ) {}

  async findAll(query: QueryRoleDto): Promise<[Role[], number]> {
    const { page, limit, sortBy = 'createdAt', order = 'ASC', search, isActive } = query;
    const where: FindOptionsWhere<Role> = {};
    if (search) where.roleName = ILike(`%${search}%`);
    if (isActive !== undefined) where.isActive = isActive;
    return this.repo.findAndCount({
      where,
      order: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findById(id: string): Promise<Role | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByName(roleName: string): Promise<Role | null> {
    return this.repo.findOne({ where: { roleName } });
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const role = this.repo.create(dto);
    return this.repo.save(role);
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role | null> {
    await this.repo.update(id, dto);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repo.softDelete(id);
    return (result.affected ?? 0) > 0;
  }
}
```

**Service:** `src/modules/role/role.service.ts`

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepo: RoleRepository) {}

  private toDto(role: any): RoleResponseDto {
    return plainToInstance(RoleResponseDto, role, { excludeExtraneousValues: true });
  }

  async findAll(query: QueryRoleDto): Promise<PaginatedResponseDto<RoleResponseDto>> {
    const [roles, total] = await this.roleRepo.findAll(query);
    return new PaginatedResponseDto(roles.map(r => this.toDto(r)), total, query.page, query.limit);
  }

  async findOne(id: string): Promise<RoleResponseDto> {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    return this.toDto(role);
  }

  async create(dto: CreateRoleDto): Promise<RoleResponseDto> {
    const existing = await this.roleRepo.findByName(dto.roleName);
    if (existing) throw new ConflictException(`Role '${dto.roleName}' already exists`);
    const role = await this.roleRepo.create(dto);
    return this.toDto(role);
  }

  async update(id: string, dto: UpdateRoleDto): Promise<RoleResponseDto> {
    await this.findOne(id);
    if (dto.roleName) {
      const existing = await this.roleRepo.findByName(dto.roleName);
      if (existing && existing.id !== id) throw new ConflictException(`Role '${dto.roleName}' already exists`);
    }
    const role = await this.roleRepo.update(id, dto);
    return this.toDto(role!);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.roleRepo.softDelete(id);
  }
}
```

**Controller:** `src/modules/role/role.controller.ts`

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../security/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ROLE } from '../../utils/constants';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @Roles([ROLE.ADMIN])
  findAll(@Query() query: QueryRoleDto) {
    return this.roleService.findAll(query);
  }

  @Get(':id')
  @Roles([ROLE.ADMIN])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.findOne(id);
  }

  @Post()
  @Roles([ROLE.ADMIN])
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Patch(':id')
  @Roles([ROLE.ADMIN])
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto);
  }

  @Delete(':id')
  @Roles([ROLE.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.remove(id);
  }
}
```

**Spec — repository** `src/modules/role/spec/role.repository.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleRepository } from '../role.repository';
import { Role } from '../entities/role.entity';
import { WinstonLogger } from '../../../setup/logger.setup';

const mockRepo = () => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
});
const mockLogger = () => ({ log: jest.fn(), error: jest.fn(), warn: jest.fn() });

describe('RoleRepository', () => {
  let roleRepo: RoleRepository;
  let repo: jest.Mocked<Repository<Role>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleRepository,
        { provide: getRepositoryToken(Role), useFactory: mockRepo },
        { provide: WinstonLogger, useFactory: mockLogger },
      ],
    }).compile();
    roleRepo = module.get(RoleRepository);
    repo = module.get(getRepositoryToken(Role));
  });

  describe('findAll', () => {
    it('returns paginated roles', async () => {
      const roles = [{ id: 'uuid-1', roleName: 'Admin' }];
      repo.findAndCount.mockResolvedValue([roles as any, 1]);
      const result = await roleRepo.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result).toEqual([roles, 1]);
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 10 }));
    });

    it('applies search filter using ILike', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await roleRepo.findAll({ page: 1, limit: 10, search: 'adm', order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ roleName: expect.anything() }),
      }));
    });

    it('filters by isActive=false', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await roleRepo.findAll({ page: 1, limit: 10, isActive: false, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ isActive: false }),
      }));
    });

    it('calculates correct offset for page 2', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await roleRepo.findAll({ page: 2, limit: 5, order: 'ASC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ skip: 5, take: 5 }));
    });

    it('sorts by provided sortBy and order', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await roleRepo.findAll({ page: 1, limit: 10, sortBy: 'roleName', order: 'DESC' });
      expect(repo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        order: { roleName: 'DESC' },
      }));
    });
  });

  describe('findById', () => {
    it('returns role by id', async () => {
      const role = { id: 'uuid-1', roleName: 'Admin' };
      repo.findOne.mockResolvedValue(role as any);
      expect(await roleRepo.findById('uuid-1')).toEqual(role);
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      expect(await roleRepo.findById('not-exist')).toBeNull();
    });
  });

  describe('create', () => {
    it('creates and saves a role', async () => {
      const dto = { roleName: 'Admin' };
      const role = { id: 'uuid-1', ...dto };
      repo.create.mockReturnValue(role as any);
      repo.save.mockResolvedValue(role as any);
      expect(await roleRepo.create(dto)).toEqual(role);
    });
  });

  describe('softDelete', () => {
    it('returns true when affected > 0', async () => {
      repo.softDelete.mockResolvedValue({ affected: 1 } as any);
      expect(await roleRepo.softDelete('uuid-1')).toBe(true);
    });

    it('returns false when nothing deleted', async () => {
      repo.softDelete.mockResolvedValue({ affected: 0 } as any);
      expect(await roleRepo.softDelete('uuid-1')).toBe(false);
    });
  });
});
```

**Spec — service** `src/modules/role/spec/role.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { RoleService } from '../role.service';
import { RoleRepository } from '../role.repository';

const mockRoleRepo = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
});

const mockRole = { id: 'uuid-1', roleName: 'Admin', isActive: true, createdAt: new Date(), updatedAt: new Date() };

describe('RoleService', () => {
  let service: RoleService;
  let repo: ReturnType<typeof mockRoleRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleService, { provide: RoleRepository, useFactory: mockRoleRepo }],
    }).compile();
    service = module.get(RoleService);
    repo = module.get(RoleRepository);
  });

  describe('findAll', () => {
    it('returns paginated response', async () => {
      repo.findAll.mockResolvedValue([[mockRole], 1]);
      const result = await service.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.totalPages).toBe(1);
    });

    it('returns empty when no roles', async () => {
      repo.findAll.mockResolvedValue([[], 0]);
      const result = await service.findAll({ page: 1, limit: 10, order: 'ASC' });
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('calculates totalPages correctly', async () => {
      repo.findAll.mockResolvedValue([[mockRole, mockRole, mockRole], 15]);
      const result = await service.findAll({ page: 1, limit: 5, order: 'ASC' });
      expect(result.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('returns role DTO', async () => {
      repo.findById.mockResolvedValue(mockRole);
      const result = await service.findOne('uuid-1');
      expect(result.id).toBe('uuid-1');
    });

    it('throws NotFoundException for missing role', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates role successfully', async () => {
      repo.findByName.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockRole);
      const result = await service.create({ roleName: 'Admin' });
      expect(result.roleName).toBe('Admin');
    });

    it('throws ConflictException on duplicate name', async () => {
      repo.findByName.mockResolvedValue(mockRole);
      await expect(service.create({ roleName: 'Admin' })).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates role successfully', async () => {
      repo.findById.mockResolvedValue(mockRole);
      repo.findByName.mockResolvedValue(null);
      repo.update.mockResolvedValue({ ...mockRole, roleName: 'Staff' });
      const result = await service.update('uuid-1', { roleName: 'Staff' });
      expect(result.roleName).toBe('Staff');
    });

    it('throws NotFoundException when role not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('bad-id', { roleName: 'Staff' })).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when new name taken by different role', async () => {
      repo.findById.mockResolvedValue(mockRole);
      repo.findByName.mockResolvedValue({ ...mockRole, id: 'uuid-2' });
      await expect(service.update('uuid-1', { roleName: 'Viewer' })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('soft-deletes role', async () => {
      repo.findById.mockResolvedValue(mockRole);
      repo.softDelete.mockResolvedValue(true);
      await expect(service.remove('uuid-1')).resolves.toBeUndefined();
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
```

**Spec — controller** `src/modules/role/spec/role.controller.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { RoleController } from '../role.controller';
import { RoleService } from '../role.service';

const mockService = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('RoleController', () => {
  let controller: RoleController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [{ provide: RoleService, useFactory: mockService }],
    }).compile();
    controller = module.get(RoleController);
    service = module.get(RoleService);
  });

  it('findAll delegates to service', async () => {
    service.findAll.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    expect(await controller.findAll({ page: 1, limit: 10, order: 'ASC' })).toHaveProperty('items');
  });

  it('findOne returns role', async () => {
    service.findOne.mockResolvedValue({ id: 'uuid-1', roleName: 'Admin' });
    expect(await controller.findOne('uuid-1')).toHaveProperty('id');
  });

  it('findOne propagates NotFoundException', async () => {
    service.findOne.mockRejectedValue(new NotFoundException());
    await expect(controller.findOne('bad')).rejects.toThrow(NotFoundException);
  });

  it('create returns new role', async () => {
    service.create.mockResolvedValue({ id: 'uuid-1', roleName: 'Admin' });
    expect(await controller.create({ roleName: 'Admin' })).toHaveProperty('id');
  });

  it('create propagates ConflictException', async () => {
    service.create.mockRejectedValue(new ConflictException());
    await expect(controller.create({ roleName: 'Admin' })).rejects.toThrow(ConflictException);
  });

  it('update delegates to service', async () => {
    service.update.mockResolvedValue({ id: 'uuid-1', roleName: 'Staff' });
    expect(await controller.update('uuid-1', { roleName: 'Staff' })).toHaveProperty('roleName');
  });

  it('remove returns undefined', async () => {
    service.remove.mockResolvedValue(undefined);
    expect(await controller.remove('uuid-1')).toBeUndefined();
  });
});
```

**Module:** `src/modules/role/role.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RoleRepository } from './role.repository';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RoleRepository, RoleService],
  controllers: [RoleController],
  exports: [RoleRepository, RoleService],
})
export class RoleModule {}
```

**Commit:** `feat(role): complete Role module with full TDD (entity, DTOs, repo, service, controller)`

---

## Task 3 — User Module (Extend Boilerplate)

**Modify** `src/modules/user/entities/user.entity.ts`:
- Change `id` to `@PrimaryGeneratedColumn('uuid')` (if not already)
- Add: `firstName`, `middleName`, `lastName` (replace old `name` if present)
- Add: `isActive: boolean` (default true)
- Add: `@DeleteDateColumn deletedAt`
- Add: `roleId: string` FK + `@ManyToOne(() => Role) role: Role` relation
- Add index on `email`

**Create/modify DTOs:**
- `create-user.dto.ts`: `firstName`, `middleName?`, `lastName`, `email`, `password`, `roleId`, `isActive?`
- `update-user.dto.ts`: `PartialType(CreateUserDto)` minus password
- `query-user.dto.ts`: extends `PaginationDto` + `roleId?`, `isActive?`
- `user-response.dto.ts`: `@Expose()` all fields, `@Exclude()` password

**Replace** `user.repository.ts` — add `findAll(query)`, `findByEmail`, `findById`, `create`, `update`, `softDelete`

**Replace** `user.service.ts` — add CRUD with `findAll`, `findOne`, `create`, `update`, `remove`, `findByEmail`

**Replace** `user.controller.ts` — full CRUD with `@Roles([ROLE.ADMIN])` except GET self

**Replace spec files** with full test coverage (same pattern as Role specs):
- Pagination tests (page, limit, offset, totalPages)
- Search by `firstName/email`
- Filter by `roleId`, `isActive`
- Sort tests
- 404 on missing user
- 409 on duplicate email
- Password excluded from responses

**Commit:** `feat(user): extend User module with pagination, RBAC, soft-delete, full TDD`

---

## Task 4 — Auth Module (Extend Boilerplate)

**Create** `src/modules/auth/entities/password-reset-token.entity.ts`:
```typescript
@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id' }) userId: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'user_id' }) user: User;
  @Column({ name: 'token', length: 255 }) token: string;
  @Column({ name: 'expires_at', type: 'timestamp' }) expiresAt: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
```

**Update** `src/modules/auth/dto/signup.dto.ts`:
- Rename: `Firstname → firstName`, `Middlename → middleName`, `Lastname → lastName`
- Add `roleId?: string` (optional, defaults to Viewer)

**Update** `src/security/jwt.strategy.ts`:
- Load `role` relation in `validate()`: `this.userRepo.findById(payload.id, { relations: ['role'] })`

**Auth service** — ensure `signUp` hashes password, creates user with `roleId`, returns `{ accessToken }`

**Replace spec files** with:
- `auth.service.spec.ts`: signUp success, signUp duplicate email (409), signIn success, signIn wrong password (401), signIn user not found (404)
- `auth.controller.spec.ts`: delegates to service, propagates errors

**Commit:** `feat(auth): add PasswordResetToken entity, fix SignupDto field names, load role in JwtStrategy`

---

## Task 5 — Department Module (Full TDD)

Follow exact same pattern as Role module.

**Entity:** `departments` table
- `id: uuid PK`
- `name: varchar(150)` with unique index where deleted_at IS NULL
- `isActive: boolean default true`
- `createdAt, updatedAt, deletedAt`
- Index on `name`

**DTOs:**
- `create-department.dto.ts`: `name`
- `update-department.dto.ts`: PartialType
- `query-department.dto.ts`: extends PaginationDto + `isActive?`
- `department-response.dto.ts`: all fields @Expose()

**Repository methods:** `findAll(query)`, `findById(id)`, `findByName(name)`, `create`, `update`, `softDelete`

**Service:** duplicate name check → 409, findOne → 404

**Controller:** `@Roles([ROLE.ADMIN])` for CUD, `@Roles([ROLE.ADMIN, ROLE.STAFF])` for R

**Tests — must cover:**
- Pagination: page, limit, totalPages, offset
- Search by name (ILike)
- Filter by isActive
- Sort by name/createdAt ASC/DESC
- 404 when not found
- 409 when duplicate name
- Soft delete sets deletedAt
- Deleted records excluded from findAll

**Commit:** `feat(department): complete Department module with full TDD`

---

## Task 6 — Category Module (Full TDD)

**Entity:** `product_categories` table
- `id: uuid PK`
- `name: varchar(150)`, unique index where deleted_at IS NULL
- `isActive: boolean default true`
- `createdAt, updatedAt, deletedAt`

Same pattern as Department — DTOs, repository, service, controller, specs.

**Extra tests:** verify category name uniqueness is case-insensitive via ILike.

**Commit:** `feat(category): complete Category module with full TDD`

---

## Task 7 — Sub-Category Module (Full TDD)

**Entity:** `sub_categories` table
- `id: uuid PK`
- `name: varchar(150)`
- `categoryId: uuid FK → product_categories`
- `@ManyToOne(() => Category) category: Category`
- Index on `categoryId`
- Unique index on `(name, category_id)` where deleted_at IS NULL
- `isActive: boolean default true`
- `createdAt, updatedAt, deletedAt`

**DTOs:**
- `create-sub-category.dto.ts`: `name`, `categoryId`
- `query-sub-category.dto.ts`: extends PaginationDto + `categoryId?`, `isActive?`

**Service extras:**
- Validate `categoryId` exists before create/update (throw 404 if not)
- Unique check on (name, categoryId)

**Tests — must cover:**
- Filter by categoryId
- 404 when categoryId not found
- 409 when (name, categoryId) duplicate
- Cascade behavior when parent category is soft-deleted

**Commit:** `feat(sub-category): complete SubCategory module with full TDD`

---

## Task 8 — Migration File

**Create** `src/migrations/1742500000000-InitSchema.ts`

Creates 21 tables in FK-dependency order:
1. `user_roles`
2. `users`
3. `password_reset_tokens`
4. `departments`
5. `product_categories`
6. `sub_categories`
7. `product_groups`
8. `group_fields`
9. `group_field_options`
10. `products`
11. `product_media`
12. `product_marketing_media`
13. `product_physical_attributes`
14. `product_zones`
15. `product_vendors`
16. `product_group_field_values`
17. `product_attributes`
18. `product_attribute_values`
19. `product_variants`
20. `product_variant_attributes`
21. `product_variant_media`

Each table includes: UUID PK, all FK columns, `is_active`, `created_at`, `updated_at`, `deleted_at`.

All indexes: unique partial (where deleted_at IS NULL), FK indexes, search indexes.

**Modify** `src/setup/database.factory.ts`:
- Set `synchronize: false` always
- Add `migrations: [join(__dirname, '../migrations/*.ts')]`
- Add `migrationsRun: false` (run manually)

**Commit:** `feat(migration): add InitSchema migration for all 21 tables`

---

## Task 9 — Seed File

**Create** `src/seeds/roles.seed.ts` — inserts Admin, Staff, Viewer roles if not present

```typescript
import { DataSource } from 'typeorm';
import { Role } from '../modules/role/entities/role.entity';

export async function seedRoles(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Role);
  const roles = ['Admin', 'Staff', 'Viewer'];
  for (const roleName of roles) {
    const existing = await repo.findOne({ where: { roleName } });
    if (!existing) {
      await repo.save(repo.create({ roleName }));
    }
  }
}
```

Add `npm run seed` script in `package.json`.

**Commit:** `feat(seed): add roles seed file`

---

## Task 10 — AppModule Wiring + Build Verification

**Modify** `src/app.module.ts`:
- Import and register: `RoleModule`, `DepartmentModule`, `CategoryModule`, `SubCategoryModule`
- Ensure `UserModule` and `AuthModule` import `RoleModule`

**Run:**
```bash
cd nest-backend
npm run build
npm run test
```

Fix any TypeScript or test errors.

**Commit:** `feat(app): wire Phase 1 modules into AppModule, verify build and tests pass`

---

## Phase 1 Done Checklist

- [ ] ClassSerializerInterceptor registered globally
- [ ] RolesGuard + Roles decorator working
- [ ] ROLE const defined
- [ ] PaginationDto + PaginatedResponseDto created
- [ ] Role module: entity, DTOs, repo, service, controller, specs — all green
- [ ] User module: extended with isActive, deletedAt, roleId FK — all specs green
- [ ] Auth module: PasswordResetToken entity, fixed SignupDto, JwtStrategy loads role
- [ ] Department module: full TDD — all specs green
- [ ] Category module: full TDD — all specs green
- [ ] SubCategory module: full TDD — all specs green
- [ ] Migration file: all 21 tables with indexes
- [ ] Seed file: Admin/Staff/Viewer roles
- [ ] `npm run build` passes with 0 errors
- [ ] `npm run test` passes with 0 failures
