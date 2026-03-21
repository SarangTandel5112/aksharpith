import { ProductAttributeValue } from '@entities/product-attribute-value.entity';
import { IProductAttributeValueRepository } from '../../interfaces/product-attribute-value.repository.interface';

export class FakeProductAttributeValueRepository implements IProductAttributeValueRepository {
  public store: ProductAttributeValue[] = [];
  private nextId = 1;

  async findById(id: number): Promise<ProductAttributeValue | null> {
    return this.store.find((v) => v.id === id && v.isActive) ?? null;
  }

  async create(data: Partial<ProductAttributeValue>): Promise<ProductAttributeValue> {
    const entity = {
      id: this.nextId++,
      isActive: true,
      createdAt: new Date(),
      ...data,
    } as ProductAttributeValue;
    this.store.push(entity);
    return entity;
  }

  async update(
    id: number,
    data: Partial<ProductAttributeValue>
  ): Promise<ProductAttributeValue | null> {
    const idx = this.store.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }

  async delete(id: number): Promise<boolean> {
    const idx = this.store.findIndex((v) => v.id === id);
    if (idx === -1) return false;
    this.store[idx].isActive = false;
    return true;
  }

  async count(): Promise<number> {
    return this.store.filter((v) => v.isActive).length;
  }

  async findByAttributeId(attributeId: number): Promise<ProductAttributeValue[]> {
    return this.store.filter((v) => v.attributeId === attributeId && v.isActive);
  }

  async findByCode(attributeId: number, code: string): Promise<ProductAttributeValue | null> {
    return (
      this.store.find(
        (v) => v.attributeId === attributeId && v.valueCode === code && v.isActive
      ) ?? null
    );
  }
}
