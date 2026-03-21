import { IProductRepository } from './interfaces/product.repository.interface';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dtos';
import { Product } from '@entities';
import { PaginatedResult } from '@common/types';
import { validateEntityExists, validateUniqueness, validateDeletion } from '@helpers/entity.helper';

export class ProductService {
  constructor(private repo: IProductRepository) {}

  async getAllProducts(query: QueryProductDto): Promise<PaginatedResult<Product>> {
    return this.repo.findAll(query);
  }

  async getProductById(id: number): Promise<Product> {
    const product = await this.repo.findById(id);
    validateEntityExists(product, 'Product');
    return product;
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    // Check for unique product code
    const existingByCode = await this.repo.findByCode(createProductDto.productCode);
    validateUniqueness(existingByCode, undefined, 'product code', createProductDto.productCode);

    // Check for unique product name
    const existingByName = await this.repo.findByName(createProductDto.productName);
    validateUniqueness(existingByName, undefined, 'product name', createProductDto.productName);

    return this.repo.create(createProductDto);
  }

  async updateProduct(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const existingProduct = await this.repo.findById(id);
    validateEntityExists(existingProduct, 'Product');

    // Check for unique product code if changing
    if (
      updateProductDto.productCode &&
      updateProductDto.productCode !== existingProduct.productCode
    ) {
      const productWithSameCode = await this.repo.findByCode(updateProductDto.productCode);
      validateUniqueness(productWithSameCode, id, 'product code', updateProductDto.productCode);
    }

    // Check for unique product name if changing
    if (
      updateProductDto.productName &&
      updateProductDto.productName !== existingProduct.productName
    ) {
      const productWithSameName = await this.repo.findByName(updateProductDto.productName);
      validateUniqueness(productWithSameName, id, 'product name', updateProductDto.productName);
    }

    const updated = await this.repo.update(id, updateProductDto);
    // Safe: validated above that product exists
    validateEntityExists(updated, 'Product');
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    const product = await this.repo.findById(id);
    validateEntityExists(product, 'Product');

    const deleted = await this.repo.delete(id);
    validateDeletion(deleted, 'Product');
  }

  async getProductCount(): Promise<number> {
    return this.repo.count();
  }
}
