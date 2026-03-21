import { Department } from '@entities/department.entity';
import { IDepartmentRepository } from './interfaces/department.repository.interface';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  QueryDepartmentDto,
} from './dtos';
import {
  validateEntityExists,
  validateUniqueness,
  validateDeletion,
} from '@helpers/entity.helper';
import { PaginatedResult } from '@common/types';

export class DepartmentService {
  constructor(private repo: IDepartmentRepository) {}

  async getAllDepartments(
    query: QueryDepartmentDto
  ): Promise<PaginatedResult<Department>> {
    return this.repo.findAll(query);
  }

  async getDepartmentById(id: number): Promise<Department> {
    const department = await this.repo.findById(id);
    validateEntityExists(department, 'Department');
    return department;
  }

  async createDepartment(data: CreateDepartmentDto): Promise<Department> {
    // Check for unique department name
    const existingByName = await this.repo.findByName(data.departmentName);
    validateUniqueness(
      existingByName,
      undefined,
      'department name',
      data.departmentName
    );

    // Check for unique department code if provided
    if (data.departmentCode) {
      const existingByCode = await this.repo.findByCode(data.departmentCode);
      validateUniqueness(
        existingByCode,
        undefined,
        'department code',
        data.departmentCode
      );
    }

    return this.repo.create(data);
  }

  async updateDepartment(
    id: number,
    data: UpdateDepartmentDto
  ): Promise<Department> {
    const department = await this.repo.findById(id);
    validateEntityExists(department, 'Department');

    // Check for unique department name if changing
    if (
      data.departmentName &&
      data.departmentName !== department.departmentName
    ) {
      const existingByName = await this.repo.findByName(data.departmentName);
      validateUniqueness(
        existingByName,
        id,
        'department name',
        data.departmentName
      );
    }

    // Check for unique department code if changing
    if (
      data.departmentCode &&
      data.departmentCode !== department.departmentCode
    ) {
      const existingByCode = await this.repo.findByCode(data.departmentCode);
      validateUniqueness(
        existingByCode,
        id,
        'department code',
        data.departmentCode
      );
    }

    const updated = await this.repo.update(id, data);
    validateEntityExists(updated, 'Department');
    return updated;
  }

  async deleteDepartment(id: number): Promise<void> {
    const department = await this.repo.findById(id);
    validateEntityExists(department, 'Department');

    const deleted = await this.repo.delete(id);
    validateDeletion(deleted, 'Department');
  }

  async getDepartmentCount(): Promise<number> {
    return this.repo.count();
  }
}
