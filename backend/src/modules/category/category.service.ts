import {
  CategoryRepository,
  CategoryQueryOptions,
} from './category.repository';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoryDto } from './dtos';
import { ProductCategory } from '@entities';
import { PaginatedResult } from '@common/types';
import { validateEntityExists, validateUniqueness, validateDeletion } from '@helpers/entity.helper';
import logger from '@setup/logger';

/**
 * Category Service
 * Uses entity helpers to reduce code duplication
 * Implements business logic for category management
 */
export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async getAllCategories(
    query: QueryCategoryDto
  ): Promise<PaginatedResult<ProductCategory>> {
    const options: CategoryQueryOptions = {
      search: query.search,
      page: query.page || 1,
      limit: query.limit || 10,
      sortBy: query.sortBy || 'createdAt',
      order: query.order || 'DESC',
    };

    return this.categoryRepository.findAll(options);
  }

  async getCategoryById(id: number): Promise<ProductCategory> {
    const category = await this.categoryRepository.findById(id);
    validateEntityExists(category, 'Category');
    return category;
  }

  async createCategory(
    createCategoryDto: CreateCategoryDto
  ): Promise<ProductCategory> {
    const existingCategory = await this.categoryRepository.findByName(
      createCategoryDto.categoryName
    );
    validateUniqueness(existingCategory, undefined, 'category', createCategoryDto.categoryName);

    const category = await this.categoryRepository.create(createCategoryDto);
    logger.info(`Category created: ${category.categoryName}`);
    return category;
  }

  async updateCategory(
    id: number,
    updateCategoryDto: UpdateCategoryDto
  ): Promise<ProductCategory> {
    const existingCategory = await this.categoryRepository.findById(id);
    validateEntityExists(existingCategory, 'Category');

    if (updateCategoryDto.categoryName) {
      const categoryWithSameName = await this.categoryRepository.findByName(
        updateCategoryDto.categoryName
      );
      validateUniqueness(categoryWithSameName, id, 'category', updateCategoryDto.categoryName);
    }

    const updatedCategory = await this.categoryRepository.update(
      id,
      updateCategoryDto
    );
    logger.info(`Category updated: ${id}`);
    return updatedCategory!;
  }

  async deleteCategory(id: number): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    validateEntityExists(category, 'Category');

    const deleted = await this.categoryRepository.delete(id);
    validateDeletion(deleted, 'category');
    logger.info(`Category deleted: ${id}`);
  }

  async getCategoryCount(): Promise<number> {
    return this.categoryRepository.count();
  }
}
