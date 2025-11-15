import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ResponseHelper } from '@common/response.helper';
import { AuthenticatedRequest } from '@types';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      ResponseHelper.success(
        res,
        result,
        'User registered successfully',
        201
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registration failed';
      ResponseHelper.error(res, message, 400);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      ResponseHelper.success(res, result, 'Login successful');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      ResponseHelper.error(res, message, 401);
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.refreshToken(req.body);
      ResponseHelper.success(res, result, 'Token refreshed successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Token refresh failed';
      ResponseHelper.error(res, message, 401);
    }
  };

  validateToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = authReq.user;

      if (!user) {
        ResponseHelper.unauthorized(res);
        return;
      }

      ResponseHelper.success(res, { user }, 'Token is valid');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Token validation failed';
      ResponseHelper.error(res, message, 401);
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      // In a stateless JWT implementation, logout is typically handled client-side
      // by removing the token from storage. However, we can add token blacklisting
      // or other mechanisms here if needed in the future.
      ResponseHelper.success(res, null, 'Logout successful');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      ResponseHelper.error(res, message, 500);
    }
  };
}
