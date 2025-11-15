import { SelectQueryBuilder } from 'typeorm';
import { AppDataSource } from '@config/database.config';
import { Product } from '@entities';
import { BaseRepository } from '@common/base.repository';
import { BaseQueryOptions, PaginatedResult } from '@common/types';

export interface ProductQueryOptions extends BaseQueryOptions {
  categoryId?: number;
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
      'productName',
      'price',
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
    const { categoryId, minPrice, maxPrice, minStock, sortBy, order } = options;

    return this.findAllWithPagination(options, (qb) => {
      // Add category relation
      qb.leftJoinAndSelect('product.category', 'category');

      // Apply category filter
      if (categoryId) {
        qb.andWhere('product.categoryId = :categoryId', { categoryId });
      }

      // Apply price range filter
      if (minPrice !== undefined && maxPrice !== undefined) {
        qb.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
          minPrice,
          maxPrice,
        });
      } else if (minPrice !== undefined) {
        qb.andWhere('product.price >= :minPrice', { minPrice });
      } else if (maxPrice !== undefined) {
        qb.andWhere('product.price <= :maxPrice', { maxPrice });
      }

      // Apply stock filter
      if (minStock !== undefined) {
        qb.andWhere('product.stockQuantity >= :minStock', { minStock });
      }

      // Handle special case for category sorting
      if (sortBy === 'categoryId' || sortBy === 'category') {
        qb.orderBy('category.categoryName', order || 'DESC');
      }
    });
  }

  async findById(id: number): Promise<Product | null> {
    return super.findById(id, ['category']);
  }

  async findByName(productName: string): Promise<Product | null> {
    return this.repository.findOne({ where: { productName, isActive: true } });
  }

  async findByCategoryId(categoryId: number): Promise<Product[]> {
    return this.repository.find({
      where: { categoryId, isActive: true },
      relations: ['category'],
    });
  }

  async countByCategory(categoryId: number): Promise<number> {
    return this.count({ categoryId });
  }
}
