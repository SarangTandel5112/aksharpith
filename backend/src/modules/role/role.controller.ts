import { Request, Response } from 'express';
import { RoleService } from './role.service';
import { ResponseHelper } from '@common/response.helper';

export class RoleController {
  constructor(private roleService: RoleService) {}

  getAllRoles = async (req: Request, res: Response): Promise<void> => {
    try {
      const roles = await this.roleService.getAllRoles();
      ResponseHelper.success(res, roles, 'Roles retrieved successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get roles';
      ResponseHelper.error(res, message, 500);
    }
  };

  getRoleById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        ResponseHelper.error(res, 'Invalid role ID', 400);
        return;
      }

      const role = await this.roleService.getRoleById(id);
      ResponseHelper.success(res, role, 'Role retrieved successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get role';
      const statusCode = message === 'Role not found' ? 404 : 500;
      ResponseHelper.error(res, message, statusCode);
    }
  };
}
