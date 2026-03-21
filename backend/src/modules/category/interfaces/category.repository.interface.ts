import { IRepository } from '@common/interfaces/repository.interface';
import { ProductCategory } from '@entities/product-category.entity';
import { PaginatedResult } from '@common/types';
import { QueryCategoryDto } from '../dtos';

export interface ICategoryRepository extends IRepository<ProductCategory> {
  findAll(options: QueryCategoryDto): Promise<PaginatedResult<ProductCategory>>;
  findByName(name: string): Promise<ProductCategory | null>;
  findByDepartmentId(departmentId: number): Promise<ProductCategory[]>;
}
