import { Product } from '@entities/product.entity';
import { PaginatedResult } from '@common/types';
import { IProductRepository } from '../../interfaces/product.repository.interface';
import { QueryProductDto } from '../../dtos';

export class FakeProductRepository implements IProductRepository {
  public store: Product[] = [];
  private nextId = 1;

  async findAll(options: QueryProductDto): Promise<PaginatedResult<Product>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    let active = this.store.filter((p) => p.isActive);

    if (options.departmentId !== undefined) {
      active = active.filter((p) => p.departmentId === options.departmentId);
    }

    if (options.subCategoryId !== undefined) {
      active = active.filter((p) => p.subCategoryId === options.subCategoryId);
    }

    if (options.minPrice !== undefined) {
      active = active.filter((p) => Number(p.unitPrice) >= options.minPrice!);
    }

    if (options.maxPrice !== undefined) {
      active = active.filter((p) => Number(p.unitPrice) <= options.maxPrice!);
    }

    if (options.minStock !== undefined) {
      active = active.filter((p) => p.stockQuantity >= options.minStock!);
    }

    if (options.search) {
      const search = options.search.toLowerCase();
      active = active.filter(
        (p) =>
          p.productName.toLowerCase().includes(search) ||
          (p.description ?? '').toLowerCase().includes(search)
      );
    }

    const total = active.length;
    const totalPages = Math.ceil(total / limit);
    const data = active.slice((page - 1) * limit, page * limit);
    return { data, total, page, limit, totalPages };
  }

  async findById(id: number): Promise<Product | null> {
    return this.store.find((p) => p.id === id && p.isActive) ?? null;
  }

  async findByCode(code: string): Promise<Product | null> {
    return this.store.find((p) => p.productCode === code && p.isActive) ?? null;
  }

  async findByName(name: string): Promise<Product | null> {
    return this.store.find((p) => p.productName === name && p.isActive) ?? null;
  }

  async findByDepartmentId(departmentId: number): Promise<Product[]> {
    return this.store.filter((p) => p.departmentId === departmentId && p.isActive);
  }

  async findBySubCategoryId(subCategoryId: number): Promise<Product[]> {
    return this.store.filter((p) => p.subCategoryId === subCategoryId && p.isActive);
  }

  async create(data: Partial<Product>): Promise<Product> {
    const entity = {
      id: this.nextId++,
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
      description: null,
      model: null,
      groupId: null,
      size: null,
      pack: null,
      vintage: null,
      stockQuantity: 0,
      nonTaxable: false,
      itemInactive: false,
      nonStockItem: false,
      productType: 'Standard',
      media: [],
      marketingMedia: [],
      vendors: [],
      zones: [],
      physicalAttributes: [],
      ...data,
    } as Product;
    this.store.push(entity);
    return entity;
  }

  async update(id: number, data: Partial<Product>): Promise<Product | null> {
    const idx = this.store.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }

  async delete(id: number): Promise<boolean> {
    const idx = this.store.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.store[idx].isActive = false;
    return true;
  }

  async count(): Promise<number> {
    return this.store.filter((p) => p.isActive).length;
  }
}
