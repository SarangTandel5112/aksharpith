import { ProductGroup } from '@entities/product-group.entity';
import { IProductGroupRepository } from '../../interfaces/product-group.repository.interface';
import { PaginatedResult } from '@common/types';
import { QueryProductGroupDto } from '../../dtos';

export class FakeProductGroupRepository implements IProductGroupRepository {
  public store: ProductGroup[] = [];
  public hasProducts = false; // toggle to simulate FK constraint
  private nextId = 1;

  async findById(id: number): Promise<ProductGroup | null> {
    return this.store.find((g) => g.id === id && g.isActive) ?? null;
  }

  async create(data: Partial<ProductGroup>): Promise<ProductGroup> {
    const entity = {
      id: this.nextId++,
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
      description: null,
      fields: [],
      products: [],
      ...data,
    } as ProductGroup;
    this.store.push(entity);
    return entity;
  }

  async update(id: number, data: Partial<ProductGroup>): Promise<ProductGroup | null> {
    const idx = this.store.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }

  async delete(id: number): Promise<boolean> {
    const idx = this.store.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    this.store[idx].isActive = false;
    return true;
  }

  async count(): Promise<number> {
    return this.store.filter((g) => g.isActive).length;
  }

  async findAll(_options: QueryProductGroupDto): Promise<PaginatedResult<ProductGroup>> {
    const data = this.store.filter((g) => g.isActive);
    return { data, total: data.length, page: 1, limit: 10, totalPages: 1 };
  }

  async findByName(name: string): Promise<ProductGroup | null> {
    return this.store.find((g) => g.groupName === name && g.isActive) ?? null;
  }

  async findWithFields(id: number): Promise<ProductGroup | null> {
    return this.findById(id);
  }

  async countProductsByGroup(_groupId: number): Promise<number> {
    return this.hasProducts ? 1 : 0;
  }
}
