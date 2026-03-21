import { IRepository } from '@common/interfaces/repository.interface';
import { UserRole } from '@entities/user-role.entity';

export interface IRoleRepository extends IRepository<UserRole> {
  findAll(): Promise<UserRole[]>;
  findByName(name: string): Promise<UserRole | null>;
}
