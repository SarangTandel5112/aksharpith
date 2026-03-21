import { Repository } from 'typeorm';
import { ProductVendor } from '@entities/product-vendor.entity';
import { IProductVendorRepository } from './interfaces/product-vendor.repository.interface';

export class ProductVendorRepository implements IProductVendorRepository {
  constructor(private repo: Repository<ProductVendor>) {}

  async findByProductId(productId: number): Promise<ProductVendor[]> {
    return this.repo.find({ where: { productId, isActive: true } });
  }

  async create(data: Partial<ProductVendor>): Promise<ProductVendor> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async findById(id: number): Promise<ProductVendor | null> {
    return this.repo.findOne({ where: { id } });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
