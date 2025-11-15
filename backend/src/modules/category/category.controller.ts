import { CategoryService } from './category.service';
import { BaseController } from '@common/base.controller';

/**
 * Category Controller
 * Extends BaseController to inherit common controller patterns
 * Reduces code duplication by using generic handlers
 */
export class CategoryController extends BaseController {
  constructor(private categoryService: CategoryService) {
    super();
  }

  getAllCategories = this.handleGetAll(
    (query) => this.categoryService.getAllCategories(query),
    'Categories retrieved successfully'
  );

  getCategoryById = this.handleGetById(
    (id) => this.categoryService.getCategoryById(id),
    'Category retrieved successfully'
  );

  createCategory = this.handleCreate(
    (data) => this.categoryService.createCategory(data),
    'Category created successfully'
  );

  updateCategory = this.handleUpdate(
    (id, data) => this.categoryService.updateCategory(id, data),
    'Category updated successfully'
  );

  deleteCategory = this.handleDelete(
    (id) => this.categoryService.deleteCategory(id),
    'Category deleted successfully'
  );

  getCategoryCount = this.handleGetCount(
    () => this.categoryService.getCategoryCount(),
    'Category count retrieved successfully'
  );
}
