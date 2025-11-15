import { Request, Response } from 'express';
import { CategoryService } from './category.service';
import { ResponseHelper } from '@common/response.helper';

export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  getAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.categoryService.getAllCategories(req.query);
      ResponseHelper.success(
        res,
        result,
        'Categories retrieved successfully'
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get categories';
      ResponseHelper.error(res, message, 500);
    }
  };

  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ResponseHelper.error(res, 'Invalid category ID', 400);
        return;
      }

      const category = await this.categoryService.getCategoryById(id);
      ResponseHelper.success(res, category, 'Category retrieved successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get category';
      const statusCode = message === 'Category not found' ? 404 : 500;
      ResponseHelper.error(res, message, statusCode);
    }
  };

  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const category = await this.categoryService.createCategory(req.body);
      ResponseHelper.success(res, category, 'Category created successfully', 201);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create category';
      ResponseHelper.error(res, message, 400);
    }
  };

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ResponseHelper.error(res, 'Invalid category ID', 400);
        return;
      }

      const category = await this.categoryService.updateCategory(id, req.body);
      ResponseHelper.success(res, category, 'Category updated successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update category';
      const statusCode = message === 'Category not found' ? 404 : 400;
      ResponseHelper.error(res, message, statusCode);
    }
  };

  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ResponseHelper.error(res, 'Invalid category ID', 400);
        return;
      }

      await this.categoryService.deleteCategory(id);
      ResponseHelper.success(res, null, 'Category deleted successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete category';
      const statusCode = message === 'Category not found' ? 404 : 500;
      ResponseHelper.error(res, message, statusCode);
    }
  };

  getCategoryCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const count = await this.categoryService.getCategoryCount();
      ResponseHelper.success(res, { count }, 'Category count retrieved successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get category count';
      ResponseHelper.error(res, message, 500);
    }
  };
}
