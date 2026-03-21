import { Repository, SelectQueryBuilder } from 'typeorm';
import { UserRole } from '@entities/user-role.entity';
import { BaseRepository } from '@common/base.repository';
import { IRoleRepository } from './interfaces/role.repository.interface';

export class RoleRepository
  extends BaseRepository<UserRole>
  implements IRoleRepository
{
  constructor(repo: Repository<UserRole>) {
    super(repo);
  }

  protected getEntityName(): string {
    return 'userRole';
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'roleName', 'createdAt'];
  }

  protected applySearchFilter(
    qb: SelectQueryBuilder<UserRole>,
    search: string
  ): void {
    qb.andWhere('userRole.roleName LIKE :search', { search: `%${search}%` });
  }

  async findAll(): Promise<UserRole[]> {
    return this.repository.find({ where: { isActive: true } });
  }

  async findByName(name: string): Promise<UserRole | null> {
    return this.repository.findOne({ where: { roleName: name, isActive: true } });
  }
}
