import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { resolveSortField } from '../../common/utils/sort.util';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';

@Injectable()
export class RoleRepository {
  private static readonly ALLOWED_SORT_FIELDS = [
    'createdAt',
    'updatedAt',
    'roleName',
    'isActive',
  ] as const;

  constructor(
    @InjectRepository(Role)
    private readonly repo: Repository<Role>,
  ) {}

  async findAll(query: QueryRoleDto): Promise<[Role[], number]> {
    const {
      page,
      limit,
      sortBy = 'createdAt',
      order = 'ASC',
      search,
      isActive,
    } = query;
    const safeSortBy = resolveSortField(
      sortBy,
      RoleRepository.ALLOWED_SORT_FIELDS,
      'createdAt',
    );
    const where: FindOptionsWhere<Role> = {};
    if (search) where.roleName = ILike(`%${search}%`);
    if (isActive !== undefined) where.isActive = isActive;
    return this.repo.findAndCount({
      where,
      order: { [safeSortBy]: order },
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
