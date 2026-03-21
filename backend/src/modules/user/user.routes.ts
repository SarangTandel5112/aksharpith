import { Router } from 'express';
import { UserController } from './user.controller';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { authMiddleware } from '@middlewares/auth.middleware';
import { CreateUserDto, UpdateUserDto } from './dtos';

export const createUserRoutes = (userController: UserController): Router => {
  const router = Router();

  // User CRUD endpoints
  router.get('/', authMiddleware, userController.getAllUsers);
  router.post('/', authMiddleware, validationMiddleware(CreateUserDto), userController.createUser);
  router.get('/stats/count', authMiddleware, userController.getUserCount);
  router.get('/:id', authMiddleware, userController.getUserById);
  router.put('/:id', authMiddleware, validationMiddleware(UpdateUserDto), userController.updateUser);
  router.delete('/:id', authMiddleware, userController.deleteUser);

  return router;
};
