import { Department } from '@entities/department.entity';
import { CreateDepartmentDto, UpdateDepartmentDto, QueryDepartmentDto } from '../dtos';
import { PaginatedResult } from '@common/types';

export interface IDepartmentService {
  getAllDepartments(query: QueryDepartmentDto): Promise<PaginatedResult<Department>>;
  getDepartmentById(id: number): Promise<Department>;
  createDepartment(data: CreateDepartmentDto): Promise<Department>;
  updateDepartment(id: number, data: UpdateDepartmentDto): Promise<Department>;
  deleteDepartment(id: number): Promise<void>;
}
