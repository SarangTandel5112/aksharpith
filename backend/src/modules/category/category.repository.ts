import { Repository, SelectQueryBuilder } from 'typeorm';
import { ProductCategory } from '@entities/product-category.entity';
import { BaseRepository } from '@common/base.repository';
import { ICategoryRepository } from './interfaces/category.repository.interface';
import { QueryCategoryDto } from './dtos';
import { PaginatedResult } from '@common/types';

export class CategoryRepository
  extends BaseRepository<ProductCategory>
  implements ICategoryRepository
{
  constructor(repo: Repository<ProductCategory>) {
    super(repo);
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

  async findAll(options: QueryCategoryDto): Promise<PaginatedResult<ProductCategory>> {
    return this.findAllWithPagination(options, (qb) => {
      if (options.departmentId !== undefined) {
        qb.andWhere('category.departmentId = :departmentId', {
          departmentId: options.departmentId,
        });
      }
    });
  }

  async findByName(categoryName: string): Promise<ProductCategory | null> {
    return this.repository.findOne({ where: { categoryName, isActive: true } });
  }

  async findByDepartmentId(departmentId: number): Promise<ProductCategory[]> {
    return this.repository.find({ where: { departmentId, isActive: true } });
  }
}
