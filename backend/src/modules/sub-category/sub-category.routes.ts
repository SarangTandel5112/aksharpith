import { Router } from 'express';
import { SubCategoryController } from './sub-category.controller';
import { authenticate } from '@middlewares/auth.middleware';

export function createSubCategoryRoutes(controller: SubCategoryController): Router {
  const router = Router();

  // Protected routes (require authentication)
  router.get('/', authenticate, controller.getAllSubCategories);
  router.get('/stats/count', authenticate, controller.getSubCategoryCount);
  router.get('/:id', authenticate, controller.getSubCategoryById);
  router.post('/', authenticate, controller.createSubCategory);
  router.put('/:id', authenticate, controller.updateSubCategory);
  router.delete('/:id', authenticate, controller.deleteSubCategory);

  return router;
}
