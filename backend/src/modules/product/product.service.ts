import {
  ProductRepository,
  ProductQueryOptions,
} from './product.repository';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dtos';
import { Product } from '@entities';
import { CategoryRepository } from '@modules/category/category.repository';
import { DepartmentRepository } from '@modules/department/department.repository';
import { SubCategoryRepository } from '@modules/sub-category/sub-category.repository';
import { PaginatedResult } from '@common/types';
import { validateEntityExists, validateUniqueness, validateDeletion } from '@helpers/entity.helper';
import { GSTHelper } from '@helpers/gst.helper';
import logger from '@setup/logger';

/**
 * Product Service
 * Uses entity helpers to reduce code duplication
 * Implements business logic for product management
 */
export class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private categoryRepository: CategoryRepository,
    private departmentRepository: DepartmentRepository,
    private subCategoryRepository: SubCategoryRepository
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
    // Validate department exists
    const department = await this.departmentRepository.findById(
      createProductDto.departmentId
    );
    validateEntityExists(department, 'Department');

    // Validate sub-category exists
    const subCategory = await this.subCategoryRepository.findById(
      createProductDto.subCategoryId
    );
    validateEntityExists(subCategory, 'SubCategory');

    // Validate GST configuration
    const gstErrors = GSTHelper.validateGSTConfiguration({
      nonTaxable: createProductDto.nonTaxable,
      gst1Sgst: createProductDto.gst1Sgst,
      gst2Cgst: createProductDto.gst2Cgst,
      gst3Igst: createProductDto.gst3Igst,
      gst1Slab: createProductDto.gst1Slab,
      gst2Slab: createProductDto.gst2Slab,
      gst3Slab: createProductDto.gst3Slab,
    });

    if (gstErrors.length > 0) {
      throw new Error(`GST validation errors: ${gstErrors.join(', ')}`);
    }

    // Check for unique product name
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

    // Validate department if provided
    if (updateProductDto.departmentId) {
      const department = await this.departmentRepository.findById(
        updateProductDto.departmentId
      );
      validateEntityExists(department, 'Department');
    }

    // Validate sub-category if provided
    if (updateProductDto.subCategoryId) {
      const subCategory = await this.subCategoryRepository.findById(
        updateProductDto.subCategoryId
      );
      validateEntityExists(subCategory, 'SubCategory');
    }

    // Validate GST configuration if any GST fields are being updated
    if (
      updateProductDto.nonTaxable !== undefined ||
      updateProductDto.gst1Sgst !== undefined ||
      updateProductDto.gst2Cgst !== undefined ||
      updateProductDto.gst3Igst !== undefined
    ) {
      const gstErrors = GSTHelper.validateGSTConfiguration({
        nonTaxable: updateProductDto.nonTaxable ?? existingProduct.nonTaxable,
        gst1Sgst: updateProductDto.gst1Sgst ?? existingProduct.gst1Sgst,
        gst2Cgst: updateProductDto.gst2Cgst ?? existingProduct.gst2Cgst,
        gst3Igst: updateProductDto.gst3Igst ?? existingProduct.gst3Igst,
        gst1Slab: updateProductDto.gst1Slab ?? existingProduct.gst1Slab,
        gst2Slab: updateProductDto.gst2Slab ?? existingProduct.gst2Slab,
        gst3Slab: updateProductDto.gst3Slab ?? existingProduct.gst3Slab,
      });

      if (gstErrors.length > 0) {
        throw new Error(`GST validation errors: ${gstErrors.join(', ')}`);
      }
    }

    // Check for unique product name if changing
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
