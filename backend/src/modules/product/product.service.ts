import {
  ProductRepository,
  ProductQueryOptions,
  PaginatedResult,
} from './product.repository';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dtos';
import { Product } from '@entities';
import { CategoryRepository } from '@modules/category/category.repository';
import logger from '@setup/logger';

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

  async getProductById(id: number): Promise<Product | null> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    // Verify category exists
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    return this.productRepository.findByCategoryId(categoryId);
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    // Verify category exists
    const category = await this.categoryRepository.findById(
      createProductDto.categoryId
    );
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if product with same name already exists
    const existingProduct = await this.productRepository.findByName(
      createProductDto.productName
    );
    if (existingProduct) {
      throw new Error('Product with this name already exists');
    }

    const product = await this.productRepository.create(createProductDto);
    logger.info(`Product created: ${product.productName}`);
    return product;
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto
  ): Promise<Product> {
    // Check if product exists
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // If updating category, verify it exists
    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findById(
        updateProductDto.categoryId
      );
      if (!category) {
        throw new Error('Category not found');
      }
    }

    // If updating name, check if new name is already taken
    if (updateProductDto.productName) {
      const productWithSameName = await this.productRepository.findByName(
        updateProductDto.productName
      );
      if (productWithSameName && productWithSameName.id !== id) {
        throw new Error('Product with this name already exists');
      }
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
    if (!product) {
      throw new Error('Product not found');
    }

    const deleted = await this.productRepository.delete(id);
    if (!deleted) {
      throw new Error('Failed to delete product');
    }
    logger.info(`Product deleted: ${id}`);
  }

  async getProductCount(): Promise<number> {
    return this.productRepository.count();
  }

  async getProductCountByCategory(categoryId: number): Promise<number> {
    // Verify category exists
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    return this.productRepository.countByCategory(categoryId);
  }
}
