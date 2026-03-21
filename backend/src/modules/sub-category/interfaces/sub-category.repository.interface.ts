import { IRepository } from '@common/interfaces/repository.interface';
import { SubCategory } from '@entities/sub-category.entity';
import { PaginatedResult } from '@common/types';
import { QuerySubCategoryDto } from '../dtos';

export interface ISubCategoryRepository extends IRepository<SubCategory> {
  findAll(options: QuerySubCategoryDto): Promise<PaginatedResult<SubCategory>>;
  findByCategoryId(categoryId: number): Promise<SubCategory[]>;
  findByNameAndCategory(name: string, categoryId: number): Promise<SubCategory | null>;
}
