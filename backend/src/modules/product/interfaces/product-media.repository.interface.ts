import { ProductMedia } from '@entities/product-media.entity';

export interface IProductMediaRepository {
  findByProductId(productId: number): Promise<ProductMedia[]>;
  create(data: Partial<ProductMedia>): Promise<ProductMedia>;
  findById(id: number): Promise<ProductMedia | null>;
  delete(id: number): Promise<boolean>;
}
