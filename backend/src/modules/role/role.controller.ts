import { BaseController } from '@common/base.controller';
import { RoleService } from './role.service';

export class RoleController extends BaseController {
  constructor(private service: RoleService) { super(); }

  getAllRoles = this.handleGetAll(
    () => this.service.getAllRoles(),
    'Roles retrieved successfully'
  );

  getRoleById = this.handleGetById(
    (id) => this.service.getRoleById(id),
    'Role retrieved successfully'
  );
}
