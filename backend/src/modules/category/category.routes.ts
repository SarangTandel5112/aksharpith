import { Router } from 'express';
import { CategoryController } from './category.controller';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { authMiddleware } from '@middlewares/auth.middleware';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  QueryCategoryDto,
} from './dtos';

export const createCategoryRoutes = (
  categoryController: CategoryController
): Router => {
  const router = Router();

  // Public routes (GET)
  router.get(
    '/',
    validationMiddleware(QueryCategoryDto, 'query'),
    categoryController.getAllCategories
  );

  router.get('/:id', categoryController.getCategoryById);

  router.get('/stats/count', categoryController.getCategoryCount);

  // Protected routes (require authentication)
  router.post(
    '/',
    authMiddleware,
    validationMiddleware(CreateCategoryDto),
    categoryController.createCategory
  );

  router.put(
    '/:id',
    authMiddleware,
    validationMiddleware(UpdateCategoryDto),
    categoryController.updateCategory
  );

  router.delete('/:id', authMiddleware, categoryController.deleteCategory);

  return router;
};
