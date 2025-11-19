import { Router } from 'express';
import { DepartmentController } from './department.controller';
import { authMiddleware } from '@middlewares/auth.middleware';

export function createDepartmentRoutes(controller: DepartmentController): Router {
  const router = Router();

  // Public routes (if needed)
  // router.get('/', controller.getAllDepartments);
  // router.get('/:id', controller.getDepartmentById);

  // Protected routes (require authentication)
  router.get('/', authMiddleware, controller.getAllDepartments);
  router.get('/stats/count', authMiddleware, controller.getDepartmentCount);
  router.get('/:id', authMiddleware, controller.getDepartmentById);
  router.post('/', authMiddleware, controller.createDepartment);
  router.put('/:id', authMiddleware, controller.updateDepartment);
  router.delete('/:id', authMiddleware, controller.deleteDepartment);

  return router;
}
