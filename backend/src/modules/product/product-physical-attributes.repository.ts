import { Repository } from 'typeorm';
import { ProductPhysicalAttributes } from '@entities/product-physical-attributes.entity';
import { IProductPhysicalAttributesRepository } from './interfaces/product-physical-attributes.repository.interface';

export class ProductPhysicalAttributesRepository implements IProductPhysicalAttributesRepository {
  constructor(private repo: Repository<ProductPhysicalAttributes>) {}

  async findByProductId(productId: number): Promise<ProductPhysicalAttributes | null> {
    return this.repo.findOne({ where: { productId } });
  }

  async upsert(productId: number, data: Partial<ProductPhysicalAttributes>): Promise<ProductPhysicalAttributes> {
    const existing = await this.findByProductId(productId);
    if (existing) {
      await this.repo.update(existing.id, data);
      // Safe: we just found and updated the entity
      return (await this.findByProductId(productId))!;
    }
    const entity = this.repo.create({ ...data, productId });
    return this.repo.save(entity);
  }
}
