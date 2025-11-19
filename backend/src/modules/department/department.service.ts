import { Department } from '@entities/department.entity';
import { DepartmentRepository } from './department.repository';
import { CreateDepartmentDto, UpdateDepartmentDto, QueryDepartmentDto } from './dtos';
import { validateEntityExists, validateUniqueness, validateDeletion } from '@helpers/entity.helper';

export class DepartmentService {
  constructor(private departmentRepository: DepartmentRepository) {}

  async getAllDepartments(query: QueryDepartmentDto) {
    return this.departmentRepository.findAll(query);
  }

  async getDepartmentById(id: number): Promise<Department> {
    const department = await this.departmentRepository.findById(id);
    validateEntityExists(department, 'Department');
    return department;
  }

  async createDepartment(data: CreateDepartmentDto): Promise<Department> {
    // Check for unique department name
    const existingByName = await this.departmentRepository.findAll({
      departmentName: data.departmentName,
      limit: 1,
    });
    const existing = existingByName.data.length > 0 ? existingByName.data[0] : null;
    validateUniqueness(existing, undefined, 'department name', data.departmentName);

    // Check for unique department code if provided
    if (data.departmentCode) {
      const existingByCode = await this.departmentRepository.findByCode(data.departmentCode);
      validateUniqueness(existingByCode, undefined, 'department code', data.departmentCode);
    }

    return this.departmentRepository.create(data);
  }

  async updateDepartment(id: number, data: UpdateDepartmentDto): Promise<Department> {
    const department = await this.departmentRepository.findById(id);
    validateEntityExists(department, 'Department');

    // Check for unique department name if changing
    if (data.departmentName && data.departmentName !== department.departmentName) {
      const existingByName = await this.departmentRepository.findAll({
        departmentName: data.departmentName,
        limit: 1,
      });
      const existing = existingByName.data.length > 0 ? existingByName.data[0] : null;
      validateUniqueness(existing, id, 'department name', data.departmentName);
    }

    // Check for unique department code if changing
    if (data.departmentCode && data.departmentCode !== department.departmentCode) {
      const existingByCode = await this.departmentRepository.findByCode(data.departmentCode);
      validateUniqueness(existingByCode, id, 'department code', data.departmentCode);
    }

    const updated = await this.departmentRepository.update(id, data);
    validateEntityExists(updated, 'Department');
    return updated;
  }

  async deleteDepartment(id: number): Promise<void> {
    const department = await this.departmentRepository.findById(id);
    validateEntityExists(department, 'Department');

    // Note: Cannot delete department if products exist (enforced by database RESTRICT constraint)
    const deleted = await this.departmentRepository.delete(id);
    validateDeletion(deleted, 'Department', 'Products may be associated with this department');
  }

  async getDepartmentCount(): Promise<number> {
    return this.departmentRepository.getCount();
  }
}
