import { ProductAttribute } from '@entities/product-attribute.entity';
import { IProductAttributeRepository } from '../../interfaces/product-attribute.repository.interface';

export class FakeProductAttributeRepository implements IProductAttributeRepository {
  public store: ProductAttribute[] = [];
  private nextId = 1;

  async findById(id: number): Promise<ProductAttribute | null> {
    return this.store.find((a) => a.id === id && a.isActive) ?? null;
  }

  async create(data: Partial<ProductAttribute>): Promise<ProductAttribute> {
    const entity = {
      id: this.nextId++,
      isActive: true,
      createdAt: new Date(),
      ...data,
    } as ProductAttribute;
    this.store.push(entity);
    return entity;
  }

  async update(id: number, data: Partial<ProductAttribute>): Promise<ProductAttribute | null> {
    const idx = this.store.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }

  async delete(id: number): Promise<boolean> {
    const idx = this.store.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.store[idx].isActive = false;
    return true;
  }

  async count(): Promise<number> {
    return this.store.filter((a) => a.isActive).length;
  }

  async findByProductId(productId: number): Promise<ProductAttribute[]> {
    return this.store.filter((a) => a.productId === productId && a.isActive);
  }

  async findByProductIdWithValues(productId: number): Promise<ProductAttribute[]> {
    return this.findByProductId(productId);
  }

  async findByCode(productId: number, code: string): Promise<ProductAttribute | null> {
    return (
      this.store.find(
        (a) => a.productId === productId && a.attributeCode === code && a.isActive
      ) ?? null
    );
  }
}
