import { Repository, SelectQueryBuilder } from 'typeorm';
import { SubCategory } from '@entities/sub-category.entity';
import { BaseRepository } from '@common/base.repository';
import { ISubCategoryRepository } from './interfaces/sub-category.repository.interface';
import { QuerySubCategoryDto } from './dtos';
import { PaginatedResult } from '@common/types';

export class SubCategoryRepository
  extends BaseRepository<SubCategory>
  implements ISubCategoryRepository
{
  constructor(repo: Repository<SubCategory>) {
    super(repo);
  }

  protected getEntityName(): string {
    return 'subCategory';
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'subCategoryName', 'displayOrder', 'createdAt', 'updatedAt'];
  }

  protected applySearchFilter(
    queryBuilder: SelectQueryBuilder<SubCategory>,
    search: string
  ): void {
    queryBuilder.andWhere(
      '(subCategory.subCategoryName LIKE :search OR subCategory.description LIKE :search)',
      { search: `%${search}%` }
    );
  }

  async findAll(options: QuerySubCategoryDto): Promise<PaginatedResult<SubCategory>> {
    return this.findAllWithPagination(options, (qb) => {
      if (options.subCategoryName) {
        qb.andWhere('subCategory.subCategoryName LIKE :name', {
          name: `%${options.subCategoryName}%`,
        });
      }
      if (options.categoryId !== undefined) {
        qb.andWhere('subCategory.categoryId = :categoryId', {
          categoryId: options.categoryId,
        });
      }
      if (options.isActive !== undefined) {
        qb.andWhere('subCategory.isActive = :isActive', { isActive: options.isActive });
      }
    });
  }

  async findByCategoryId(categoryId: number): Promise<SubCategory[]> {
    return this.repository.find({ where: { categoryId, isActive: true } });
  }

  async findByNameAndCategory(name: string, categoryId: number): Promise<SubCategory | null> {
    return this.repository.findOne({
      where: { subCategoryName: name, categoryId, isActive: true },
    });
  }
}
