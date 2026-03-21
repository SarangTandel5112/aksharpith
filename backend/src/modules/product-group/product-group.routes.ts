import { Router } from 'express';
import { authMiddleware } from '@middlewares/auth.middleware';
import { ProductGroupController } from './product-group.controller';

export function createProductGroupRoutes(controller: ProductGroupController): Router {
  const router = Router();
  router.get('/', authMiddleware, controller.getAll);
  router.get('/:id', authMiddleware, controller.getById);
  router.post('/', authMiddleware, controller.create);
  router.put('/:id', authMiddleware, controller.update);
  router.delete('/:id', authMiddleware, controller.delete);
  return router;
}
