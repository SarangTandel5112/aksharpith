import { SubCategory } from '@entities/sub-category.entity';
import { ISubCategoryRepository } from './interfaces/sub-category.repository.interface';
import { CreateSubCategoryDto, UpdateSubCategoryDto, QuerySubCategoryDto } from './dtos';
import { PaginatedResult } from '@common/types';
import { validateEntityExists, validateDeletion } from '@helpers/entity.helper';

export class SubCategoryService {
  constructor(private repo: ISubCategoryRepository) {}

  async getAllSubCategories(query: QuerySubCategoryDto): Promise<PaginatedResult<SubCategory>> {
    return this.repo.findAll(query);
  }

  async getSubCategoryById(id: number): Promise<SubCategory> {
    const subCategory = await this.repo.findById(id);
    validateEntityExists(subCategory, 'SubCategory');
    return subCategory;
  }

  async createSubCategory(data: CreateSubCategoryDto): Promise<SubCategory> {
    const existing = await this.repo.findByNameAndCategory(data.subCategoryName, data.categoryId);
    if (existing) {
      throw new Error(`Sub-category name '${data.subCategoryName}' already exists in this category`);
    }
    return this.repo.create(data);
  }

  async updateSubCategory(id: number, data: UpdateSubCategoryDto): Promise<SubCategory> {
    const subCategory = await this.repo.findById(id);
    validateEntityExists(subCategory, 'SubCategory');

    if (
      data.subCategoryName &&
      (data.subCategoryName !== subCategory.subCategoryName ||
        (data.categoryId && data.categoryId !== subCategory.categoryId))
    ) {
      const targetCategoryId = data.categoryId ?? subCategory.categoryId;
      const existing = await this.repo.findByNameAndCategory(data.subCategoryName, targetCategoryId);
      if (existing && existing.id !== id) {
        throw new Error(
          `Sub-category name '${data.subCategoryName}' already exists in this category`
        );
      }
    }

    const updated = await this.repo.update(id, data);
    validateEntityExists(updated, 'SubCategory');
    return updated;
  }

  async deleteSubCategory(id: number): Promise<void> {
    const subCategory = await this.repo.findById(id);
    validateEntityExists(subCategory, 'SubCategory');

    const deleted = await this.repo.delete(id);
    validateDeletion(deleted, 'SubCategory');
  }
}
