import { Repository, SelectQueryBuilder } from 'typeorm';
import { ProductVariant } from '@entities/product-variant.entity';
import { ProductVariantAttribute } from '@entities/product-variant-attribute.entity';
import { BaseRepository } from '@common/base.repository';
import { IProductVariantRepository } from './interfaces/product-variant.repository.interface';

export class ProductVariantRepository
  extends BaseRepository<ProductVariant>
  implements IProductVariantRepository
{
  constructor(repo: Repository<ProductVariant>) {
    super(repo);
  }

  protected getEntityName(): string {
    return 'productVariant';
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'sku', 'upc', 'stockQuantity', 'createdAt', 'updatedAt'];
  }

  protected applySearchFilter(
    queryBuilder: SelectQueryBuilder<ProductVariant>,
    search: string
  ): void {
    queryBuilder.andWhere(
      '(productVariant.sku LIKE :search OR productVariant.upc LIKE :search)',
      { search: `%${search}%` }
    );
  }

  async findByProductId(productId: number): Promise<ProductVariant[]> {
    return this.repository.find({ where: { productId, isActive: true } });
  }

  async findByProductIdWithAttributes(productId: number): Promise<ProductVariant[]> {
    return this.repository.find({
      where: { productId, isActive: true },
      relations: ['variantAttributes', 'variantAttributes.attribute', 'variantAttributes.attributeValue'],
    });
  }

  async findByHash(productId: number, hash: string): Promise<ProductVariant | null> {
    return this.repository.findOne({
      where: { productId, combinationHash: hash, isActive: true },
    });
  }

  async findBySku(sku: string): Promise<ProductVariant | null> {
    return this.repository.findOne({ where: { sku, isActive: true } });
  }

  async addAttributeMapping(
    variantId: number,
    attributeId: number,
    attributeValueId: number
  ): Promise<void> {
    await this.repository.manager.getRepository(ProductVariantAttribute).save({
      variantId,
      attributeId,
      attributeValueId,
    });
  }

  async deleteAttributeMappings(variantId: number): Promise<void> {
    await this.repository.manager
      .getRepository(ProductVariantAttribute)
      .delete({ variantId });
  }
}
