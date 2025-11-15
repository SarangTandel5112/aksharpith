import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { authMiddleware } from '@middlewares/auth.middleware';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dtos';

export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  // Public routes
  router.post(
    '/register',
    validationMiddleware(RegisterDto),
    authController.register
  );

  router.post('/login', validationMiddleware(LoginDto), authController.login);

  router.post(
    '/refresh-token',
    validationMiddleware(RefreshTokenDto),
    authController.refreshToken
  );

  // Protected routes
  router.get('/validate', authMiddleware, authController.validateToken);

  router.post('/logout', authMiddleware, authController.logout);

  return router;
};
