import { UserRole } from '@entities/user-role.entity';

export interface IRoleService {
  getAllRoles(): Promise<UserRole[]>;
  getRoleById(id: number): Promise<UserRole>;
  getRoleByName(name: string): Promise<UserRole | null>;
}
