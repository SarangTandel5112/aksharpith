import { ProductMarketingMedia } from '@entities/product-marketing-media.entity';

export interface IProductMarketingMediaRepository {
  findByProductId(productId: number): Promise<ProductMarketingMedia[]>;
  create(data: Partial<ProductMarketingMedia>): Promise<ProductMarketingMedia>;
  findById(id: number): Promise<ProductMarketingMedia | null>;
  delete(id: number): Promise<boolean>;
}
