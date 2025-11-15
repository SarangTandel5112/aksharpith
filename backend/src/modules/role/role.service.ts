import { RoleRepository } from './role.repository';
import { UserRole } from '@entities';

export class RoleService {
  constructor(private roleRepository: RoleRepository) {}

  async getAllRoles(): Promise<UserRole[]> {
    return this.roleRepository.findAll();
  }

  async getRoleById(id: number): Promise<UserRole | null> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new Error('Role not found');
    }
    return role;
  }
}
