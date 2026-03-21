import { Repository } from 'typeorm';
import { ProductAttributeValue } from '@entities/product-attribute-value.entity';
import { BaseRepository } from '@common/base.repository';
import { IProductAttributeValueRepository } from './interfaces/product-attribute-value.repository.interface';

export class ProductAttributeValueRepository
  extends BaseRepository<ProductAttributeValue>
  implements IProductAttributeValueRepository
{
  constructor(repo: Repository<ProductAttributeValue>) {
    super(repo);
  }

  protected getEntityName(): string {
    return 'productAttributeValue';
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'valueLabel', 'valueCode', 'displayOrder', 'createdAt'];
  }

  protected applySearchFilter(): void {
    // not used for list queries in this module
  }

  async findByAttributeId(attributeId: number): Promise<ProductAttributeValue[]> {
    return this.repository.find({ where: { attributeId, isActive: true } });
  }

  async findByCode(attributeId: number, code: string): Promise<ProductAttributeValue | null> {
    return this.repository.findOne({
      where: { attributeId, valueCode: code, isActive: true },
    });
  }
}
