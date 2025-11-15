import { Request, Response } from 'express';
import { UserService } from './user.service';
import { ResponseHelper } from '@common/response.helper';
import { AuthenticatedRequest } from '@types';

export class UserController {
  constructor(private userService: UserService) {}

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.getAllUsers(req.query);
      ResponseHelper.success(res, result, 'Users retrieved successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get users';
      ResponseHelper.error(res, message, 500);
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ResponseHelper.error(res, 'Invalid user ID', 400);
        return;
      }

      const user = await this.userService.getUserById(id);
      ResponseHelper.success(res, user, 'User retrieved successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get user';
      const statusCode = message === 'User not found' ? 404 : 500;
      ResponseHelper.error(res, message, statusCode);
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ResponseHelper.error(res, 'Invalid user ID', 400);
        return;
      }

      const user = await this.userService.updateUser(id, req.body);
      ResponseHelper.success(res, user, 'User updated successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update user';
      const statusCode = message === 'User not found' ? 404 : 400;
      ResponseHelper.error(res, message, statusCode);
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ResponseHelper.error(res, 'Invalid user ID', 400);
        return;
      }

      await this.userService.deleteUser(id);
      ResponseHelper.success(res, null, 'User deleted successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete user';
      const statusCode = message === 'User not found' ? 404 : 500;
      ResponseHelper.error(res, message, statusCode);
    }
  };

  getUserCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const count = await this.userService.getUserCount();
      ResponseHelper.success(res, { count }, 'User count retrieved successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get user count';
      ResponseHelper.error(res, message, 500);
    }
  };

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.userService.createUser(req.body);
      ResponseHelper.success(res, user, 'User created successfully', 201);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create user';
      ResponseHelper.error(res, message, 400);
    }
  };

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.register(req.body);
      ResponseHelper.success(res, result, 'User registered successfully', 201);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registration failed';
      ResponseHelper.error(res, message, 400);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.login(req.body);
      ResponseHelper.success(res, result, 'Login successful');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      ResponseHelper.error(res, message, 401);
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        ResponseHelper.unauthorized(res);
        return;
      }

      const user = await this.userService.getProfile(userId);
      if (!user) {
        ResponseHelper.notFound(res, 'User not found');
        return;
      }

      ResponseHelper.success(res, user, 'Profile retrieved successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get profile';
      ResponseHelper.error(res, message, 500);
    }
  };
}
