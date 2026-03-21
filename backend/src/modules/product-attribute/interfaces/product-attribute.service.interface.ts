import { ProductAttribute } from '@entities/product-attribute.entity';
import { ProductAttributeValue } from '@entities/product-attribute-value.entity';
import {
  CreateProductAttributeDto,
  UpdateProductAttributeDto,
  CreateAttributeValueDto,
  UpdateAttributeValueDto,
} from '../dtos';

export interface IProductAttributeService {
  getAttributesByProduct(productId: number): Promise<ProductAttribute[]>;
  getAttributeById(id: number): Promise<ProductAttribute>;
  createAttribute(productId: number, data: CreateProductAttributeDto): Promise<ProductAttribute>;
  updateAttribute(id: number, data: UpdateProductAttributeDto): Promise<ProductAttribute>;
  deleteAttribute(id: number): Promise<void>;
  getAttributeValues(attributeId: number): Promise<ProductAttributeValue[]>;
  createAttributeValue(attributeId: number, data: CreateAttributeValueDto): Promise<ProductAttributeValue>;
  updateAttributeValue(valueId: number, data: UpdateAttributeValueDto): Promise<ProductAttributeValue>;
  deleteAttributeValue(valueId: number): Promise<void>;
}
