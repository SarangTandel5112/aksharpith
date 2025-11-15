import { Router } from 'express';
import { RoleController } from './role.controller';
import { authMiddleware } from '@middlewares/auth.middleware';

export const createRoleRoutes = (roleController: RoleController): Router => {
  const router = Router();

  router.get('/', authMiddleware, roleController.getAllRoles);
  router.get('/:id', authMiddleware, roleController.getRoleById);

  return router;
};
