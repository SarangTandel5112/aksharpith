import { Repository } from 'typeorm';
import { ProductAttribute } from '@entities/product-attribute.entity';
import { BaseRepository } from '@common/base.repository';
import { IProductAttributeRepository } from './interfaces/product-attribute.repository.interface';

export class ProductAttributeRepository
  extends BaseRepository<ProductAttribute>
  implements IProductAttributeRepository
{
  constructor(repo: Repository<ProductAttribute>) {
    super(repo);
  }

  protected getEntityName(): string {
    return 'productAttribute';
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'attributeName', 'attributeCode', 'displayOrder', 'createdAt'];
  }

  protected applySearchFilter(): void {
    // not used for list queries in this module
  }

  async findByProductId(productId: number): Promise<ProductAttribute[]> {
    return this.repository.find({ where: { productId, isActive: true } });
  }

  async findByProductIdWithValues(productId: number): Promise<ProductAttribute[]> {
    return this.repository.find({
      where: { productId, isActive: true },
      relations: ['values'],
    });
  }

  async findByCode(productId: number, code: string): Promise<ProductAttribute | null> {
    return this.repository.findOne({
      where: { productId, attributeCode: code, isActive: true },
    });
  }
}
