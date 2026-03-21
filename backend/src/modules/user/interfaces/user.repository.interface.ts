import { IRepository } from '@common/interfaces/repository.interface';
import { User } from '@entities/user.entity';
import { PaginatedResult } from '@common/types';
import { QueryUserDto } from '../dtos';

export interface IUserRepository extends IRepository<User> {
  findAll(options: QueryUserDto): Promise<PaginatedResult<User>>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
}
