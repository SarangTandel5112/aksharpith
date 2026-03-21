import { ProductZone } from '@entities/product-zone.entity';

export interface IProductZoneRepository {
  findByProductId(productId: number): Promise<ProductZone[]>;
  upsert(productId: number, data: Partial<ProductZone>[]): Promise<ProductZone[]>;
}
