import { Router } from 'express';
import { DepartmentController } from './department.controller';
import { authenticate } from '@middlewares/auth.middleware';

export function createDepartmentRoutes(controller: DepartmentController): Router {
  const router = Router();

  // Public routes (if needed)
  // router.get('/', controller.getAllDepartments);
  // router.get('/:id', controller.getDepartmentById);

  // Protected routes (require authentication)
  router.get('/', authenticate, controller.getAllDepartments);
  router.get('/stats/count', authenticate, controller.getDepartmentCount);
  router.get('/:id', authenticate, controller.getDepartmentById);
  router.post('/', authenticate, controller.createDepartment);
  router.put('/:id', authenticate, controller.updateDepartment);
  router.delete('/:id', authenticate, controller.deleteDepartment);

  return router;
}
