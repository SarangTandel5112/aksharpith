import { User } from '@entities/user.entity';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from '../dtos';
import { PaginatedResult } from '@common/types';

export interface IUserService {
  getAllUsers(query: QueryUserDto): Promise<PaginatedResult<Omit<User, 'passwordHash'>>>;
  getUserById(id: number): Promise<Omit<User, 'passwordHash'>>;
  createUser(data: CreateUserDto): Promise<Omit<User, 'passwordHash'>>;
  updateUser(id: number, data: UpdateUserDto): Promise<Omit<User, 'passwordHash'>>;
  deleteUser(id: number): Promise<void>;
}
