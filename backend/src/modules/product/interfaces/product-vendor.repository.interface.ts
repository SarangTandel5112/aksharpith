import { ProductVendor } from '@entities/product-vendor.entity';

export interface IProductVendorRepository {
  findByProductId(productId: number): Promise<ProductVendor[]>;
  create(data: Partial<ProductVendor>): Promise<ProductVendor>;
  findById(id: number): Promise<ProductVendor | null>;
  delete(id: number): Promise<boolean>;
}
