import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { resolveSortField } from '../../common/utils/sort.util';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { QueryDepartmentDto } from './dto/query-department.dto';

@Injectable()
export class DepartmentRepository {
  private static readonly ALLOWED_SORT_FIELDS = [
    'createdAt',
    'updatedAt',
    'name',
    'code',
    'isActive',
  ] as const;

  constructor(
    @InjectRepository(Department)
    private readonly repo: Repository<Department>,
  ) {}

  async findAll(query: QueryDepartmentDto): Promise<[Department[], number]> {
    const { page, limit, sortBy = 'createdAt', order = 'ASC', search, isActive } = query;
    const safeSortBy = resolveSortField(
      sortBy,
      DepartmentRepository.ALLOWED_SORT_FIELDS,
      'createdAt',
    );
    const where: FindOptionsWhere<Department> = {};
    if (search) where.name = ILike(`%${search}%`);
    if (isActive !== undefined) where.isActive = isActive;
    return this.repo.findAndCount({
      where,
      order: { [safeSortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findById(id: string): Promise<Department | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Department | null> {
    return this.repo.findOne({ where: { name } });
  }

  async create(dto: CreateDepartmentDto): Promise<Department> {
    const dept = this.repo.create(dto);
    return this.repo.save(dept);
  }

  async update(id: string, dto: UpdateDepartmentDto): Promise<Department | null> {
    await this.repo.update(id, dto);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repo.softDelete(id);
    return (result.affected ?? 0) > 0;
  }
}
