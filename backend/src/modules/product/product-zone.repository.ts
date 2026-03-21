import { Repository } from 'typeorm';
import { ProductZone } from '@entities/product-zone.entity';
import { IProductZoneRepository } from './interfaces/product-zone.repository.interface';

export class ProductZoneRepository implements IProductZoneRepository {
  constructor(private repo: Repository<ProductZone>) {}

  async findByProductId(productId: number): Promise<ProductZone[]> {
    return this.repo.find({ where: { productId, isActive: true } });
  }

  async upsert(productId: number, data: Partial<ProductZone>[]): Promise<ProductZone[]> {
    // Soft-delete existing zones for this product
    await this.repo.update({ productId }, { isActive: false });
    // Create the new set of zones
    const entities = data.map((d) => this.repo.create({ ...d, productId, isActive: true }));
    return this.repo.save(entities);
  }
}
