import { ProductVariant } from '@entities/product-variant.entity';
import { IProductVariantRepository } from '../../interfaces/product-variant.repository.interface';

type AttributeMapping = { variantId: number; attributeId: number; attributeValueId: number };

export class FakeProductVariantRepository implements IProductVariantRepository {
  public store: ProductVariant[] = [];
  public mappings: AttributeMapping[] = [];
  private nextId = 1;

  async findById(id: number) { return this.store.find(v => v.id === id && v.isActive) ?? null; }
  async create(data: Partial<ProductVariant>) {
    const entity = { id: this.nextId++, isActive: true, isDeleted: false, stockQuantity: 0, createdAt: new Date(), updatedAt: null, ...data } as ProductVariant;
    this.store.push(entity);
    return entity;
  }
  async update(id: number, data: Partial<ProductVariant>) {
    const idx = this.store.findIndex(v => v.id === id);
    if (idx === -1) return null;
    this.store[idx] = { ...this.store[idx], ...data };
    return this.store[idx];
  }
  async delete(id: number) {
    const idx = this.store.findIndex(v => v.id === id);
    if (idx === -1) return false;
    this.store[idx].isActive = false;
    return true;
  }
  async count() { return this.store.filter(v => v.isActive).length; }
  async findByProductId(productId: number) { return this.store.filter(v => v.productId === productId && v.isActive); }
  async findByProductIdWithAttributes(productId: number) { return this.findByProductId(productId); }
  async findByHash(productId: number, hash: string) {
    return this.store.find(v => v.productId === productId && v.combinationHash === hash && v.isActive) ?? null;
  }
  async findBySku(sku: string) { return this.store.find(v => v.sku === sku && v.isActive) ?? null; }
  async addAttributeMapping(variantId: number, attributeId: number, attributeValueId: number) {
    this.mappings.push({ variantId, attributeId, attributeValueId });
  }
  async deleteAttributeMappings(variantId: number) {
    this.mappings = this.mappings.filter(m => m.variantId !== variantId);
  }
}
