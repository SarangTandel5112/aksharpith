import {
  CategoryRepository,
  CategoryQueryOptions,
  PaginatedResult,
} from './category.repository';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoryDto } from './dtos';
import { ProductCategory } from '@entities';
import logger from '@setup/logger';

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

  async getCategoryById(id: number): Promise<ProductCategory | null> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async createCategory(
    createCategoryDto: CreateCategoryDto
  ): Promise<ProductCategory> {
    // Check if category with same name already exists
    const existingCategory = await this.categoryRepository.findByName(
      createCategoryDto.categoryName
    );
    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }

    const category = await this.categoryRepository.create(createCategoryDto);
    logger.info(`Category created: ${category.categoryName}`);
    return category;
  }

  async updateCategory(
    id: number,
    updateCategoryDto: UpdateCategoryDto
  ): Promise<ProductCategory> {
    // Check if category exists
    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      throw new Error('Category not found');
    }

    // If updating name, check if new name is already taken
    if (updateCategoryDto.categoryName) {
      const categoryWithSameName = await this.categoryRepository.findByName(
        updateCategoryDto.categoryName
      );
      if (categoryWithSameName && categoryWithSameName.id !== id) {
        throw new Error('Category with this name already exists');
      }
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
    if (!category) {
      throw new Error('Category not found');
    }

    const deleted = await this.categoryRepository.delete(id);
    if (!deleted) {
      throw new Error('Failed to delete category');
    }
    logger.info(`Category deleted: ${id}`);
  }

  async getCategoryCount(): Promise<number> {
    return this.categoryRepository.count();
  }
}
