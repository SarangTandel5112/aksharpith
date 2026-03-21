import { SubCategory } from '@entities/sub-category.entity';
import { CreateSubCategoryDto, UpdateSubCategoryDto, QuerySubCategoryDto } from '../dtos';
import { PaginatedResult } from '@common/types';

export interface ISubCategoryService {
  getAllSubCategories(query: QuerySubCategoryDto): Promise<PaginatedResult<SubCategory>>;
  getSubCategoryById(id: number): Promise<SubCategory>;
  createSubCategory(data: CreateSubCategoryDto): Promise<SubCategory>;
  updateSubCategory(id: number, data: UpdateSubCategoryDto): Promise<SubCategory>;
  deleteSubCategory(id: number): Promise<void>;
}
