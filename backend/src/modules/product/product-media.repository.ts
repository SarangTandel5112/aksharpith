import { Repository } from 'typeorm';
import { ProductMedia } from '@entities/product-media.entity';
import { IProductMediaRepository } from './interfaces/product-media.repository.interface';

export class ProductMediaRepository implements IProductMediaRepository {
  constructor(private repo: Repository<ProductMedia>) {}

  async findByProductId(productId: number): Promise<ProductMedia[]> {
    return this.repo.find({ where: { productId }, order: { displayOrder: 'ASC' } });
  }

  async create(data: Partial<ProductMedia>): Promise<ProductMedia> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async findById(id: number): Promise<ProductMedia | null> {
    return this.repo.findOne({ where: { id } });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
