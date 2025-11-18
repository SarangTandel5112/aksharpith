import { AppDataSource } from '@config/database.config';
import { Department } from '@entities/department.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseRepository } from '@common/base.repository';
import { QueryDepartmentDto } from './dtos';

export class DepartmentRepository extends BaseRepository<Department> {
  constructor() {
    super(AppDataSource.getRepository(Department));
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

  async findAll(queryOptions: QueryDepartmentDto) {
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

  async findById(id: number): Promise<Department | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByCode(departmentCode: string): Promise<Department | null> {
    return this.repository.findOne({ where: { departmentCode } });
  }

  async create(data: Partial<Department>): Promise<Department> {
    const department = this.repository.create(data);
    return this.repository.save(department);
  }

  async update(id: number, data: Partial<Department>): Promise<Department | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async getCount(): Promise<number> {
    return this.repository.count();
  }
}
