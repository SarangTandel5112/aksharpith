import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '@entities';
import { BaseRepository } from '@common/base.repository';
import { PaginatedResult } from '@common/types';
import { IUserRepository } from './interfaces/user.repository.interface';
import { QueryUserDto } from './dtos';

export class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor(repo: Repository<User>) {
    super(repo);
  }

  protected getEntityName(): string {
    return 'user';
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'username', 'email', 'createdAt', 'updatedAt'];
  }

  protected applySearchFilter(queryBuilder: SelectQueryBuilder<User>, search: string): void {
    queryBuilder.andWhere(
      '(user.username LIKE :search OR user.email LIKE :search OR user.Firstname LIKE :search OR user.Lastname LIKE :search)',
      { search: `%${search}%` }
    );
  }

  async findAll(options: QueryUserDto): Promise<PaginatedResult<User>> {
    return this.findAllWithPagination(options, (qb) => {
      qb.leftJoinAndSelect('user.role', 'role');
    });
  }

  async findById(id: number): Promise<User | null> {
    return super.findById(id, ['role']);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email, isActive: true },
      relations: ['role'],
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({
      where: { username, isActive: true },
      relations: ['role'],
    });
  }
}
