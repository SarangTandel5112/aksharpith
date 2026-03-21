import { ProductCategory } from '@entities/product-category.entity';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoryDto } from '../dtos';
import { PaginatedResult } from '@common/types';

export interface ICategoryService {
  getAllCategories(query: QueryCategoryDto): Promise<PaginatedResult<ProductCategory>>;
  getCategoryById(id: number): Promise<ProductCategory>;
  createCategory(data: CreateCategoryDto): Promise<ProductCategory>;
  updateCategory(id: number, data: UpdateCategoryDto): Promise<ProductCategory>;
  deleteCategory(id: number): Promise<void>;
}
