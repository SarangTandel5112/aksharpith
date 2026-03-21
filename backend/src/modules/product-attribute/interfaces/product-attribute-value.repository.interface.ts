import { IRepository } from '@common/interfaces/repository.interface';
import { ProductAttributeValue } from '@entities/product-attribute-value.entity';

export interface IProductAttributeValueRepository extends IRepository<ProductAttributeValue> {
  findByAttributeId(attributeId: number): Promise<ProductAttributeValue[]>;
  findByCode(attributeId: number, code: string): Promise<ProductAttributeValue | null>;
}
