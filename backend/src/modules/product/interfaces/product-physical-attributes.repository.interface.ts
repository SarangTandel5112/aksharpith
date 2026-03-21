import { ProductPhysicalAttributes } from '@entities/product-physical-attributes.entity';

export interface IProductPhysicalAttributesRepository {
  findByProductId(productId: number): Promise<ProductPhysicalAttributes | null>;
  upsert(productId: number, data: Partial<ProductPhysicalAttributes>): Promise<ProductPhysicalAttributes>;
}
