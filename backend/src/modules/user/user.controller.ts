import { UserService } from './user.service';
import { BaseController } from '@common/base.controller';

/**
 * User Controller
 * Extends BaseController to inherit common controller patterns
 * Contains CRUD operations for user management
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
}
