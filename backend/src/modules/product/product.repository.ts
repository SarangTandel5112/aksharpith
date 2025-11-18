import { SelectQueryBuilder } from 'typeorm';
import { AppDataSource } from '@config/database.config';
import { Product } from '@entities';
import { BaseRepository } from '@common/base.repository';
import { BaseQueryOptions, PaginatedResult } from '@common/types';

export interface ProductQueryOptions extends BaseQueryOptions {
  departmentId?: number;
  subCategoryId?: number;
  categoryId?: number; // For backward compatibility
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
}

/**
 * Product Repository
 * Extends BaseRepository to inherit common data access patterns
 * Implements product-specific filtering logic
 */
export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(AppDataSource.getRepository(Product));
  }

  protected getEntityName(): string {
    return 'product';
  }

  protected getAllowedSortFields(): string[] {
    return [
      'id',
      'productCode',
      'productName',
      'unitPrice',
      'stockQuantity',
      'description',
      'createdAt',
      'updatedAt',
    ];
  }

  protected applySearchFilter(
    queryBuilder: SelectQueryBuilder<Product>,
    search: string
  ): void {
    queryBuilder.andWhere(
      '(product.productName LIKE :search OR product.description LIKE :search)',
      { search: `%${search}%` }
    );
  }

  async findAll(
    options: ProductQueryOptions
  ): Promise<PaginatedResult<Product>> {
    const { departmentId, subCategoryId, categoryId, minPrice, maxPrice, minStock, sortBy, order } = options;

    return this.findAllWithPagination(options, (qb) => {
      // Add relations
      qb.leftJoinAndSelect('product.department', 'department');
      qb.leftJoinAndSelect('product.subCategory', 'subCategory');
      qb.leftJoinAndSelect('subCategory.category', 'category');

      // Apply department filter
      if (departmentId) {
        qb.andWhere('product.departmentId = :departmentId', { departmentId });
      }

      // Apply sub-category filter
      if (subCategoryId) {
        qb.andWhere('product.subCategoryId = :subCategoryId', { subCategoryId });
      }

      // Apply category filter (via subCategory)
      if (categoryId) {
        qb.andWhere('subCategory.categoryId = :categoryId', { categoryId });
      }

      // Apply price range filter
      if (minPrice !== undefined && maxPrice !== undefined) {
        qb.andWhere('product.unitPrice BETWEEN :minPrice AND :maxPrice', {
          minPrice,
          maxPrice,
        });
      } else if (minPrice !== undefined) {
        qb.andWhere('product.unitPrice >= :minPrice', { minPrice });
      } else if (maxPrice !== undefined) {
        qb.andWhere('product.unitPrice <= :maxPrice', { maxPrice });
      }

      // Apply stock filter
      if (minStock !== undefined) {
        qb.andWhere('product.stockQuantity >= :minStock', { minStock });
      }

      // Handle special case for sorting
      if (sortBy === 'department') {
        qb.orderBy('department.departmentName', order || 'DESC');
      } else if (sortBy === 'subCategory' || sortBy === 'categoryId') {
        qb.orderBy('subCategory.subCategoryName', order || 'DESC');
      }
    });
  }

  async findById(id: number): Promise<Product | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['department', 'subCategory', 'subCategory.category'],
    });
  }

  async findByName(productName: string): Promise<Product | null> {
    return this.repository.findOne({ where: { productName, isActive: true } });
  }

  async findByCategoryId(categoryId: number): Promise<Product[]> {
    return this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.department', 'department')
      .leftJoinAndSelect('product.subCategory', 'subCategory')
      .leftJoinAndSelect('subCategory.category', 'category')
      .where('subCategory.categoryId = :categoryId', { categoryId })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async countByCategory(categoryId: number): Promise<number> {
    return this.count({ categoryId });
  }
}
