import { ProductAttribute } from '@entities/product-attribute.entity';
import { ProductAttributeValue } from '@entities/product-attribute-value.entity';
import { IProductAttributeRepository } from './interfaces/product-attribute.repository.interface';
import { IProductAttributeValueRepository } from './interfaces/product-attribute-value.repository.interface';
import { IProductRepository } from '@modules/product/interfaces/product.repository.interface';
import {
  CreateProductAttributeDto,
  UpdateProductAttributeDto,
  CreateAttributeValueDto,
  UpdateAttributeValueDto,
} from './dtos';
import { validateEntityExists, validateDeletion } from '@helpers/entity.helper';

export class ProductAttributeService {
  constructor(
    private attrRepo: IProductAttributeRepository,
    private valueRepo: IProductAttributeValueRepository,
    private productRepo: IProductRepository
  ) {}

  async getAttributesByProduct(productId: number): Promise<ProductAttribute[]> {
    const product = await this.productRepo.findById(productId);
    validateEntityExists(product, 'Product');
    return this.attrRepo.findByProductIdWithValues(productId);
  }

  async getAttributeById(id: number): Promise<ProductAttribute> {
    const attr = await this.attrRepo.findById(id);
    validateEntityExists(attr, 'Product attribute');
    // Safe: validated above
    return attr!;
  }

  async createAttribute(
    productId: number,
    data: CreateProductAttributeDto
  ): Promise<ProductAttribute> {
    const product = await this.productRepo.findById(productId);
    validateEntityExists(product, 'Product');
    if (product!.productType !== 'Lot Matrix') {
      throw new Error('Cannot add attributes to a Standard product');
    }
    const existing = await this.attrRepo.findByCode(productId, data.attributeCode);
    if (existing) {
      throw new Error(`Attribute code '${data.attributeCode}' already exists`);
    }
    return this.attrRepo.create({ ...data, productId });
  }

  async updateAttribute(
    id: number,
    data: UpdateProductAttributeDto
  ): Promise<ProductAttribute> {
    const attr = await this.attrRepo.findById(id);
    validateEntityExists(attr, 'Product attribute');
    if (data.attributeCode && data.attributeCode !== attr!.attributeCode) {
      const existing = await this.attrRepo.findByCode(attr!.productId, data.attributeCode);
      if (existing) {
        throw new Error(`Attribute code '${data.attributeCode}' already exists`);
      }
    }
    const updated = await this.attrRepo.update(id, data);
    validateEntityExists(updated, 'Product attribute');
    // Safe: validated above
    return updated!;
  }

  async deleteAttribute(id: number): Promise<void> {
    const attr = await this.attrRepo.findById(id);
    validateEntityExists(attr, 'Product attribute');
    const deleted = await this.attrRepo.delete(id);
    validateDeletion(deleted, 'Product attribute');
  }

  async getAttributeValues(attributeId: number): Promise<ProductAttributeValue[]> {
    const attr = await this.attrRepo.findById(attributeId);
    validateEntityExists(attr, 'Product attribute');
    return this.valueRepo.findByAttributeId(attributeId);
  }

  async createAttributeValue(
    attributeId: number,
    data: CreateAttributeValueDto
  ): Promise<ProductAttributeValue> {
    const attr = await this.attrRepo.findById(attributeId);
    validateEntityExists(attr, 'Product attribute');
    const existing = await this.valueRepo.findByCode(attributeId, data.valueCode);
    if (existing) {
      throw new Error(`Attribute value code '${data.valueCode}' already exists`);
    }
    return this.valueRepo.create({ ...data, attributeId });
  }

  async updateAttributeValue(
    valueId: number,
    data: UpdateAttributeValueDto
  ): Promise<ProductAttributeValue> {
    const value = await this.valueRepo.findById(valueId);
    validateEntityExists(value, 'Attribute value');
    if (data.valueCode && data.valueCode !== value!.valueCode) {
      const existing = await this.valueRepo.findByCode(value!.attributeId, data.valueCode);
      if (existing) {
        throw new Error(`Attribute value code '${data.valueCode}' already exists`);
      }
    }
    const updated = await this.valueRepo.update(valueId, data);
    validateEntityExists(updated, 'Attribute value');
    // Safe: validated above
    return updated!;
  }

  async deleteAttributeValue(valueId: number): Promise<void> {
    const value = await this.valueRepo.findById(valueId);
    validateEntityExists(value, 'Attribute value');
    const deleted = await this.valueRepo.delete(valueId);
    validateDeletion(deleted, 'Attribute value');
  }
}
