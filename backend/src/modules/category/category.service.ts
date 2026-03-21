import { ProductCategory } from '@entities/product-category.entity';
import { ICategoryRepository } from './interfaces/category.repository.interface';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoryDto } from './dtos';
import { PaginatedResult } from '@common/types';
import { validateEntityExists, validateUniqueness, validateDeletion } from '@helpers/entity.helper';

export class CategoryService {
  constructor(private repo: ICategoryRepository) {}

  async getAllCategories(query: QueryCategoryDto): Promise<PaginatedResult<ProductCategory>> {
    return this.repo.findAll(query);
  }

  async getCategoryById(id: number): Promise<ProductCategory> {
    const category = await this.repo.findById(id);
    validateEntityExists(category, 'Category');
    return category;
  }

  async createCategory(data: CreateCategoryDto): Promise<ProductCategory> {
    const existing = await this.repo.findByName(data.categoryName);
    validateUniqueness(existing, undefined, 'category name', data.categoryName);
    return this.repo.create(data);
  }

  async updateCategory(id: number, data: UpdateCategoryDto): Promise<ProductCategory> {
    const category = await this.repo.findById(id);
    validateEntityExists(category, 'Category');

    if (data.categoryName && data.categoryName !== category.categoryName) {
      const existing = await this.repo.findByName(data.categoryName);
      validateUniqueness(existing, id, 'category name', data.categoryName);
    }

    const updated = await this.repo.update(id, data);
    validateEntityExists(updated, 'Category');
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    const category = await this.repo.findById(id);
    validateEntityExists(category, 'Category');

    const deleted = await this.repo.delete(id);
    validateDeletion(deleted, 'Category');
  }

  async getCategoryCount(): Promise<number> {
    return this.repo.count();
  }
}
