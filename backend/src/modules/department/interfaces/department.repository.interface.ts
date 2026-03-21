import { IRepository } from '@common/interfaces/repository.interface';
import { Department } from '@entities/department.entity';
import { PaginatedResult } from '@common/types';
import { QueryDepartmentDto } from '../dtos';

export interface IDepartmentRepository extends IRepository<Department> {
  findAll(options: QueryDepartmentDto): Promise<PaginatedResult<Department>>;
  findByCode(code: string): Promise<Department | null>;
  findByName(name: string): Promise<Department | null>;
}
