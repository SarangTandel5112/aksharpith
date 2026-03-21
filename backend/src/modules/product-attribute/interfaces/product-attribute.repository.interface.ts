import { IRepository } from '@common/interfaces/repository.interface';
import { ProductAttribute } from '@entities/product-attribute.entity';

export interface IProductAttributeRepository extends IRepository<ProductAttribute> {
  findByProductId(productId: number): Promise<ProductAttribute[]>;
  findByProductIdWithValues(productId: number): Promise<ProductAttribute[]>;
  findByCode(productId: number, code: string): Promise<ProductAttribute | null>;
}
