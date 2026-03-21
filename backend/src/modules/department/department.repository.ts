import { Department } from '@entities/department.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseRepository } from '@common/base.repository';
import { IDepartmentRepository } from './interfaces/department.repository.interface';
import { QueryDepartmentDto } from './dtos';
import { PaginatedResult } from '@common/types';

export class DepartmentRepository
  extends BaseRepository<Department>
  implements IDepartmentRepository
{
  constructor(repo: Repository<Department>) {
    super(repo);
  }

  protected getEntityName(): string {
    return 'department';
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'departmentName', 'departmentCode', 'createdAt', 'updatedAt'];
  }

  protected applySearchFilter(queryBuilder: SelectQueryBuilder<Department>, search: string): void {
    queryBuilder.andWhere(
      '(department.departmentName LIKE :search OR department.departmentCode LIKE :search OR department.description LIKE :search)',
      { search: `%${search}%` }
    );
  }

  async findAll(queryOptions: QueryDepartmentDto): Promise<PaginatedResult<Department>> {
    return this.findAllWithPagination(queryOptions, (qb) => {
      if (queryOptions.departmentName) {
        qb.andWhere('department.departmentName LIKE :name', {
          name: `%${queryOptions.departmentName}%`,
        });
      }
      if (queryOptions.departmentCode) {
        qb.andWhere('department.departmentCode LIKE :code', {
          code: `%${queryOptions.departmentCode}%`,
        });
      }
      if (queryOptions.isActive !== undefined) {
        qb.andWhere('department.isActive = :isActive', { isActive: queryOptions.isActive });
      }
    });
  }

  async findByCode(departmentCode: string): Promise<Department | null> {
    return this.repository.findOne({ where: { departmentCode, isActive: true } });
  }

  async findByName(departmentName: string): Promise<Department | null> {
    return this.repository.findOne({ where: { departmentName, isActive: true } });
  }
}
