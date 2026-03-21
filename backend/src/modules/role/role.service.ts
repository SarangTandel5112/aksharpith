import { IRoleRepository } from './interfaces/role.repository.interface';
import { UserRole } from '@entities/user-role.entity';
import { validateEntityExists } from '@helpers/entity.helper';

export class RoleService {
  constructor(private repo: IRoleRepository) {}

  async getAllRoles(): Promise<UserRole[]> {
    return this.repo.findAll();
  }

  async getRoleById(id: number): Promise<UserRole> {
    const role = await this.repo.findById(id);
    validateEntityExists(role, 'Role');
    return role;
  }
}
