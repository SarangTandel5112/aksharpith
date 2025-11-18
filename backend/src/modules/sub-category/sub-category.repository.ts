import { AppDataSource } from '@config/database.config';
import { SubCategory } from '@entities/sub-category.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseRepository } from '@common/base.repository';
import { QuerySubCategoryDto } from './dtos';

export class SubCategoryRepository extends BaseRepository<SubCategory> {
  protected repository: Repository<SubCategory>;

  constructor() {
    super();
    this.repository = AppDataSource.getRepository(SubCategory);
  }

  protected getEntityName(): string {
    return 'subCategory';
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'subCategoryName', 'displayOrder', 'createdAt', 'updatedAt'];
  }

  protected applySearchFilter(queryBuilder: SelectQueryBuilder<SubCategory>, search: string): void {
    queryBuilder.andWhere('(subCategory.subCategoryName LIKE :search OR subCategory.description LIKE :search)', {
      search: `%${search}%`,
    });
  }

  async findAll(queryOptions: QuerySubCategoryDto) {
    return this.findAllWithPagination(queryOptions, (qb) => {
      if (queryOptions.subCategoryName) {
        qb.andWhere('subCategory.subCategoryName LIKE :name', {
          name: `%${queryOptions.subCategoryName}%`,
        });
      }
      if (queryOptions.categoryId) {
        qb.andWhere('subCategory.categoryId = :categoryId', { categoryId: queryOptions.categoryId });
      }
      if (queryOptions.isActive !== undefined) {
        qb.andWhere('subCategory.isActive = :isActive', { isActive: queryOptions.isActive });
      }
    });
  }

  async findById(id: number): Promise<SubCategory | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async findByCategoryAndName(categoryId: number, subCategoryName: string): Promise<SubCategory | null> {
    return this.repository.findOne({
      where: { categoryId, subCategoryName },
    });
  }

  async create(data: Partial<SubCategory>): Promise<SubCategory> {
    const subCategory = this.repository.create(data);
    return this.repository.save(subCategory);
  }

  async update(id: number, data: Partial<SubCategory>): Promise<SubCategory | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async getCount(): Promise<number> {
    return this.repository.count();
  }

  async getCountByCategory(categoryId: number): Promise<number> {
    return this.repository.count({ where: { categoryId } });
  }
}
