import { SelectQueryBuilder } from 'typeorm';
import { AppDataSource } from '@config/database.config';
import { User } from '@entities';
import { BaseRepository } from '@common/base.repository';
import { BaseQueryOptions, PaginatedResult } from '@common/types';

export interface UserQueryOptions extends BaseQueryOptions {}

/**
 * User Repository
 * Extends BaseRepository to inherit common data access patterns
 * Only implements user-specific logic
 */
export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(AppDataSource.getRepository(User));
  }

  protected getEntityName(): string {
    return 'user';
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'username', 'email', 'createdAt', 'updatedAt'];
  }

  protected applySearchFilter(
    queryBuilder: SelectQueryBuilder<User>,
    search: string
  ): void {
    queryBuilder.andWhere(
      '(user.username LIKE :search OR user.email LIKE :search OR user.Firstname LIKE :search OR user.Lastname LIKE :search)',
      { search: `%${search}%` }
    );
  }

  async findAll(options: UserQueryOptions): Promise<PaginatedResult<User>> {
    // Override to add role relation
    const result = await this.findAllWithPagination(options, (qb) => {
      qb.leftJoinAndSelect('user.role', 'role');
    });
    return result;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email, isActive: true },
      relations: ['role'],
    });
  }

  async findById(id: number): Promise<User | null> {
    return super.findById(id, ['role']);
  }
}
