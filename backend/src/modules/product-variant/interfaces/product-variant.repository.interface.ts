import { IRepository } from '@common/interfaces/repository.interface';
import { ProductVariant } from '@entities/product-variant.entity';

export interface IProductVariantRepository extends IRepository<ProductVariant> {
  findByProductId(productId: number): Promise<ProductVariant[]>;
  findByProductIdWithAttributes(productId: number): Promise<ProductVariant[]>;
  findByHash(productId: number, hash: string): Promise<ProductVariant | null>;
  findBySku(sku: string): Promise<ProductVariant | null>;
  addAttributeMapping(variantId: number, attributeId: number, attributeValueId: number): Promise<void>;
  deleteAttributeMappings(variantId: number): Promise<void>;
}
