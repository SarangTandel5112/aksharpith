import { Router } from 'express';
import { SubCategoryController } from './sub-category.controller';
import { authMiddleware } from '@middlewares/auth.middleware';

export function createSubCategoryRoutes(controller: SubCategoryController): Router {
  const router = Router();

  // Protected routes (require authentication)
  router.get('/', authMiddleware, controller.getAllSubCategories);
  router.get('/stats/count', authMiddleware, controller.getSubCategoryCount);
  router.get('/:id', authMiddleware, controller.getSubCategoryById);
  router.post('/', authMiddleware, controller.createSubCategory);
  router.put('/:id', authMiddleware, controller.updateSubCategory);
  router.delete('/:id', authMiddleware, controller.deleteSubCategory);

  return router;
}
