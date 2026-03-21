import { SubCategory } from '@entities/sub-category.entity';
import { PaginatedResult } from '@common/types';
import { ISubCategoryRepository } from '../../interfaces/sub-category.repository.interface';
import { QuerySubCategoryDto } from '../../dtos';

export class FakeSubCategoryRepository implements ISubCategoryRepository {
  public store: SubCategory[] = [];
  private nextId = 1;

  async findAll(options: QuerySubCategoryDto): Promise<PaginatedResult<SubCategory>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    let active = this.store.filter((sc) => sc.isActive);

    if (options.categoryId !== undefined) {
      active = active.filter((sc) => sc.categoryId === options.categoryId);
    }

    const total = active.length;
    const totalPages = Math.ceil(total / limit);
    const data = active.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit, totalPages };
  }

  async findById(id: number): Promise<SubCategory | null> {
    return this.store.find((sc) => sc.id === id && sc.isActive) ?? null;
  }

  async findByCategoryId(categoryId: number): Promise<SubCategory[]> {
    return this.store.filter((sc) => sc.categoryId === categoryId && sc.isActive);
  }

  async findByNameAndCategory(name: string, categoryId: number): Promise<SubCategory | null> {
    return (
      this.store.find(
        (sc) => sc.subCategoryName === name && sc.categoryId === categoryId && sc.isActive
      ) ?? null
    );
  }

  async create(data: Partial<SubCategory>): Promise<SubCategory> {
    const entity = {
      id: this.nextId++,
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
      description: null,
      photo: null,
      displayOrder: 0,
      category: null,
      products: [],
      ...data,
    } as SubCategory;
    this.store.push(entity);
    return entity;
  }

  async update(id: number, data: Partial<SubCategory>): Promise<SubCategory | null> {
    const idx = this.store.findIndex((sc) => sc.id === id);
    if (idx === -1) return null;
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }

  async delete(id: number): Promise<boolean> {
    const idx = this.store.findIndex((sc) => sc.id === id);
    if (idx === -1) return false;
    this.store[idx].isActive = false;
    return true;
  }

  async count(): Promise<number> {
    return this.store.filter((sc) => sc.isActive).length;
  }
}
