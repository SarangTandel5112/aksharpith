import { SubCategory } from '@entities/sub-category.entity';
import { SubCategoryRepository } from './sub-category.repository';
import { CreateSubCategoryDto, UpdateSubCategoryDto, QuerySubCategoryDto } from './dtos';
import { validateEntityExists, validateDeletion } from '@helpers/entity.helper';

export class SubCategoryService {
  constructor(private subCategoryRepository: SubCategoryRepository) {}

  async getAllSubCategories(query: QuerySubCategoryDto) {
    return this.subCategoryRepository.findAll(query);
  }

  async getSubCategoryById(id: number): Promise<SubCategory> {
    const subCategory = await this.subCategoryRepository.findById(id);
    validateEntityExists(subCategory, 'SubCategory');
    return subCategory;
  }

  async createSubCategory(data: CreateSubCategoryDto): Promise<SubCategory> {
    // Check for unique sub-category name within the same category
    const existing = await this.subCategoryRepository.findByCategoryAndName(data.categoryId, data.subCategoryName);
    if (existing) {
      throw new Error('Sub-category name already exists in this category');
    }

    return this.subCategoryRepository.create(data);
  }

  async updateSubCategory(id: number, data: UpdateSubCategoryDto): Promise<SubCategory> {
    const subCategory = await this.subCategoryRepository.findById(id);
    validateEntityExists(subCategory, 'SubCategory');

    // Check for unique sub-category name if changing
    if (
      data.subCategoryName &&
      (data.subCategoryName !== subCategory.subCategoryName || (data.categoryId && data.categoryId !== subCategory.categoryId))
    ) {
      const targetCategoryId = data.categoryId || subCategory.categoryId;
      const existing = await this.subCategoryRepository.findByCategoryAndName(targetCategoryId, data.subCategoryName);
      if (existing && existing.id !== id) {
        throw new Error('Sub-category name already exists in this category');
      }
    }

    const updated = await this.subCategoryRepository.update(id, data);
    validateEntityExists(updated, 'SubCategory');
    return updated;
  }

  async deleteSubCategory(id: number): Promise<void> {
    const subCategory = await this.subCategoryRepository.findById(id);
    validateEntityExists(subCategory, 'SubCategory');

    // Note: Cannot delete sub-category if products exist (enforced by database RESTRICT constraint)
    const deleted = await this.subCategoryRepository.delete(id);
    validateDeletion(deleted, 'SubCategory', 'Products may be associated with this sub-category');
  }

  async getSubCategoryCount(categoryId?: number): Promise<number> {
    if (categoryId) {
      return this.subCategoryRepository.getCountByCategory(categoryId);
    }
    return this.subCategoryRepository.getCount();
  }
}
