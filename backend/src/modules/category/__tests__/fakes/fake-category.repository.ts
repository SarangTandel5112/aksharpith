import { ProductCategory } from '@entities/product-category.entity';
import { PaginatedResult } from '@common/types';
import { ICategoryRepository } from '../../interfaces/category.repository.interface';
import { QueryCategoryDto } from '../../dtos';

export class FakeCategoryRepository implements ICategoryRepository {
  public store: ProductCategory[] = [];
  private nextId = 1;

  async findAll(options: QueryCategoryDto): Promise<PaginatedResult<ProductCategory>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const active = this.store.filter((c) => c.isActive);
    const total = active.length;
    const totalPages = Math.ceil(total / limit);
    const data = active.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit, totalPages };
  }

  async findById(id: number): Promise<ProductCategory | null> {
    return this.store.find((c) => c.id === id && c.isActive) ?? null;
  }

  async findByName(name: string): Promise<ProductCategory | null> {
    return this.store.find((c) => c.categoryName === name && c.isActive) ?? null;
  }

  async findByDepartmentId(departmentId: number): Promise<ProductCategory[]> {
    return this.store.filter((c) => c.departmentId === departmentId && c.isActive);
  }

  async create(data: Partial<ProductCategory>): Promise<ProductCategory> {
    const entity = {
      id: this.nextId++,
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
      departmentId: null,
      department: null,
      description: null,
      photo: null,
      subCategories: [],
      ...data,
    } as ProductCategory;
    this.store.push(entity);
    return entity;
  }

  async update(id: number, data: Partial<ProductCategory>): Promise<ProductCategory | null> {
    const idx = this.store.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }

  async delete(id: number): Promise<boolean> {
    const idx = this.store.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.store[idx].isActive = false;
    return true;
  }

  async count(): Promise<number> {
    return this.store.filter((c) => c.isActive).length;
  }
}
