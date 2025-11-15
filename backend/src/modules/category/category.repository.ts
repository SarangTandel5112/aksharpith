import { SelectQueryBuilder } from 'typeorm';
import { AppDataSource } from '@config/database.config';
import { ProductCategory } from '@entities';
import { BaseRepository } from '@common/base.repository';
import { BaseQueryOptions, PaginatedResult } from '@common/types';

export interface CategoryQueryOptions extends BaseQueryOptions {}

/**
 * Category Repository
 * Extends BaseRepository to inherit common data access patterns
 * Only implements category-specific logic
 */
export class CategoryRepository extends BaseRepository<ProductCategory> {
  constructor() {
    super(AppDataSource.getRepository(ProductCategory));
  }

  protected getEntityName(): string {
    return 'category';
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'categoryName', 'description', 'createdAt', 'updatedAt'];
  }

  protected applySearchFilter(
    queryBuilder: SelectQueryBuilder<ProductCategory>,
    search: string
  ): void {
    queryBuilder.andWhere(
      '(category.categoryName LIKE :search OR category.description LIKE :search)',
      { search: `%${search}%` }
    );
  }

  async findAll(
    options: CategoryQueryOptions
  ): Promise<PaginatedResult<ProductCategory>> {
    return this.findAllWithPagination(options);
  }

  async findByName(categoryName: string): Promise<ProductCategory | null> {
    return this.repository.findOne({ where: { categoryName, isActive: true } });
  }
}
