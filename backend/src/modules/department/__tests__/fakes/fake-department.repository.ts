import { Department } from '@entities/department.entity';
import { PaginatedResult } from '@common/types';
import { IDepartmentRepository } from '../../interfaces/department.repository.interface';
import { QueryDepartmentDto } from '../../dtos';

export class FakeDepartmentRepository implements IDepartmentRepository {
  public store: Department[] = [];
  private nextId = 1;

  async findAll(options: QueryDepartmentDto): Promise<PaginatedResult<Department>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const active = this.store.filter((d) => d.isActive);
    const total = active.length;
    const totalPages = Math.ceil(total / limit);
    const data = active.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit, totalPages };
  }

  async findById(id: number): Promise<Department | null> {
    return this.store.find((d) => d.id === id && d.isActive) ?? null;
  }

  async findByCode(code: string): Promise<Department | null> {
    return this.store.find((d) => d.departmentCode === code && d.isActive) ?? null;
  }

  async findByName(name: string): Promise<Department | null> {
    return this.store.find((d) => d.departmentName === name && d.isActive) ?? null;
  }

  async create(data: Partial<Department>): Promise<Department> {
    const entity = {
      id: this.nextId++,
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
      departmentCode: null,
      description: null,
      products: [],
      ...data,
    } as Department;
    this.store.push(entity);
    return entity;
  }

  async update(id: number, data: Partial<Department>): Promise<Department | null> {
    const idx = this.store.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }

  async delete(id: number): Promise<boolean> {
    const idx = this.store.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    this.store[idx].isActive = false;
    return true;
  }

  async count(): Promise<number> {
    return this.store.filter((d) => d.isActive).length;
  }
}
