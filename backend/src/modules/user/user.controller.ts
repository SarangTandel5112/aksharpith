import { Request, Response } from 'express';
import { UserService } from './user.service';
import { BaseController } from '@common/base.controller';
import { ResponseHelper } from '@common/response.helper';
import { AuthenticatedRequest } from '@types';

/**
 * User Controller
 * Extends BaseController to inherit common controller patterns
 * Contains both CRUD operations and auth-related methods
 */
export class UserController extends BaseController {
  constructor(private userService: UserService) {
    super();
  }

  getAllUsers = this.handleGetAll(
    (query) => this.userService.getAllUsers(query),
    'Users retrieved successfully'
  );

  getUserById = this.handleGetById(
    (id) => this.userService.getUserById(id),
    'User retrieved successfully'
  );

  createUser = this.handleCreate(
    (data) => this.userService.createUser(data),
    'User created successfully'
  );

  updateUser = this.handleUpdate(
    (id, data) => this.userService.updateUser(id, data),
    'User updated successfully'
  );

  deleteUser = this.handleDelete(
    (id) => this.userService.deleteUser(id),
    'User deleted successfully'
  );

  getUserCount = this.handleGetCount(
    () => this.userService.getUserCount(),
    'User count retrieved successfully'
  );

  register = this.handleCreate(
    (data) => this.userService.register(data),
    'User registered successfully'
  );

  login = this.asyncHandler(
    async (req) => await this.userService.login(req.body),
    { successMessage: 'Login successful' }
  );

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
