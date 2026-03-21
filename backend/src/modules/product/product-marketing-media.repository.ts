import { Repository } from 'typeorm';
import { ProductMarketingMedia } from '@entities/product-marketing-media.entity';
import { IProductMarketingMediaRepository } from './interfaces/product-marketing-media.repository.interface';

export class ProductMarketingMediaRepository implements IProductMarketingMediaRepository {
  constructor(private repo: Repository<ProductMarketingMedia>) {}

  async findByProductId(productId: number): Promise<ProductMarketingMedia[]> {
    return this.repo.find({ where: { productId }, order: { displayOrder: 'ASC' } });
  }

  async create(data: Partial<ProductMarketingMedia>): Promise<ProductMarketingMedia> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async findById(id: number): Promise<ProductMarketingMedia | null> {
    return this.repo.findOne({ where: { id } });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
