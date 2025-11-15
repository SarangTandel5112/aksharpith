import {
  ProductRepository,
  ProductQueryOptions,
} from './product.repository';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dtos';
import { Product } from '@entities';
import { CategoryRepository } from '@modules/category/category.repository';
import { PaginatedResult } from '@common/types';
import { validateEntityExists, validateUniqueness, validateDeletion } from '@helpers/entity.helper';
import logger from '@setup/logger';

/**
 * Product Service
 * Uses entity helpers to reduce code duplication
 * Implements business logic for product management
 */
export class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private categoryRepository: CategoryRepository
  ) {}

  async getAllProducts(
    query: QueryProductDto
  ): Promise<PaginatedResult<Product>> {
    const options: ProductQueryOptions = {
      search: query.search,
      categoryId: query.categoryId,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      minStock: query.minStock,
      page: query.page || 1,
      limit: query.limit || 10,
      sortBy: query.sortBy || 'createdAt',
      order: query.order || 'DESC',
    };

    return this.productRepository.findAll(options);
  }

  async getProductById(id: number): Promise<Product> {
    const product = await this.productRepository.findById(id);
    validateEntityExists(product, 'Product');
    return product;
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    const category = await this.categoryRepository.findById(categoryId);
    validateEntityExists(category, 'Category');

    return this.productRepository.findByCategoryId(categoryId);
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const category = await this.categoryRepository.findById(
      createProductDto.categoryId
    );
    validateEntityExists(category, 'Category');

    const existingProduct = await this.productRepository.findByName(
      createProductDto.productName
    );
    validateUniqueness(existingProduct, undefined, 'product', createProductDto.productName);

    const product = await this.productRepository.create(createProductDto);
    logger.info(`Product created: ${product.productName}`);
    return product;
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto
  ): Promise<Product> {
    const existingProduct = await this.productRepository.findById(id);
    validateEntityExists(existingProduct, 'Product');

    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findById(
        updateProductDto.categoryId
      );
      validateEntityExists(category, 'Category');
    }

    if (updateProductDto.productName) {
      const productWithSameName = await this.productRepository.findByName(
        updateProductDto.productName
      );
      validateUniqueness(productWithSameName, id, 'product', updateProductDto.productName);
    }

    const updatedProduct = await this.productRepository.update(
      id,
      updateProductDto
    );
    logger.info(`Product updated: ${id}`);
    return updatedProduct!;
  }

  async deleteProduct(id: number): Promise<void> {
    const product = await this.productRepository.findById(id);
    validateEntityExists(product, 'Product');

    const deleted = await this.productRepository.delete(id);
    validateDeletion(deleted, 'product');
    logger.info(`Product deleted: ${id}`);
  }

  async getProductCount(): Promise<number> {
    return this.productRepository.count();
  }

  async getProductCountByCategory(categoryId: number): Promise<number> {
    const category = await this.categoryRepository.findById(categoryId);
    validateEntityExists(category, 'Category');

    return this.productRepository.countByCategory(categoryId);
  }
}
